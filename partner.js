/**
 * @fileoverview This file contains the partner-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Partner Update form.
 * @param {Object} e The event object.
 */
function handlePartnerUpdateFormSubmit(e) {
  try {
    // Validate event object
    if (!e) {
      throw new Error('Event object is undefined. Function must be called with form submission event data.');
    }
    
    if (!e.values && !e.namedValues) {
      throw new Error('Event object missing form data. Both e.values and e.namedValues are undefined.');
    }
    
    // Extract form data with fallback handling
    const response = e.values || [];
    const timestamp = (response && response[0]) ? response[0] : new Date();
    
    // Get submitter email from multiple sources with safe access
    let submitterEmail = '';
    if (response && response.length > 1) {
      submitterEmail = response[1] || '';
    }
    
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0] || '';
    }
    
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail() || '';
    }
    
    if (!submitterEmail) {
      throw new Error('Cannot determine submitter email from form submission data');
    }
    
    // Safe extraction of form fields
    const projectId = (response && response[2]) ? response[2] : ''; // This should be a Potential Site ID (e.g., P.S-001)
    const partnerType = (response && response[3]) ? response[3] : '';
    const partnerId = (response && response[4]) ? response[4] : '';
    const partnerName = (response && response[5]) ? response[5] : '';
    const whatsappNumber = (response && response[6]) ? response[6] : '';

    console.log('Partner Update Form Submission:');
    console.log('Project ID (should be Potential Site ID):', projectId);
    console.log('Partner Type:', partnerType);
  console.log('Partner ID:', partnerId);
  console.log('Partner Name:', partnerName);

  if (!validatePartnerId(partnerId, partnerType)) {
    console.error(`Invalid Partner ID format for type ${partnerType}: ${partnerId}`);
    return;
  }

  // Declare projectInfo outside try block so it's accessible throughout the function
  let projectInfo = null;

  try {
    // Look up the Potential Site (Project) in POTENTIAL_SITE_APPROVALS sheet
    const potentialSiteSheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM, 
      CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS,
      CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS
    );
    
    const potentialSiteData = getSheetData(potentialSiteSheet);
    let projectRowIndex = -1;
    
    for (let i = 1; i < potentialSiteData.length; i++) {
      if (potentialSiteData[i][8] === projectId) { // Potential Site ID is in column 9 (index 8)
        projectRowIndex = i + 1;
        projectInfo = {
          siteName: potentialSiteData[i][2],
          address: potentialSiteData[i][3],
          submitterEmail: potentialSiteData[i][1],
          status: potentialSiteData[i][9]
        };
        break;
      }
    }

    if (projectRowIndex === -1) {
      console.error('Potential Site (Project) with ID ' + projectId + ' not found.');
      console.log('Available Potential Site IDs:', potentialSiteData.slice(1).map(row => row[8]).filter(id => id));
      return;
    }

    if (!projectInfo) {
      console.error('Project information not found for project ID: ' + projectId);
      return;
    }

    if (projectInfo.status !== 'Approved') {
      console.error('Cannot assign partner/engineer to project ' + projectId + '. Project status: ' + projectInfo.status);
      return;
    }

    // Update the potential site record with partner/engineer information
    const siteSheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM, 
      CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS,
      CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS
    );
    
    // Based on POTENTIAL_SITE_APPROVALS schema:
    // Column indexes: 0=Timestamp, 1=Email, 2=Site Name, 3=Address, 4=Lat, 5=Long, 
    // 6=IHB ID, 7=IHB Name, 8=Potential Site ID, 9=Status, 10=Engineer ID, 
    // 11=Engineer Name, 12=Partner ID, 13=Partner Name, 14=Assignment Date, 15=Notes
    
    const currentRow = siteSheet.getRange(projectRowIndex, 1, 1, 16).getValues()[0];
    
    // Update the appropriate columns based on partner type
    if (partnerType === 'Site Engineer') {
      siteSheet.getRange(projectRowIndex, 11).setValue(partnerId);     // Engineer ID (column 11)
      siteSheet.getRange(projectRowIndex, 12).setValue(partnerName);   // Engineer Name (column 12)
    } else if (partnerType === 'Partner') {
      siteSheet.getRange(projectRowIndex, 13).setValue(partnerId);     // Partner ID (column 13)
      siteSheet.getRange(projectRowIndex, 14).setValue(partnerName);   // Partner Name (column 14)
    }
    
    // Update assignment date
    siteSheet.getRange(projectRowIndex, 15).setValue(new Date().toLocaleString()); // Assignment Date (column 15)
    
    // Update notes
    const currentNotes = currentRow[15] || ''; // Notes is column 16 (index 15)
    const assignmentNote = `${partnerType} Assignment: ${partnerName} (${partnerId}) assigned on ${new Date().toLocaleString()}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n${assignmentNote}` : assignmentNote;
    siteSheet.getRange(projectRowIndex, 16).setValue(updatedNotes);   // Notes (column 16)
  
  } catch (error) {
    console.error('Error in partner update process:', error);
    return;
  }
  
  // Store detailed partner update in PROJECT_UPDATE sheet if it exists, otherwise create a record in CRM
  let trackingSheet;
  try {
    trackingSheet = getSheet(CONFIG.SPREADSHEET_IDS.PROJECT_UPDATE, CONFIG.SHEET_NAMES.PROJECT_UPDATE);
  } catch (error) {
    console.log('PROJECT_UPDATE sheet not available, using CRM for tracking');
    trackingSheet = null;
  }
  
  if (trackingSheet) {
    // Ensure projectInfo exists before using it
    if (!projectInfo) {
      console.error('Project information not available for tracking record');
      return;
    }
    
    const updateSubmissionId = Utilities.getUuid().substring(0, 8).toUpperCase();
    
    const updateRow = [
      timestamp,
      submitterEmail,
      projectId,
      partnerType === 'Site Engineer' ? partnerId : '',
      partnerType === 'Partner' ? partnerId : '',
      'Partner Update', // Delivery Method
      'N/A', // Reward Eligible
      'Assigned', // Status
      `${partnerType} ${partnerName} assigned to project`, // Notes
      updateSubmissionId,
      projectInfo.siteName || '', // Project Name
      projectInfo.address || '', // Project Address
      '', // Project Lat
      '', // Project Long
      'Active', // Project Status
      partnerType === 'Site Engineer' ? partnerName : '', // Engineer Name
      partnerType === 'Site Engineer' ? partnerId : '', // Engineer ID
      partnerType === 'Partner' ? partnerName : '', // Partner Name
      partnerType === 'Partner' ? partnerId : '' // Partner ID
    ];
    
    appendRow(trackingSheet, updateRow);
  } else {
    console.log('Partner assignment recorded in potential site notes');
  }

  try {
    // Look up submitter in employee system for notifications
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    console.log(`Debug: Submitter employee lookup for ${submitterEmail}:`, submitterEmployee);
    
    // Create notification message
    const message = `🔔 Partner/Engineer Assignment Update

📋 Project ID: ${projectId}
🏗️ Project Name: ${projectInfo ? projectInfo.siteName : 'N/A'}
📍 Project Address: ${projectInfo ? projectInfo.address : 'N/A'}
👤 ${partnerType}: ${partnerName} (${partnerId})
${whatsappNumber ? `📞 Contact: ${whatsappNumber}` : ''}
👨‍💼 Assigned by: ${submitterEmployee ? submitterEmployee.name : submitterEmail}
📅 Assignment Date: ${new Date().toLocaleString()}`;
    
    // Collect notification recipients
    let notificationRecipients = [];
    
    // Add admin/management notifications (default recipients)
    try {
      const adminEmployees = findEmployeesByRole(['ASM', 'CRO']); // Admin roles
      adminEmployees.forEach(admin => {
        if (admin.whatsappNumber) {
          notificationRecipients.push({
            name: admin.name,
            role: admin.role,
            whatsappNumber: admin.whatsappNumber
          });
        }
      });
      console.log(`Debug: Added ${adminEmployees.length} admin recipients`);
    } catch (error) {
      console.log('Debug: Could not find admin employees:', error);
    }
    
    // Add submitter if they have WhatsApp
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      notificationRecipients.push({
        name: submitterEmployee.name,
        role: submitterEmployee.role,
        whatsappNumber: submitterEmployee.whatsappNumber
      });
      console.log(`Debug: Added submitter ${submitterEmployee.name} to notifications`);
    } else {
      console.log(`Debug: Submitter not found in employee system or no WhatsApp number`);
    }

    // Add territory team members if submitter has territory
    if (submitterEmployee && submitterEmployee.territory) {
      const territoryTeamMembers = findEmployeesByTerritory(submitterEmployee.territory);
      console.log(`Debug: Found ${territoryTeamMembers.length} territory team members`);
      
      territoryTeamMembers.forEach(member => {
        if (member.whatsappNumber && member.email !== submitterEmail) {
          notificationRecipients.push({
            name: member.name,
            role: member.role,
            whatsappNumber: member.whatsappNumber
          });
        }
      });
    } else {
      console.log(`Debug: No territory found for submitter`);
    }

    // Fallback: If no recipients found, send to default territories
    if (notificationRecipients.length === 0) {
      console.log(`Debug: No specific recipients found, using fallback territory notifications`);
      try {
        sendWhatsAppNotification('Admin', message);
        sendWhatsAppNotification('Management', message);
        console.log(`Debug: Sent fallback notifications to Admin and Management territories`);
      } catch (error) {
        console.error('Debug: Failed to send fallback notifications:', error);
      }
    }

    console.log(`Debug: Total notification recipients: ${notificationRecipients.length}`);

    // Send notifications to all recipients
    notificationRecipients.forEach(recipient => {
      try {
        sendWhatsAppMessage(recipient.whatsappNumber, message);
        console.log(`Partner assignment notification sent to ${recipient.name} (${recipient.role}): ${recipient.whatsappNumber}`);
      } catch (error) {
        console.error(`Failed to send notification to ${recipient.name}:`, error);
      }
    });

    console.log(`Partner assignment processed for Project ${projectId}. Notifications sent to ${notificationRecipients.length} recipients.`);
    
  } catch (error) {
    console.error('Error sending partner assignment notifications:', error);
  }
  
  } catch (error) {
    console.error('❌ Error processing Partner Update form submission:', error);
    Logger.log(`Error processing Partner Update form submission: ${error.toString()}`);
    throw error;
  }
}

