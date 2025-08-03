/**
 * @fileoverview Per-Submitter Sheets Management for Anwar Sales Ecosystem
 * This module handles creation and management of individual user sheets,
 * providing personalized data access for form submitters.
 * 
 * Features:
 * - Automatic user-specific sheet creation on form submission
 * - Sheet metadata tracking and registry management
 * - WhatsApp integration for data queries
 * - Conversation state management for user interactions
 */

/**
 * Gets or creates a user-specific sheet for a given email and sheet type.
 * This is the core function that ensures each user has their own data repository.
 * 
 * @param {string} email - User's email address (primary identifier)
 * @param {string} sheetType - Type of sheet (Orders, Visits, IHB, SitePrescription, etc.)
 * @returns {Object} Sheet object with id and spreadsheet reference
 */
function getOrCreateUserSheet(email, sheetType) {
  try {
    console.log(`🔍 Getting or creating user sheet for ${email}, type: ${sheetType}`);
    
    if (!email || !sheetType) {
      throw new Error('Email and sheet type are required');
    }
    
    // Check if user sheets feature is enabled
    if (!CONFIG.USER_SHEETS_CONFIG.ENABLED) {
      console.log('User sheets feature is disabled');
      return null;
    }
    
    // Get or create the user sheets folder
    const folder = getUserSheetsFolder();
    if (!folder) {
      throw new Error('Unable to access user sheets folder');
    }
    
    // Check if sheet already exists in registry
    const existingSheet = findUserSheetInRegistry(email, sheetType);
    if (existingSheet) {
      try {
        // Verify the sheet still exists and is accessible
        const spreadsheet = SpreadsheetApp.openById(existingSheet.sheetId);
        console.log(`✅ Found existing user sheet: ${existingSheet.sheetName}`);
        return {
          id: existingSheet.sheetId,
          spreadsheet: spreadsheet,
          name: existingSheet.sheetName
        };
      } catch (error) {
        console.log(`⚠️ Existing sheet ${existingSheet.sheetId} is not accessible, creating new one`);
        // Remove invalid entry from registry
        removeUserSheetFromRegistry(email, sheetType);
      }
    }
    
    // Create new sheet
    const sanitizedEmail = sanitizeEmailForFileName(email);
    const sheetName = `${sheetType}_${sanitizedEmail}`;
    
    console.log(`📝 Creating new user sheet: ${sheetName}`);
    const newSpreadsheet = SpreadsheetApp.create(sheetName);
    
    // Move to user sheets folder
    const file = DriveApp.getFileById(newSpreadsheet.getId());
    file.moveTo(folder);
    
    // Set up the sheet with appropriate schema
    setupUserSheetStructure(newSpreadsheet, sheetType);
    
    // Add to registry
    addUserSheetToRegistry(email, sheetType, sheetName, newSpreadsheet.getId());
    
    console.log(`✅ Created new user sheet: ${sheetName} (${newSpreadsheet.getId()})`);
    
    return {
      id: newSpreadsheet.getId(),
      spreadsheet: newSpreadsheet,
      name: sheetName
    };
    
  } catch (error) {
    console.error(`❌ Error creating user sheet for ${email}, type ${sheetType}:`, error);
    throw error;
  }
}

/**
 * Sets up the structure of a user sheet with appropriate headers and formatting.
 * 
 * @param {Spreadsheet} spreadsheet - The user's spreadsheet
 * @param {string} sheetType - Type of sheet to determine schema
 */
function setupUserSheetStructure(spreadsheet, sheetType) {
  try {
    // Get the default sheet and rename it
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName(sheetType);
    
    // Get schema based on sheet type
    let schema = null;
    switch (sheetType) {
      case 'Orders':
        schema = CONFIG.SCHEMAS.ORDERS;
        break;
      case 'Visits':
        schema = CONFIG.SCHEMAS.VISITS;
        break;
      case 'IHB':
        schema = CONFIG.SCHEMAS.IHB_APPROVALS;
        break;
      case 'SitePrescription':
        schema = CONFIG.SCHEMAS.SITE_PRESCRIPTION_APPROVALS;
        break;
      case 'PotentialSites':
        schema = CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS;
        break;
      default:
        console.log(`⚠️ No specific schema found for sheet type: ${sheetType}, using basic headers`);
        schema = ['Timestamp', 'Data', 'Status', 'Notes'];
    }
    
    if (schema && schema.length > 0) {
      // Add headers
      sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, schema.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, schema.length);
      
      console.log(`📋 Set up sheet structure with ${schema.length} columns`);
    }
    
  } catch (error) {
    console.error('Error setting up user sheet structure:', error);
    throw error;
  }
}

