/**
 * @fileoverview This file contains IHB (Individual House Builder) management functionality.
 */

/**
 * Handles the onFormSubmit event for the IHB Registration form.
 * @param {Object} e The event object from the form submission.
 */
function handleIHBFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.IHB_APPROVALS, CONFIG.SCHEMAS.IHB_APPROVALS);
    
    // Generate unique Submission ID
    const submissionId = generateSubmissionId('IHB');
    
    // Extract form data
    const responses = e.values;
    
    // DEBUG: Log all form responses to understand the structure
    Logger.log('Form submission data:');
    Logger.log('e.values: ' + JSON.stringify(responses));
    Logger.log('e.namedValues: ' + JSON.stringify(e.namedValues || 'Not available'));
    
    // Check if email is in e.namedValues (common for Google Forms)
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
    const ihbData = {
      timestamp: responses[0] || new Date(),
      submissionId: submissionId,
      submitterEmail: submitterEmail,
      ihbName: responses[2] || '',
      ihbEmail: responses[3] || '',
      mobileNumber: responses[4] || '',
      nidNumber: responses[5] || '',
      address: responses[6] || '',
      whatsappNumber: responses[7] || '',
      nidUploadLink: responses[8] || '',
      additionalNotes: responses[9] || '',
      status: 'Pending Approval',
      ihbId: '', // Will be generated upon approval
      approvalDate: '',
      crmNotes: ''
    };
    
    // Add data to CRM sheet
    const rowData = [
      ihbData.timestamp,
      ihbData.submissionId,
      ihbData.submitterEmail,
      ihbData.ihbName,
      ihbData.ihbEmail,
      ihbData.mobileNumber,
      ihbData.nidNumber,
      ihbData.address,
      ihbData.whatsappNumber,
      ihbData.nidUploadLink,
      ihbData.additionalNotes,
      ihbData.status,
      ihbData.ihbId,
      ihbData.approvalDate,
      ihbData.crmNotes
    ];
    
    sheet.appendRow(rowData);
    
    // Send notification to CRM team
    sendIHBNotification(ihbData);
    
    Logger.log(`IHB registration submitted: ${ihbData.submissionId} for ${ihbData.ihbName}`);
    
  } catch (error) {
    Logger.log(`Error processing IHB registration: ${error.toString()}`);
    throw error;
  }
}

/**
 * Generates a unique IHB ID for approved IHBs.
 * @return {string} The generated IHB ID.
 */
