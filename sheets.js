/**
 * @fileoverview This file contains utility functions for interacting with Google Sheets.
 */

/**
 * Gets a sheet by its name from a spreadsheet.
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} sheetName The name of the sheet.
 * @returns {Sheet} The sheet object.
 * @throws {Error} If the sheet is not found.
 */
function getSheet(spreadsheetId, sheetName) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found in spreadsheet ${spreadsheetId}. Available sheets: ${ss.getSheets().map(s => s.getName()).join(', ')}`);
    }
    
    return sheet;
  } catch (error) {
    console.error(`Error accessing sheet '${sheetName}' in spreadsheet ${spreadsheetId}:`, error);
    throw error;
  }
}

/**
 * Gets all the data from a sheet.
 * @param {Sheet} sheet The sheet object.
 * @returns {Array<Array<Object>>} The data from the sheet.
 * @throws {Error} If the sheet is null or invalid.
 */
function getSheetData(sheet) {
  if (!sheet) {
    throw new Error('Sheet object is null or undefined');
  }
  
  try {
    return sheet.getDataRange().getValues();
  } catch (error) {
    console.error('Error getting data from sheet:', error);
    throw error;
  }
}

/**
 * Appends a row to a sheet.
 * @param {Sheet} sheet The sheet object.
 * @param {Array<Object>} row The row to append.
 */
function appendRow(sheet, row) {
  try {
    sheet.appendRow(row);
  } catch (error) {
    console.error('Error appending row to sheet:', error);
    throw error;
  }
}

/**
 * Ensures headers exist in a sheet - adds them if missing
 * @param {Sheet} sheet The sheet object.
 * @param {Array<string>} headers The header row to add if missing.
 * @param {string} sheetContext Context description for logging.
 */
function ensureSheetHeaders(sheet, headers, sheetContext = '') {
  try {
    if (!sheet) {
      throw new Error('Sheet object is null or undefined');
    }
    
    if (sheet.getLastRow() === 0) {
      // Sheet is empty, add headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      sheet.autoResizeColumns(1, headers.length);
      
      console.log(`Added headers to ${sheet.getName()} sheet${sheetContext ? ' for ' + sheetContext : ''}`);
      return true;
    }
    
    return false; // Headers already exist
  } catch (error) {
    console.error(`Error ensuring headers in sheet:`, error);
    throw error;
  }
}

/**
 * Gets a sheet by name, or creates it if it doesn't exist using the provided schema.
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} sheetName The name of the sheet.
 * @param {Array<string>} schema Optional array of column headers for new sheet.
 * @returns {Sheet} The sheet object.
 */
function getOrCreateSheetSafe(spreadsheetId, sheetName, schema = null) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      console.log(`Sheet '${sheetName}' not found. Creating new sheet...`);
      
      // Get the schema from CONFIG if not provided
      if (!schema) {
        // Try to find the schema based on sheet name
        const schemaKey = Object.keys(CONFIG.SHEET_NAMES).find(key => 
          CONFIG.SHEET_NAMES[key] === sheetName
        );
        if (schemaKey && CONFIG.SCHEMAS[schemaKey]) {
          schema = CONFIG.SCHEMAS[schemaKey];
        }
      }
      
      // Create the sheet using the config helper function
      if (schema) {
        sheet = getOrCreateSheet(ss, sheetName, schema);
      } else {
        sheet = ss.insertSheet(sheetName);
        console.log(`Created sheet '${sheetName}' without headers (no schema found)`);
      }
    }
    
    return sheet;
  } catch (error) {
    console.error(`Error getting or creating sheet '${sheetName}':`, error);
    throw error;
  }
}
