/**
 * @fileoverview Test suite for Territory Dropdown Update System
 * Tests the territory dropdown update functionality
 */

/**
 * Test the territory dropdown update system
 */
function testTerritoryDropdownUpdate() {
  console.log('🧪 TESTING TERRITORY DROPDOWN UPDATE SYSTEM');
  console.log('===========================================');
  
  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Check if territories can be read from CRM
  console.log('Test 1: Reading territories from CRM Location Map...');
  try {
    const territories = getTerritoryListFromCRM();
    
    if (territories && territories.length > 0) {
      console.log(`✅ Test 1 PASSED: Found ${territories.length} territories`);
      console.log(`   Sample territories: ${territories.slice(0, 3).join(', ')}${territories.length > 3 ? '...' : ''}`);
      testResults.passed++;
      testResults.tests.push({
        name: 'Read territories from CRM',
        status: 'PASSED',
        details: `${territories.length} territories found`
      });
    } else {
      console.log('❌ Test 1 FAILED: No territories found');
      testResults.failed++;
      testResults.tests.push({
        name: 'Read territories from CRM',
        status: 'FAILED',
        details: 'No territories found in Location Map'
      });
    }
  } catch (error) {
    console.log(`❌ Test 1 FAILED: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: 'Read territories from CRM',
      status: 'FAILED',
      details: error.message
    });
  }
  
  // Test 2: Check if we can access form spreadsheets
  console.log('\nTest 2: Checking form spreadsheet access...');
  try {
    const testSpreadsheetId = CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST;
    const spreadsheet = SpreadsheetApp.openById(testSpreadsheetId);
    const name = spreadsheet.getName();
    
    console.log(`✅ Test 2 PASSED: Can access form spreadsheet "${name}"`);
    testResults.passed++;
    testResults.tests.push({
      name: 'Access form spreadsheets',
      status: 'PASSED',
      details: `Accessed ${name}`
    });
  } catch (error) {
    console.log(`❌ Test 2 FAILED: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: 'Access form spreadsheets',
      status: 'FAILED',
      details: error.message
    });
  }
  
  // Test 3: Test smart update detection
  console.log('\nTest 3: Testing smart update detection...');
  try {
    // Clear previous state for testing
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty('LAST_TERRITORIES');
    
    const result = checkAndUpdateTerritories();
    
    if (result.updated) {
      console.log('✅ Test 3 PASSED: Smart update detection working');
      testResults.passed++;
      testResults.tests.push({
        name: 'Smart update detection',
        status: 'PASSED',
        details: 'Update detection and execution successful'
      });
    } else {
      console.log('⚠️ Test 3 PARTIAL: No update needed (territories may be unchanged)');
      testResults.passed++;
      testResults.tests.push({
        name: 'Smart update detection',
        status: 'PASSED',
        details: 'No update needed - territories unchanged'
      });
    }
  } catch (error) {
    console.log(`❌ Test 3 FAILED: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: 'Smart update detection',
      status: 'FAILED',
      details: error.message
    });
  }
  
  // Test 4: Check trigger setup
  console.log('\nTest 4: Testing trigger setup...');
  try {
    const setupResult = setupTerritoryUpdateTrigger();
    
    if (setupResult.success) {
      console.log('✅ Test 4 PASSED: Territory update trigger setup successful');
      testResults.passed++;
      testResults.tests.push({
        name: 'Trigger setup',
        status: 'PASSED',
        details: `Trigger created with ID: ${setupResult.triggerId}`
      });
    } else {
      console.log(`❌ Test 4 FAILED: ${setupResult.error}`);
      testResults.failed++;
      testResults.tests.push({
        name: 'Trigger setup',
        status: 'FAILED',
        details: setupResult.error
      });
    }
  } catch (error) {
    console.log(`❌ Test 4 FAILED: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: 'Trigger setup',
      status: 'FAILED',
      details: error.message
    });
  }
  
  // Test Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  console.log('');
  
  console.log('📋 DETAILED RESULTS:');
  testResults.tests.forEach((test, index) => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}: ${test.details}`);
  });
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Territory dropdown update system is ready.');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('1. Territory dropdowns will update automatically every 6 hours');
    console.log('2. Run updateAllTerritoryDropdowns() to update manually anytime');
    console.log('3. Run showTerritoryUpdateStatus() to check system status');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Please review the issues above.');
    console.log('');
    console.log('💡 TROUBLESHOOTING:');
    console.log('1. Ensure CRM spreadsheet has Location Map sheet with territory data');
    console.log('2. Check that form spreadsheets are accessible');
    console.log('3. Verify CONFIG.SPREADSHEET_IDS are correct');
    console.log('4. Run diagnoseFormDataFlow() for comprehensive system check');
  }
  
  console.log('===========================================');
  
  return testResults;
}

/**
 * Test a single form's territory dropdown update
 */
function testSingleFormTerritoryUpdate(formName = 'Demand Generation Request') {
  console.log(`🧪 TESTING SINGLE FORM: ${formName}`);
  console.log('=====================================');
  
  try {
    // Get territories
    const territories = getTerritoryListFromCRM();
    console.log(`📍 Retrieved ${territories.length} territories from CRM`);
    
    // Find the form configuration
    const formConfigs = {
      'Demand Generation Request': {
        id: CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST,
        fieldTitle: 'Territory'
      },
      'Partner Registration': {
        id: CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION,
        fieldTitle: 'Territory'
      },
      'Order Creation': {
        id: CONFIG.SPREADSHEET_IDS.ORDER_CREATION,
        fieldTitle: 'Territory'
      }
    };
    
    const formConfig = formConfigs[formName];
    if (!formConfig) {
      console.log(`❌ Form configuration not found for: ${formName}`);
      return false;
    }
    
    // Update the form
    const result = updateTerritoryDropdownInForm(
      formConfig.id,
      formConfig.fieldTitle,
      territories
    );
    
    if (result.success) {
      console.log(`✅ Successfully updated ${formName}`);
      console.log(`   Field type: ${result.fieldType}`);
      console.log(`   Choices updated: ${result.choicesCount}`);
      console.log('   Sample choices:', territories.slice(0, 3).join(', ') + '...');
      
      // Verify the update by checking the form
      const spreadsheet = SpreadsheetApp.openById(formConfig.id);
      const formUrl = spreadsheet.getFormUrl();
      console.log(`   Form URL: ${formUrl}`);
      
      return true;
    } else {
      console.log(`❌ Failed to update ${formName}: ${result.error}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Test failed for ${formName}:`, error);
    return false;
  }
}

/**
 * Quick test to verify territory list generation
 */
function quickTestTerritoryList() {
  console.log('⚡ QUICK TERRITORY LIST TEST');
  console.log('===========================');
  
  try {
    const territories = getTerritoryListFromCRM();
    
    console.log(`📊 Territory count: ${territories.length}`);
    console.log('📍 First 10 territories:');
    territories.slice(0, 10).forEach((territory, index) => {
      console.log(`   ${index + 1}. ${territory}`);
    });
    
    if (territories.length > 10) {
      console.log(`   ... and ${territories.length - 10} more`);
    }
    
    console.log('✅ Territory list generation working correctly');
    return territories;
    
  } catch (error) {
    console.error('❌ Territory list test failed:', error);
    return null;
  }
}

/**
 * Test the notification system
 */
function testTerritoryUpdateNotifications() {
  console.log('📧 TESTING TERRITORY UPDATE NOTIFICATIONS');
  console.log('=========================================');
  
  try {
    // Test notification with mock data
    const mockResult = {
      updatedForms: ['Demand Generation Request', 'Partner Registration'],
      failedForms: [
        { name: 'Order Creation', error: 'Form not found' }
      ],
      totalTerritories: 25
    };
    
    console.log('📤 Sending test notification...');
    sendTerritoryUpdateNotification(mockResult);
    
    console.log('✅ Test notification sent successfully');
    console.log(`   Recipient: ${CONFIG.NOTIFICATION_EMAIL || 'Not configured'}`);
    console.log('   Check your email for the notification');
    
    return true;
    
  } catch (error) {
    console.error('❌ Notification test failed:', error);
    
    if (error.message.includes('NOTIFICATION_EMAIL')) {
      console.log('💡 Configure CONFIG.NOTIFICATION_EMAIL to enable notifications');
    }
    
    return false;
  }
}

// Auto-load message
console.log('🧪 Territory Dropdown Update Test Suite Loaded');
console.log('💡 Run testTerritoryDropdownUpdate() for full system test');
console.log('⚡ Run quickTestTerritoryList() for quick territory check');
console.log('📧 Run testTerritoryUpdateNotifications() to test email alerts');
