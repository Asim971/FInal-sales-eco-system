/**
 * @fileoverview This file contains Retailer Point Request management functionality.
 */

/**
 * Handles the onFormSubmit event for the Retailer Point Request form.
 * @param {Object} e The event object from the form submission.
 */
function handleRetailerPointFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS, CONFIG.SCHEMAS.RETAILER_POINT_REQUESTS);
    
    // Generate unique Request ID
    const requestId = generateRetailerPointRequestId();
    
    // Extract form data
    const responses = e.values;
    
    // DEBUG: Log all form responses to understand the structure
    Logger.log('Retailer Point Form submission data:');
    Logger.log('e.values: ' + JSON.stringify(responses));
    Logger.log('e.namedValues: ' + JSON.stringify(e.namedValues || 'Not available'));
    
    // Extract email using the same approach as IHB
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
    
    // Map form responses
    const requestData = {
      timestamp: responses[0] || new Date(),
      requestId: requestId,
      submitterEmail: submitterEmail,
      territoryName: responses[2] || '',
      location: responses[3] || '',
      selectCompany: responses[4] || '',
      status: 'Pending Review',
      asmNotes: '',
      approvalDate: '',
      notes: ''
    };
    
    // Add data to CRM sheet
    const rowData = [
      requestData.timestamp,
      requestData.requestId,
      requestData.submitterEmail,
      requestData.territoryName,
      requestData.location,
      requestData.selectCompany,
      requestData.status,
      requestData.asmNotes,
      requestData.approvalDate,
      requestData.notes
    ];
    
    sheet.appendRow(rowData);
    
    // Send notifications
    sendRetailerPointNotifications(requestData);
    
    Logger.log(`Retailer Point request submitted: ${requestData.requestId} for territory ${requestData.territoryName}`);
    
  } catch (error) {
    Logger.log(`Error processing Retailer Point request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Generates a unique Request ID for retailer point requests.
 * @return {string} The generated Request ID.
 */
function generateRetailerPointRequestId() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS, CONFIG.SCHEMAS.RETAILER_POINT_REQUESTS);
  const lastRow = sheet.getLastRow();
  
  // Generate ID in format: RPR-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
  
  // Count requests for today
  let requestCount = 1;
  if (lastRow > 1) {
    const requestIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    const todayRequests = requestIds.filter(id => id && id.includes(dateStr));
    requestCount = todayRequests.length + 1;
  }
  
  return `RPR-${dateStr}-${requestCount.toString().padStart(3, '0')}`;
}

/**
 * Sends WhatsApp notifications for new retailer point request.
 * Sends to both the submitter (BDO/CRO) and the appropriate ASM.
 * @param {Object} requestData The retailer point request data.
 */
function sendRetailerPointNotifications(requestData) {
  try {
    console.log('📬 Sending Retailer Point Request notifications...');
    
    // Look up submitter details
    const submitterEmployee = findEmployeeByEmail(requestData.submitterEmail);
    
    if (!submitterEmployee) {
      console.error(`Could not find employee record for: ${requestData.submitterEmail}`);
      return;
    }
    
    console.log(`Request submitted by: ${submitterEmployee.name} (${submitterEmployee.role})`);
    
    // Validate that submitter is BDO or CRO
    if (!['BDO', 'CRO'].includes(submitterEmployee.role)) {
      console.warn(`Retailer Point request submitted by ${submitterEmployee.role} - expected BDO or CRO`);
    }
    
    // Create message for the submitter (BDO/CRO)
    const submitterMessage = `🏪 *Retailer Point Request Submitted*

*Request ID:* ${requestData.requestId}
*Territory:* ${requestData.territoryName}
*Location:* ${requestData.location}
*Company:* ${requestData.selectCompany}

*Status:* Pending ASM Review

Your retailer point request has been submitted successfully and is now pending review from the Area Sales Manager.

*Submitted by:* ${submitterEmployee.name} (${submitterEmployee.role})
*Submission Time:* ${new Date().toLocaleString()}`;

    // Create enhanced message for the ASM
    const asmMessage = `🏪 *New Retailer Point Request - ACTION REQUIRED*

*Request ID:* ${requestData.requestId}
*Submitted by:* ${submitterEmployee.name} (${submitterEmployee.role})
*Submitter Email:* ${requestData.submitterEmail}
*Territory:* ${requestData.territoryName}
*Location:* ${requestData.location}
*Company:* ${requestData.selectCompany}

*Status:* Pending Your Review

📝 *Action Required:*
Please review this retailer point request and approve or reject it through the CRM system.

*Review Guidelines:*
- Verify location feasibility
- Check territory coverage
- Assess market potential
- Ensure compliance with company policies

*Submission Time:* ${new Date().toLocaleString()}`;

    // Send notification to submitter (BDO/CRO)
    if (submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, submitterMessage);
      console.log(`Retailer Point confirmation sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`No WhatsApp number found for submitter: ${submitterEmployee.name}`);
    }

    // Find and notify the appropriate ASM
    const asm = findASMByTerritoryAndCompany(requestData.territoryName, requestData.selectCompany);
    if (asm && asm.whatsappNumber) {
      sendWhatsAppMessage(asm.whatsappNumber, asmMessage);
      console.log(`Retailer Point notification sent to ASM ${asm.name} at ${asm.whatsappNumber}`);
    } else {
      console.error(`Could not find ASM for territory: ${requestData.territoryName}, company: ${requestData.selectCompany}`);
      
      // Fallback: Send to all ASMs of the same company as backup
      sendFallbackASMNotification(requestData, asmMessage);
    }
    
    console.log('✅ Retailer Point Request notifications sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending Retailer Point notifications:', error);
    Logger.log(`Error sending Retailer Point notifications: ${error.toString()}`);
  }
}

