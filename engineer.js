/**
 * @fileoverview This file contains the engineer-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Engineer Registration form.
 * @param {Object} e The event object.
 */
function handleEngineerFormSubmit(e) {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ENGINEER_APPROVALS);
  const croSheet = getSheet(CONFIG.SPREADSHEET_IDS.CONTRACTOR_REGISTRATION, CONFIG.SHEET_NAMES.CRO_REG);

  const response = e.values;
  const timestamp = response[0];
  const submitterEmail = response[1];
  const engineerName = response[2];
  const mobileNo = response[3];
  const addressOrg = response[4];
  const designation = response[5];
  const district = response[6];
  const thana = response[7];
  const bdOfficer = response[8];
  const idNo = response[9];
  const engineerEmail = response[10];
  const education = response[11];
  const classification = response[12];
  const remarks = response[13];

  const submissionId = Utilities.getUuid();
  const status = 'Pending';
  const notes = '';

  const row = [timestamp, submitterEmail, engineerName, mobileNo, addressOrg, designation, district, thana, bdOfficer, idNo, engineerEmail, education, classification, remarks, submissionId, status, notes];
  appendRow(crmSheet, row);

  const croData = getSheetData(croSheet);
  let croPhone = null;
  for (let i = 1; i < croData.length; i++) {
    if (croData[i][0] === submitterEmail) {
      croPhone = croData[i][2];
      break;
    }
  }

  if (croPhone) {
    const message = `New Engineer Registration Submission
Submission ID: ${submissionId}
Engineer Name: ${engineerName}
Mobile: ${mobileNo}
ID No: ${idNo}
Email: ${engineerEmail}
District: ${district}
Thana: ${thana}
Classification: ${classification}
Status: ${status}
Submission Date: ${timestamp}`;
    sendWhatsAppMessage(croPhone, message);
  }
}

/**
 * Handles the onEdit event for the Engineer Approvals sheet.
 * @param {Object} e The event object.
 */
function handleEngineerApprovalsEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  if (range.getColumn() !== 16) return; // Status column

  const status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  const row = range.getRow();
  const rowData = sheet.getRange(row, 1, 1, 17).getValues()[0];
  
  const timestamp = rowData[0];
  const submitterEmail = rowData[1];
  const engineerName = rowData[2];
  const mobileNo = rowData[3];
  const addressOrg = rowData[4];
  const designation = rowData[5];
  const district = rowData[6];
  const thana = rowData[7];
  const bdOfficer = rowData[8];
  const idNo = rowData[9];
  const engineerEmail = rowData[10];
  const education = rowData[11];
  const classification = rowData[12];
  const remarks = rowData[13];
  const submissionId = rowData[14];
  const notes = rowData[16];

  // Lookup CRO phone from original spreadsheet
  const croSheet = getSheet(CONFIG.SPREADSHEET_IDS.ENGINEER_REGISTRATION, CONFIG.SHEET_NAMES.CRO_REG);
  const croData = getSheetData(croSheet);
  let croPhone = null;
  for (let i = 1; i < croData.length; i++) {
    if (croData[i][0] === submitterEmail) {
      croPhone = croData[i][2];
      break;
    }
  }

  if (croPhone) {
    const message = `Engineer Registration Update
Submission ID: ${submissionId}
Engineer Name: ${engineerName}
Mobile: ${mobileNo}
ID No: ${idNo}
Email: ${engineerEmail}
District: ${district}
Thana: ${thana}
Classification: ${classification}
Status: ${status}
Update Date: ${new Date().toLocaleString()}
Notes: ${notes}`;
    sendWhatsAppMessage(croPhone, message);
  }
}

/**
 * Handles the onFormSubmit event for the Engineer Update form.
 * @param {Object} e The event object.
 */
function handleEngineerUpdateFormSubmit(e) {
  const projectSheet = getSheet(CONFIG.SPREADSHEET_IDS.PROJECT_UPDATE, CONFIG.SHEET_NAMES.PROJECT_UPDATE);
  const bdRegSheet = getSheet(CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE, CONFIG.SHEET_NAMES.BD_REG);

  const response = e.values;
  const timestamp = response[0];
  const submitterEmail = response[1];
  const submissionId = response[2]; // Select Potential Site (Submission ID)
  const engineerName = response[3];
  const engineerMobile = response[4];
  const engineerEmail = response[5];
  const engineerIdNo = response[6];
  const engineerClassification = response[7];
  const remarks = response[8];

  // Find the row in Project Update sheet with matching Submission ID
  const projectData = getSheetData(projectSheet);
  let rowIndex = -1;
  let bdTerritory = '';
  for (let i = 1; i < projectData.length; i++) {
    if (projectData[i][11] === submissionId) { // Assuming Submission ID is in column 12 (index 11)
      rowIndex = i + 1;
      bdTerritory = projectData[i][2]; // Assuming BD Territory in column 3 (index 2)
      break;
    }
  }

  if (rowIndex === -1) {
    // Project not found, perhaps append new or log error
    Logger.log('Project with Submission ID ' + submissionId + ' not found.');
    // Optionally send notification
    return;
  }

  // Update the row with engineer details
  // Assuming columns for engineer details, adjust indices as needed
  projectSheet.getRange(rowIndex, 17).setValue(engineerName); // Example column 17 for Engineer Name
  projectSheet.getRange(rowIndex, 18).setValue(engineerMobile);
  projectSheet.getRange(rowIndex, 19).setValue(engineerEmail);
  projectSheet.getRange(rowIndex, 20).setValue(engineerIdNo);
  projectSheet.getRange(rowIndex, 21).setValue(engineerClassification);
  projectSheet.getRange(rowIndex, 22).setValue(remarks);

  // Lookup BD Whatsapp based on BD Territory
  const bdData = getSheetData(bdRegSheet);
  let bdWhatsapp = '';
  for (let j = 1; j < bdData.length; j++) {
    if (bdData[j][3] === bdTerritory) {
      bdWhatsapp = bdData[j][2];
      break;
    }
  }

  const message = `Engineer Update for Potential Site
Submission ID: ${submissionId}
Engineer Name: ${engineerName}
Mobile: ${engineerMobile}
Email: ${engineerEmail}
ID No: ${engineerIdNo}
Classification: ${engineerClassification}
Remarks: ${remarks}
Update Date: ${timestamp}`;

  if (bdWhatsapp) {
    sendWhatsAppMessage(bdWhatsapp, message);
  } else {
    Logger.log('BD Whatsapp not found for territory: ' + bdTerritory);
  }
}
