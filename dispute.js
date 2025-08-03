/**
 * @fileoverview This file contains the dispute-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Dispute Creation form.
 * @param {Object} e The event object.
 */
function handleDisputeFormSubmit(e) {
  const response = e.values;
  const timestamp = response[0];
  const submitterEmail = response[1]; // BDO or CRO's email
  const orderId = response[2];
  const disputeReason = response[3];

  const disputeId = 'DIS-' + Utilities.getUuid();
  const status = 'Open';

  // 1. Get Sheets
  // Assuming disputes are in a sheet named 'Disputes' in the main CRM spreadsheet
  const disputesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.DISPUTES);
  const ordersSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ORDERS);

  // 2. Append to Disputes Sheet
  // Columns: Timestamp, Dispute ID, Order ID, Submitter Email, Reason, Status
  const disputeRow = [
    timestamp,
    disputeId,
    orderId,
    submitterEmail,
    disputeReason,
    status
  ];
  appendRow(disputesSheet, disputeRow);

  // 3. Update Order Status in the Orders sheet
  const orderData = getSheetData(ordersSheet);
  let orderRowIndex = -1;
  // Assuming Order ID is in column 2 (index 1)
  for (let i = 1; i < orderData.length; i++) {
    if (orderData[i][1] === orderId) {
      orderRowIndex = i + 1;
      break;
    }
  }
  if (orderRowIndex !== -1) {
    // Assuming Order Status is in column 9 (index 8)
    ordersSheet.getRange(orderRowIndex, 9).setValue('Disputed');
  } else {
    Logger.log(`Order with ID ${orderId} not found for status update.`);
  }

  // 4. Send Notifications
  let orderDetails = null;
  if (orderRowIndex !== -1) {
    // SR Email is in col 4, Engineer ID in col 5, Partner ID in col 6
    orderDetails = {
      srEmail: orderData[orderRowIndex - 1][3],
      engineerId: orderData[orderRowIndex - 1][4],
      partnerId: orderData[orderRowIndex - 1][5]
    };
  }

  // Helper to find phone number from the CRM sheet by ID or Email
  const getPhoneNumber = (identifier) => {
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
      
      console.log('Added headers to Dashboard sheet for dispute lookup');
    }
    
    const crmData = getSheetData(crmSheet);
    // Assuming SR contact info is also in CRM sheet, identified by email
    const srSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.SR_REG);
    const srData = getSheetData(srSheet);

    // Check CRM sheet by ID (for Partner/Engineer)
    for (let i = 1; i < crmData.length; i++) {
      if (crmData[i][10] === identifier) { // Partner/Engineer ID in col 11
        return crmData[i][12] || crmData[i][4]; // WhatsApp or Contact number
      }
    }
    // Check SR sheet by Email
    for (let i = 1; i < srData.length; i++) {
        if (srData[i][0] === identifier) { // SR Email in col 1
            return srData[i][2]; // Assuming phone is in col 3
        }
    }
    return null;
  };

  const message = `New Dispute Raised: ${disputeId}\nOrder ID: ${orderId}\nReason: ${disputeReason}\nRaised by: ${submitterEmail}`;

  // Notify BDO/CRO (Confirmation)
  Logger.log(`Dispute Confirmation for ${submitterEmail}: Dispute ${disputeId} raised.`);

  if (orderDetails) {
    const srPhone = getPhoneNumber(orderDetails.srEmail);
    const partnerPhone = getPhoneNumber(orderDetails.partnerId);
    const engineerPhone = getPhoneNumber(orderDetails.engineerId);

    if (srPhone) {
      sendWhatsAppMessage(srPhone, message);
    } else {
      Logger.log(`SR Notification for Order ${orderId}: A dispute has been raised.`);
    }
    if (partnerPhone) {
      sendWhatsAppMessage(partnerPhone, message);
    } else {
      Logger.log(`Partner Notification for Order ${orderId}: A dispute has been raised.`);
    }
    if (engineerPhone) {
      sendWhatsAppMessage(engineerPhone, message);
    } else {
      Logger.log(`Site Engineer Notification for Order ${orderId}: A dispute has been raised.`);
    }
  } else {
    Logger.log('Could not send notifications as order details were not found.');
  }
}
