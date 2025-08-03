/**
 * @fileoverview This file contains Demand Generation Request management functionality.
 * ASMs submit demand generation requests which are reviewed by BD Incharge personnel.
 */

/**
 * Handles the onFormSubmit event for the Demand Generation Request form.
 * @param {Object} e The event object from the form submission.
 */
function handleDemandGenerationFormSubmit(e) {
  try {
    console.log('📈 Processing Demand Generation Request...');
    
    // Validate event object
    if (!e) {
      throw new Error('Event object is undefined. Function must be called with form submission event data.');
    }
    
    if (!e.values && !e.namedValues) {
      throw new Error('Event object missing form data. Both e.values and e.namedValues are undefined.');
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM,
      CONFIG.SHEET_NAMES.DEMAND_GENERATION_REQUESTS,
      CONFIG.SCHEMAS.DEMAND_GENERATION_REQUESTS
    );
    
    // Generate unique Request ID
    const requestId = generateDemandGenerationRequestId();
    
    // Extract form data with fallback handling
    const responses = e.values || [];
    
    // DEBUG: Log all form responses to understand the structure
    console.log('Demand Generation Form submission data:');
    console.log('e.values:', JSON.stringify(responses));
    console.log('e.namedValues:', JSON.stringify(e.namedValues || 'Not available'));
    
    // Extract email using the same approach as other forms
    let submitterEmail = '';
    
    // Try to get email from values array first
    if (responses && responses.length > 1) {
      submitterEmail = responses[1] || '';
    }
    
    // Try to get email from different sources if not found
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
      console.log('Found email in namedValues:', submitterEmail);
    }
    
    // If still no email, try to get from response source
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
      console.log('Found email from response:', submitterEmail);
    }
    
    if (!submitterEmail) {
      throw new Error('Cannot determine submitter email from form submission data');
    }
    
    console.log('Final submitter email:', submitterEmail);
    
    // Map form responses based on DEMAND_GENERATION_REQUEST form structure
    // Handle missing values with safe array access
    const requestData = {
      timestamp: (responses && responses[0]) ? responses[0] : new Date(),
      requestId: requestId,
      submitterEmail: submitterEmail,
      territory: (responses && responses[2]) ? responses[2] : '',
      bazaar: (responses && responses[3]) ? responses[3] : '',
      area: (responses && responses[4]) ? responses[4] : '',
      reason: (responses && responses[5]) ? responses[5] : '',
      businessUnit: (responses && responses[6]) ? responses[6] : '',
      status: 'Pending Review',
      bdInchargeNotes: '',
      approvalDate: '',
      notes: ''
    };
    
    // Validate submitter is ASM
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    if (submitterEmployee && submitterEmployee.role !== 'ASM') {
      console.warn(`Demand Generation request submitted by ${submitterEmployee.role} - expected ASM`);
    }
    
    // Add data to CRM sheet
    const rowData = [
      requestData.timestamp,
      requestData.requestId,
      requestData.submitterEmail,
      requestData.territory,
      requestData.bazaar,
      requestData.area,
      requestData.reason,
      requestData.businessUnit,
      requestData.status,
      requestData.bdInchargeNotes,
      requestData.approvalDate,
      requestData.notes
    ];
    
    appendRow(sheet, rowData);
    
    // Send notifications using centralized notification system
    const notificationData = {
      formType: 'DEMAND_GENERATION_REQUEST',
      submitterEmail: requestData.submitterEmail,
      territory: requestData.territory,
      formData: {
        territory: requestData.territory,
        bazaar: requestData.bazaar,
        area: requestData.area,
        reason: requestData.reason,
        businessUnit: requestData.businessUnit,
        requestId: requestData.requestId
      }
    };
    
    sendFormNotification(notificationData);
    
    console.log(`✅ Demand Generation request submitted: ${requestData.requestId} for territory ${requestData.territory}`);
    
  } catch (error) {
    console.error('❌ Error processing Demand Generation request:', error);
    Logger.log(`Error processing Demand Generation request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Generates a unique Request ID for demand generation requests.
 * @return {string} The generated Request ID in format DGR-YYYYMMDD-XXX.
 */
function generateDemandGenerationRequestId() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM,
      CONFIG.SHEET_NAMES.DEMAND_GENERATION_REQUESTS,
      CONFIG.SCHEMAS.DEMAND_GENERATION_REQUESTS
    );
    const lastRow = sheet.getLastRow();
    
    // Generate ID in format: DGR-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
    
    // Count requests for today
    let requestCount = 1;
    if (lastRow > 1) {
      const requestIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      const todayRequests = requestIds.filter(id => id && id.includes(dateStr));
      requestCount = todayRequests.length + 1;
    }
    
    return `DGR-${dateStr}-${requestCount.toString().padStart(3, '0')}`;
    
  } catch (error) {
    console.error('Error generating Demand Generation Request ID:', error);
    // Fallback to UUID-based ID if sequential generation fails
    return `DGR-${Utilities.getUuid().substring(0, 8).toUpperCase()}`;
  }
}

/**
 * Sends WhatsApp notifications for new demand generation request.
 * Sends to both the submitter (ASM) and the appropriate BD Incharge.
 * @param {Object} requestData The demand generation request data.
 */
function sendDemandGenerationNotifications(requestData) {
  try {
    console.log('📬 Sending Demand Generation Request notifications...');
    
    // Look up submitter details
    const submitterEmployee = findEmployeeByEmail(requestData.submitterEmail);
    
    if (!submitterEmployee) {
      console.error(`Could not find employee record for: ${requestData.submitterEmail}`);
      return;
    }
    
    console.log(`Request submitted by: ${submitterEmployee.name} (${submitterEmployee.role})`);
    
    // Validate that submitter is ASM
    if (submitterEmployee.role !== 'ASM') {
      console.warn(`Demand Generation request submitted by ${submitterEmployee.role} - expected ASM`);
    }
    
    // Create message for the submitter (ASM)
    const submitterMessage = `📈 *Demand Generation Request Submitted*

*Request ID:* ${requestData.requestId}
*Territory:* ${requestData.territory}
*Bazaar:* ${requestData.bazaar}
*Area:* ${requestData.area}
*Business Unit:* ${requestData.businessUnit}

*Status:* Pending BD Incharge Review

Your demand generation request has been submitted successfully and is now pending review from the BD Incharge.

*Submitted by:* ${submitterEmployee.name} (${submitterEmployee.role})
*Submission Time:* ${new Date().toLocaleString()}

*Request Summary:*
${requestData.reason}`;

    // Create enhanced message for the BD Incharge
    const bdInchargeMessage = `📈 *New Demand Generation Request - ACTION REQUIRED*

*Request ID:* ${requestData.requestId}
*Submitted by:* ${submitterEmployee.name} (${submitterEmployee.role})
*Submitter Email:* ${requestData.submitterEmail}
*Territory:* ${requestData.territory}
*Bazaar:* ${requestData.bazaar}
*Area:* ${requestData.area}
*Business Unit:* ${requestData.businessUnit}

*Status:* Pending Your Review

*Request Details:*
${requestData.reason}

📝 *Action Required:*
Please review this demand generation request and approve or reject it through the CRM system.

*Review Guidelines:*
- Assess market potential and viability
- Evaluate resource requirements
- Check alignment with business strategy
- Verify territory and area feasibility
- Ensure compliance with business unit policies

*Submission Time:* ${new Date().toLocaleString()}`;

    // Send notification to submitter (ASM)
    if (submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, submitterMessage);
      console.log(`Demand Generation confirmation sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`No WhatsApp number found for submitter: ${submitterEmployee.name}`);
    }

    // Find and notify the appropriate BD Incharge
    const bdInchargeEmployees = findBDInchargeByTerritoryAndBusinessUnit(requestData.territory, requestData.businessUnit);
    
    if (bdInchargeEmployees.length > 0) {
      bdInchargeEmployees.forEach(bdIncharge => {
        if (bdIncharge.whatsappNumber) {
          try {
            sendWhatsAppMessage(bdIncharge.whatsappNumber, bdInchargeMessage);
            console.log(`Demand Generation notification sent to BD Incharge ${bdIncharge.name} at ${bdIncharge.whatsappNumber}`);
          } catch (error) {
            console.error(`Failed to send notification to BD Incharge ${bdIncharge.name}:`, error);
          }
        } else {
          console.warn(`BD Incharge ${bdIncharge.name} has no WhatsApp number`);
        }
      });
    } else {
      console.error(`Could not find BD Incharge for territory: ${requestData.territory}, business unit: ${requestData.businessUnit}`);
      
      // Fallback: Send to all BD Incharge of the same business unit as backup
      sendFallbackBDInchargeNotification(requestData, bdInchargeMessage);
    }
    
    console.log('✅ Demand Generation Request notifications sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending Demand Generation notifications:', error);
    Logger.log(`Error sending Demand Generation notifications: ${error.toString()}`);
  }
}