/**
 * Sends fallback notification to all ASMs of the same company when specific ASM is not found.
 * @param {Object} requestData The retailer point request data.
 * @param {string} originalMessage The original ASM message.
 */
function sendFallbackASMNotification(requestData, originalMessage) {
  try {
    console.log('🔄 Sending fallback notifications to all ASMs of company:', requestData.selectCompany);
    
    // Find all ASMs for the company
    const allASMs = findEmployeesByRole(['ASM']);
    const companyASMs = allASMs.filter(asm => asm.company === requestData.selectCompany);
    
    if (companyASMs.length === 0) {
      console.error(`No ASMs found for company: ${requestData.selectCompany}`);
      return;
    }
    
    const fallbackMessage = `⚠️ *FALLBACK NOTIFICATION*\n\n${originalMessage}\n\n⚠️ *Note:* No specific ASM found for territory "${requestData.territoryName}". Please coordinate among ASMs to assign responsibility for this request.`;
    
    companyASMs.forEach(asm => {
      if (asm.whatsappNumber) {
        try {
          sendWhatsAppMessage(asm.whatsappNumber, fallbackMessage);
          console.log(`Fallback notification sent to ASM ${asm.name} (${asm.territory || 'No territory'}) at ${asm.whatsappNumber}`);
        } catch (error) {
          console.error(`Failed to send fallback notification to ${asm.name}:`, error);
        }
      } else {
        console.warn(`ASM ${asm.name} has no WhatsApp number`);
      }
    });
    
  } catch (error) {
    console.error('Error in sendFallbackASMNotification:', error);
  }
}

/**
 * Finds the appropriate ASM based on territory and company.
 * @param {string} territory The territory name.
 * @param {string} company The company (ACL or AIL).
 * @return {Object|null} ASM employee details or null if not found.
 */
function findASMByTerritoryAndCompany(territory, company) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
    
    if (!sheet) {
      Logger.log('Employees sheet not found');
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find column indices
    const roleIndex = headers.indexOf('Role');
    const companyIndex = headers.indexOf('Company');
    const territoryIndex = headers.indexOf('Territory');
    const areaIndex = headers.indexOf('Area');
    
    Logger.log(`Looking for ASM with territory: ${territory}, company: ${company}`);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Check if this is an ASM for the right company and territory
      if (row[roleIndex] === 'ASM' && 
          row[companyIndex] === company && 
          row[territoryIndex] === territory) {
        
        const asm = {
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
          territory: row[11],
          area: row[12],
          legacyId: row[13],
          notes: row[14]
        };
        
        Logger.log(`Found ASM: ${asm.name} for territory ${territory}, company ${company}`);
        return asm;
      }
    }
    
    Logger.log(`No ASM found for territory: ${territory}, company: ${company}`);
    return null;
    
  } catch (error) {
    Logger.log(`Error finding ASM: ${error.toString()}`);
    return null;
  }
}

/**
 * Approves a retailer point request.
 * @param {string} requestId The request ID to approve.
 * @param {string} asmNotes Optional notes from ASM.
 */