function generateIHBId() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
  
  if (!sheet) {
    throw new Error('IHB Approvals sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  let maxNumber = 0;
  
  // Find the highest existing IHB ID number
  for (let i = 1; i < data.length; i++) {
    const existingId = data[i][12]; // IHB ID column
    if (existingId && typeof existingId === 'string' && existingId.startsWith('IHB')) {
      const numberPart = parseInt(existingId.replace('IHB', ''));
      if (!isNaN(numberPart) && numberPart > maxNumber) {
        maxNumber = numberPart;
      }
    }
  }
  
  const nextNumber = maxNumber + 1;
  return `IHB${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Generates a unique submission ID for IHB registration.
 * @param {string} type The type of submission (IHB).
 * @return {string} The generated submission ID.
 */
function generateSubmissionId(type) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.IHB_APPROVALS, CONFIG.SCHEMAS.IHB_APPROVALS);
  const lastRow = sheet.getLastRow();
  
  // Generate ID in format: IHB-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
  
  // Count submissions for today
  let submissionCount = 1;
  if (lastRow > 1) {
    const submissionIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    const todaySubmissions = submissionIds.filter(id => id && id.includes(dateStr));
    submissionCount = todaySubmissions.length + 1;
  }
  
  return `${type}-${dateStr}-${submissionCount.toString().padStart(3, '0')}`;
}

/**
 * Sends WhatsApp notification for new IHB registration.
 * @param {Object} ihbData The IHB registration data.
 */
function sendIHBNotification(ihbData) {
  try {
    const message = `🏠 *IHB Registration Submitted*

*Submission ID:* ${ihbData.submissionId}
*IHB Name:* ${ihbData.ihbName}
*Email:* ${ihbData.ihbEmail}
*Mobile:* ${ihbData.mobileNumber}
*NID:* ${ihbData.nidNumber}
*Address:* ${ihbData.address}

*Status:* Pending CRM Review

Your IHB registration has been submitted successfully and is now pending approval from the CRM team.`;

    // Look up submitter's WhatsApp number from employees sheet
    const submitterEmployee = findEmployeeByEmail(ihbData.submitterEmail);
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      Logger.log(`IHB notification sent to ${submitterEmployee.name} at ${submitterEmployee.whatsappNumber}`);
    } else {
      Logger.log(`Could not find WhatsApp number for submitter: ${ihbData.submitterEmail}`);
    }
    
  } catch (error) {
    Logger.log(`Error sending IHB notification: ${error.toString()}`);
  }
}

/**
 * Approves an IHB registration and generates IHB ID.
 * @param {string} submissionId The submission ID to approve.
 * @param {string} crmNotes Optional notes from CRM.
 */
function approveIHB(submissionId, crmNotes = '') {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      throw new Error('IHB Approvals sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === submissionId) { // Column B contains Submission ID
        // Generate IHB ID
        const ihbId = generateIHBId();
        
        // Update the record
        sheet.getRange(i + 1, 12).setValue('Approved'); // Status column
        sheet.getRange(i + 1, 13).setValue(ihbId); // IHB ID column
        sheet.getRange(i + 1, 14).setValue(new Date()); // Approval Date column
        sheet.getRange(i + 1, 15).setValue(crmNotes); // CRM Notes column
        
        // Send approval notification
        sendIHBApprovalNotification(data[i], ihbId);
        
        Logger.log(`Approved IHB registration: ${submissionId}, assigned ID: ${ihbId}`);
        return ihbId;
      }
    }
    
    throw new Error(`IHB submission ${submissionId} not found`);
    
  } catch (error) {
    Logger.log(`Error approving IHB: ${error.toString()}`);
    throw error;
  }
}

/**
 * Rejects an IHB registration.
 * @param {string} submissionId The submission ID to reject.
 * @param {string} reason The reason for rejection.
 */
function rejectIHB(submissionId, reason) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      throw new Error('IHB Approvals sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === submissionId) { // Column B contains Submission ID
        sheet.getRange(i + 1, 12).setValue('Rejected'); // Status column
        sheet.getRange(i + 1, 15).setValue(reason); // CRM Notes column
        
        // Send rejection notification
        sendIHBRejectionNotification(data[i], reason);
        
        Logger.log(`Rejected IHB registration: ${submissionId}, reason: ${reason}`);
        return true;
      }
    }
    
    throw new Error(`IHB submission ${submissionId} not found`);
    
  } catch (error) {
    Logger.log(`Error rejecting IHB: ${error.toString()}`);
    throw error;
  }
}

/**
 * Sends approval notification for IHB registration.
 * @param {Array} ihbData The IHB registration data row.
 * @param {string} ihbId The assigned IHB ID.
 */
function sendIHBApprovalNotification(ihbData, ihbId) {
  try {
    const message = `✅ *IHB Registration Approved*

*IHB Name:* ${ihbData[3]}
*IHB ID:* ${ihbId}
*Submission ID:* ${ihbData[1]}

Your IHB registration has been approved. You can now be tagged in potential site forms.

Welcome to the Anwar Sales Ecosystem!`;

    // Look up submitter's WhatsApp number from employees sheet using their email
    const submitterEmail = ihbData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      Logger.log(`IHB approval notification sent to ${submitterEmployee.name} at ${submitterEmployee.whatsappNumber}`);
    } else {
      Logger.log(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    Logger.log(`Error sending IHB approval notification: ${error.toString()}`);
  }
}

/**
 * Sends rejection notification for IHB registration.
 * @param {Array} ihbData The IHB registration data row.
 * @param {string} reason The reason for rejection.
 */
function sendIHBRejectionNotification(ihbData, reason) {
  try {
    const message = `❌ *IHB Registration Rejected*

*IHB Name:* ${ihbData[3]}
*Submission ID:* ${ihbData[1]}
*Reason:* ${reason}

Please contact the CRM team for more information or to resubmit with corrections.`;

    // Look up submitter's WhatsApp number from employees sheet using their email
    const submitterEmail = ihbData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      Logger.log(`IHB rejection notification sent to ${submitterEmployee.name} at ${submitterEmployee.whatsappNumber}`);
    } else {
      Logger.log(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    Logger.log(`Error sending IHB rejection notification: ${error.toString()}`);
  }
}

/**
 * Gets all approved IHBs for use in potential site forms.
 * @return {Array} Array of approved IHB records.
 */
function getApprovedIHBs() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const approvedIHBs = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][11] === 'Approved') { // Status column
        const ihb = {};
        headers.forEach((header, index) => {
          ihb[header] = data[i][index];
        });
        approvedIHBs.push(ihb);
      }
    }
    
    return approvedIHBs;
    
  } catch (error) {
    Logger.log(`Error getting approved IHBs: ${error.toString()}`);
    return [];
  }
}

/**
 * Gets IHB details by IHB ID.
 * @param {string} ihbId The IHB ID to search for.
 * @return {Object|null} IHB details or null if not found.
 */
function getIHBById(ihbId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][12] === ihbId) { // IHB ID column
        const ihb = {};
        headers.forEach((header, index) => {
          ihb[header] = data[i][index];
        });
        return ihb;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log(`Error getting IHB by ID: ${error.toString()}`);
    return null;
  }
}

/**
 * Handles edits to the IHB Approvals sheet for status changes.
 * @param {Object} e The edit event object.
 */
function handleIHBApprovalsEdit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Check if edit is in the Status column (column 12)
  if (col === 12 && row > 1) {
    const newStatus = e.range.getValue();
    const submissionId = sheet.getRange(row, 2).getValue(); // Submission ID in column B
    
    if (newStatus === 'Approved') {
      // Auto-approve when status is changed to 'Approved'
      const crmNotes = sheet.getRange(row, 15).getValue() || 'Approved via status change';
      approveIHB(submissionId, crmNotes);
    } else if (newStatus === 'Rejected') {
      // Auto-reject when status is changed to 'Rejected'
      const reason = sheet.getRange(row, 15).getValue() || 'Rejected via status change';
      rejectIHB(submissionId, reason);
    }
  }
}

/**
 * Updates IHB information.
 * @param {string} ihbId The IHB ID to update.
 * @param {Object} updateData The data to update.
 */
function updateIHBInfo(ihbId, updateData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      throw new Error('IHB Approvals sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][12] === ihbId) { // IHB ID column
        // Update specified fields
        Object.keys(updateData).forEach(key => {
          const columnIndex = headers.indexOf(key);
          if (columnIndex !== -1) {
            sheet.getRange(i + 1, columnIndex + 1).setValue(updateData[key]);
          }
        });
        
        Logger.log(`Updated IHB ${ihbId} information`);
        return true;
      }
    }
    
    throw new Error(`IHB ${ihbId} not found`);
    
  } catch (error) {
    Logger.log(`Error updating IHB info: ${error.toString()}`);
    throw error;
  }
}