/**
 * Validates the Partner ID based on the Partner Type.
 * @param {string} id The Partner ID to validate.
 * @param {string} type The Partner Type ('Site Engineer' or 'Partner').
 * @returns {boolean} True if the ID is valid, false otherwise.
 */
function validatePartnerId(id, type) {
  if (type === 'Site Engineer') {
    return /^S\d{5}$/.test(id); // S10122 format
  } else if (type === 'Partner') {
    return /^C\d{4}$/.test(id); // C1022 format
  }
  return false;
}

/**
 * Handles the onFormSubmit event for the Partner Registration form.
 * @param {Object} e The event object.
 */
function handlePartnerRegistrationFormSubmit(e) {
  try {
    Logger.log('Partner Registration form submitted');
    
    // Validate event object
    if (!e) {
      throw new Error('Event object is undefined. Function must be called with form submission event data.');
    }
    
    if (!e.values && !e.namedValues) {
      throw new Error('Event object missing form data. Both e.values and e.namedValues are undefined.');
    }
    
    const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, 'Dashboard');

    // Ensure headers exist for partner data
    const headers = CONFIG.SCHEMAS.CRM_APPROVALS || [
      'Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 
      'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes', 'Partner ID', 'Partner Type', 'WhatsApp Number'
    ];
    ensureSheetHeaders(crmSheet, headers, 'partner registration');

    // Extract form data with fallback handling
    const response = e.values || [];
    const timestamp = (response && response[0]) ? response[0] : new Date();
    
    // Get submitter email with safe access
    let submitterEmail = '';
    if (response && response.length > 1) {
      submitterEmail = response[1] || '';
    }
    
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0] || '';
    }
    
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail() || '';
    }
    
    if (!submitterEmail) {
      throw new Error('Cannot determine submitter email from form submission data');
    }
    
    // Safe extraction of form fields
    const partnerType = (response && response[2]) ? response[2] : ''; // 'Site Engineer' or 'Partner'
    const partnerName = (response && response[3]) ? response[3] : '';
    const contactNumber = (response && response[4]) ? response[4] : '';
    const bkashNumber = (response && response[5]) ? response[5] : '';
    const nidNo = (response && response[6]) ? response[6] : '';
  const nidUpload = response[7];
  const whatsappNumber = response[8]; // Optional

  // Enhanced email extraction using multiple methods
  Logger.log('Original submitter email from form: ' + submitterEmail);
  
  // Try to get email from namedValues first
  if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
    submitterEmail = e.namedValues['Email Address'][0];
    Logger.log('Found email in namedValues: ' + submitterEmail);
  }
  
  // Try to get email from form response
  if (!submitterEmail && e.response) {
    submitterEmail = e.response.getRespondentEmail();
    Logger.log('Found email from getRespondentEmail: ' + submitterEmail);
  }
  
  if (!submitterEmail) {
    Logger.log('Warning: No submitter email found for partner registration');
  }

  const partnerId = generateNextPartnerId(partnerType);
  if (!partnerId) {
    Logger.log(`Could not generate a new Partner ID for type: ${partnerType}`);
    return;
  }

  const submissionId = Utilities.getUuid();
  const status = 'Pending';
  const notes = '';

  // This assumes the CRM Approvals sheet can accommodate both types.
  // You might need to adjust the columns or use a different sheet.
  const row = [timestamp, submitterEmail, partnerName, bkashNumber, contactNumber, nidNo, nidUpload, submissionId, status, notes, partnerId, partnerType, whatsappNumber];
  appendRow(crmSheet, row);

  const message = `New Partner Registration
Submission ID: ${submissionId}
Partner Type: ${partnerType}
Partner Name: ${partnerName}
Partner ID: ${partnerId}
Contact: ${contactNumber}
Status: ${status}`;

  Logger.log(message);

  // Send notifications using centralized notification system
  const notificationData = {
    formType: 'PARTNER_REGISTRATION',
    submitterEmail: submitterEmail,
    territory: null, // Will be determined from submitter's profile
    formData: {
      submissionId: submissionId,
      partnerType: partnerType,
      partnerName: partnerName,
      partnerId: partnerId,
      contactNumber: contactNumber,
      bkashNumber: bkashNumber,
      nidNo: nidNo,
      status: status
    }
  };
  
  sendFormNotification(notificationData);
  
  } catch (error) {
    console.error('❌ Error processing Partner Registration form submission:', error);
    Logger.log(`Error processing Partner Registration form submission: ${error.toString()}`);
    throw error;
  }
}

