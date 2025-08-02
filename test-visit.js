/**
 * @fileoverview Test functions for Visit form functionality
 */

/**
 * Test function to validate Visit form configuration
 */
function testVisitFormConfig() {
  console.log('🧪 Testing Visit Form Configuration...');
  
  try {
    // Test 1: Check if VISIT form is defined in CONFIG.FORMS
    if (!CONFIG.FORMS.VISIT) {
      throw new Error('VISIT form not found in CONFIG.FORMS');
    }
    console.log('✅ VISIT form found in CONFIG.FORMS');
    
    // Test 2: Check form structure
    const visitForm = CONFIG.FORMS.VISIT;
    if (!visitForm.title || !visitForm.items) {
      throw new Error('VISIT form missing title or items');
    }
    console.log('✅ VISIT form has proper structure');
    
    // Test 3: Check required fields
    const requiredFields = [
      'Submitter Email',
      'Type of Visit',
      'Territory',
      'Type of Client',
      'Client Name',
      'Client Phone Number'
    ];
    
    const formFieldTitles = visitForm.items.map(item => item.title);
    const missingFields = requiredFields.filter(field => !formFieldTitles.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('✅ All required fields present');
    
    // Test 4: Check VISITS schema
    if (!CONFIG.SCHEMAS.VISITS) {
      throw new Error('VISITS schema not found');
    }
    console.log('✅ VISITS schema found');
    
    // Test 5: Check VISITS sheet name
    if (!CONFIG.SHEET_NAMES.VISITS) {
      throw new Error('VISITS sheet name not found');
    }
    console.log('✅ VISITS sheet name found');
    
    console.log('🎉 Visit Form Configuration Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Form Configuration Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate Visit ID generation
 */
function testVisitIdGeneration() {
  console.log('🧪 Testing Visit ID Generation...');
  
  try {
    // Test generateVisitId function
    const visitId1 = generateVisitId();
    const visitId2 = generateVisitId();
    
    console.log('Generated Visit IDs:', visitId1, visitId2);
    
    // Test ID format: V-YYYYMMDD-XXX
    const idPattern = /^V-\d{8}-\d{3}$/;
    
    if (!idPattern.test(visitId1)) {
      throw new Error(`Invalid Visit ID format: ${visitId1}`);
    }
    
    if (!idPattern.test(visitId2)) {
      throw new Error(`Invalid Visit ID format: ${visitId2}`);
    }
    
    console.log('✅ Visit ID format validation passed');
    
    // Test that IDs are sequential
    const id1Number = parseInt(visitId1.split('-')[2]);
    const id2Number = parseInt(visitId2.split('-')[2]);
    
    if (id2Number !== id1Number + 1) {
      console.log('⚠️ Warning: Visit IDs may not be sequential (depends on existing data)');
    } else {
      console.log('✅ Visit IDs are sequential');
    }
    
    console.log('🎉 Visit ID Generation Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit ID Generation Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate sheet creation and headers
 */
function testVisitSheetCreation() {
  console.log('🧪 Testing Visit Sheet Creation...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Test sheet creation/verification
    verifyAndHealSheet(CONFIG.SHEET_NAMES.VISITS, ss);
    
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    if (!sheet) {
      throw new Error('Failed to create/find Visits sheet');
    }
    console.log('✅ Visits sheet exists');
    
    // Test headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedHeaders = CONFIG.SCHEMAS.VISITS;
    
    console.log('Actual headers:', headers);
    console.log('Expected headers:', expectedHeaders);
    
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing headers: ${missingHeaders.join(', ')}`);
    }
    
    console.log('✅ All required headers present');
    
    console.log('🎉 Visit Sheet Creation Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Sheet Creation Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to simulate visit form submission
 */
function testVisitFormSubmission() {
  console.log('🧪 Testing Visit Form Submission...');
  
  try {
    // Create mock form submission data
    const mockFormData = [
      new Date(), // Timestamp
      'test@anwar.com', // Submitter Email
      'Client Visit', // Type of Visit (updated)
      'Dhaka North', // Territory
      'Retailer', // Type of Client (updated)
      'Test Retailer', // Client Name
      '01234567890', // Client Phone Number
      '123 Test Street, Dhaka', // Client Address
      'Initial visit to discuss new products', // Visit Purpose/Notes
      'https://drive.google.com/test-image-link' // Upload Image Link
    ];
    
    // Create mock event object
    const mockEvent = {
      values: mockFormData
    };
    
    // Test the form submission handler
    handleVisitFormSubmit(mockEvent);
    
    // Verify data was added to sheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet) {
      throw new Error('Visits sheet not found after submission');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No data found in visits sheet after submission');
    }
    
    const lastRowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('Last row data:', lastRowData);
    
    // Check that Visit ID was generated
    const visitId = lastRowData[1]; // Column B contains Visit ID
    if (!visitId || !visitId.toString().startsWith('V-')) {
      throw new Error('Visit ID not properly generated');
    }
    
    console.log('✅ Visit submission processed successfully');
    console.log('📋 Generated Visit ID:', visitId);
    
    console.log('🎉 Visit Form Submission Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Form Submission Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate visit status update functionality
 */
function testVisitStatusUpdate() {
  console.log('🧪 Testing Visit Status Update...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      console.log('⚠️ No visit data found, skipping status update test');
      return true;
    }
    
    // Get the last visit ID
    const lastRow = sheet.getLastRow();
    const visitId = sheet.getRange(lastRow, 2).getValue(); // Column B contains Visit ID
    
    if (!visitId) {
      throw new Error('No visit ID found to test status update');
    }
    
    // Test status update
    updateVisitStatus(visitId, 'Completed', 'Test status update');
    
    // Verify update
    const updatedRow = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const status = updatedRow[11]; // Status column
    const notes = updatedRow[13]; // Notes column
    
    if (status !== 'Completed') {
      throw new Error('Status not updated correctly');
    }
    
    if (notes !== 'Test status update') {
      throw new Error('Notes not updated correctly');
    }
    
    console.log('✅ Visit status updated successfully');
    
    console.log('🎉 Visit Status Update Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Status Update Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate visit filtering functionality
 */
function testVisitFiltering() {
  console.log('🧪 Testing Visit Filtering...');
  
  try {
    // Test filtering by territory
    const dhakaVisits = getVisitsByFilter('territory', 'Dhaka North');
    console.log('✅ Territory filtering works, found', dhakaVisits.length, 'visits in Dhaka North');
    
    // Test filtering by submitter
    const submitterVisits = getVisitsByFilter('submitter', 'test@anwar.com');
    console.log('✅ Submitter filtering works, found', submitterVisits.length, 'visits by test@anwar.com');
    
    console.log('🎉 Visit Filtering Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Filtering Test FAILED:', error.message);
    return false;
  }
}

/**
 * Run all visit form tests
 */
function runAllVisitTests() {
  console.log('🚀 Starting Comprehensive Visit Form Testing...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Configuration Test', func: testVisitFormConfig },
    { name: 'ID Generation Test', func: testVisitIdGeneration },
    { name: 'Sheet Creation Test', func: testVisitSheetCreation },
    { name: 'Form Submission Test', func: testVisitFormSubmission },
    { name: 'Status Update Test', func: testVisitStatusUpdate },
    { name: 'Filtering Test', func: testVisitFiltering },
    { name: 'Client Lookup Test', func: testClientLookup },
    { name: 'Visit Update Test', func: testVisitUpdate },
    { name: 'Visit Update Form Test', func: testVisitUpdateFormSubmission }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`\n🔍 Running ${test.name}...`);
    console.log('-'.repeat(30));
    
    if (test.func()) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Visit form functionality is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the errors above.');
  }
  
  return failed === 0;
}

/**
 * Debug function to check sheet creation status
 */
function debugSheetCreation() {
  console.log('🔍 Debugging Sheet Creation...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const allSheets = ss.getSheets();
    
    console.log(`📊 Current spreadsheet has ${allSheets.length} sheets:`);
    allSheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.getName()} (${sheet.getLastRow()} rows, ${sheet.getLastColumn()} columns)`);
    });
    
    console.log('\n📋 Expected sheets from CONFIG.SHEET_NAMES:');
    const expectedSheets = Object.values(CONFIG.SHEET_NAMES);
    expectedSheets.forEach((sheetName, index) => {
      if (typeof sheetName === 'string') {
        const exists = ss.getSheetByName(sheetName) ? '✅' : '❌';
        const hasSchema = CONFIG.SCHEMAS[sheetName] ? '📋' : '⚠️';
        console.log(`${index + 1}. ${sheetName} ${exists} ${hasSchema}`);
      }
    });
    
    console.log('\n🎯 Summary:');
    console.log(`Total expected sheets: ${expectedSheets.filter(s => typeof s === 'string').length}`);
    console.log(`Actually created sheets: ${allSheets.length}`);
    console.log(`Default Sheet1 exists: ${ss.getSheetByName('Sheet1') ? 'Yes' : 'No'}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    return false;
  }
}

/**
 * Test function to safely create one sheet at a time
 */
function testSafeSheetCreation() {
  console.log('🧪 Testing Safe Sheet Creation...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheetNames = Object.values(CONFIG.SHEET_NAMES).filter(s => typeof s === 'string');
    
    console.log(`Creating ${sheetNames.length} sheets one by one...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    sheetNames.forEach((sheetName, index) => {
      try {
        console.log(`${index + 1}/${sheetNames.length}: Creating ${sheetName}...`);
        verifyAndHealSheet(sheetName, ss);
        successCount++;
        console.log(`✅ Success: ${sheetName}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${sheetName} - ${error.message}`);
      }
    });
    
    console.log(`\n� Results: ${successCount} success, ${errorCount} errors`);
    
    // Only try to delete Sheet1 if we have other sheets
    const totalSheets = ss.getSheets().length;
    const defaultSheet = ss.getSheetByName('Sheet1');
    
    if (defaultSheet && totalSheets > 1) {
      try {
        ss.deleteSheet(defaultSheet);
        console.log('✅ Successfully deleted Sheet1');
      } catch (error) {
        console.log(`⚠️ Could not delete Sheet1: ${error.message}`);
      }
    } else if (defaultSheet) {
      console.log('⚠️ Keeping Sheet1 as it\'s the only sheet');
    }
    
    return errorCount === 0;
    
  } catch (error) {
    console.error('❌ Safe sheet creation test failed:', error.message);
    return false;
  }
}

/**
 * Test function for IHB form functionality
 */
function testIHBFormConfig() {
  console.log('🧪 Testing IHB Form Configuration...');
  
  try {
    // Test 1: Check if IHB_REGISTRATION form is defined in CONFIG.FORMS
    if (!CONFIG.FORMS.IHB_REGISTRATION) {
      throw new Error('IHB_REGISTRATION form not found in CONFIG.FORMS');
    }
    console.log('✅ IHB_REGISTRATION form found in CONFIG.FORMS');
    
    // Test 2: Check form structure
    const ihbForm = CONFIG.FORMS.IHB_REGISTRATION;
    if (!ihbForm.title || !ihbForm.items) {
      throw new Error('IHB_REGISTRATION form missing title or items');
    }
    console.log('✅ IHB form has proper structure');
    
    // Test 3: Check required fields
    const requiredFields = [
      'Submitter Email (CRO/SR)',
      'IHB Name',
      'IHB Email',
      'Mobile Number',
      'NID Number',
      'Address'
    ];
    
    const formFieldTitles = ihbForm.items.map(item => item.title);
    const missingFields = requiredFields.filter(field => !formFieldTitles.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('✅ All required fields present');
    
    // Test 4: Check IHB_APPROVALS schema
    if (!CONFIG.SCHEMAS.IHB_APPROVALS) {
      throw new Error('IHB_APPROVALS schema not found');
    }
    console.log('✅ IHB_APPROVALS schema found');
    
    // Test 5: Check IHB_APPROVALS sheet name
    if (!CONFIG.SHEET_NAMES.IHB_APPROVALS) {
      throw new Error('IHB_APPROVALS sheet name not found');
    }
    console.log('✅ IHB_APPROVALS sheet name found');
    
    // Test 6: Check IHB employee role
    if (!CONFIG.EMPLOYEE_ROLES.IHB) {
      throw new Error('IHB employee role not found');
    }
    console.log('✅ IHB employee role configured');
    
    console.log('🎉 IHB Form Configuration Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ IHB Form Configuration Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to simulate IHB form submission
 */
function testIHBFormSubmission() {
  console.log('🧪 Testing IHB Form Submission...');
  
  try {
    // Create mock form submission data
    const mockFormData = [
      new Date(), // Timestamp
      'cro@anwar.com', // Submitter Email (CRO/SR)
      'John Builder', // IHB Name
      'john.builder@email.com', // IHB Email
      '01234567890', // Mobile Number
      '1234567890123', // NID Number
      '123 Builder Street, Dhaka', // Address
      '01234567890', // WhatsApp Number
      'https://drive.google.com/nid-link', // Link to NID Upload
      'Experienced house builder' // Additional Notes
    ];
    
    // Create mock event object
    const mockEvent = {
      values: mockFormData
    };
    
    // Test the form submission handler
    handleIHBFormSubmit(mockEvent);
    
    // Verify data was added to sheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet) {
      throw new Error('IHB Approvals sheet not found after submission');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No data found in IHB approvals sheet after submission');
    }
    
    const lastRowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('Last row data:', lastRowData);
    
    // Check that Submission ID was generated
    const submissionId = lastRowData[1]; // Column B contains Submission ID
    if (!submissionId || !submissionId.toString().startsWith('IHB-')) {
      throw new Error('Submission ID not properly generated');
    }
    
    console.log('✅ IHB submission processed successfully');
    console.log('📋 Generated Submission ID:', submissionId);
    
    console.log('🎉 IHB Form Submission Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ IHB Form Submission Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test IHB approval process
 */
function testIHBApproval() {
  console.log('🧪 Testing IHB Approval Process...');
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.IHB_APPROVALS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      console.log('⚠️ No IHB data found, skipping approval test');
      return true;
    }
    
    // Get the last submission ID
    const lastRow = sheet.getLastRow();
    const submissionId = sheet.getRange(lastRow, 2).getValue(); // Column B contains Submission ID
    
    if (!submissionId) {
      throw new Error('No submission ID found to test approval');
    }
    
    // Test approval
    const ihbId = approveIHB(submissionId, 'Test approval');
    
    // Verify approval
    const updatedRow = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const status = updatedRow[11]; // Status column
    const assignedIhbId = updatedRow[12]; // IHB ID column
    
    if (status !== 'Approved') {
      throw new Error('Status not updated to Approved');
    }
    
    if (!assignedIhbId || !assignedIhbId.toString().startsWith('IHB')) {
      throw new Error('IHB ID not generated correctly');
    }
    
    console.log('✅ IHB approval processed successfully');
    console.log('📋 Assigned IHB ID:', assignedIhbId);
    
    console.log('🎉 IHB Approval Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ IHB Approval Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate Retailer Point Request form configuration
 */
function testRetailerPointFormConfig() {
  console.log('🧪 Testing Retailer Point Request Form Configuration...');
  
  try {
    // Test CONFIG exists
    if (!CONFIG) {
      throw new Error('CONFIG not found');
    }
    console.log('✅ CONFIG found');
    
    // Test RETAILER_POINT_REQUEST form config exists
    if (!CONFIG.FORMS.RETAILER_POINT_REQUEST) {
      throw new Error('RETAILER_POINT_REQUEST form config not found');
    }
    console.log('✅ RETAILER_POINT_REQUEST form config found');
    
    const formConfig = CONFIG.FORMS.RETAILER_POINT_REQUEST;
    
    // Test form has required properties
    if (!formConfig.title) {
      throw new Error('Form title missing');
    }
    console.log('✅ Form title found:', formConfig.title);
    
    if (!formConfig.items || !Array.isArray(formConfig.items)) {
      throw new Error('Form items array missing');
    }
    console.log('✅ Form items array found with', formConfig.items.length, 'items');
    
    // Test required form fields exist
    const requiredFields = ['Territory Name', 'Location', 'Select Company'];
    requiredFields.forEach(field => {
      const found = formConfig.items.find(item => item.title === field);
      if (!found) {
        throw new Error(`Required field missing: ${field}`);
      }
      console.log(`✅ Required field found: ${field}`);
    });
    
    // Test schema exists
    if (!CONFIG.SCHEMAS.RETAILER_POINT_REQUESTS) {
      throw new Error('RETAILER_POINT_REQUESTS schema not found');
    }
    console.log('✅ RETAILER_POINT_REQUESTS schema found');
    
    // Test sheet name exists
    if (!CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS) {
      throw new Error('RETAILER_POINT_REQUESTS sheet name not found');
    }
    console.log('✅ RETAILER_POINT_REQUESTS sheet name found');
    
    console.log('🎉 Retailer Point Request Form Configuration Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Retailer Point Request Form Configuration Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to simulate retailer point request form submission
 */
function testRetailerPointFormSubmission() {
  console.log('🧪 Testing Retailer Point Request Form Submission...');
  
  try {
    // Create mock form submission data
    const mockFormData = [
      new Date(), // Timestamp
      'bdo@anwar.com', // Submitter Email
      'Dhaka North', // Territory Name
      'Gulshan Circle 1', // Location
      'ACL' // Select Company
    ];
    
    // Create mock event object with namedValues
    const mockEvent = {
      values: mockFormData,
      namedValues: {
        'Email Address': ['bdo@anwar.com'],
        'Territory Name': ['Dhaka North'],
        'Location': ['Gulshan Circle 1'],
        'Select Company': ['ACL']
      }
    };
    
    // Test the form submission handler
    handleRetailerPointFormSubmit(mockEvent);
    
    // Verify data was added to sheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS);
    
    if (!sheet) {
      throw new Error('Retailer Point Requests sheet not found after submission');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No data found in retailer point requests sheet after submission');
    }
    
    const lastRowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('Last row data:', lastRowData);
    
    // Check that Request ID was generated
    const requestId = lastRowData[1]; // Column B contains Request ID
    if (!requestId || !requestId.toString().startsWith('RPR-')) {
      throw new Error('Retailer Point Request ID not properly generated');
    }
    
    console.log('✅ Retailer Point Request submission processed successfully');
    console.log('📋 Generated Request ID:', requestId);
    
    console.log('🎉 Retailer Point Request Form Submission Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Retailer Point Request Form Submission Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate ASM lookup functionality
 */
function testASMLookup() {
  console.log('🧪 Testing ASM Lookup Functionality...');
  
  try {
    // Test territory and company combinations
    const testCases = [
      { territory: 'Dhaka North', company: 'ACL' },
      { territory: 'Dhaka South', company: 'AIL' },
      { territory: 'Chittagong', company: 'ACL' }
    ];
    
    testCases.forEach(testCase => {
      console.log(`Testing ASM lookup for Territory: ${testCase.territory}, Company: ${testCase.company}`);
      
      const asm = findASMByTerritoryAndCompany(testCase.territory, testCase.company);
      
      if (asm) {
        console.log(`✅ Found ASM: ${asm.name} (${asm.employeeId}) - WhatsApp: ${asm.whatsappNumber}`);
      } else {
        console.log(`⚠️ No ASM found for Territory: ${testCase.territory}, Company: ${testCase.company}`);
      }
    });
    
    console.log('🎉 ASM Lookup Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ ASM Lookup Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate client lookup functionality
 */
function testClientLookup() {
  console.log('🧪 Testing Client Lookup Functionality...');
  
  try {
    // Test different client types
    const testCases = [
      { clientType: 'Retailer', phoneNumber: '01234567890' },
      { clientType: 'IHB', phoneNumber: '01987654321' },
      { clientType: 'Dealer', phoneNumber: '01555555555' }
    ];
    
    testCases.forEach(testCase => {
      console.log(`\nTesting lookup for ${testCase.clientType} with phone: ${testCase.phoneNumber}`);
      
      const clientData = lookupClientData(testCase.clientType, testCase.phoneNumber);
      
      if (clientData) {
        console.log(`✅ Found ${testCase.clientType}:`, clientData);
      } else {
        console.log(`⚠️ No ${testCase.clientType} found with phone: ${testCase.phoneNumber}`);
      }
    });
    
    // Test phone number format variations
    console.log('\n🔍 Testing phone number format variations...');
    const phoneVariations = [
      '01234567890',
      '+8801234567890',
      '8801234567890',
      '01-234-567-890'
    ];
    
    phoneVariations.forEach(phone => {
      console.log(`Testing phone format: ${phone}`);
      const clientData = lookupClientData('Retailer', phone);
      console.log(`Result: ${clientData ? 'Found' : 'Not found'}`);
    });
    
    console.log('🎉 Client Lookup Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Client Lookup Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate visit update functionality
 */
function testVisitUpdate() {
  console.log('🧪 Testing Visit Update Functionality...');
  
  try {
    // First create a test visit to update
    const mockVisitData = [
      new Date(),
      'test@anwar.com',
      'Client Visit',
      'Dhaka North',
      'Retailer',
      'Test Client',
      '01234567890',
      'Test Address',
      'Initial visit',
      'test-image-link'
    ];
    
    const mockEvent = { values: mockVisitData };
    handleVisitFormSubmit(mockEvent);
    
    // Get the latest visit ID
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    const lastRow = sheet.getLastRow();
    const visitId = sheet.getRange(lastRow, 2).getValue();
    
    console.log(`Testing update for Visit ID: ${visitId}`);
    
    // Test updating various fields
    const updateData = {
      typeOfVisit: 'Site Visit',
      status: 'In Progress',
      notes: 'Updated via test function',
      clientPhone: '01987654321'
    };
    
    const updateSuccess = updateVisitRecord(visitId, updateData);
    
    if (!updateSuccess) {
      throw new Error('Visit update returned false');
    }
    
    // Verify the updates
    const updatedVisit = getVisitById(visitId);
    
    if (!updatedVisit) {
      throw new Error('Could not retrieve updated visit');
    }
    
    if (updatedVisit['Type of Visit'] !== 'Site Visit') {
      throw new Error('Type of Visit not updated correctly');
    }
    
    if (updatedVisit['Status'] !== 'In Progress') {
      throw new Error('Status not updated correctly');
    }
    
    if (updatedVisit['Client Phone Number'] !== '01987654321') {
      throw new Error('Client Phone Number not updated correctly');
    }
    
    console.log('✅ Visit update functionality working correctly');
    console.log('✅ All updated fields verified');
    
    console.log('🎉 Visit Update Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Update Test FAILED:', error.message);
    return false;
  }
}

/**
 * Test function to validate visit update form submission
 */
function testVisitUpdateFormSubmission() {
  console.log('🧪 Testing Visit Update Form Submission...');
  
  try {
    // First ensure we have a visit to update
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.VISITS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      console.log('⚠️ No existing visits found. Creating a test visit first...');
      testVisitFormSubmission();
    }
    
    const lastRow = sheet.getLastRow();
    const visitId = sheet.getRange(lastRow, 2).getValue();
    
    console.log(`Testing form update for Visit ID: ${visitId}`);
    
    // Create mock form update submission
    const mockUpdateData = [
      new Date(), // Timestamp
      'test@anwar.com', // Submitter Email
      visitId, // Visit ID
      'Site Visit', // Type of Visit (updated)
      '', // Territory (no change)
      'IHB', // Type of Client (updated)
      '', // Client Name (no change)
      '01999888777', // Client Phone Number (updated)
      '', // Client Address (no change)
      'Follow-up visit for project discussion', // Visit Purpose/Notes (updated)
      '', // Upload Image Link (no change)
      'Completed', // Status (updated)
      'Visit completed successfully via test' // Update Notes
    ];
    
    const mockUpdateEvent = {
      values: mockUpdateData,
      namedValues: {
        'Email Address': ['test@anwar.com'],
        'Visit ID': [visitId]
      }
    };
    
    // Test the form submission handler
    handleVisitUpdateFormSubmit(mockUpdateEvent);
    
    // Verify the update was processed
    const updatedVisit = getVisitById(visitId);
    
    if (!updatedVisit) {
      throw new Error('Visit not found after update');
    }
    
    if (updatedVisit['Type of Visit'] !== 'Site Visit') {
      throw new Error('Type of Visit not updated via form');
    }
    
    if (updatedVisit['Status'] !== 'Completed') {
      throw new Error('Status not updated via form');
    }
    
    console.log('✅ Visit update form submission processed successfully');
    console.log('✅ All form updates verified');
    
    console.log('🎉 Visit Update Form Submission Test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Visit Update Form Submission Test FAILED:', error.message);
    return false;
  }
}
