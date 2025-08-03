/**
 * @fileoverview Setup and Initialization for Per-Submitter Sheets Feature
 * This file contains setup functions and deployment helpers for the user sheets functionality.
 */

/**
 * Main setup function for Per-Submitter Sheets feature.
 * Run this function once during deployment to initialize all components.
 */
function setupPerSubmitterSheetsFeature() {
  try {
    console.log('🚀 Setting up Per-Submitter Sheets Feature...');
    console.log('=' .repeat(60));
    
    // Step 1: Create user sheets folder
    console.log('📁 Step 1: Creating user sheets folder...');
    const folderId = createUserSheetsFolder();
    
    // Step 2: Initialize User Sheet Map in CRM
    console.log('📊 Step 2: Initializing User Sheet Map...');
    initializeUserSheetMap();
    
    // Step 3: Verify configuration
    console.log('🔧 Step 3: Verifying configuration...');
    verifyConfiguration();
    
    // Step 4: Test basic functionality
    console.log('🧪 Step 4: Testing basic functionality...');
    testBasicSetup();
    
    console.log('=' .repeat(60));
    console.log('✅ Per-Submitter Sheets Feature setup completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log(`1. Update CONFIG.USER_SHEETS_CONFIG.FOLDER_ID with: ${folderId}`);
    console.log('2. Enable the feature by setting CONFIG.USER_SHEETS_CONFIG.ENABLED = true');
    console.log('3. Configure WhatsApp webhook URL in Maytapi dashboard');
    console.log('4. Run testPerSubmitterSheetsComplete() to validate everything works');
    console.log('');
    console.log('🎉 The feature is ready for production use!');
    
    return {
      success: true,
      folderId: folderId,
      message: 'Setup completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Creates the main folder for user sheets and returns its ID.
 * @returns {string} The folder ID
 */
function createUserSheetsFolder() {
  try {
    console.log('📁 Creating user sheets folder...');
    
    // Check if folder already exists
    const existingFolderId = CONFIG.USER_SHEETS_CONFIG.FOLDER_ID;
    
    if (existingFolderId && existingFolderId !== 'USER_SHEETS_FOLDER_ID_TO_BE_REPLACED') {
      try {
        const existingFolder = DriveApp.getFolderById(existingFolderId);
        console.log(`✅ Using existing folder: ${existingFolder.getName()} (${existingFolderId})`);
        return existingFolderId;
      } catch (error) {
        console.log('⚠️ Configured folder not accessible, creating new one...');
      }
    }
    
    // Create new folder
    const rootFolder = DriveApp.getRootFolder();
    const folderName = 'Anwar CRM - User Personal Sheets';
    const newFolder = rootFolder.createFolder(folderName);
    
    console.log(`✅ Created new folder: ${folderName} (${newFolder.getId()})`);
    return newFolder.getId();
    
  } catch (error) {
    console.error('❌ Error creating user sheets folder:', error);
    throw error;
  }
}

/**
 * Initializes the User Sheet Map in the CRM spreadsheet.
 */
function initializeUserSheetMap() {
  try {
    console.log('📊 Initializing User Sheet Map...');
    
    const sheet = getOrCreateSheetSafe(
      CONFIG.SPREADSHEET_IDS.CRM,
      CONFIG.SHEET_NAMES.USER_SHEET_MAP,
      CONFIG.SCHEMAS.USER_SHEET_MAP
    );
    
    console.log(`✅ User Sheet Map initialized: ${sheet.getName()}`);
    
    // Add a sample entry to verify structure
    const testEntry = [
      'setup-test@example.com',
      'Setup Test',
      'Test Sheet',
      'test-sheet-id',
      new Date(),
      new Date(),
      'Test'
    ];
    
    sheet.appendRow(testEntry);
    console.log('✅ Added test entry to verify structure');
    
  } catch (error) {
    console.error('❌ Error initializing User Sheet Map:', error);
    throw error;
  }
}

/**
 * Verifies that all configuration elements are properly set up.
 */
function verifyConfiguration() {
  try {
    console.log('🔧 Verifying configuration...');
    
    const errors = [];
    
    // Check USER_SHEETS_CONFIG
    if (!CONFIG.USER_SHEETS_CONFIG) {
      errors.push('USER_SHEETS_CONFIG not found in CONFIG');
    }
    
    // Check schemas
    if (!CONFIG.SCHEMAS.USER_SHEET_MAP) {
      errors.push('USER_SHEET_MAP schema not configured');
    }
    
    // Check sheet names
    if (!CONFIG.SHEET_NAMES.USER_SHEET_MAP) {
      errors.push('USER_SHEET_MAP sheet name not configured');
    }
    
    // Check CRM spreadsheet access
    try {
      const crmSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      console.log(`✅ CRM spreadsheet accessible: ${crmSpreadsheet.getName()}`);
    } catch (error) {
      errors.push(`CRM spreadsheet not accessible: ${error.message}`);
    }
    
    // Check Maytapi configuration
    if (!CONFIG.MAYTAPI_CONFIG || !CONFIG.MAYTAPI_CONFIG.API_KEY) {
      errors.push('Maytapi configuration incomplete - WhatsApp integration may not work');
    }
    
    if (errors.length > 0) {
      console.error('❌ Configuration issues found:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error(`Configuration validation failed: ${errors.length} issues found`);
    }
    
    console.log('✅ Configuration verification passed');
    
  } catch (error) {
    console.error('❌ Configuration verification failed:', error);
    throw error;
  }
}

/**
 * Tests basic setup functionality.
 */
function testBasicSetup() {
  try {
    console.log('🧪 Testing basic setup...');
    
    // Test user sheet creation
    const testEmail = 'setup-verification@anwar-crm.com';
    const userSheet = getOrCreateUserSheet(testEmail, 'Orders');
    
    if (!userSheet || !userSheet.id) {
      throw new Error('User sheet creation test failed');
    }
    
    console.log(`✅ User sheet creation test passed: ${userSheet.name}`);
    
    // Test registry functionality
    const userSheets = listSheetsForUser(testEmail);
    
    if (userSheets.length === 0) {
      throw new Error('User sheet registry test failed');
    }
    
    console.log(`✅ Registry test passed: found ${userSheets.length} sheets`);
    
    // Test employee lookup (if employees exist)
    try {
      const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
      const employeeData = getSheetData(employeesSheet);
      
      if (employeeData.length > 1) {
        console.log(`✅ Employee system accessible: ${employeeData.length - 1} employees found`);
      } else {
        console.log('⚠️ No employees found - WhatsApp integration will need employee data');
      }
    } catch (error) {
      console.log('⚠️ Employee sheet not accessible - create employees for WhatsApp integration');
    }
    
    console.log('✅ Basic setup tests passed');
    
  } catch (error) {
    console.error('❌ Basic setup test failed:', error);
    throw error;
  }
}

/**
 * Updates the configuration file with the new folder ID.
 * Note: This requires manual update since we can't modify the code files programmatically.
 * 
 * @param {string} folderId - The folder ID to set
 */
function updateConfigurationInstructions(folderId) {
  console.log('📝 Configuration Update Instructions:');
  console.log('');
  console.log('Update config.js with the following:');
  console.log('');
  console.log('USER_SHEETS_CONFIG: {');
  console.log(`  FOLDER_ID: '${folderId}',`);
  console.log('  ENABLED: true,');
  console.log('  CACHE_TIMEOUT: 600');
  console.log('},');
  console.log('');
}

/**
 * Enables the Per-Submitter Sheets feature.
 * Run this after completing the setup and configuration.
 */
function enablePerSubmitterSheetsFeature() {
  try {
    console.log('✅ Enabling Per-Submitter Sheets Feature...');
    
    // Verify setup is complete
    if (CONFIG.USER_SHEETS_CONFIG.FOLDER_ID === 'USER_SHEETS_FOLDER_ID_TO_BE_REPLACED') {
      throw new Error('Setup not complete: Please update FOLDER_ID in config.js first');
    }
    
    // Enable the feature
    CONFIG.USER_SHEETS_CONFIG.ENABLED = true;
    
    console.log('🎉 Per-Submitter Sheets Feature is now ENABLED!');
    console.log('');
    console.log('📋 Feature Status:');
    console.log(`  - Folder ID: ${CONFIG.USER_SHEETS_CONFIG.FOLDER_ID}`);
    console.log(`  - Enabled: ${CONFIG.USER_SHEETS_CONFIG.ENABLED}`);
    console.log(`  - Cache Timeout: ${CONFIG.USER_SHEETS_CONFIG.CACHE_TIMEOUT} seconds`);
    console.log('');
    console.log('🚀 Users can now:');
    console.log('  - Get personal copies of their form submissions');
    console.log('  - Query their data via WhatsApp using "need to see data"');
    console.log('  - Receive direct links to their personal Google Sheets');
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to enable feature:', error);
    return false;
  }
}

/**
 * Disables the Per-Submitter Sheets feature.
 */
function disablePerSubmitterSheetsFeature() {
  try {
    console.log('⚠️ Disabling Per-Submitter Sheets Feature...');
    
    CONFIG.USER_SHEETS_CONFIG.ENABLED = false;
    
    console.log('✅ Per-Submitter Sheets Feature is now DISABLED');
    console.log('ℹ️ Existing user sheets will remain accessible, but no new sheets will be created');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to disable feature:', error);
    return false;
  }
}

/**
 * Gets the current status of the Per-Submitter Sheets feature.
 */
function getFeatureStatus() {
  try {
    const status = {
      enabled: CONFIG.USER_SHEETS_CONFIG.ENABLED,
      folderId: CONFIG.USER_SHEETS_CONFIG.FOLDER_ID,
      cacheTimeout: CONFIG.USER_SHEETS_CONFIG.CACHE_TIMEOUT,
      setupComplete: CONFIG.USER_SHEETS_CONFIG.FOLDER_ID !== 'USER_SHEETS_FOLDER_ID_TO_BE_REPLACED'
    };
    
    console.log('📊 Per-Submitter Sheets Feature Status:');
    console.log(`  - Setup Complete: ${status.setupComplete ? '✅' : '❌'}`);
    console.log(`  - Enabled: ${status.enabled ? '✅' : '❌'}`);
    console.log(`  - Folder ID: ${status.folderId}`);
    console.log(`  - Cache Timeout: ${status.cacheTimeout} seconds`);
    
    // Get statistics
    try {
      const userSheetMapData = getUserSheetMapData();
      const activeSheets = userSheetMapData.filter(sheet => sheet.status === 'Active');
      const uniqueUsers = [...new Set(activeSheets.map(sheet => sheet.email))];
      
      console.log('');
      console.log('📈 Usage Statistics:');
      console.log(`  - Total User Sheets: ${activeSheets.length}`);
      console.log(`  - Unique Users: ${uniqueUsers.length}`);
      
      // Sheet type breakdown
      const sheetTypes = {};
      activeSheets.forEach(sheet => {
        sheetTypes[sheet.sheetType] = (sheetTypes[sheet.sheetType] || 0) + 1;
      });
      
      console.log('  - Sheet Types:');
      Object.entries(sheetTypes).forEach(([type, count]) => {
        console.log(`    * ${type}: ${count}`);
      });
      
    } catch (error) {
      console.log('⚠️ Could not retrieve usage statistics');
    }
    
    return status;
    
  } catch (error) {
    console.error('❌ Error getting feature status:', error);
    return null;
  }
}

/**
 * Deployment checklist function.
 */
function deploymentChecklist() {
  console.log('📋 Per-Submitter Sheets Deployment Checklist:');
  console.log('');
  console.log('✅ Phase 1: Foundation Setup');
  console.log('  □ Run setupPerSubmitterSheetsFeature()');
  console.log('  □ Update config.js with folder ID');
  console.log('  □ Verify CRM spreadsheet access');
  console.log('');
  console.log('✅ Phase 2: Configuration');
  console.log('  □ Enable feature with enablePerSubmitterSheetsFeature()');
  console.log('  □ Test with testPerSubmitterSheetsComplete()');
  console.log('  □ Verify employee data exists for WhatsApp integration');
  console.log('');
  console.log('✅ Phase 3: WhatsApp Integration');
  console.log('  □ Configure Maytapi webhook URL');
  console.log('  □ Test WhatsApp commands with real employees');
  console.log('  □ Verify conversation state management');
  console.log('');
  console.log('✅ Phase 4: Production Validation');
  console.log('  □ Test form submissions create user sheets');
  console.log('  □ Test WhatsApp "need to see data" command');
  console.log('  □ Verify sheet links are accessible');
  console.log('  □ Monitor performance and error logs');
  console.log('');
  console.log('🚀 Ready for Production!');
}