/**
 * Generates the next available Partner ID.
 * @param {string} partnerType The type of partner ('Site Engineer' or 'Partner').
 * @returns {string|null} The new partner ID or null if type is invalid.
 */
function generateNextPartnerId(partnerType) {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, 'Dashboard');
  
  // Ensure headers exist - add if missing
  if (crmSheet.getLastRow() === 0) {
    const headers = CONFIG.SCHEMAS.CRM_APPROVALS || [
      'Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 
      'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes', 'Partner ID', 'Partner Type', 'WhatsApp Number'
    ];
    crmSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = crmSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    crmSheet.autoResizeColumns(1, headers.length);
    
    console.log('Added headers to Dashboard sheet for partner ID generation');
  }
  
  const data = getSheetData(crmSheet);
  
  let prefix;
  let idRegex;
  let idColumnIndex; // The column where Partner IDs are stored
  let startNumber;

  if (partnerType === 'Site Engineer') {
    prefix = 'S';
    idRegex = /^S(\d{5})$/;
    idColumnIndex = 10; // Assuming column K for Partner ID
    startNumber = 10122;
  } else if (partnerType === 'Partner') {
    prefix = 'C';
    idRegex = /^C(\d{4})$/;
    idColumnIndex = 10; // Assuming column K for Partner ID
    startNumber = 1022;
  } else {
    return null;
  }

  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const partnerId = data[i][idColumnIndex];
    const partnerTypeInData = data[i][11]; // Assuming column L for Partner Type
    if (partnerTypeInData === partnerType && partnerId && idRegex.test(partnerId)) {
      const idNumber = parseInt(idRegex.exec(partnerId)[1], 10);
      if (idNumber > maxId) {
        maxId = idNumber;
      }
    }
  }

  const nextIdNumber = maxId > 0 ? maxId + 1 : startNumber;
  
  if (partnerType === 'Site Engineer') {
    return prefix + String(nextIdNumber).padStart(5, '0');
  } else {
    return prefix + String(nextIdNumber).padStart(4, '0');
  }
}

