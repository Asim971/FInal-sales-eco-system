/**
 * @fileoverview Enhanced Visit Update Process with conditional logic and role-based notifications.
 * Implements the requirements from requirement2.md for Visit Update Process Enhancement.
 */

/**
 * Handles the onFormSubmit event for the Enhanced Visit Update form.
 * @param {Object} e The event object from the form submission.
 */
function handleVisitUpdateFormSubmit(e) {
  try {
    console.log('📍 Processing Enhanced Visit Update Submission...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.VISIT_UPDATES, CONFIG.SCHEMAS.VISIT_UPDATES);
    
    // Extract form data
    const responses = e.values;
    
    // DEBUG: Log form responses
    console.log('Visit Update form submission data:');
    console.log('e.values: ' + JSON.stringify(responses));
    console.log('e.namedValues: ' + JSON.stringify(e.namedValues || 'Not available'));
    
    // Extract submitter email using multiple methods
    let submitterEmail = responses[1] || '';
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    console.log('Final submitter email:', submitterEmail);
    
    // Map form responses based on the new structure
    const visitData = {
      timestamp: responses[0] || new Date(),
      submitterEmail: submitterEmail,
      typeOfVisit: responses[2] || '', // "General Visit" or "Order Confirmation"
      
      // Conditional fields - populated based on visit type
      typeOfClient: responses[3] || '', // Only for General Visit
      clientId: responses[4] || '', // Only for General Visit
      userOrderId: responses[5] || '', // Only for Order Confirmation
      
      // Common fields
      territory: responses[6] || '',
      imageLink: responses[7] || '',
      clientName: responses[8] || '',
      clientPhoneNumber: responses[9] || '',
      
      // System fields
      status: 'Submitted',
      notificationSentTo: '',
      remarks: ''
    };
    
    // Validate required fields
    if (!visitData.submitterEmail || !visitData.typeOfVisit) {
      throw new Error('Missing required fields: submitter email or visit type');
    }
    
    // Conditional validation based on visit type
    const validationResult = validateVisitUpdateData(visitData);
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Generate unique Visit Update ID
    const visitUpdateId = generateVisitUpdateId();
    
    // Store data in Google Sheets
    const rowData = [
      visitData.timestamp,
      visitUpdateId,
      visitData.submitterEmail,
      visitData.typeOfVisit,
      visitData.typeOfClient,
      visitData.clientId,
      visitData.userOrderId,
      visitData.territory,
      visitData.imageLink,
      visitData.clientName,
      visitData.clientPhoneNumber,
      visitData.status,
      visitData.notificationSentTo,
      visitData.remarks
    ];
    
    sheet.appendRow(rowData);
    
    // Create personal user sheet entry
    try {
      if (CONFIG.USER_SHEETS_CONFIG && CONFIG.USER_SHEETS_CONFIG.ENABLED && submitterEmail) {
        console.log(`📝 Creating personal visit update sheet for: ${submitterEmail}`);
        const userSheet = getOrCreateUserSheet(submitterEmail, 'Visit Updates');
        if (userSheet) {
          appendRowToUserSheet(userSheet.id, 'Visit Updates', rowData);
          console.log(`✅ Added visit update to personal sheet: ${userSheet.name}`);
        }
      }
    } catch (userSheetError) {
      console.error('⚠️ Error creating user sheet (non-critical):', userSheetError);
    }
    
    // Send role-based WhatsApp notifications
    const notificationRecipients = sendVisitUpdateNotifications(visitData);
    
    // Update notification log
    const recipientNames = notificationRecipients.map(r => `${r.name} (${r.role})`).join(', ');
    sheet.getRange(sheet.getLastRow(), 13).setValue(recipientNames); // Update "Notification Sent To" column
    
    console.log(`✅ Visit update processed successfully: ${visitUpdateId}`);
    console.log(`📤 Notifications sent to: ${recipientNames}`);
    
  } catch (error) {
    console.error(`❌ Error processing visit update submission: ${error.toString()}`);
    Logger.log(`Error processing visit update submission: ${error.toString()}`);
    throw error;
  }
}

/**
 * Validates visit update data based on conditional logic.
 * @param {Object} visitData The visit data to validate.
 * @returns {Object} Validation result with isValid flag and errors array.
 */
function validateVisitUpdateData(visitData) {
  const errors = [];
  
  try {
    console.log('🔍 Validating visit update data...');
    
    // Validate based on visit type
    if (visitData.typeOfVisit === 'General Visit') {
      // For General Visit, validate Type of Client and Client ID
      if (!visitData.typeOfClient) {
        errors.push('Type of Client is required for General Visit');
      }
      
      if (!visitData.clientId) {
        errors.push('Client ID is required for General Visit');
      } else {
        // Validate that the Client ID exists based on client type
        const clientExists = validateClientId(visitData.clientId, visitData.typeOfClient);
        if (!clientExists) {
          errors.push(`${visitData.typeOfClient} with ID ${visitData.clientId} not found or not approved`);
        }
      }
      
    } else if (visitData.typeOfVisit === 'Order Confirmation') {
      // For Order Confirmation, validate User Order ID
      if (!visitData.userOrderId) {
        errors.push('User Order ID is required for Order Confirmation');
      } else {
        // Validate that the Order ID exists and is valid for visit confirmation
        const orderExists = validateOrderId(visitData.userOrderId);
        if (!orderExists.isValid) {
          errors.push(`Order ID ${visitData.userOrderId} is ${orderExists.reason}`);
        }
      }
    } else {
      errors.push('Invalid visit type. Must be "General Visit" or "Order Confirmation"');
    }
    
    // Validate common required fields
    if (!visitData.territory) {
      errors.push('Territory is required');
    }
    
    if (!visitData.clientName) {
      errors.push('Client Name is required');
    }
    
    if (!visitData.clientPhoneNumber) {
      errors.push('Client Phone Number is required');
    }
    
    console.log(`Validation result: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
    
  } catch (error) {
    console.error('Error during validation:', error);
    return {
      isValid: false,
      errors: ['Validation system error: ' + error.toString()]
    };
  }
}

/**
 * Validates that a client ID exists and is approved based on client type.
 * @param {string} clientId The client ID to validate.
 * @param {string} clientType The type of client (Dealer, Retailer, Partner).
 * @returns {boolean} True if client exists and is approved.
 */
function validateClientId(clientId, clientType) {
  try {
    console.log(`🔍 Validating ${clientType} ID: ${clientId}`);
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    let sheetName, idColumn, statusColumn;
    
    // Determine which sheet and columns to check based on client type
    switch (clientType.toLowerCase()) {
      case 'dealer':
        sheetName = CONFIG.SHEET_NAMES.DEALER_APPROVALS;
        idColumn = 0; // Usually the first column contains ID
        statusColumn = 7; // Status column
        break;
        
      case 'retailer':
        sheetName = CONFIG.SHEET_NAMES.RETAILER_APPROVALS;
        idColumn = 6; // Submission ID column for retailers
        statusColumn = 7; // Status column
        break;
        
      case 'partner':
        sheetName = CONFIG.SHEET_NAMES.CRM_APPROVALS;
        idColumn = 10; // Partner ID column
        statusColumn = 8; // Status column
        break;
        
      default:
        console.log(`Unknown client type: ${clientType}`);
        return false;
    }
    
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      console.log(`Sheet not found: ${sheetName}`);
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Search for the client ID
    for (let i = 1; i < data.length; i++) {
      const rowId = data[i][idColumn];
      const status = data[i][statusColumn];
      
      if (rowId === clientId || rowId === clientId.toString()) {
        console.log(`Found ${clientType} ${clientId} with status: ${status}`);
        return status === 'Approved';
      }
    }
    
    console.log(`${clientType} ${clientId} not found`);
    return false;
    
  } catch (error) {
    console.error(`Error validating ${clientType} ID ${clientId}:`, error);
    return false;
  }
}

/**
 * Validates that an order ID exists and allows visit confirmation.
 * @param {string} orderId The order ID to validate.
 * @returns {Object} Validation result with isValid flag and reason.
 */
function validateOrderId(orderId) {
  try {
    console.log(`🔍 Validating Order ID: ${orderId}`);
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!ordersSheet) {
      return { isValid: false, reason: 'not found (orders sheet missing)' };
    }
    
    const data = ordersSheet.getDataRange().getValues();
    
    // Search for the order ID
    for (let i = 1; i < data.length; i++) {
      const rowOrderId = data[i][1]; // Order ID is typically in column B
      const orderStatus = data[i][16]; // Status column (adjust index as needed)
      
      if (rowOrderId === orderId || rowOrderId === orderId.toString()) {
        console.log(`Found Order ${orderId} with status: ${orderStatus}`);
        
        // Check if order status allows visit confirmation
        const allowedStatuses = ['Submitted', 'Approved', 'In Progress', 'Completed'];
        if (allowedStatuses.includes(orderStatus)) {
          return { isValid: true, reason: 'valid' };
        } else {
          return { isValid: false, reason: `invalid status: ${orderStatus}` };
        }
      }
    }
    
    console.log(`Order ${orderId} not found`);
    return { isValid: false, reason: 'not found' };
    
  } catch (error) {
    console.error(`Error validating Order ID ${orderId}:`, error);
    return { isValid: false, reason: 'validation error' };
  }
}

/**
 * Sends role-based WhatsApp notifications for visit updates.
 * @param {Object} visitData The visit data.
 * @returns {Array} Array of notification recipients.
 */
function sendVisitUpdateNotifications(visitData) {
  try {
    console.log('📤 Sending visit update notifications...');
    
    // Look up submitter employee info
    const submitterEmployee = findEmployeeByEmail(visitData.submitterEmail);
    if (!submitterEmployee) {
      console.error(`Submitter not found in employee system: ${visitData.submitterEmail}`);
      return [];
    }
    
    console.log(`Visit submitted by: ${submitterEmployee.name} (${submitterEmployee.role})`);
    
    let recipients = [];
    
    // Determine recipients based on submitter role
    if (submitterEmployee.role === 'SR' || submitterEmployee.role === 'CRO') {
      // If submitted by SR or CRO: Notify BDO and BD Team Incharge
      const bdoRecipients = findEmployeesByRole(['BDO']);
      const bdTeamInchargeRecipients = findEmployeesByRole(['BD Team Incharge']);
      
      recipients = [...bdoRecipients, ...bdTeamInchargeRecipients];
      console.log(`SR/CRO submission - notifying ${bdoRecipients.length} BDO(s) and ${bdTeamInchargeRecipients.length} BD Team Incharge(s)`);
      
    } else if (submitterEmployee.role === 'BDO' || submitterEmployee.role === 'BD Team Incharge') {
      // If submitted by BDO or BD Team Incharge: Notify BD Incharge
      recipients = findEmployeesByRole(['BD Incharge']);
      console.log(`BDO/BD Team Incharge submission - notifying ${recipients.length} BD Incharge(s)`);
      
    } else {
      // For other roles, send to general management
      recipients = findEmployeesByRole(['ASM', 'CRO']);
      console.log(`Other role submission - notifying ${recipients.length} ASM/CRO(s) as fallback`);
    }
    
    // Filter recipients who have WhatsApp numbers
    const validRecipients = recipients.filter(emp => emp.whatsappNumber);
    console.log(`Found ${validRecipients.length} recipients with WhatsApp numbers`);
    
    // Create the notification message
    const clientOrOrderId = visitData.typeOfVisit === 'General Visit' 
      ? visitData.clientId 
      : visitData.userOrderId;
      
    const message = `📍 *New Visit Update Submitted*

*Type:* ${visitData.typeOfVisit}
*Client/Order ID:* ${clientOrOrderId}
*Territory:* ${visitData.territory}
*Client Name:* ${visitData.clientName}
*Client Phone:* ${visitData.clientPhoneNumber}
*Submitted by:* ${submitterEmployee.name} (${submitterEmployee.role})

${visitData.typeOfVisit === 'General Visit' 
  ? `*Client Type:* ${visitData.typeOfClient}` 
  : `*Order Confirmation:* ${visitData.userOrderId}`}

${visitData.imageLink ? `*Images:* ${visitData.imageLink}` : ''}

Please review and take necessary action.

*Submission Time:* ${new Date().toLocaleString()}`;

    // Send notifications
    const notificationResults = [];
    validRecipients.forEach(recipient => {
      try {
        sendWhatsAppMessage(recipient.whatsappNumber, message);
        notificationResults.push({
          name: recipient.name,
          role: recipient.role,
          whatsappNumber: recipient.whatsappNumber
        });
        console.log(`Notification sent to ${recipient.name} (${recipient.role}): ${recipient.whatsappNumber}`);
      } catch (error) {
        console.error(`Failed to send notification to ${recipient.name}:`, error);
      }
    });
    
    console.log(`✅ Visit update notifications completed. Sent to ${notificationResults.length} recipients.`);
    return notificationResults;
    
  } catch (error) {
    console.error('❌ Error sending visit update notifications:', error);
    return [];
  }
}

/**
 * Generates a unique Visit Update ID.
 * @returns {string} The generated Visit Update ID.
 */
function generateVisitUpdateId() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.VISIT_UPDATES, CONFIG.SCHEMAS.VISIT_UPDATES);
    const lastRow = sheet.getLastRow();
    
    // Generate ID in format: VU-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
    
    // Count visit updates for today
    let updateCount = 1;
    if (lastRow > 1) {
      const updateIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      const todayUpdates = updateIds.filter(id => id && id.includes(dateStr));
      updateCount = todayUpdates.length + 1;
    }
    
    const visitUpdateId = `VU-${dateStr}-${updateCount.toString().padStart(3, '0')}`;
    console.log(`Generated Visit Update ID: ${visitUpdateId}`);
    return visitUpdateId;
    
  } catch (error) {
    console.error('Error generating Visit Update ID:', error);
    // Fallback ID generation
    return `VU-${Date.now()}`;
  }
}

/**
 * Gets approved orders for dropdown population in forms.
 * @returns {Array} Array of approved order objects.
 */
function getApprovedOrdersForVisitConfirmation() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!ordersSheet) {
      console.log('Orders sheet not found');
      return [];
    }
    
    const data = ordersSheet.getDataRange().getValues();
    const approvedOrders = [];
    
    // Filter for orders that can have visit confirmations
    for (let i = 1; i < data.length; i++) {
      const orderId = data[i][1];
      const orderType = data[i][3];
      const status = data[i][16];
      const submitterEmail = data[i][4];
      
      if (['Submitted', 'Approved', 'In Progress'].includes(status)) {
        approvedOrders.push({
          orderId: orderId,
          orderType: orderType,
          status: status,
          submitterEmail: submitterEmail,
          displayText: `${orderId} - ${orderType} (${status})`
        });
      }
    }
    
    console.log(`Found ${approvedOrders.length} orders available for visit confirmation`);
    return approvedOrders;
    
  } catch (error) {
    console.error('Error getting approved orders:', error);
    return [];
  }
}

/**
 * Test function for visit update validation.
 */
function testVisitUpdateValidation() {
  console.log('🧪 Testing Visit Update Validation...');
  
  try {
    // Test General Visit validation
    console.log('\n--- Testing General Visit Validation ---');
    const generalVisitData = {
      submitterEmail: 'test@anwar.com',
      typeOfVisit: 'General Visit',
      typeOfClient: 'Retailer',
      clientId: 'RET-001',
      userOrderId: '',
      territory: 'Dhaka North',
      clientName: 'Test Client',
      clientPhoneNumber: '01234567890'
    };
    
    const generalResult = validateVisitUpdateData(generalVisitData);
    console.log('General Visit validation result:', generalResult);
    
    // Test Order Confirmation validation
    console.log('\n--- Testing Order Confirmation Validation ---');
    const orderVisitData = {
      submitterEmail: 'test@anwar.com',
      typeOfVisit: 'Order Confirmation',
      typeOfClient: '',
      clientId: '',
      userOrderId: 'ORD-001',
      territory: 'Dhaka North',
      clientName: 'Test Client',
      clientPhoneNumber: '01234567890'
    };
    
    const orderResult = validateVisitUpdateData(orderVisitData);
    console.log('Order Confirmation validation result:', orderResult);
    
    console.log('✅ Visit Update Validation Test Completed');
    
  } catch (error) {
    console.error('❌ Error in visit update validation test:', error);
  }
}

/**
 * Test function for visit update notifications.
 */
function testVisitUpdateNotifications() {
  console.log('🧪 Testing Visit Update Notifications...');
  
  try {
    // Test SR submission (should notify BDO and BD Team Incharge)
    console.log('\n--- Testing SR Submission ---');
    const srVisitData = {
      submitterEmail: 'sr@anwar.com', // Make sure this email exists in employees
      typeOfVisit: 'General Visit',
      typeOfClient: 'Retailer',
      clientId: 'RET-001',
      territory: 'Dhaka North',
      clientName: 'Test Client',
      clientPhoneNumber: '01234567890',
      imageLink: 'https://drive.google.com/test'
    };
    
    const srRecipients = sendVisitUpdateNotifications(srVisitData);
    console.log('SR notification recipients:', srRecipients);
    
    // Test BDO submission (should notify BD Incharge)
    console.log('\n--- Testing BDO Submission ---');
    const bdoVisitData = {
      submitterEmail: 'bdo@anwar.com', // Make sure this email exists in employees
      typeOfVisit: 'Order Confirmation',
      userOrderId: 'ORD-001',
      territory: 'Dhaka South',
      clientName: 'Test Client 2',
      clientPhoneNumber: '01987654321'
    };
    
    const bdoRecipients = sendVisitUpdateNotifications(bdoVisitData);
    console.log('BDO notification recipients:', bdoRecipients);
    
    console.log('✅ Visit Update Notifications Test Completed');
    
  } catch (error) {
    console.error('❌ Error in visit update notifications test:', error);
  }
}
