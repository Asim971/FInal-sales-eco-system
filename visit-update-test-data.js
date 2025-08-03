/**
 * @fileoverview Test data setup for Visit Update system testing
 * This file creates sample data to support comprehensive testing
 */

/**
 * Sets up test data for Visit Update system testing.
 * This function creates sample clients, orders, and employees for testing.
 */
function setupVisitUpdateTestData() {
  console.log('🔧 Setting up Visit Update Test Data...');
  
  try {
    // Setup test clients/retailers
    setupTestClients();
    
    // Setup test orders
    setupTestOrders();
    
    // Setup test employees
    setupTestEmployees();
    
    console.log('✅ Visit Update Test Data Setup Complete');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
}

/**
 * Creates test client data for validation testing
 */
function setupTestClients() {
  console.log('📋 Setting up test clients...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Create test retailers if they don't exist
    let retailerSheet;
    try {
      retailerSheet = ss.getSheetByName('RETAILERS');
    } catch (e) {
      retailerSheet = ss.insertSheet('RETAILERS');
      
      // Add headers
      retailerSheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Retailer ID', 'Name', 'Phone', 'Territory', 
        'Status', 'Address', 'Registration Date'
      ]]);
    }
    
    // Add test retailer data
    const testRetailers = [
      [new Date(), 'RET-001', 'Test Retailer 1', '01712345678', 'Dhaka North', 'Approved', 'Test Address 1', new Date()],
      [new Date(), 'RET-002', 'Test Retailer 2', '01812345678', 'Chittagong', 'Approved', 'Test Address 2', new Date()],
      [new Date(), 'TEST001', 'Mock Test Client', '01912345678', 'Dhaka South', 'Approved', 'Test Address 3', new Date()]
    ];
    
    // Check if test data already exists
    const existingData = retailerSheet.getDataRange().getValues();
    const existingIds = existingData.map(row => row[1]).slice(1); // Skip header
    
    const newData = testRetailers.filter(retailer => !existingIds.includes(retailer[1]));
    
    if (newData.length > 0) {
      const lastRow = retailerSheet.getLastRow();
      retailerSheet.getRange(lastRow + 1, 1, newData.length, newData[0].length).setValues(newData);
      console.log(`✅ Added ${newData.length} test retailers`);
    } else {
      console.log('ℹ️ Test retailer data already exists');
    }
    
    // Create test dealers
    let dealerSheet;
    try {
      dealerSheet = ss.getSheetByName('DEALERS');
    } catch (e) {
      dealerSheet = ss.insertSheet('DEALERS');
      
      // Add headers
      dealerSheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Dealer ID', 'Name', 'Phone', 'Territory', 
        'Status', 'Address', 'Registration Date'
      ]]);
    }
    
    // Add test dealer data
    const testDealers = [
      [new Date(), 'DLR-001', 'Test Dealer 1', '01712345679', 'Dhaka North', 'Approved', 'Test Dealer Address 1', new Date()],
      [new Date(), 'DLR-002', 'Test Dealer 2', '01812345679', 'Chittagong', 'Approved', 'Test Dealer Address 2', new Date()]
    ];
    
    const existingDealerData = dealerSheet.getDataRange().getValues();
    const existingDealerIds = existingDealerData.map(row => row[1]).slice(1);
    
    const newDealerData = testDealers.filter(dealer => !existingDealerIds.includes(dealer[1]));
    
    if (newDealerData.length > 0) {
      const lastRow = dealerSheet.getLastRow();
      dealerSheet.getRange(lastRow + 1, 1, newDealerData.length, newDealerData[0].length).setValues(newDealerData);
      console.log(`✅ Added ${newDealerData.length} test dealers`);
    } else {
      console.log('ℹ️ Test dealer data already exists');
    }
    
  } catch (error) {
    console.error('❌ Error setting up test clients:', error);
    throw error;
  }
}

/**
 * Creates test order data for validation testing
 */
function setupTestOrders() {
  console.log('📦 Setting up test orders...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Create test orders sheet if it doesn't exist
    let orderSheet;
    try {
      orderSheet = ss.getSheetByName('ORDERS');
    } catch (e) {
      orderSheet = ss.insertSheet('ORDERS');
      
      // Add headers
      orderSheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp', 'Order ID', 'Client ID', 'Client Type', 'Territory', 
        'Status', 'Amount', 'Products', 'Submitted By', 'Approval Date'
      ]]);
    }
    
    // Add test order data
    const testOrders = [
      [new Date(), 'ORD-001', 'RET-001', 'Retailer', 'Dhaka North', 'Approved', 50000, 'Test Products', 'test@company.com', new Date()],
      [new Date(), 'ORD-002', 'DLR-001', 'Dealer', 'Chittagong', 'Approved', 75000, 'Test Products 2', 'test@company.com', new Date()],
      [new Date(), 'ORD-003', 'RET-002', 'Retailer', 'Dhaka South', 'Pending', 30000, 'Test Products 3', 'test@company.com', new Date()]
    ];
    
    // Check if test data already exists
    const existingData = orderSheet.getDataRange().getValues();
    const existingIds = existingData.map(row => row[1]).slice(1);
    
    const newData = testOrders.filter(order => !existingIds.includes(order[1]));
    
    if (newData.length > 0) {
      const lastRow = orderSheet.getLastRow();
      orderSheet.getRange(lastRow + 1, 1, newData.length, newData[0].length).setValues(newData);
      console.log(`✅ Added ${newData.length} test orders`);
    } else {
      console.log('ℹ️ Test order data already exists');
    }
    
  } catch (error) {
    console.error('❌ Error setting up test orders:', error);
    throw error;
  }
}

