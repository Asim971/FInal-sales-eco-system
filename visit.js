/**
 * @fileoverview This file contains visit management functionality.
 */

/**
 * Handles the onFormSubmit event for the Visit form.
 * @param {Object} e The event object from the form submission.
 */
function handleVisitFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.VISITS, CONFIG.SCHEMAS.VISITS);
    
    // Generate unique Visit ID
    const visitId = generateVisitId();
    
    // Extract form data
    const responses = e.values;
    
    // DEBUG: Log all form responses to understand the structure
    Logger.log('Visit form submission data:');
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
    const visitData = {
      timestamp: responses[0] || new Date(),
      visitId: visitId,
      submitterEmail: submitterEmail,
      typeOfVisit: responses[2] || '',
      territory: responses[3] || '',
      typeOfClient: responses[4] || '',
      clientName: responses[5] || '',
      clientPhone: responses[6] || '',
      clientAddress: responses[7] || '',
      visitPurpose: responses[8] || '',
      imageLink: responses[9] || '',
      status: 'Submitted',
      followupRequired: 'No',
      notes: ''
    };
    
    // Add data to CRM sheet
    const rowData = [
      visitData.timestamp,
      visitData.visitId,
      visitData.submitterEmail,
      visitData.typeOfVisit,
      visitData.territory,
      visitData.typeOfClient,
      visitData.clientName,
      visitData.clientPhone,
      visitData.clientAddress,
      visitData.visitPurpose,
      visitData.imageLink,
      visitData.status,
      visitData.followupRequired,
      visitData.notes
    ];
    
    sheet.appendRow(rowData);
    
    // Send notification to relevant team members
    sendVisitNotification(visitData);
    
    Logger.log(`Visit submission processed: ${visitData.visitId}`);
    
  } catch (error) {
    Logger.log(`Error processing visit submission: ${error.toString()}`);
    throw error;
  }
}

/**
 * Generates a unique Visit ID.
 * @return {string} The generated Visit ID.
 */
function generateVisitId() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.VISITS, CONFIG.SCHEMAS.VISITS);
  const lastRow = sheet.getLastRow();
  
  // Generate ID in format: V-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
  
  // Count visits for today
  let visitCount = 1;
  if (lastRow > 1) {
    const visitIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    const todayVisits = visitIds.filter(id => id && id.includes(dateStr));
    visitCount = todayVisits.length + 1;
  }
  
  return `V-${dateStr}-${visitCount.toString().padStart(3, '0')}`;
}

/**
 * Sends WhatsApp notification for new visit submission.
 * @param {Object} visitData The visit data object.
 */
function sendVisitNotification(visitData) {
  try {
    // Look up client data based on client type and phone number
    const clientData = lookupClientData(visitData.typeOfClient, visitData.clientPhone);
    
    let clientInfo = '';
    if (clientData) {
      switch (visitData.typeOfClient.toLowerCase()) {
        case 'retailer':
          clientInfo = `\n*Client Details:*
*Retailer Name:* ${clientData.name}
*Contact:* ${clientData.contactNumber}
*NID:* ${clientData.nidNo}
*Status:* ${clientData.status}`;
          break;
        case 'ihb':
          clientInfo = `\n*Client Details:*
*IHB Name:* ${clientData.name}
*Email:* ${clientData.email}
*Mobile:* ${clientData.mobileNumber}
*NID:* ${clientData.nidNumber}
*Address:* ${clientData.address}
*IHB ID:* ${clientData.ihbId || 'Pending'}
*Status:* ${clientData.status}`;
          break;
        case 'dealer':
          clientInfo = `\n*Client Details:*
*Dealer Name:* ${clientData.name}
*Contact:* ${clientData.contactNumber}
*NID:* ${clientData.nidNo}
*Territory:* ${clientData.territory}
*Company:* ${clientData.company}
*Status:* ${clientData.status}`;
          break;
        case 'partner':
          clientInfo = `\n*Client Details:*
*Partner Name:* ${clientData.name}
*Partner Type:* ${clientData.partnerType}
*Partner ID:* ${clientData.partnerId}
*Contact:* ${clientData.contactNumber}
*bKash:* ${clientData.bkashNumber}
*WhatsApp:* ${clientData.whatsappNumber || 'Not provided'}
*NID:* ${clientData.nidNo}
*Status:* ${clientData.status}`;
          break;
      }
    } else {
      clientInfo = `\n⚠️ *Client Not Found:* No ${visitData.typeOfClient} record found with phone number ${visitData.clientPhone}`;
    }

    const message = `🏠 *Visit Submitted Successfully*

*Visit ID:* ${visitData.visitId}
*Visit Type:* ${visitData.typeOfVisit}
*Territory:* ${visitData.territory}
*Client:* ${visitData.clientName} (${visitData.typeOfClient})
*Phone:* ${visitData.clientPhone}
*Purpose:* ${visitData.visitPurpose}${clientInfo}

Your visit has been recorded successfully and is now in the system for tracking.`;

    // Look up submitter's WhatsApp number from employees sheet
    const submitterEmployee = findEmployeeByEmail(visitData.submitterEmail);
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      Logger.log(`Visit notification sent to ${submitterEmployee.name} at ${submitterEmployee.whatsappNumber}`);
    } else {
      Logger.log(`Could not find WhatsApp number for submitter: ${visitData.submitterEmail}`);
    }
    
  } catch (error) {
    Logger.log(`Error sending visit notification: ${error.toString()}`);
  }
}

