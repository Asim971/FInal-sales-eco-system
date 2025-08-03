/**
 * @fileoverview This file contains the retailer-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Retailer Registration form.
 * @param {Object} e The event object.
 */
function handleRetailerFormSubmit(e) {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.RETAILER_APPROVALS);
  const srRegSheet = getSheet(CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION, 'Form Responses 1');

  const response = e.values;
  const timestamp = response[0];
  const emailAddress = response[1];
  const shopName = response[2];
  const proprietorName = response[3];
  const shopAddress = response[4];
  const bazaarName = response[5];
  const phoneNumber = response[6];
  const bkashNumber = response[7];
  const nid = response[8];
  const uploadNidImage = response[9];

  // Look up submitter employee data from the employee sheet
  const employeeSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const employeeData = getSheetData(employeeSheet);
  
  let submitterEmployee = null;
  let territory = '';
  
  // Find employee by email
  for (let i = 1; i < employeeData.length; i++) {
    if (employeeData[i][3] === emailAddress && employeeData[i][8] === 'Active') { // Email column and Status column
      submitterEmployee = {
        id: employeeData[i][0],
        name: employeeData[i][1], 
        role: employeeData[i][2],
        email: employeeData[i][3],
        contactNumber: employeeData[i][4],
        whatsappNumber: employeeData[i][5],
        territory: employeeData[i][11] || employeeData[i][16] || '', // Legacy or new territory field
        company: employeeData[i][10] || '',
        bazaar: employeeData[i][17] || ''
      };
      territory = submitterEmployee.territory;
      break;
    }
  }

  // If no employee found, use bazaar name as territory fallback
  if (!territory) {
    territory = bazaarName;
  }

  const submissionId = Utilities.getUuid();
  const status = 'Pending';
  const notes = '';

  const row = [timestamp, emailAddress, shopName, proprietorName, shopAddress, bazaarName, phoneNumber, bkashNumber, nid, uploadNidImage, submissionId, submitterEmployee ? submitterEmployee.whatsappNumber : '', status, notes];
  appendRow(crmSheet, row);

  // Send notifications using centralized notification system
  const notificationData = {
    formType: 'RETAILER_REGISTRATION',
    submitterEmail: emailAddress,
    territory: territory, // Use actual territory from employee lookup
    formData: {
      submissionId: submissionId,
      shopName: shopName,
      proprietorName: proprietorName,
      phoneNumber: phoneNumber,
      bazaarName: bazaarName,
      shopAddress: shopAddress,
      status: status
    }
  };
  
  sendFormNotification(notificationData);
}

/**
 * Handles the onEdit event for the Retailer Approvals sheet.
 * @param {Object} e The event object.
 */
function handleRetailerApprovalsEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();

  if (range.getColumn() !== 13) return; // Status column

  const status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  const row = range.getRow();
  const rowData = sheet.getRange(row, 1, 1, 14).getValues()[0];
  
  const timestamp = rowData[0];
  const emailAddress = rowData[1];
  const shopName = rowData[2];
  const proprietorName = rowData[3];
  const shopAddress = rowData[4];
  const bazaarName = rowData[5];
  const phoneNumber = rowData[6];
  const bkashNumber = rowData[7];
  const nid = rowData[8];
  const uploadNidImage = rowData[9];
  const submissionId = rowData[10];
  const srWhatsapp = rowData[11];
  const notes = rowData[13];

  // Send approval/rejection notifications using centralized notification system
  const notificationData = {
    formType: status === 'Approved' ? 'RETAILER_APPROVAL' : 'RETAILER_REJECTION',
    submitterEmail: emailAddress,
    territory: bazaarName,
    formData: {
      submissionId: submissionId,
      shopName: shopName,
      proprietorName: proprietorName,
      phoneNumber: phoneNumber,
      bazaarName: bazaarName,
      bkashNumber: bkashNumber,
      nid: nid,
      status: status,
      notes: notes,
      updateDate: new Date().toLocaleString()
    }
  };
  
  // Send centralized notification for approval/rejection
  sendFormNotification(notificationData);
  
  // Also send direct notification to submitter for immediate confirmation
  if (emailAddress) {
    const submitterNotificationData = {
      formType: 'RETAILER_STATUS_UPDATE',
      submitterEmail: emailAddress,
      territory: bazaarName,
      formData: {
        submissionId: submissionId,
        shopName: shopName,
        proprietorName: proprietorName,
        status: status,
        notes: notes,
        updateDate: new Date().toLocaleString()
      }
    };
    
    sendFormNotification(submitterNotificationData);
  }
}
