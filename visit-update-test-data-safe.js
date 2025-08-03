/**
 * @fileoverview Safe Visit Update Test Data Setup
 * This version includes proper error handling and sheet creation
 */

/**
 * Sets up test data for Visit Update system with proper error handling
 */
function setupVisitUpdateTestDataSafe() {
  console.log('🔧 Setting up Visit Update Test Data (Safe Mode)...');
  
  try {
    // First, check if CONFIG exists and has the required spreadsheet ID
    if (typeof CONFIG === 'undefined') {
      console.log('⚠️ CONFIG not found. Creating minimal config for testing...');
      createMinimalTestConfig();
    }
    
    if (!CONFIG.SPREADSHEET_IDS || !CONFIG.SPREADSHEET_IDS.CRM) {
      console.log('⚠️ CRM Spreadsheet ID not configured. Please set CONFIG.SPREADSHEET_IDS.CRM');
      return;
    }
    
    console.log('📊 Using CRM Spreadsheet ID:', CONFIG.SPREADSHEET_IDS.CRM);
    
    // Try to open the spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      console.log('✅ Successfully opened CRM spreadsheet:', spreadsheet.getName());
    } catch (error) {
      console.log('❌ Cannot open CRM spreadsheet:', error.message);
      console.log('Creating a new test spreadsheet...');
      spreadsheet = createTestSpreadsheet();
    }
    
    // Set up test data in different sheets
    setupTestClientsData(spreadsheet);
    setupTestOrdersData(spreadsheet);
    setupTestEmployeesData(spreadsheet);
    setupTestVisitUpdatesSheet(spreadsheet);
    
    console.log('✅ Visit Update Test Data Setup Completed Successfully!');
    console.log('📊 Spreadsheet ID:', spreadsheet.getId());
    console.log('🔗 Spreadsheet URL:', spreadsheet.getUrl());
    
    return {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl(),
      spreadsheetName: spreadsheet.getName()
    };
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
}

/**
 * Creates a minimal CONFIG for testing purposes
 */
function createMinimalTestConfig() {
  if (typeof CONFIG === 'undefined') {
    // Create a global CONFIG object for testing
    global.CONFIG = {
      SPREADSHEET_IDS: {},
      SHEET_NAMES: {
        CLIENTS: 'Clients',
        ORDERS: 'Orders', 
        EMPLOYEES: 'Employees',
        VISIT_UPDATES: 'Visit Updates'
      },
      SCHEMAS: {
        VISIT_UPDATES: [
          'Timestamp',
          'Visit Update ID',
          'Email Address',
          'Type of Visit',
          'Type of Client',
          'Client ID',
          'User Order ID',
          'Territory',
          'Upload Image Link',
          'Client Name',
          'Client Phone Number',
          'Status',
          'Notification Sent To',
          'Remarks'
        ]
      }
    };
    console.log('✅ Created minimal CONFIG for testing');
  }
}

/**
 * Creates a new test spreadsheet if the configured one doesn't exist
 */
function createTestSpreadsheet() {
  try {
    console.log('🔧 Creating new test spreadsheet...');
    const spreadsheet = SpreadsheetApp.create('Visit Update System - Test Data');
    
    // Update CONFIG with the new spreadsheet ID
    CONFIG.SPREADSHEET_IDS.CRM = spreadsheet.getId();
    
    console.log('✅ Created new test spreadsheet:', spreadsheet.getName());
    console.log('📊 New Spreadsheet ID:', spreadsheet.getId());
    
    return spreadsheet;
    
  } catch (error) {
    console.error('❌ Error creating test spreadsheet:', error);
    throw error;
  }
}

/**
 * Sets up test client data safely
 */
function setupTestClientsData(spreadsheet) {
  try {
    console.log('📋 Setting up test clients data...');
    
    // Get or create the Clients sheet
    let clientsSheet;
    try {
      clientsSheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAMES.CLIENTS || 'Clients');
    } catch (error) {
      console.log('Creating Clients sheet...');
      clientsSheet = spreadsheet.insertSheet(CONFIG.SHEET_NAMES.CLIENTS || 'Clients');
    }
    
    // Clear existing data and set up headers
    clientsSheet.clear();
    const clientHeaders = ['Client ID', 'Client Name', 'Type', 'Phone', 'Territory', 'Status'];
    clientsSheet.getRange(1, 1, 1, clientHeaders.length).setValues([clientHeaders]);
    
    // Add test client data
    const testClients = [
      ['TEST001', 'Test Dealer 1', 'Dealer', '01712345678', 'Dhaka North', 'Active'],
      ['TEST002', 'Test Retailer 1', 'Retailer', '01812345678', 'Dhaka South', 'Active'],
      ['TEST003', 'Test Partner 1', 'Partner', '01912345678', 'Chittagong', 'Active'],
      ['DLR001', 'ABC Electronics', 'Dealer', '01712345679', 'Dhaka North', 'Active'],
      ['RET001', 'XYZ Store', 'Retailer', '01812345679', 'Chittagong', 'Active'],
      ['PTR001', 'Best Partners Ltd', 'Partner', '01912345679', 'Sylhet', 'Active']
    ];
    
    clientsSheet.getRange(2, 1, testClients.length, testClients[0].length).setValues(testClients);
    
    console.log(`✅ Added ${testClients.length} test clients`);
    
  } catch (error) {
    console.error('❌ Error setting up test clients:', error);
    throw error;
  }
}

