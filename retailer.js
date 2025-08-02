/**
 * @fileoverview This file contains the retailer-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Retailer Registration form.
 * @param {Object} e The event object.
 */
function handleRetailerFormSubmit(e) {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.RETAILER_APPROVALS);
  const srRegSheet = getSheet(CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION, CONFIG.SHEET_NAMES.SR_REG);

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

  // Lookup SR Whatsapp based on Bazaar Name
  const srData = getSheetData(srRegSheet);
  let srWhatsapp = '';
  for (let i = 1; i < srData.length; i++) {
    if (srData[i][4] === bazaarName) {
      srWhatsapp = srData[i][2];
      break;
    }
  }

  const submissionId = Utilities.getUuid();
  const status = 'Pending';
  const notes = '';

  const row = [timestamp, emailAddress, shopName, proprietorName, shopAddress, bazaarName, phoneNumber, bkashNumber, nid, uploadNidImage, submissionId, srWhatsapp, status, notes];
  appendRow(crmSheet, row);

  if (srWhatsapp) {
    const message = `New Retailer Registration Submission
Submission ID: ${submissionId}
Shop Name: ${shopName}
Proprietor Name: ${proprietorName}
Phone Number: ${phoneNumber}
Bazaar Name: ${bazaarName}
Status: ${status}
Submission Date: ${timestamp}`;
    sendWhatsAppMessage(srWhatsapp, message);
  }
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

  if (srWhatsapp) {
    const message = `Retailer Registration Update
Submission ID: ${submissionId}
Shop Name: ${shopName}
Proprietor Name: ${proprietorName}
Phone Number: ${phoneNumber}
Bazaar Name: ${bazaarName}
Bkash Number: ${bkashNumber}
NID: ${nid}
Status: ${status}
Update Date: ${new Date().toLocaleString()}
Notes: ${notes}`;
    sendWhatsAppMessage(srWhatsapp, message);
  }
}
