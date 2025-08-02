/**
 * @fileoverview This file contains sheet validation and healing functionality.
 */

/**
 * Verifies that a sheet has the correct header columns and adds any missing ones.
 * If the sheet itself is missing, it will be created with the correct headers.
 * @param {string} sheetName The name of the sheet to verify.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss The spreadsheet object.
 */
function verifyAndHealSheet(sheetName, ss) {
  const schema = CONFIG.SCHEMAS[sheetName];
  if (!schema) {
    // No schema defined for this sheet, so we can't verify it.
    Logger.log(`No schema found for sheet: '${sheetName}'`);
    return;
  }

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // If the sheet doesn't exist, create it with the correct header.
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
    Logger.log(`Created missing sheet: '${sheetName}' with headers: ${schema.join(', ')}`);
    return; // The new sheet is already perfect.
  }

  // Check if the sheet is completely empty (no headers at all)
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
    Logger.log(`Added headers to empty sheet: '${sheetName}': ${schema.join(', ')}`);
    return;
  }

  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const actualHeaders = headerRange.getValues()[0];

  const missingHeaders = [];
  schema.forEach(expectedHeader => {
    if (actualHeaders.indexOf(expectedHeader) === -1) {
      missingHeaders.push(expectedHeader);
    }
  });

  if (missingHeaders.length > 0) {
    const lastColumn = sheet.getLastColumn();
    sheet.getRange(1, lastColumn + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    Logger.log(`Added missing headers to '${sheetName}': ${missingHeaders.join(', ')}`);
  }
}
