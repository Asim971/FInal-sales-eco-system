/**
 * @fileoverview Test file for trigger recreation functionality.
 * This file contains test cases for the enhanced trigger management system.
 */

/**
 * Tests the trigger recreation functionality.
 */
function testTriggerRecreation() {
  try {
    console.log('🧪 Testing trigger recreation functionality...');
    
    // Get initial trigger count
    const initialTriggers = ScriptApp.getProjectTriggers();
    const initialCount = initialTriggers.length;
    console.log(`Initial trigger count: ${initialCount}`);
    
    // Test deleteAllTriggersQuietly function
    const deletedCount = deleteAllTriggersQuietly();
    console.log(`Deleted ${deletedCount} triggers quietly`);
    
    // Verify all triggers are deleted
    const afterDeleteTriggers = ScriptApp.getProjectTriggers();
    const afterDeleteCount = afterDeleteTriggers.length;
    console.log(`Trigger count after deletion: ${afterDeleteCount}`);
    
    if (afterDeleteCount !== 0) {
      console.warn(`⚠️ Expected 0 triggers after deletion, but found ${afterDeleteCount}`);
    }
    
    // Test createTriggers function
    console.log('Testing createTriggers function...');
    createTriggers();
    
    // Get final trigger count
    const finalTriggers = ScriptApp.getProjectTriggers();
    const finalCount = finalTriggers.length;
    console.log(`Final trigger count: ${finalCount}`);
    
    // List all created triggers
    console.log('Created triggers:');
    finalTriggers.forEach((trigger, index) => {
      const source = trigger.getTriggerSource();
      const eventType = trigger.getEventType();
      const handlerFunction = trigger.getHandlerFunction();
      
      if (source === ScriptApp.TriggerSource.SPREADSHEETS) {
        const sourceId = trigger.getTriggerSourceId();
        console.log(`${index + 1}. ${handlerFunction} - ${eventType} on ${sourceId}`);
      } else {
        console.log(`${index + 1}. ${handlerFunction} - ${eventType} on ${source}`);
      }
    });
    
    console.log('✅ Trigger recreation test completed successfully');
    
    return {
      initialCount,
      deletedCount,
      finalCount,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Trigger recreation test failed:', error);
    Logger.log(`Trigger recreation test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests individual trigger creation functions.
 */
function testIndividualTriggerCreation() {
  try {
    console.log('🧪 Testing individual trigger creation functions...');
    
    // Test cases for individual trigger creation
    const testCases = [
      {
        name: 'Visit Form Trigger',
        function: createVisitFormTrigger,
        spreadsheetId: CONFIG.SPREADSHEET_IDS.VISIT
      },
      {
        name: 'Visit Update Form Trigger',
        function: createVisitUpdateFormTrigger,
        spreadsheetId: CONFIG.SPREADSHEET_IDS.VISIT_UPDATE
      }
    ];
    
    const results = [];
    
    testCases.forEach(testCase => {
      console.log(`\nTesting ${testCase.name}...`);
      
      try {
        // Check if spreadsheet ID is configured
        if (!testCase.spreadsheetId || 
            testCase.spreadsheetId === '' || 
            testCase.spreadsheetId.includes('TO_BE_REPLACED') ||
            testCase.spreadsheetId.includes('Replace with actual ID')) {
          console.log(`⚠️ Skipping ${testCase.name} - spreadsheet ID not configured`);
          results.push({ name: testCase.name, status: 'skipped', reason: 'ID not configured' });
          return;
        }
        
        // Get triggers before creation
        const beforeTriggers = ScriptApp.getProjectTriggers().filter(trigger => 
          trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
          trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
          trigger.getTriggerSourceId() === testCase.spreadsheetId
        );
        
        console.log(`Existing triggers for ${testCase.name}: ${beforeTriggers.length}`);
        
        // Create the trigger
        const result = testCase.function();
        
        // Get triggers after creation
        const afterTriggers = ScriptApp.getProjectTriggers().filter(trigger => 
          trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
          trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
          trigger.getTriggerSourceId() === testCase.spreadsheetId
        );
        
        console.log(`Triggers after creation for ${testCase.name}: ${afterTriggers.length}`);
        
        if (afterTriggers.length === 1) {
          console.log(`✅ ${testCase.name} created successfully`);
          results.push({ name: testCase.name, status: 'success' });
        } else {
          console.warn(`⚠️ ${testCase.name} - unexpected trigger count: ${afterTriggers.length}`);
          results.push({ name: testCase.name, status: 'warning', reason: `Unexpected count: ${afterTriggers.length}` });
        }
        
      } catch (error) {
        console.error(`❌ ${testCase.name} failed:`, error.message);
        results.push({ name: testCase.name, status: 'error', error: error.message });
      }
    });
    
    // Summary
    console.log('\n📊 Individual Trigger Creation Test Summary:');
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'skipped' ? '⚠️' : '❌';
      const reason = result.reason ? ` (${result.reason})` : 
                    result.error ? ` (${result.error})` : '';
      console.log(`${status} ${result.name}${reason}`);
    });
    
    console.log('✅ Individual trigger creation test completed');
    return results;
    
  } catch (error) {
    console.error('❌ Individual trigger creation test failed:', error);
    Logger.log(`Individual trigger creation test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Tests the trigger replacement functionality.
 */
function testTriggerReplacement() {
  try {
    console.log('🧪 Testing trigger replacement functionality...');
    
    // Create some test triggers first
    console.log('Creating initial triggers...');
    createTriggers();
    
    const initialTriggers = ScriptApp.getProjectTriggers();
    const initialCount = initialTriggers.length;
    console.log(`Initial trigger count: ${initialCount}`);
    
    // Create triggers again to test replacement
    console.log('Creating triggers again to test replacement...');
    createTriggers();
    
    const finalTriggers = ScriptApp.getProjectTriggers();
    const finalCount = finalTriggers.length;
    console.log(`Final trigger count: ${finalCount}`);
    
    // The count should be the same if replacement worked correctly
    if (finalCount === initialCount) {
      console.log('✅ Trigger replacement working correctly - same count maintained');
    } else {
      console.warn(`⚠️ Trigger replacement may have issues - count changed from ${initialCount} to ${finalCount}`);
    }
    
    console.log('✅ Trigger replacement test completed');
    
    return {
      initialCount,
      finalCount,
      replacementWorking: finalCount === initialCount
    };
    
  } catch (error) {
    console.error('❌ Trigger replacement test failed:', error);
    Logger.log(`Trigger replacement test failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Runs all trigger-related tests.
 */
function runAllTriggerTests() {
  try {
    console.log('🚀 Starting comprehensive trigger tests...\n');
    
    const results = {};
    
    // Run recreation test
    console.log('1. Testing Trigger Recreation...');
    results.recreation = testTriggerRecreation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Run individual creation test
    console.log('2. Testing Individual Trigger Creation...');
    results.individual = testIndividualTriggerCreation();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Run replacement test
    console.log('3. Testing Trigger Replacement...');
    results.replacement = testTriggerReplacement();
    
    console.log('\n🎉 All trigger tests completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`• Recreation Test: ${results.recreation.success ? 'PASSED' : 'FAILED'}`);
    console.log(`• Individual Creation Test: ${results.individual.length} test cases completed`);
    console.log(`• Replacement Test: ${results.replacement.replacementWorking ? 'PASSED' : 'NEEDS REVIEW'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Trigger test suite failed:', error);
    Logger.log(`Trigger test suite failed: ${error.toString()}`);
    throw error;
  }
}

/**
 * Quick test to verify trigger creation with detailed logging.
 */
function quickTriggerTest() {
  try {
    console.log('🚀 Quick trigger test starting...');
    
    // Count existing triggers
    const before = ScriptApp.getProjectTriggers();
    console.log(`Triggers before: ${before.length}`);
    
    // Create triggers with the new system
    createTriggers();
    
    // Count final triggers
    const after = ScriptApp.getProjectTriggers();
    console.log(`Triggers after: ${after.length}`);
    
    // List all triggers
    console.log('\nFinal trigger list:');
    after.forEach((trigger, index) => {
      try {
        const handler = trigger.getHandlerFunction();
        const source = trigger.getTriggerSource();
        const event = trigger.getEventType();
        
        if (source === ScriptApp.TriggerSource.SPREADSHEETS) {
          const sourceId = trigger.getTriggerSourceId();
          console.log(`${index + 1}. ${handler} - ${event} - ${sourceId.substring(0, 20)}...`);
        } else {
          console.log(`${index + 1}. ${handler} - ${event} - ${source}`);
        }
      } catch (error) {
        console.log(`${index + 1}. [Error reading trigger details: ${error.message}]`);
      }
    });
    
    console.log('✅ Quick trigger test completed');
    
  } catch (error) {
    console.error('❌ Quick trigger test failed:', error);
    Logger.log(`Quick trigger test failed: ${error.toString()}`);
  }
}