/**
 * Sends fallback notification to all BD Incharge of the same business unit when specific BD Incharge is not found.
 * @param {Object} requestData The demand generation request data.
 * @param {string} originalMessage The original BD Incharge message.
 */
function sendFallbackBDInchargeNotification(requestData, originalMessage) {
  try {
    console.log('🔄 Sending fallback notifications to all BD Incharge of business unit:', requestData.businessUnit);
    
    // Find all BD Incharge for the business unit
    const allBDIncharge = findEmployeesByRole(['BD Incharge', 'BDO']); // Include BDO as fallback
    const businessUnitBDIncharge = allBDIncharge.filter(bd => 
      bd.company === requestData.businessUnit || 
      (bd.role === 'BD Incharge' && (bd.territory === requestData.territory || !bd.territory))
    );
    
    if (businessUnitBDIncharge.length === 0) {
      console.error(`No BD Incharge found for business unit: ${requestData.businessUnit}`);
      return;
    }
    
    const fallbackMessage = `⚠️ *FALLBACK NOTIFICATION*\n\n${originalMessage}\n\n⚠️ *Note:* No specific BD Incharge found for territory "${requestData.territory}" and business unit "${requestData.businessUnit}". Please coordinate among BD team to assign responsibility for this request.`;
    
    businessUnitBDIncharge.forEach(bdIncharge => {
      if (bdIncharge.whatsappNumber) {
        try {
          sendWhatsAppMessage(bdIncharge.whatsappNumber, fallbackMessage);
          console.log(`Fallback notification sent to BD Incharge ${bdIncharge.name} (${bdIncharge.territory || 'No territory'}) at ${bdIncharge.whatsappNumber}`);
        } catch (error) {
          console.error(`Failed to send fallback notification to ${bdIncharge.name}:`, error);
        }
      } else {
        console.warn(`BD Incharge ${bdIncharge.name} has no WhatsApp number`);
      }
    });
    
  } catch (error) {
    console.error('Error in sendFallbackBDInchargeNotification:', error);
  }
}