/**
 * Creates test employee data for notification testing
 */
function setupTestEmployees() {
  console.log('👥 Setting up test employees...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Create test employees sheet if it doesn't exist
    let employeeSheet;
    try {
      employeeSheet = ss.getSheetByName('EMPLOYEES');
    } catch (e) {
      employeeSheet = ss.insertSheet('EMPLOYEES');
      
      // Add headers
      employeeSheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Email', 'Name', 'Role', 'Territory', 
        'Phone', 'Status', 'Reporting Manager'
      ]]);
    }
    
    // Add test employee data
    const testEmployees = [
      [new Date(), 'sr@anwar.com', 'Test SR', 'SR', 'Dhaka North', '01712345680', 'Active', 'cro@anwar.com'],
      [new Date(), 'cro@anwar.com', 'Test CRO', 'CRO', 'Dhaka North', '01712345681', 'Active', 'bdo@anwar.com'],
      [new Date(), 'bdo@anwar.com', 'Test BDO', 'BDO', 'Dhaka North', '01712345682', 'Active', 'bdteam@anwar.com'],
      [new Date(), 'bdteam@anwar.com', 'Test BD Team Incharge', 'BD Team Incharge', 'Dhaka North', '01712345683', 'Active', 'bdincharge@anwar.com'],
      [new Date(), 'bdincharge@anwar.com', 'Test BD Incharge', 'BD Incharge', 'Dhaka North', '01712345684', 'Active', ''],
      [new Date(), 'test@company.com', 'Test User', 'SR', 'Chittagong', '01812345680', 'Active', 'cro2@anwar.com'],
      [new Date(), 'cro2@anwar.com', 'Test CRO Chittagong', 'CRO', 'Chittagong', '01812345681', 'Active', 'bdo2@anwar.com'],
      [new Date(), 'bdo2@anwar.com', 'Test BDO Chittagong', 'BDO', 'Chittagong', '01812345682', 'Active', 'bdteam@anwar.com']
    ];
    
    // Check if test data already exists
    const existingData = employeeSheet.getDataRange().getValues();
    const existingEmails = existingData.map(row => row[1]).slice(1);
    
    const newData = testEmployees.filter(employee => !existingEmails.includes(employee[1]));
    
    if (newData.length > 0) {
      const lastRow = employeeSheet.getLastRow();
      employeeSheet.getRange(lastRow + 1, 1, newData.length, newData[0].length).setValues(newData);
      console.log(`✅ Added ${newData.length} test employees`);
    } else {
      console.log('ℹ️ Test employee data already exists');
    }
    
  } catch (error) {
    console.error('❌ Error setting up test employees:', error);
    throw error;
  }
}

/**
 * Creates the VISIT_UPDATES sheet with proper headers if it doesn't exist
 */
function setupVisitUpdatesSheet() {
  console.log('📊 Setting up VISIT_UPDATES sheet...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    let visitUpdatesSheet;
    try {
      visitUpdatesSheet = ss.getSheetByName('VISIT_UPDATES');
    } catch (e) {
      visitUpdatesSheet = ss.insertSheet('VISIT_UPDATES');
      
      // Add headers matching the schema
      visitUpdatesSheet.getRange(1, 1, 1, 14).setValues([[
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
      ]]);
      
      console.log('✅ VISIT_UPDATES sheet created with headers');
    }
    
  } catch (error) {
    console.error('❌ Error setting up VISIT_UPDATES sheet:', error);
    throw error;
  }
}

/**
 * Runs setup for all test data components
 */
function runCompleteTestDataSetup() {
  console.log('🚀 Running Complete Test Data Setup...');
  console.log('='.repeat(60));
  
  try {
    // Setup all test data
    setupVisitUpdateTestData();
    
    // Setup visit updates sheet
    setupVisitUpdatesSheet();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Complete Test Data Setup Finished!');
    console.log('📋 You can now run: runAllVisitUpdateTests()');
    
  } catch (error) {
    console.error('❌ Complete test data setup failed:', error);
  }
}

/**
 * Cleans up test data (use with caution!)
 */
function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // List of test sheets to clean up
    const testSheets = ['RETAILERS', 'DEALERS', 'ORDERS', 'EMPLOYEES'];
    
    testSheets.forEach(sheetName => {
      try {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          
          // Remove test data (keep headers)
          if (data.length > 1) {
            sheet.getRange(2, 1, data.length - 1, data[0].length).clearContent();
            console.log(`✅ Cleaned ${sheetName} sheet`);
          }
        }
      } catch (e) {
        console.log(`ℹ️ ${sheetName} sheet not found or already clean`);
      }
    });
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}
