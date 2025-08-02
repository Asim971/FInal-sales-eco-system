/**
 * @fileoverview This file contains the site prescription-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Site Prescription form.
 * @param {Object} e The event object.
 */
function handleSitePrescriptionFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.SITE_PRESCRIPTION_APPROVALS, CONFIG.SCHEMAS.SITE_PRESCRIPTION_APPROVALS);
    
    // Generate unique Submission ID
    const submissionId = generateSubmissionId('SP');
    
    // Extract form data
    const responses = e.values;
    
    // DEBUG: Log all form responses to understand the structure
    Logger.log('Site Prescription form submission data:');
    Logger.log('e.values: ' + JSON.stringify(responses));
    Logger.log('e.namedValues: ' + JSON.stringify(e.namedValues || 'Not available'));
    
    // Extract submitter email
    let submitterEmail = responses[1] || '';
    
    // Try to get email from different sources
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
      Logger.log('Found email in namedValues: ' + submitterEmail);
    }
    
    // If still no email, try to get from response source
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
      Logger.log('Found email from response: ' + submitterEmail);
    }
    
    Logger.log('Final submitter email: ' + submitterEmail);
    
    // Map form responses (assuming standard order from form)
    const prescriptionData = {
      timestamp: responses[0] || new Date(),
      submitterEmail: submitterEmail,
      projectId: responses[2] || '', // Should be Potential Site ID (P.S-XXX)
      prescriptionDetails: responses[3] || '',
      technicalSpecs: responses[4] || '',
      estimatedMaterials: responses[5] || '',
      supportingDocs: responses[6] || '',
      submissionId: submissionId,
      status: 'Pending Review',
      engineerId: '', // Will be filled during approval
      approvalDate: '',
      notes: ''
    };
    
    // Validate that Project ID is a valid Potential Site ID
    if (!prescriptionData.projectId) {
      Logger.log('Error: Project ID is required');
      return;
    }
    
    // Verify the potential site exists and is approved
    const potentialSiteSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS);
    const potentialSiteData = getSheetData(potentialSiteSheet);
    let siteInfo = null;
    
    for (let i = 1; i < potentialSiteData.length; i++) {
      if (potentialSiteData[i][8] === prescriptionData.projectId) { // Potential Site ID is in column 9 (index 8)
        siteInfo = {
          siteName: potentialSiteData[i][2],
          address: potentialSiteData[i][3],
          submitterEmail: potentialSiteData[i][1],
          status: potentialSiteData[i][9],
          ihbId: potentialSiteData[i][6],
          ihbName: potentialSiteData[i][7]
        };
        break;
      }
    }
    
    if (!siteInfo) {
      Logger.log(`Error: Potential Site with ID ${prescriptionData.projectId} not found`);
      return;
    }
    
    if (siteInfo.status !== 'Approved') {
      Logger.log(`Error: Potential Site ${prescriptionData.projectId} is not approved yet. Current status: ${siteInfo.status}`);
      return;
    }
    
    // Add data to CRM sheet
    const rowData = [
      prescriptionData.timestamp,
      prescriptionData.submitterEmail,
      prescriptionData.projectId,
      prescriptionData.prescriptionDetails,
      prescriptionData.technicalSpecs,
      prescriptionData.estimatedMaterials,
      prescriptionData.supportingDocs,
      prescriptionData.submissionId,
      prescriptionData.status,
      prescriptionData.engineerId,
      prescriptionData.approvalDate,
      prescriptionData.notes
    ];
    
    sheet.appendRow(rowData);
    
    // Send notifications
    sendSitePrescriptionNotifications(prescriptionData, siteInfo);
    
    Logger.log(`Site Prescription submitted: ${prescriptionData.submissionId} for site ${prescriptionData.projectId}`);
    
  } catch (error) {
    Logger.log(`Error processing site prescription submission: ${error.toString()}`);
    throw error;
  }
}

/**
 * Handles the onEdit event for the Site Prescription Approvals sheet.
 * @param {Object} e The event object.
 */
function handleSitePrescriptionApprovalsEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    
    // Check if this is the correct sheet and column (Status column)
    if (sheet.getName() !== CONFIG.SHEET_NAMES.SITE_PRESCRIPTION_APPROVALS || range.getColumn() !== 9) {
      return; // Not the status column or wrong sheet
    }
    
    const row = range.getRow();
    if (row === 1) return; // Header row
    
    const status = range.getValue();
    if (!status || (status !== 'Approved' && status !== 'Rejected')) {
      return; // Not a valid status change
    }
    
    // Get the row data
    const rowData = sheet.getRange(row, 1, 1, 12).getValues()[0];
    const submitterEmail = rowData[1];
    const projectId = rowData[2];
    const prescriptionDetails = rowData[3];
    const submissionId = rowData[7];
    const notes = rowData[11];
    
    // Look up site information
    const potentialSiteSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS);
    const potentialSiteData = getSheetData(potentialSiteSheet);
    let siteInfo = null;
    
    for (let i = 1; i < potentialSiteData.length; i++) {
      if (potentialSiteData[i][8] === projectId) { // Potential Site ID is in column 9 (index 8)
        siteInfo = {
          siteName: potentialSiteData[i][2],
          address: potentialSiteData[i][3],
          originalSubmitterEmail: potentialSiteData[i][1],
          ihbId: potentialSiteData[i][6],
          ihbName: potentialSiteData[i][7]
        };
        break;
      }
    }
    
    if (!siteInfo) {
      Logger.log(`Site with ID ${projectId} not found for prescription notification`);
      return;
    }
    
    // Look up submitter in employee system to get territory and contact info
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    // Look up original site submitter for notifications
    const originalSubmitterEmployee = findEmployeeByEmail(siteInfo.originalSubmitterEmail);
    
    // Look up IHB data if IHB ID is provided
    let ihbData = null;
    if (siteInfo.ihbId) {
      ihbData = findIHBById(siteInfo.ihbId);
    }
    
    // Collect notification recipients
    let notificationRecipients = [];
    
    // Add submitter if they have WhatsApp
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      notificationRecipients.push({
        name: submitterEmployee.name,
        role: submitterEmployee.role,
        whatsappNumber: submitterEmployee.whatsappNumber
      });
    }
    
    // Add original site submitter if different from prescription submitter
    if (originalSubmitterEmployee && 
        originalSubmitterEmployee.whatsappNumber && 
        originalSubmitterEmployee.email !== submitterEmail) {
      notificationRecipients.push({
        name: originalSubmitterEmployee.name,
        role: originalSubmitterEmployee.role,
        whatsappNumber: originalSubmitterEmployee.whatsappNumber
      });
    }
    
    // Add team members in the same territory
    if (submitterEmployee && submitterEmployee.territory) {
      const territoryTeamMembers = findEmployeesByTerritory(submitterEmployee.territory);
      territoryTeamMembers.forEach(member => {
        if (member.whatsappNumber && 
            member.email !== submitterEmail && 
            member.email !== siteInfo.originalSubmitterEmail) {
          notificationRecipients.push({
            name: member.name,
            role: member.role,
            whatsappNumber: member.whatsappNumber
          });
        }
      });
    }
    
    // Add IHB if available
    if (ihbData && ihbData.whatsappNumber) {
      notificationRecipients.push({
        name: ihbData.ihbName,
        role: 'IHB',
        whatsappNumber: ihbData.whatsappNumber
      });
    }
    
    // Create notification message
    const message = `Site Prescription ${status}
Submission ID: ${submissionId}
Project ID: ${projectId}
Site Name: ${siteInfo.siteName}
Address: ${siteInfo.address}
Prescription Details: ${prescriptionDetails}
${siteInfo.ihbId ? `IHB ID: ${siteInfo.ihbId}` : ''}
${siteInfo.ihbName ? `IHB Name: ${siteInfo.ihbName}` : ''}
Status: ${status}
Update Date: ${new Date().toLocaleString()}
${notes ? `Notes: ${notes}` : ''}`;
    
    // Send notifications to all recipients
    notificationRecipients.forEach(recipient => {
      try {
        sendWhatsAppMessage(recipient.whatsappNumber, message);
        Logger.log(`Site Prescription notification sent to ${recipient.name} (${recipient.role}): ${recipient.whatsappNumber}`);
      } catch (error) {
        Logger.log(`Failed to send site prescription notification to ${recipient.name}: ${error.toString()}`);
      }
    });
    
    Logger.log(`Site Prescription ${status}: ${submissionId}. Notifications sent to ${notificationRecipients.length} recipients.`);
    
  } catch (error) {
    Logger.log(`Error handling site prescription approval edit: ${error.toString()}`);
  }
}