/**
 * Finds the appropriate BD Incharge based on territory and business unit.
 * @param {string} territory The territory name.
 * @param {string} businessUnit The business unit (ACL or AIL).
 * @return {Array} Array of BD Incharge employee details.
 */
function findBDInchargeByTerritoryAndBusinessUnit(territory, businessUnit) {
  try {
    const allEmployees = findEmployeesByRole(['BD Incharge', 'BDO']); // Include BDO as fallback role
    
    console.log(`Looking for BD Incharge with territory: ${territory}, business unit: ${businessUnit}`);
    
    // First try to find exact matches with BD Incharge role
    let bdInchargeEmployees = allEmployees.filter(employee => 
      employee.role === 'BD Incharge' && 
      employee.company === businessUnit && 
      employee.territory === territory
    );
    
    // If no exact match found, try broader matches
    if (bdInchargeEmployees.length === 0) {
      console.log('No exact BD Incharge match found, trying broader search...');
      
      // Try business unit match only
      bdInchargeEmployees = allEmployees.filter(employee => 
        employee.role === 'BD Incharge' && 
        employee.company === businessUnit
      );
      
      // If still no match, try BDO role as fallback
      if (bdInchargeEmployees.length === 0) {
        console.log('No BD Incharge found, trying BDO as fallback...');
        bdInchargeEmployees = allEmployees.filter(employee => 
          employee.role === 'BDO' && 
          employee.company === businessUnit
        );
      }
    }
    
    console.log(`Found ${bdInchargeEmployees.length} BD Incharge/BDO employees for territory ${territory}, business unit ${businessUnit}`);
    
    return bdInchargeEmployees;
    
  } catch (error) {
    console.error(`Error finding BD Incharge: ${error.toString()}`);
    return [];
  }
}

/**
 * Approves a demand generation request.
 * @param {string} requestId The request ID to approve.
 * @param {string} bdInchargeNotes Optional notes from BD Incharge.
 */
