/**
 * @fileoverview Test file to verify the demand generation fix.
 * This file tests the improved error handling in demand-generation.js
 */

/**
 * Test the demand generation function with proper event data
 */
function testDemandGenerationWithValidData() {
  try {
    console.log('🧪 Testing Demand Generation with valid data...');
    
    const mockEvent = {
      values: [
        new Date(),
        'test.asm@anwar.com',
        'Test Territory',
        'Test Bazaar',
        'Test Area',
        'Test reason for demand generation',
        'AIL'
      ],
      namedValues: {
        'Email Address': ['test.asm@anwar.com']
      }
    };
    
    handleDemandGenerationFormSubmit(mockEvent);
    console.log('✅ Test with valid data passed');
    
  } catch (error) {
    console.error('❌ Test with valid data failed:', error);
  }
}

/**
 * Test the demand generation function with undefined event
 */
function testDemandGenerationWithUndefinedEvent() {
  try {
    console.log('🧪 Testing Demand Generation with undefined event...');
    
    handleDemandGenerationFormSubmit(undefined);
    console.log('❌ Should have thrown error but didn\'t');
    
  } catch (error) {
    console.log('✅ Correctly caught error for undefined event:', error.message);
  }
}

/**
 * Test the demand generation function with empty event
 */
function testDemandGenerationWithEmptyEvent() {
  try {
    console.log('🧪 Testing Demand Generation with empty event...');
    
    handleDemandGenerationFormSubmit({});
    console.log('❌ Should have thrown error but didn\'t');
    
  } catch (error) {
    console.log('✅ Correctly caught error for empty event:', error.message);
  }
}

/**
 * Test the demand generation function with partial data
 */
function testDemandGenerationWithPartialData() {
  try {
    console.log('🧪 Testing Demand Generation with partial data...');
    
    const mockEvent = {
      values: [new Date()], // Only timestamp, missing other fields
      namedValues: {
        'Email Address': ['test.asm@anwar.com']
      }
    };
    
    handleDemandGenerationFormSubmit(mockEvent);
    console.log('✅ Test with partial data handled gracefully');
    
  } catch (error) {
    console.log('⚠️ Test with partial data threw error:', error.message);
  }
}

/**
 * Run all demand generation tests
 */
function runAllDemandGenerationTests() {
  console.log('🧪 Running all Demand Generation error handling tests...');
  console.log('=======================================================');
  
  testDemandGenerationWithValidData();
  console.log('');
  
  testDemandGenerationWithUndefinedEvent();
  console.log('');
  
  testDemandGenerationWithEmptyEvent();
  console.log('');
  
  testDemandGenerationWithPartialData();
  
  console.log('');
  console.log('✅ All Demand Generation tests completed');
  console.log('=======================================================');
}

/**
 * Quick test to validate the fix
 */
function quickTestDemandGenerationFix() {
  console.log('🔧 Quick test of Demand Generation fix...');
  
  try {
    // This should fail gracefully with our improved error handling
    handleDemandGenerationFormSubmit(undefined);
  } catch (error) {
    console.log('✅ Error handling working correctly:', error.message);
  }
  
  try {
    // This should work
    const validEvent = {
      values: [new Date(), 'test@example.com', 'Territory', 'Bazaar', 'Area', 'Reason', 'AIL'],
      namedValues: {'Email Address': ['test@example.com']}
    };
    handleDemandGenerationFormSubmit(validEvent);
    console.log('✅ Valid event processed successfully');
  } catch (error) {
    console.log('⚠️ Valid event failed:', error.message);
  }
}
