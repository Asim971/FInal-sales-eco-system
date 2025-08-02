/**
 * @fileoverview This file contains the CRM-related functionality.
 */

/**
 * Handles the onEdit event for the CRM Approvals sheet.
 * @param {Object} e The event object.
 */
function handleCrmApprovalsEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  if (range.getColumn() !== 9) return; // Status column

  const status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  const row = range.getRow();
  const rowData = sheet.getRange(row, 1, 1, 10).getValues()[0];
  
  const timestamp = rowData[0];
  const submitterEmail = rowData[1];
  const contractorName = rowData[2];
  const bkashNumber = rowData[3];
  const contactNumber = rowData[4];
  const nidNo = rowData[5];
  const nidUpload = rowData[6];
  const submissionId = rowData[7];
  const notes = rowData[9];

  // Lookup CRO phone from original spreadsheet
  const croSheet = getSheet(CONFIG.SPREADSHEET_IDS.CONTRACTOR_REGISTRATION, CONFIG.SHEET_NAMES.CRO_REG);
  const croData = getSheetData(croSheet);
  let croPhone = null;
  for (let i = 1; i < croData.length; i++) {
    if (croData[i][0] === submitterEmail) {
      croPhone = croData[i][2];
      break;
    }
  }

  if (croPhone) {
    const message = `Contractor Enlistment Update
Submission ID: ${submissionId}
Contractor Name: ${contractorName}
Mobile: ${contactNumber}
NID: ${nidNo}
Payment Number: ${bkashNumber}
Remarks: ${nidUpload}
Status: ${status}
Update Date: ${new Date().toLocaleString()}
Notes: ${notes}`;
    sendWhatsAppMessage(croPhone, message);
  }
}