/**
 * Updates visit status.
 * @param {string} visitId The visit ID to update.
 * @param {string} newStatus The new status.
 * @param {string} notes Optional notes.
 */
function updateVisitStatus(visitId, newStatus, notes = '') {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      throw new Error('Visits sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === visitId) { // Column B contains Visit ID
        sheet.getRange(i + 1, 12).setValue(newStatus); // Status column
        if (notes) {
          sheet.getRange(i + 1, 14).setValue(notes); // Notes column
        }
        
        Logger.log(`Updated visit ${visitId} status to: ${newStatus}`);
        return true;
      }
    }
    
    throw new Error(`Visit ID ${visitId} not found`);
    
  } catch (error) {
    Logger.log(`Error updating visit status: ${error.toString()}`);
    throw error;
  }
}

/**
 * Gets all visits for a specific territory or submitter.
 * @param {string} filterType Either 'territory' or 'submitter'.
 * @param {string} filterValue The value to filter by.
 * @return {Array} Array of visit records.
 */
function getVisitsByFilter(filterType, filterValue) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const visits = [];
    
    const filterColumn = filterType === 'territory' ? 4 : 2; // Territory or Submitter Email
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][filterColumn] === filterValue) {
        const visit = {};
        headers.forEach((header, index) => {
          visit[header] = data[i][index];
        });
        visits.push(visit);
      }
    }
    
    return visits;
    
  } catch (error) {
    Logger.log(`Error getting visits: ${error.toString()}`);
    return [];
  }
}

/**
 * Looks up client data from appropriate sheet based on client type and phone number.
 * @param {string} clientType The type of client (Retailer, IHB, Dealer).
 * @param {string} phoneNumber The client's phone number.
 * @return {Object|null} Client data object or null if not found.
 */
function lookupClientData(clientType, phoneNumber) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    let sheetName, phoneColumn, dataMapping;
    
    switch (clientType.toLowerCase()) {
      case 'retailer':
        sheetName = CONFIG.SHEET_NAMES.RETAILER_APPROVALS;
        phoneColumn = 3; // 'Contact Number' column (0-indexed)
        dataMapping = (row) => ({
          name: row[2], // Retailer Name
          contactNumber: row[3], // Contact Number
          nidNo: row[4], // NID No
          status: row[7] // Status
        });
        break;
        
      case 'ihb':
        sheetName = CONFIG.SHEET_NAMES.IHB_APPROVALS;
        phoneColumn = 5; // 'Mobile Number' column (0-indexed)
        dataMapping = (row) => ({
          name: row[3], // IHB Name
          email: row[4], // IHB Email
          mobileNumber: row[5], // Mobile Number
          nidNumber: row[6], // NID Number
          address: row[7], // Address
          ihbId: row[12], // IHB ID
          status: row[11] // Status
        });
        break;
        
      case 'dealer':
        sheetName = CONFIG.SHEET_NAMES.DEALER_APPROVALS;
        phoneColumn = 3; // 'Contact Number' column (0-indexed)
        dataMapping = (row) => ({
          name: row[2], // Dealer Name
          contactNumber: row[3], // Contact Number
          nidNo: row[4], // NID No
          territory: row[9], // Territory
          company: row[10], // Company
          status: row[7] // Status
        });
        break;
        
      case 'partner':
        sheetName = CONFIG.SHEET_NAMES.CRM_APPROVALS;
        phoneColumn = 4; // 'Contact Number' column (0-indexed) for partners
        dataMapping = (row) => ({
          name: row[2], // Partner Name (Contractor Name in CRM_APPROVALS)
          contactNumber: row[4], // Contact Number
          bkashNumber: row[3], // Bkash Number
          nidNo: row[5], // NID No
          partnerId: row[10], // Partner ID
          partnerType: row[11], // Partner Type (Site Engineer/Partner)
          whatsappNumber: row[12], // WhatsApp Number
          status: row[8] // Status
        });
        break;
        
      default:
        Logger.log(`Unknown client type: ${clientType}`);
        return null;
    }
    
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`Sheet not found: ${sheetName}`);
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Search for matching phone number
    for (let i = 1; i < data.length; i++) { // Skip header row
      const row = data[i];
      const clientPhone = String(row[phoneColumn]).trim();
      const searchPhone = String(phoneNumber).trim();
      
      // Try multiple phone number formats
      if (clientPhone === searchPhone ||
          clientPhone === searchPhone.replace(/^0/, '+880') ||
          clientPhone === searchPhone.replace(/^\+880/, '0') ||
          clientPhone.replace(/[^0-9]/g, '') === searchPhone.replace(/[^0-9]/g, '')) {
        
        const clientData = dataMapping(row);
        Logger.log(`Found ${clientType} client:`, clientData);
        return clientData;
      }
    }
    
    Logger.log(`No ${clientType} found with phone number: ${phoneNumber}`);
    return null;
    
  } catch (error) {
    Logger.log(`Error looking up ${clientType} data: ${error.toString()}`);
    return null;
  }
}