/**
 * Migrates existing partners to the new "Partner" type.
 * This function should be run once to update the data.
 */
function migrateExistingPartners() {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, 'Dashboard');
  
  // Ensure headers exist - add if missing
  if (crmSheet.getLastRow() === 0) {
    const headers = CONFIG.SCHEMAS.CRM_APPROVALS || [
      'Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 
      'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes', 'Partner ID', 'Partner Type', 'WhatsApp Number'
    ];
    crmSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = crmSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    crmSheet.autoResizeColumns(1, headers.length);
    
    console.log('Added headers to Dashboard sheet for partner migration');
  }
  
  const data = getSheetData(crmSheet);
  const partnerTypeCol = 12; // Assuming column L for Partner Type
  const partnerIdCol = 11;   // Assuming column K for Partner ID

  let maxPartnerId = 0;
  const partnerIdRegex = /^C(\d{4})$/;

  // First, find the highest existing 'Partner' ID to know where to start new IDs from.
  for (let i = 1; i < data.length; i++) {
    const partnerId = data[i][partnerIdCol - 1];
    if (partnerId && partnerIdRegex.test(partnerId)) {
      const idNumber = parseInt(partnerIdRegex.exec(partnerId)[1], 10);
      if (idNumber > maxPartnerId) {
        maxPartnerId = idNumber;
      }
    }
  }

  let nextPartnerIdNumber = maxPartnerId > 0 ? maxPartnerId + 1 : 1022;
  const updates = [];

  // Now, iterate and update rows that don't have a partner type.
  for (let i = 1; i < data.length; i++) {
    const partnerType = data[i][partnerTypeCol - 1];
    if (!partnerType) {
      const newPartnerId = 'C' + String(nextPartnerIdNumber++).padStart(4, '0');
      updates.push({
        row: i + 1,
        id: newPartnerId,
        type: 'Partner'
      });
    }
  }

  // Perform batch updates
  for (const update of updates) {
    crmSheet.getRange(update.row, partnerIdCol).setValue(update.id);
    crmSheet.getRange(update.row, partnerTypeCol).setValue(update.type);
  }

  if (updates.length > 0) {
    Logger.log(`Migrated ${updates.length} existing partners.`);
  } else {
    Logger.log('No partners needed migration.');
  }
}