function approveDemandGenerationRequest(requestId, bdInchargeNotes = '') {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DEMAND_GENERATION_REQUESTS);
    
    if (!sheet) {
      throw new Error('Demand Generation Requests sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === requestId) { // Column B contains Request ID
        // Update the record
        sheet.getRange(i + 1, 9).setValue('Approved'); // Status column
        sheet.getRange(i + 1, 10).setValue(bdInchargeNotes); // BD Incharge Notes column
        sheet.getRange(i + 1, 11).setValue(new Date()); // Approval Date column
        
        // Send approval notification
        sendDemandGenerationApprovalNotification(data[i]);
        
        console.log(`Approved Demand Generation request: ${requestId}`);
        return true;
      }
    }
    
    throw new Error(`Demand Generation request ${requestId} not found`);
    
  } catch (error) {
    console.error(`Error approving Demand Generation request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Rejects a demand generation request.
 * @param {string} requestId The request ID to reject.
 * @param {string} reason The reason for rejection.
 */
function rejectDemandGenerationRequest(requestId, reason) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DEMAND_GENERATION_REQUESTS);
    
    if (!sheet) {
      throw new Error('Demand Generation Requests sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === requestId) { // Column B contains Request ID
        sheet.getRange(i + 1, 9).setValue('Rejected'); // Status column
        sheet.getRange(i + 1, 10).setValue(reason); // BD Incharge Notes column
        
        // Send rejection notification
        sendDemandGenerationRejectionNotification(data[i], reason);
        
        console.log(`Rejected Demand Generation request: ${requestId}, reason: ${reason}`);
        return true;
      }
    }
    
    throw new Error(`Demand Generation request ${requestId} not found`);
    
  } catch (error) {
    console.error(`Error rejecting Demand Generation request: ${error.toString()}`);
    throw error;
  }
}

/**
 * Sends approval notification for demand generation request.
 * @param {Array} requestData The request data row.
 */
function sendDemandGenerationApprovalNotification(requestData) {
  try {
    // Look up submitter details for enhanced messaging
    const submitterEmail = requestData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    const message = `✅ *Demand Generation Request Approved*

*Request ID:* ${requestData[1]}
*Territory:* ${requestData[3]}
*Bazaar:* ${requestData[4]}
*Area:* ${requestData[5]}
*Business Unit:* ${requestData[7]}

Your demand generation request has been approved by the BD Incharge.

*Approval Details:*
- Status: Approved
- Submitted by: ${submitterEmployee ? `${submitterEmployee.name} (${submitterEmployee.role})` : submitterEmail}
- Approval Date: ${new Date().toLocaleString()}

📋 *Next Steps:*
Proceed with implementing the demand generation strategy according to approved guidelines. Coordinate with your team and track progress through the CRM system.`;

    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      console.log(`Demand Generation approval notification sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    console.error('Error sending Demand Generation approval notification:', error);
    Logger.log(`Error sending Demand Generation approval notification: ${error.toString()}`);
  }
}

/**
 * Sends rejection notification for demand generation request.
 * @param {Array} requestData The request data row.
 * @param {string} reason The reason for rejection.
 */
function sendDemandGenerationRejectionNotification(requestData, reason) {
  try {
    // Look up submitter details for enhanced messaging
    const submitterEmail = requestData[2]; // Submitter Email column
    const submitterEmployee = findEmployeeByEmail(submitterEmail);
    
    const message = `❌ *Demand Generation Request Rejected*

*Request ID:* ${requestData[1]}
*Territory:* ${requestData[3]}
*Bazaar:* ${requestData[4]}
*Area:* ${requestData[5]}
*Business Unit:* ${requestData[7]}
*Rejection Reason:* ${reason}

*Rejection Details:*
- Status: Rejected by BD Incharge
- Submitted by: ${submitterEmployee ? `${submitterEmployee.name} (${submitterEmployee.role})` : submitterEmail}
- Rejection Date: ${new Date().toLocaleString()}

📋 *Next Steps:*
Please contact your BD Incharge for more information or to resubmit with modifications. Review the rejection reason and address any concerns before resubmission.`;

    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      console.log(`Demand Generation rejection notification sent to ${submitterEmployee.name} (${submitterEmployee.role}) at ${submitterEmployee.whatsappNumber}`);
    } else {
      console.error(`Could not find WhatsApp number for submitter: ${submitterEmail}`);
    }
    
  } catch (error) {
    console.error('Error sending Demand Generation rejection notification:', error);
    Logger.log(`Error sending Demand Generation rejection notification: ${error.toString()}`);
  }
}

/**
 * Handles edits to the Demand Generation Requests sheet for status changes.
 * @param {Object} e The edit event object.
 */
function handleDemandGenerationRequestsEdit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  // Check if edit is in the Status column (column 9)
  if (col === 9 && row > 1) {
    const newStatus = e.range.getValue();
    const requestId = sheet.getRange(row, 2).getValue(); // Request ID in column B
    
    if (newStatus === 'Approved') {
      // Auto-approve when status is changed to 'Approved'
      const bdInchargeNotes = sheet.getRange(row, 10).getValue() || 'Approved via status change';
      approveDemandGenerationRequest(requestId, bdInchargeNotes);
    } else if (newStatus === 'Rejected') {
      // Auto-reject when status is changed to 'Rejected'
      const reason = sheet.getRange(row, 10).getValue() || 'Rejected via status change';
      rejectDemandGenerationRequest(requestId, reason);
    }
  }
}