/**
 * Appends data to a user's specific sheet.
 * 
 * @param {string} sheetId - The ID of the user's sheet
 * @param {string} sheetName - Name of the sheet within the spreadsheet
 * @param {Array} data - Data row to append
 */
function appendRowToUserSheet(sheetId, sheetName, data) {
  try {
    console.log(`📝 Appending data to user sheet ${sheetId}, sheet: ${sheetName}`);
    
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // If sheet doesn't exist, create it (shouldn't happen with proper setup)
    if (!sheet) {
      console.log(`⚠️ Sheet ${sheetName} not found, creating it`);
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    sheet.appendRow(data);
    console.log(`✅ Successfully appended data to user sheet`);
    
    // Update the last updated timestamp in registry
    updateUserSheetLastUpdated(sheetId);
    
  } catch (error) {
    console.error(`❌ Error appending to user sheet ${sheetId}:`, error);
    throw error;
  }
}

/**
 * Gets or creates the main folder for storing user sheets.
 * 
 * @returns {Folder} Google Drive folder for user sheets
 */
function getUserSheetsFolder() {
  try {
    const folderId = CONFIG.USER_SHEETS_CONFIG.FOLDER_ID;
    
    if (folderId && folderId !== 'USER_SHEETS_FOLDER_ID_TO_BE_REPLACED') {
      try {
        return DriveApp.getFolderById(folderId);
      } catch (error) {
        console.log(`⚠️ Configured folder ${folderId} not accessible, creating new one`);
      }
    }
    
    // Create new folder if not configured or not accessible
    const rootFolder = DriveApp.getRootFolder();
    const newFolder = rootFolder.createFolder('Anwar CRM User Sheets');
    
    console.log(`📁 Created new user sheets folder: ${newFolder.getId()}`);
    console.log(`⚠️ Please update CONFIG.USER_SHEETS_CONFIG.FOLDER_ID with: ${newFolder.getId()}`);
    
    return newFolder;
    
  } catch (error) {
    console.error('Error accessing/creating user sheets folder:', error);
    throw error;
  }
}

/**
 * Gets the User Sheet Map registry data.
 * 
 * @returns {Array} Array of user sheet registry entries
 */
function getUserSheetMapData() {
  try {
    const sheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM, 
      CONFIG.SHEET_NAMES.USER_SHEET_MAP, 
      CONFIG.SCHEMAS.USER_SHEET_MAP
    );
    
    const data = getSheetData(sheet);
    
    // Skip header row and convert to objects
    return data.slice(1).map(row => ({
      email: row[0] || '',
      sheetType: row[1] || '',
      sheetName: row[2] || '',
      sheetId: row[3] || '',
      createdDate: row[4] || '',
      lastUpdated: row[5] || '',
      status: row[6] || 'Active'
    })).filter(entry => entry.email && entry.sheetId);
    
  } catch (error) {
    console.error('Error getting user sheet map data:', error);
    return [];
  }
}

/**
 * Finds a user sheet entry in the registry.
 * 
 * @param {string} email - User's email
 * @param {string} sheetType - Type of sheet
 * @returns {Object|null} Sheet registry entry or null if not found
 */
function findUserSheetInRegistry(email, sheetType) {
  try {
    const registryData = getUserSheetMapData();
    return registryData.find(entry => 
      entry.email === email && 
      entry.sheetType === sheetType && 
      entry.status === 'Active'
    ) || null;
  } catch (error) {
    console.error('Error finding user sheet in registry:', error);
    return null;
  }
}

/**
 * Adds a new user sheet entry to the registry.
 * 
 * @param {string} email - User's email
 * @param {string} sheetType - Type of sheet
 * @param {string} sheetName - Name of the sheet
 * @param {string} sheetId - ID of the sheet
 */