/**
 * Sets up test order data safely
 */
function setupTestOrdersData(spreadsheet) {
  try {
    console.log('📋 Setting up test orders data...');
    
    // Get or create the Orders sheet
    let ordersSheet;
    try {
      ordersSheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAMES.ORDERS || 'Orders');
    } catch (error) {
      console.log('Creating Orders sheet...');
      ordersSheet = spreadsheet.insertSheet(CONFIG.SHEET_NAMES.ORDERS || 'Orders');
    }
    
    // Clear existing data and set up headers
    ordersSheet.clear();
    const orderHeaders = ['Order ID', 'Client ID', 'Status', 'Territory', 'Created Date', 'Value'];
    ordersSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
    
    // Add test order data
    const testOrders = [
      ['ORD001', 'TEST001', 'Approved', 'Dhaka North', new Date(), '50000'],
      ['ORD002', 'TEST002', 'Approved', 'Dhaka South', new Date(), '75000'],
      ['ORD003', 'TEST003', 'Pending', 'Chittagong', new Date(), '30000'],
      ['ORD004', 'DLR001', 'Approved', 'Dhaka North', new Date(), '100000'],
      ['ORD005', 'RET001', 'Approved', 'Chittagong', new Date(), '25000']
    ];
    
    ordersSheet.getRange(2, 1, testOrders.length, testOrders[0].length).setValues(testOrders);
    
    console.log(`✅ Added ${testOrders.length} test orders`);
    
  } catch (error) {
    console.error('❌ Error setting up test orders:', error);
    throw error;
  }
}

/**
 * Sets up test employee data safely
 */
function setupTestEmployeesData(spreadsheet) {
  try {
    console.log('📋 Setting up test employees data...');
    
    // Get or create the Employees sheet
    let employeesSheet;
    try {
      employeesSheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES || 'Employees');
    } catch (error) {
      console.log('Creating Employees sheet...');
      employeesSheet = spreadsheet.insertSheet(CONFIG.SHEET_NAMES.EMPLOYEES || 'Employees');
    }
    
    // Clear existing data and set up headers
    employeesSheet.clear();
    const employeeHeaders = ['Name', 'Email', 'Role', 'Territory', 'Phone', 'Status'];
    employeesSheet.getRange(1, 1, 1, employeeHeaders.length).setValues([employeeHeaders]);
    
    // Add test employee data
    const testEmployees = [
      ['John SR', 'john.sr@company.com', 'SR', 'Dhaka North', '01712345680', 'Active'],
      ['Jane CRO', 'jane.cro@company.com', 'CRO', 'Dhaka North', '01712345681', 'Active'],
      ['Mike BDO', 'mike.bdo@company.com', 'BDO', 'Dhaka North', '01712345682', 'Active'],
      ['Sarah SR', 'sarah.sr@company.com', 'SR', 'Chittagong', '01812345680', 'Active'],
      ['Tom CRO', 'tom.cro@company.com', 'CRO', 'Chittagong', '01812345681', 'Active'],
      ['Lisa BDO', 'lisa.bdo@company.com', 'BDO', 'Chittagong', '01812345682', 'Active'],
      ['Admin User', 'admin@company.com', 'BD Team Incharge', 'All', '01712345683', 'Active']
    ];
    
    employeesSheet.getRange(2, 1, testEmployees.length, testEmployees[0].length).setValues(testEmployees);
    
    console.log(`✅ Added ${testEmployees.length} test employees`);
    
  } catch (error) {
    console.error('❌ Error setting up test employees:', error);
    throw error;
  }
}

/**
 * Sets up the Visit Updates sheet safely
 */