/**
 * Marks a visit as requiring follow-up.
 * @param {string} visitId The visit ID.
 * @param {string} reason The reason for follow-up.
 */
function markVisitForFollowup(visitId, reason) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      throw new Error('Visits sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === visitId) { // Column B contains Visit ID
        sheet.getRange(i + 1, 13).setValue('Yes'); // Follow-up Required column
        sheet.getRange(i + 1, 14).setValue(reason); // Notes column
        
        Logger.log(`Marked visit ${visitId} for follow-up: ${reason}`);
        return true;
      }
    }
    
    throw new Error(`Visit ID ${visitId} not found`);
    
  } catch (error) {
    Logger.log(`Error marking visit for follow-up: ${error.toString()}`);
    throw error;
  }
}

/**
 * Updates an existing visit record with new information.
 * @param {string} visitId The visit ID to update.
 * @param {Object} updateData Object containing fields to update.
 * @return {boolean} True if update was successful.
 */
function updateVisitRecord(visitId, updateData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      throw new Error('Visits sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the visit record
    let visitRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === visitId) { // Column B contains Visit ID
        visitRowIndex = i;
        break;
      }
    }
    
    if (visitRowIndex === -1) {
      throw new Error(`Visit ID ${visitId} not found`);
    }
    
    // Map of updateable fields to their column indices
    const fieldMapping = {
      'typeOfVisit': 3,        // Column D: Type of Visit
      'territory': 4,          // Column E: Territory
      'typeOfClient': 5,       // Column F: Type of Client
      'clientName': 6,         // Column G: Client Name
      'clientPhone': 7,        // Column H: Client Phone Number
      'clientAddress': 8,      // Column I: Client Address
      'visitPurpose': 9,       // Column J: Visit Purpose/Notes
      'imageLink': 10,         // Column K: Upload Image Link
      'status': 11,            // Column L: Status
      'followupRequired': 12,  // Column M: Follow-up Required
      'notes': 13              // Column N: Notes
    };
    
    const updatedFields = [];
    const currentRow = visitRowIndex + 1; // Convert to 1-based indexing
    
    // Update each field that was provided
    Object.keys(updateData).forEach(field => {
      if (fieldMapping.hasOwnProperty(field)) {
        const columnIndex = fieldMapping[field] + 1; // Convert to 1-based indexing
        const newValue = updateData[field];
        const oldValue = data[visitRowIndex][fieldMapping[field]];
        
        sheet.getRange(currentRow, columnIndex).setValue(newValue);
        updatedFields.push(`${field}: "${oldValue}" → "${newValue}"`);
        
        Logger.log(`Updated ${field} for visit ${visitId}: ${oldValue} → ${newValue}`);
      } else {
        Logger.log(`Warning: Field "${field}" is not updateable or doesn't exist`);
      }
    });
    
    if (updatedFields.length === 0) {
      Logger.log('No valid fields provided for update');
      return false;
    }
    
    // Add update timestamp to notes if notes field wasn't explicitly updated
    if (!updateData.hasOwnProperty('notes')) {
      const currentNotes = data[visitRowIndex][13] || '';
      const updateTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      const updateNote = `\n[${updateTimestamp}] Visit updated: ${updatedFields.join(', ')}`;
      const newNotes = currentNotes + updateNote;
      
      sheet.getRange(currentRow, 14).setValue(newNotes); // Column N: Notes
    }
    
    Logger.log(`Successfully updated visit ${visitId}. Fields updated: ${updatedFields.length}`);
    
    // Send notification about the update
    sendVisitUpdateNotification(visitId, updatedFields, updateData);
    
    return true;
    
  } catch (error) {
    Logger.log(`Error updating visit record: ${error.toString()}`);
    throw error;
  }
}