/**
 * Finds all employees in a specific territory.
 * Enhanced to work with both legacy and new territory fields.
 * @param {string} territory The territory to search for.
 * @returns {Array} Array of employee objects in the territory.
 */
function findEmployeesByTerritory(territory) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);
  const employees = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[8]; // Status column
    const legacyTerritory = row[11]; // Legacy territory column
    const newTerritory = row[16]; // New territory column (if exists)
    
    // Check both legacy and new territory fields for backward compatibility
    if (status === 'Active' && (legacyTerritory === territory || newTerritory === territory)) {
      employees.push({
        id: row[0],
        name: row[1],
        role: row[2],
        email: row[3],
        contactNumber: row[4],
        whatsappNumber: row[5],
        bkashNumber: row[6],
        nidNo: row[7],
        status: row[8],
        hireDate: row[9],
        company: row[10],
        territory: row[11], // Legacy territory field
        area: row[12], // Legacy area field
        zone: row[13] || '', // New zone field (optional)
        district: row[14] || '', // New district field (optional)
        newArea: row[15] || '', // New area field (optional)
        newTerritory: row[16] || '', // New territory field (optional)
        bazaar: row[17] || '', // Bazaar field (optional)
        upazilla: row[18] || '', // Upazilla field (optional)
        bdTerritory: row[19] || '', // BD Territory field (optional)
        croTerritory: row[20] || '', // CRO Territory field (optional)
        businessUnit: row[21] || '', // Business Unit field (optional)
        legacyId: row[22] || row[13] || '', // Legacy ID field (maintain backward compatibility)
        notes: row[23] || row[14] || '' // Notes field (maintain backward compatibility)
      });
    }
  }

  return employees;
}
