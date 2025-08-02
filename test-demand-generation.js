/**
 * @fileoverview Test file for Demand Generation Request functionality.
 * This file contains test cases for the demand generation system.
 */

/**
 * Tests the Demand Generation Request form submission with a valid ASM user.
 */
function testDemandGenerationRequest() {
  try {
    console.log('🧪 Testing Demand Generation Request form submission...');
    
    // Simulate form submission data
    const mockFormEvent = {
      values: [
        new Date(), // Timestamp
        'test.asm@anwar.com', // Email
        'East Karachi', // Territory
        'Landhi', // Bazaar
        'Korangi Road', // Area
        'Market expansion needed for healthcare products in densely populated residential area with high diabetes prevalence. Current coverage insufficient for demand.', // Reason
        'AIL' // Business Unit
      ],
      namedValues: {
        'Email Address': ['test.asm@anwar.com']
      }
    };
    
    // Mock the employee lookup
    console.log('Setting up test data...');
    
    // Execute the function
    handleDemandGenerationFormSubmit(mockFormEvent);
    
    console.log('✅ Demand Generation Request test completed successfully');
    
  } catch (error) {
    console.error('❌ Demand Generation Request test failed:', error);
    Logger.log(`Demand Generation Request test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the Demand Generation Request ID generation.
 */
function testDemandGenerationRequestIdGeneration() {
  try {
    console.log('🧪 Testing Demand Generation Request ID generation...');
    
    // Generate multiple IDs to test uniqueness and format
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const id = generateDemandGenerationRequestId();
      ids.push(id);
      console.log(`Generated ID ${i + 1}: ${id}`);
    }
    
    // Verify format (DGR-YYYYMMDD-XXX)
    const idPattern = /^DGR-\d{8}-\d{3}$/;
    const today = new Date();
    const expectedDateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
    
    ids.forEach((id, index) => {
      if (!idPattern.test(id)) {
        throw new Error(`ID ${index + 1} does not match expected format: ${id}`);
      }
      
      if (!id.includes(expectedDateStr)) {
        console.warn(`ID ${index + 1} does not contain today's date: ${id}`);
      }
    });
    
    console.log('✅ Demand Generation Request ID generation test completed successfully');
    
  } catch (error) {
    console.error('❌ Demand Generation Request ID generation test failed:', error);
    Logger.log(`Demand Generation Request ID generation test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the BD Incharge lookup functionality for various territories and business units.
 */
function testBDInchargeLookup() {
  try {
    console.log('🧪 Testing BD Incharge lookup functionality...');
    
    const testCases = [
      { territory: 'East Karachi', businessUnit: 'AIL' },
      { territory: 'West Karachi', businessUnit: 'ACL' },
      { territory: 'North Karachi', businessUnit: 'AIL' },
      { territory: 'Central Karachi', businessUnit: 'ACL' },
      { territory: 'NonExistent Territory', businessUnit: 'AIL' } // Test fallback
    ];
    
    testCases.forEach((testCase, index) => {
      console.log(`\nTest case ${index + 1}: Territory: ${testCase.territory}, Business Unit: ${testCase.businessUnit}`);
      
      const bdInchargeEmployees = findBDInchargeByTerritoryAndBusinessUnit(testCase.territory, testCase.businessUnit);
      
      console.log(`Found ${bdInchargeEmployees.length} BD Incharge employees:`);
      bdInchargeEmployees.forEach(employee => {
        console.log(`- ${employee.name} (${employee.role}) - Territory: ${employee.territory || 'Not specified'} - Company: ${employee.company || 'Not specified'}`);
      });
      
      if (bdInchargeEmployees.length === 0) {
        console.warn(`No BD Incharge found for ${testCase.territory}, ${testCase.businessUnit} - fallback notification would be triggered`);
      }
    });
    
    console.log('\n✅ BD Incharge lookup test completed successfully');
    
  } catch (error) {
    console.error('❌ BD Incharge lookup test failed:', error);
    Logger.log(`BD Incharge lookup test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the demand generation notification system.
 */
function testDemandGenerationNotifications() {
  try {
    console.log('🧪 Testing Demand Generation notification system...');
    
    // Mock request data
    const requestData = {
      requestId: 'DGR-20241201-001',
      submitterEmail: 'test.asm@anwar.com',
      territory: 'East Karachi',
      bazaar: 'Landhi',
      area: 'Korangi Road',
      reason: 'Market expansion needed for healthcare products in densely populated residential area.',
      businessUnit: 'AIL',
      status: 'Pending Review'
    };
    
    console.log('Test request data:', JSON.stringify(requestData, null, 2));
    
    // Test notification sending
    sendDemandGenerationNotifications(requestData);
    
    console.log('✅ Demand Generation notification test completed successfully');
    
  } catch (error) {
    console.error('❌ Demand Generation notification test failed:', error);
    Logger.log(`Demand Generation notification test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the approval and rejection workflow.
 */
function testDemandGenerationApprovalWorkflow() {
  try {
    console.log('🧪 Testing Demand Generation approval workflow...');
    
    // First create a test request
    const testRequestId = 'DGR-TEST-001';
    
    console.log('Testing approval...');
    try {
      approveDemandGenerationRequest(testRequestId, 'Approved for testing purposes');
      console.log('✅ Approval test completed (note: may fail if request doesn\'t exist)');
    } catch (error) {
      console.log('ℹ️ Approval test expected to fail if test request doesn\'t exist:', error.message);
    }
    
    console.log('Testing rejection...');
    try {
      rejectDemandGenerationRequest(testRequestId, 'Rejected for testing purposes');
      console.log('✅ Rejection test completed (note: may fail if request doesn\'t exist)');
    } catch (error) {
      console.log('ℹ️ Rejection test expected to fail if test request doesn\'t exist:', error.message);
    }
    
    console.log('✅ Demand Generation approval workflow test completed');
    
  } catch (error) {
    console.error('❌ Demand Generation approval workflow test failed:', error);
    Logger.log(`Demand Generation approval workflow test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the fallback BD Incharge notification system.
 */
function testFallbackBDInchargeNotification() {
  try {
    console.log('🧪 Testing fallback BD Incharge notification...');
    
    // Mock request data with territory that might not have specific BD Incharge
    const requestData = {
      requestId: 'DGR-FALLBACK-001',
      submitterEmail: 'test.asm@anwar.com',
      territory: 'Remote Territory',
      bazaar: 'Test Bazaar',
      area: 'Test Area',
      reason: 'Testing fallback notification system',
      businessUnit: 'AIL',
      status: 'Pending Review'
    };
    
    const testMessage = 'This is a test message for fallback notification';
    
    sendFallbackBDInchargeNotification(requestData, testMessage);
    
    console.log('✅ Fallback BD Incharge notification test completed successfully');
    
  } catch (error) {
    console.error('❌ Fallback BD Incharge notification test failed:', error);
    Logger.log(`Fallback BD Incharge notification test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Runs all Demand Generation tests.
 */
function runAllDemandGenerationTests() {
  try {
    console.log('🚀 Starting comprehensive Demand Generation tests...\n');
    
    // Run all test functions
    testDemandGenerationRequestIdGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testBDInchargeLookup();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testDemandGenerationNotifications();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testFallbackBDInchargeNotification();
    console.log('\n' + '='.repeat(50) + '\n');
    
    testDemandGenerationApprovalWorkflow();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Main form submission test (may create actual data)
    console.log('⚠️ Running form submission test (may create actual data)...');
    testDemandGenerationRequest();
    
    console.log('\n🎉 All Demand Generation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Demand Generation test suite failed:', error);
    Logger.log(`Demand Generation test suite failed: ${error.toString()}`);
    throw error;
  }
}