function approveRetailerPointRequest(requestId, asmNotes = '') {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS);
    
    if (!sheet) {
      throw new Error('Retailer Point Requests sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === requestId) { // Column B contains Request ID
        // Update the record
        sheet.getRange(i + 1, 7).setValue('Approved'); // Status column
        sheet.getRange(i + 1, 8).setValue(asmNotes); // ASM Notes column
        sheet.getRange(i + 1, 9).setValue(new Date()); // Approval Date column
        
        // Send approval notification
        sendRetailerPointApprovalNotification(data[i]);
        
        Logger.log(`Approved Retailer Point request: ${requestId}`);
        return true;
      }
    }
    
    throw new Error(`Retailer Point request ${requestId} not found`);
    
  } catch (error) {
    Logger.log(`Error approving Retailer Point request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Rejects a retailer point request.
 * @param {string} requestId The request ID to reject.
 * @param {string} reason The reason for rejection.
 */
function rejectRetailerPointRequest(requestId, reason) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS);
    
    if (!sheet) {
      throw new Error('Retailer Point Requests sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === requestId) { // Column B contains Request ID
        sheet.getRange(i + 1, 7).setValue('Rejected'); // Status column
        sheet.getRange(i + 1, 8).setValue(reason); // ASM Notes column
        
        // Send rejection notification
        sendRetailerPointRejectionNotification(data[i], reason);
        
        Logger.log(`Rejected Retailer Point request: ${requestId}, reason: ${reason}`);
        return true;
      }
    }
    
    throw new Error(`Retailer Point request ${requestId} not found`);
    
  } catch (error) {
    Logger.log(`Error rejecting Retailer Point request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Sends approval notification for retailer point request.
 * @param {Array} requestData The request data row.
 */
function sendRetailerPointApprovalNotification(requestData) {
  try {
    // Look up submitter details for enhanced messaging
    const submitterEmail = requestData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    const message = `✅ *Retailer Point Request Approved*

*Request ID:* ${requestData[1]}
*Territory:* ${requestData[3]}
*Location:* ${requestData[4]}
*Company:* ${requestData[5]}

Your retailer point request has been approved by the ASM.

*Approval Details:*
- Status: Approved
- Submitted by: ${submitterEmployee ? `${submitterEmployee.name} (${submitterEmployee.role})` : submitterEmail}
- Approval Date: ${new Date().toLocaleString()}

📋 *Next Steps:*
Proceed with setting up the retailer point according to company guidelines.`;

    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      console.log(`Retailer Point approval notification sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    console.error('Error sending Retailer Point approval notification:', error);
    Logger.log(`Error sending Retailer Point approval notification: ${error.toString()}`);
  }
}

/**
 * Sends rejection notification for retailer point request.
 * @param {Array} requestData The request data row.
 * @param {string} reason The reason for rejection.
 */
function sendRetailerPointRejectionNotification(requestData, reason) {
  try {
    // Look up submitter details for enhanced messaging
    const submitterEmail = requestData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    const message = `❌ *Retailer Point Request Rejected*

*Request ID:* ${requestData[1]}
*Territory:* ${requestData[3]}
*Location:* ${requestData[4]}
*Company:* ${requestData[5]}
*Rejection Reason:* ${reason}

*Rejection Details:*
- Status: Rejected by ASM
- Submitted by: ${submitterEmployee ? `${submitterEmployee.name} (${submitterEmployee.role})` : submitterEmail}
- Rejection Date: ${new Date().toLocaleString()}

📋 *Next Steps:*
Please contact your ASM for more information or to resubmit with corrections. Review the rejection reason and address any concerns before resubmission.`;

    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      console.log(`Retailer Point rejection notification sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    console.error('Error sending Retailer Point rejection notification:', error);
    Logger.log(`Error sending Retailer Point rejection notification: ${error.toString()}`);
  }
}

/**
 * Handles edits to the Retailer Point Requests sheet for status changes.
 * @param {Object} e The edit event object.
 */
function handleRetailerPointRequestsEdit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Check if edit is in the Status column (column 7)
  if (col === 7 && row > 1) {
    const newStatus = e.range.getValue();
    const requestId = sheet.getRange(row, 2).getValue(); // Request ID in column B
    
    if (newStatus === 'Approved') {
      // Auto-approve when status is changed to 'Approved'
      const asmNotes = sheet.getRange(row, 8).getValue() || 'Approved via status change';
      approveRetailerPointRequest(requestId, asmNotes);
    } else if (newStatus === 'Rejected') {
      // Auto-reject when status is changed to 'Rejected'
      const reason = sheet.getRange(row, 8).getValue() || 'Rejected via status change';
      rejectRetailerPointRequest(requestId, reason);
    }
  }
}