function addUserSheetToRegistry(email, sheetType, sheetName, sheetId) {
  try {
    console.log(`📝 Adding user sheet to registry: ${email}, ${sheetType}`);
    
    const sheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM, 
      CONFIG.SHEET_NAMES.USER_SHEET_MAP, 
      CONFIG.SCHEMAS.USER_SHEET_MAP
    );
    
    const now = new Date();
    const registryRow = [
      email,
      sheetType,
      sheetName,
      sheetId,
      now,
      now,
      'Active'
    ];
    
    sheet.appendRow(registryRow);
    console.log(`✅ Added user sheet to registry`);
    
  } catch (error) {
    console.error('Error adding user sheet to registry:', error);
    throw error;
  }
}

/**
 * Updates the last updated timestamp for a user sheet in registry.
 * 
 * @param {string} sheetId - ID of the sheet to update
 */
function updateUserSheetLastUpdated(sheetId) {
  try {
    const sheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.USER_SHEET_MAP);
    const data = getSheetData(sheet);
    
    // Find the row with matching sheet ID (column D, index 3)
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === sheetId) {
        // Update last updated timestamp (column F, index 5)
        sheet.getRange(i + 1, 6).setValue(new Date());
        break;
      }
    }
  } catch (error) {
    console.error('Error updating user sheet last updated timestamp:', error);
    // Don't throw here as this is a non-critical operation
  }
}

/**
 * Removes a user sheet entry from the registry (marks as inactive).
 * 
 * @param {string} email - User's email
 * @param {string} sheetType - Type of sheet
 */
function removeUserSheetFromRegistry(email, sheetType) {
  try {
    const sheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.USER_SHEET_MAP);
    const data = getSheetData(sheet);
    
    // Find and mark as inactive
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email && data[i][1] === sheetType) {
        sheet.getRange(i + 1, 7).setValue('Inactive'); // Status column
        console.log(`🗑️ Marked user sheet as inactive: ${email}, ${sheetType}`);
        break;
      }
    }
  } catch (error) {
    console.error('Error removing user sheet from registry:', error);
    // Don't throw here as this is a non-critical operation
  }
}

/**
 * Lists all active sheets for a specific user.
 * 
 * @param {string} email - User's email
 * @returns {Array} Array of user's sheet information
 */
function listSheetsForUser(email) {
  try {
    console.log(`📋 Listing sheets for user: ${email}`);
    
    const registryData = getUserSheetMapData();
    const userSheets = registryData.filter(entry => 
      entry.email === email && entry.status === 'Active'
    );
    
    console.log(`📊 Found ${userSheets.length} sheets for user ${email}`);
    return userSheets;
    
  } catch (error) {
    console.error(`Error listing sheets for user ${email}:`, error);
    return [];
  }
}

/**
 * Sanitizes email address for use in file names.
 * 
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email suitable for file names
 */
function sanitizeEmailForFileName(email) {
  if (!email) return 'unknown';
  
  return email
    .replace(/[@.]/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
    .substring(0, 30); // Limit length
}

/**
 * Test function to verify user sheets functionality.
 * Run this from the Apps Script editor to test the implementation.
 */
function testUserSheetsCreation() {
  try {
    console.log('🧪 Testing user sheets creation...');
    
    const testEmail = 'test@example.com';
    const testSheetType = 'Orders';
    
    // Test sheet creation
    const userSheet = getOrCreateUserSheet(testEmail, testSheetType);
    console.log('✅ User sheet created:', userSheet);
    
    // Test data appending
    const testData = [
      new Date(),
      'TEST-001',
      'P.S-001',
      'Test Order',
      testEmail,
      'Ground Floor',
      '2nd Floor',
      'Test Address',
      '100 bags cement',
      'Within 24 hours',
      '',
      'Test order',
      'Yes',
      'Yes',
      '',
      '',
      '',
      'Submitted',
      'Dhaka North',
      '',
      '',
      'Test processing'
    ];
    
    appendRowToUserSheet(userSheet.id, testSheetType, testData);
    console.log('✅ Test data appended');
    
    // Test listing user sheets
    const userSheets = listSheetsForUser(testEmail);
    console.log('✅ User sheets listed:', userSheets);
    
    console.log('🎉 User sheets test completed successfully!');
    
  } catch (error) {
    console.error('❌ User sheets test failed:', error);
    throw error;
  }
}