function setupTestVisitUpdatesSheet(spreadsheet) {
  try {
    console.log('📋 Setting up Visit Updates sheet...');
    
    // Get or create the Visit Updates sheet
    let visitUpdatesSheet;
    try {
      visitUpdatesSheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAMES.VISIT_UPDATES || 'Visit Updates');
    } catch (error) {
      console.log('Creating Visit Updates sheet...');
      visitUpdatesSheet = spreadsheet.insertSheet(CONFIG.SHEET_NAMES.VISIT_UPDATES || 'Visit Updates');
    }
    
    // Clear existing data and set up headers
    visitUpdatesSheet.clear();
    const headers = CONFIG.SCHEMAS.VISIT_UPDATES || [
      'Timestamp',
      'Visit Update ID',
      'Email Address',
      'Type of Visit',
      'Type of Client',
      'Client ID',
      'User Order ID',
      'Territory',
      'Upload Image Link',
      'Client Name',
      'Client Phone Number',
      'Status',
      'Notification Sent To',
      'Remarks'
    ];
    
    visitUpdatesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    console.log(`✅ Set up Visit Updates sheet with ${headers.length} columns`);
    
  } catch (error) {
    console.error('❌ Error setting up Visit Updates sheet:', error);
    throw error;
  }
}

/**
 * Verifies that test data was set up correctly
 */
function verifyTestDataSetup() {
  console.log('🔍 Verifying test data setup...');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Check each sheet
    const sheetsToCheck = ['Clients', 'Orders', 'Employees', 'Visit Updates'];
    const results = {};
    
    sheetsToCheck.forEach(sheetName => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        const dataRange = sheet.getDataRange();
        const rowCount = dataRange.getNumRows();
        results[sheetName] = rowCount > 1 ? `✅ ${rowCount - 1} records` : '⚠️ No data';
        console.log(`${sheetName}: ${results[sheetName]}`);
      } catch (error) {
        results[sheetName] = '❌ Sheet not found';
        console.log(`${sheetName}: ${results[sheetName]}`);
      }
    });
    
    console.log('✅ Test data verification completed');
    return results;
    
  } catch (error) {
    console.error('❌ Error verifying test data:', error);
    return {};
  }
}

/**
 * Quick test to validate Visit Update functionality with test data
 */
function testVisitUpdateWithTestData() {
  console.log('🧪 Testing Visit Update with Test Data...');
  
  try {
    // Test general visit validation
    const generalVisitData = {
      typeOfVisit: 'General Visit',
      typeOfClient: 'Dealer',
      clientId: 'TEST001',
      territory: 'Dhaka North',
      clientName: 'Test Dealer 1',
      clientPhone: '01712345678',
      submitterEmail: 'test@company.com'
    };
    
    console.log('\n--- Testing General Visit Validation ---');
    const result1 = validateVisitUpdateData(generalVisitData);
    console.log('General visit validation:', result1.isValid ? '✅ PASS' : '❌ FAIL');
    if (!result1.isValid) {
      console.log('Errors:', result1.errors);
    }
    
    // Test order confirmation validation
    const orderConfirmationData = {
      typeOfVisit: 'Order Confirmation',
      userOrderId: 'ORD001',
      territory: 'Dhaka North',
      clientName: 'Test Client',
      clientPhone: '01712345678',
      submitterEmail: 'test@company.com'
    };
    
    console.log('\n--- Testing Order Confirmation Validation ---');
    const result2 = validateVisitUpdateData(orderConfirmationData);
    console.log('Order confirmation validation:', result2.isValid ? '✅ PASS' : '❌ FAIL');
    if (!result2.isValid) {
      console.log('Errors:', result2.errors);
    }
    
    console.log('✅ Visit Update testing with test data completed');
    
  } catch (error) {
    console.error('❌ Error testing with test data:', error);
  }
}

/**
 * Complete setup and test workflow
 */
function setupAndTestVisitUpdate() {
  console.log('🚀 Running Complete Visit Update Setup and Test...');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Set up test data
    console.log('\n📊 Step 1: Setting up test data...');
    const setupResult = setupVisitUpdateTestDataSafe();
    
    // Step 2: Verify setup
    console.log('\n🔍 Step 2: Verifying test data...');
    const verificationResult = verifyTestDataSetup();
    
    // Step 3: Test functionality
    console.log('\n🧪 Step 3: Testing Visit Update functionality...');
    testVisitUpdateWithTestData();
    
    // Step 4: Run smoke test
    console.log('\n💨 Step 4: Running smoke test...');
    runSmokeTest();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Complete Visit Update Setup and Test Completed!');
    
    if (setupResult) {
      console.log('📊 Spreadsheet ID:', setupResult.spreadsheetId);
      console.log('🔗 Spreadsheet URL:', setupResult.spreadsheetUrl);
    }
    
  } catch (error) {
    console.error('❌ Setup and test failed:', error);
  }
}