/**
 * Sends notifications for new site prescription submissions.
 * @param {Object} prescriptionData The prescription data.
 * @param {Object} siteInfo The site information.
 */
function sendSitePrescriptionNotifications(prescriptionData, siteInfo) {
  try {
    // Look up submitter in employee system to get territory and contact info
    const submitterEmployee = findEmployeeByEmail(prescriptionData.submitterEmail);
    
    // Look up original site submitter for notifications
    const originalSubmitterEmployee = findEmployeeByEmail(siteInfo.submitterEmail);
    
    // Look up IHB data if IHB ID is provided
    let ihbData = null;
    if (siteInfo.ihbId) {
      ihbData = findIHBById(siteInfo.ihbId);
    }
    
    // Collect notification recipients
    let notificationRecipients = [];
    
    // Add submitter if they have WhatsApp
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      notificationRecipients.push({
        name: submitterEmployee.name,
        role: submitterEmployee.role,
        whatsappNumber: submitterEmployee.whatsappNumber
      });
    }
    
    // Add original site submitter if different from prescription submitter
    if (originalSubmitterEmployee && 
        originalSubmitterEmployee.whatsappNumber && 
        originalSubmitterEmployee.email !== prescriptionData.submitterEmail) {
      notificationRecipients.push({
        name: originalSubmitterEmployee.name,
        role: originalSubmitterEmployee.role,
        whatsappNumber: originalSubmitterEmployee.whatsappNumber
      });
    }
    
    // Add team members in the same territory
    if (submitterEmployee && submitterEmployee.territory) {
      const territoryTeamMembers = findEmployeesByTerritory(submitterEmployee.territory);
      territoryTeamMembers.forEach(member => {
        if (member.whatsappNumber && 
            member.email !== prescriptionData.submitterEmail && 
            member.email !== siteInfo.submitterEmail) {
          notificationRecipients.push({
            name: member.name,
            role: member.role,
            whatsappNumber: member.whatsappNumber
          });
        }
      });
    }
    
    // Add IHB if available
    if (ihbData && ihbData.whatsappNumber) {
      notificationRecipients.push({
        name: ihbData.ihbName,
        role: 'IHB',
        whatsappNumber: ihbData.whatsappNumber
      });
    }
    
    // Create notification message
    const message = `New Site Prescription Submission
Submission ID: ${prescriptionData.submissionId}
Project ID: ${prescriptionData.projectId}
Site Name: ${siteInfo.siteName}
Address: ${siteInfo.address}
Prescription Details: ${prescriptionData.prescriptionDetails}
${prescriptionData.technicalSpecs ? `Technical Specs: ${prescriptionData.technicalSpecs}` : ''}
${prescriptionData.estimatedMaterials ? `Estimated Materials: ${prescriptionData.estimatedMaterials}` : ''}
${prescriptionData.supportingDocs ? `Supporting Documents: ${prescriptionData.supportingDocs}` : ''}
${siteInfo.ihbId ? `IHB ID: ${siteInfo.ihbId}` : ''}
${siteInfo.ihbName ? `IHB Name: ${siteInfo.ihbName}` : ''}
Submitter: ${submitterEmployee ? submitterEmployee.name : prescriptionData.submitterEmail}
${submitterEmployee && submitterEmployee.territory ? `Territory: ${submitterEmployee.territory}` : ''}
Submission Date: ${new Date().toLocaleString()}`;
    
    // Send notifications to all recipients
    notificationRecipients.forEach(recipient => {
      try {
        sendWhatsAppMessage(recipient.whatsappNumber, message);
        Logger.log(`Site Prescription notification sent to ${recipient.name} (${recipient.role}): ${recipient.whatsappNumber}`);
      } catch (error) {
        Logger.log(`Failed to send site prescription notification to ${recipient.name}: ${error.toString()}`);
      }
    });
    
    Logger.log(`Site Prescription submission processed. Notifications sent to ${notificationRecipients.length} recipients.`);
    
  } catch (error) {
    Logger.log(`Error sending site prescription notifications: ${error.toString()}`);
  }
}