/**
 * Gets a specific visit record by ID.
 * @param {string} visitId The visit ID to retrieve.
 * @return {Object|null} Visit record object or null if not found.
 */
function getVisitById(visitId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the visit record
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === visitId) { // Column B contains Visit ID
        const visit = {};
        headers.forEach((header, index) => {
          visit[header] = data[i][index];
        });
        return visit;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log(`Error getting visit by ID: ${error.toString()}`);
    return null;
  }
}

/**
 * Sends WhatsApp notification for visit updates.
 * @param {string} visitId The visit ID that was updated.
 * @param {Array} updatedFields Array of updated field descriptions.
 * @param {Object} updateData The update data object.
 */
function sendVisitUpdateNotification(visitId, updatedFields, updateData) {
  try {
    // Get the updated visit record
    const visitRecord = getVisitById(visitId);
    if (!visitRecord) {
      Logger.log(`Could not find visit record for notification: ${visitId}`);
      return;
    }
    
    const message = `📝 *Visit Updated Successfully*

*Visit ID:* ${visitId}
*Client:* ${visitRecord['Client Name']} (${visitRecord['Type of Client']})
*Territory:* ${visitRecord['Territory']}

*Updated Fields:*
${updatedFields.map(field => `• ${field}`).join('\n')}

*Current Status:* ${visitRecord['Status']}

Visit information has been updated in the system.`;

    // Look up submitter's WhatsApp number from employees sheet
    const submitterEmployee = findEmployeeByEmail(visitRecord['Email Address']);
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      sendWhatsAppMessage(submitterEmployee.whatsappNumber, message);
      Logger.log(`Visit update notification sent to ${submitterEmployee.name} at ${submitterEmployee.whatsappNumber}`);
    } else {
      Logger.log(`Could not find WhatsApp number for submitter: ${visitRecord['Email Address']}`);
    }
    
  } catch (error) {
    Logger.log(`Error sending visit update notification: ${error.toString()}`);
  }
}

/**
 * Handles the onFormSubmit event for the Visit Update form.
 * @param {Object} e The event object from the form submission.
 */
function handleVisitUpdateFormSubmit(e) {
  try {
    const responses = e.values;
    
    // DEBUG: Log form responses
    Logger.log('Visit Update form submission data:');
    Logger.log('e.values: ' + JSON.stringify(responses));
    Logger.log('e.namedValues: ' + JSON.stringify(e.namedValues || 'Not available'));
    
    // Extract submitter email
    let submitterEmail = responses[1] || '';
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    // Map form responses for update
    const visitId = responses[2] || ''; // Visit ID to update
    const updateData = {
      typeOfVisit: responses[3] || '',
      territory: responses[4] || '',
      typeOfClient: responses[5] || '',
      clientName: responses[6] || '',
      clientPhone: responses[7] || '',
      clientAddress: responses[8] || '',
      visitPurpose: responses[9] || '',
      imageLink: responses[10] || '',
      status: responses[11] || '',
      notes: responses[12] || ''
    };
    
    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (!updateData[key] || updateData[key].trim() === '') {
        delete updateData[key];
      }
    });
    
    if (!visitId) {
      throw new Error('Visit ID is required for update');
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }
    
    // Verify the visit exists and the submitter has permission to update it
    const existingVisit = getVisitById(visitId);
    if (!existingVisit) {
      throw new Error(`Visit ID ${visitId} not found`);
    }
    
    // Check if submitter is the original submitter or has admin rights
    if (existingVisit['Email Address'] !== submitterEmail) {
      // Check if submitter is admin/manager (you can customize this logic)
      const submitterEmployee = findEmployeeByEmail(submitterEmail);
      if (!submitterEmployee || !['CRO', 'ASM'].includes(submitterEmployee.role)) {
        throw new Error('You can only update your own visits or need admin privileges');
      }
    }
    
    // Perform the update
    const success = updateVisitRecord(visitId, updateData);
    
    if (success) {
      Logger.log(`Visit update processed successfully: ${visitId}`);
    } else {
      throw new Error('Failed to update visit record');
    }
    
  } catch (error) {
    Logger.log(`Error processing visit update submission: ${error.toString()}`);
    throw error;
  }
}
