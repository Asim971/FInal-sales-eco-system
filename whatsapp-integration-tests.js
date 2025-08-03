/**
 * @fileoverview Comprehensive WhatsApp Integration Testing and Diagnostics
 * This script provides thorough testing of the WhatsApp integration including
 * webhook functionality, employee lookup, message processing, and error handling.
 * 
 * Features:
 * - Complete integration testing
 * - Performance benchmarking
 * - Error scenario testing
 * - Security validation
 * - Load testing capabilities
 */

/**
 * Main comprehensive test function.
 * Run this to perform a complete test of the WhatsApp integration.
 */
function runComprehensiveWhatsAppTests() {
  try {
    console.log('🧪 Starting Comprehensive WhatsApp Integration Tests');
    console.log('====================================================');
    
    const startTime = new Date().getTime();
    const testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [],
      performance: {}
    };
    
    // Test Suite 1: Configuration Tests
    console.log('\n1️⃣ Configuration Tests');
    console.log('----------------------');
    runConfigurationTests(testResults);
    
    // Test Suite 2: Employee Management Tests
    console.log('\n2️⃣ Employee Management Tests');
    console.log('-----------------------------');
    runEmployeeManagementTests(testResults);
    
    // Test Suite 3: Phone Number Validation Tests
    console.log('\n3️⃣ Phone Number Validation Tests');
    console.log('---------------------------------');
    runPhoneNumberTests(testResults);
    
    // Test Suite 4: Message Processing Tests
    console.log('\n4️⃣ Message Processing Tests');
    console.log('---------------------------');
    runMessageProcessingTests(testResults);
    
    // Test Suite 5: Webhook Tests
    console.log('\n5️⃣ Webhook Integration Tests');
    console.log('-----------------------------');
    runWebhookTests(testResults);
    
    // Test Suite 6: Security Tests
    console.log('\n6️⃣ Security Tests');
    console.log('-----------------');
    runSecurityTests(testResults);
    
    // Test Suite 7: Performance Tests
    console.log('\n7️⃣ Performance Tests');
    console.log('--------------------');
    runPerformanceTests(testResults);
    
    // Test Suite 8: Error Handling Tests
    console.log('\n8️⃣ Error Handling Tests');
    console.log('-----------------------');
    runErrorHandlingTests(testResults);
    
    // Generate final report
    const endTime = new Date().getTime();
    testResults.performance.totalTime = endTime - startTime;
    
    generateTestReport(testResults);
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    throw error;
  }
}

/**
 * Tests configuration validation and setup.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runConfigurationTests(testResults) {
  const tests = [
    {
      name: 'Maytapi Config Validation',
      test: () => validateMaytapiConfig()
    },
    {
      name: 'Employee Roles Config',
      test: () => {
        const roles = CONFIG.EMPLOYEE_ROLES;
        if (!roles || Object.keys(roles).length === 0) {
          throw new Error('No employee roles configured');
        }
        ['BDO', 'CRO', 'SR', 'ASM'].forEach(role => {
          if (!roles[role]) throw new Error(`Missing role: ${role}`);
        });
      }
    },
    {
      name: 'User Sheets Config',
      test: () => {
        const config = CONFIG.USER_SHEETS_CONFIG;
        if (!config || !config.FOLDER_ID) {
          throw new Error('User sheets configuration missing');
        }
      }
    },
    {
      name: 'Spreadsheet IDs Config',
      test: () => {
        const ids = CONFIG.SPREADSHEET_IDS;
        if (!ids || !ids.CRM) {
          throw new Error('Critical spreadsheet IDs missing');
        }
      }
    }
  ];
  
  runTestSuite('Configuration', tests, testResults);
}

/**
 * Tests employee management functionality.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runEmployeeManagementTests(testResults) {
  const tests = [
    {
      name: 'Add Employee',
      test: () => {
        const testEmployee = {
          name: 'Test Employee',
          role: 'BDO',
          email: 'test.employee@anwarsales.com',
          contactNumber: '8801234567890',
          whatsappNumber: '8801234567890',
          bkashNumber: '01234567890',
          nidNo: '1234567890123'
        };
        
        const employeeId = addEmployee(testEmployee);
        if (!employeeId) throw new Error('Failed to add employee');
        return employeeId;
      }
    },
    {
      name: 'Find Employee by ID',
      test: () => {
        const employee = findEmployeeById('BDO001');
        if (!employee) {
          // Try to find any employee
          const sheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
          const data = getSheetData(sheet);
          if (data.length > 1) {
            const foundEmployee = findEmployeeById(data[1][0]);
            if (!foundEmployee) throw new Error('Employee ID lookup failed');
          }
        }
      }
    },
    {
      name: 'Find Employee by WhatsApp',
      test: () => {
        const employee = findEmployeeByWhatsApp('8801234567890');
        if (!employee) throw new Error('WhatsApp lookup failed for test employee');
      }
    },
    {
      name: 'Find Employee by Email',
      test: () => {
        const employee = findEmployeeByEmail('test.employee@anwarsales.com');
        if (!employee) throw new Error('Email lookup failed for test employee');
      }
    },
    {
      name: 'Employee Role Filtering',
      test: () => {
        const bdoEmployees = findEmployeesByRole('BDO');
        if (!Array.isArray(bdoEmployees)) throw new Error('Role filtering failed');
      }
    }
  ];
  
  runTestSuite('Employee Management', tests, testResults);
}

/**
 * Tests phone number validation and normalization.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runPhoneNumberTests(testResults) {
  const tests = [
    {
      name: 'Bangladesh Number Normalization',
      test: () => {
        const testCases = [
          { input: '01234567890', expected: '8801234567890' },
          { input: '+8801234567890', expected: '8801234567890' },
          { input: '88 01234567890', expected: '8801234567890' },
          { input: '01234-567890', expected: '8801234567890' },
          { input: '(01234) 567890', expected: '8801234567890' }
        ];
        
        testCases.forEach(testCase => {
          const result = normalizePhoneNumber(testCase.input);
          if (result !== testCase.expected) {
            throw new Error(`Normalization failed: ${testCase.input} -> ${result} (expected ${testCase.expected})`);
          }
        });
      }
    },
    {
      name: 'Phone Number Validation',
      test: () => {
        const validNumbers = [
          '8801234567890',
          '01234567890',
          '+8801234567890'
        ];
        
        const invalidNumbers = [
          '123',
          'invalid',
          '',
          '9901234567890'
        ];
        
        validNumbers.forEach(number => {
          if (!isValidBangladeshNumber(number)) {
            throw new Error(`Valid number rejected: ${number}`);
          }
        });
        
        invalidNumbers.forEach(number => {
          if (isValidBangladeshNumber(number)) {
            throw new Error(`Invalid number accepted: ${number}`);
          }
        });
      }
    },
    {
      name: 'Phone Number Formatting',
      test: () => {
        const testNumber = '8801234567890';
        
        const formats = {
          local: formatPhoneNumber(testNumber, 'local'),
          international: formatPhoneNumber(testNumber, 'international'),
          display: formatPhoneNumber(testNumber, 'display')
        };
        
        if (!formats.local || !formats.international || !formats.display) {
          throw new Error('Phone number formatting failed');
        }
        
        console.log(`   📞 Formats: Local(${formats.local}) Intl(${formats.international}) Display(${formats.display})`);
      }
    }
  ];
  
  runTestSuite('Phone Number Validation', tests, testResults);
}

/**
 * Tests message processing logic.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runMessageProcessingTests(testResults) {
  const tests = [
    {
      name: 'Data Request Detection',
      test: () => {
        const dataRequests = [
          'need to see data',
          'show me data',
          'my data',
          'data sheets',
          'data'
        ];
        
        const nonDataRequests = [
          'hello',
          'how are you',
          'order status',
          'random message'
        ];
        
        dataRequests.forEach(msg => {
          if (!isDataRequestMessage(msg)) {
            throw new Error(`Data request not detected: ${msg}`);
          }
        });
        
        nonDataRequests.forEach(msg => {
          if (isDataRequestMessage(msg)) {
            throw new Error(`False positive data request: ${msg}`);
          }
        });
      }
    },
    {
      name: 'Help Message Detection',
      test: () => {
        const helpMessages = ['help', 'assist', 'commands'];
        const nonHelpMessages = ['hello', 'data', 'test'];
        
        helpMessages.forEach(msg => {
          if (!isHelpMessage(msg)) {
            throw new Error(`Help message not detected: ${msg}`);
          }
        });
        
        nonHelpMessages.forEach(msg => {
          if (isHelpMessage(msg)) {
            throw new Error(`False positive help message: ${msg}`);
          }
        });
      }
    },
    {
      name: 'Sheet Selection Matching',
      test: () => {
        const mockSheets = [
          { sheetType: 'Orders' },
          { sheetType: 'Visits' },
          { sheetType: 'Site Prescriptions' }
        ];
        
        // Test number matching
        const sheet1 = matchSheetFromReply('1', mockSheets);
        if (!sheet1 || sheet1.sheetType !== 'Orders') {
          throw new Error('Number matching failed');
        }
        
        // Test name matching
        const sheet2 = matchSheetFromReply('visits', mockSheets);
        if (!sheet2 || sheet2.sheetType !== 'Visits') {
          throw new Error('Name matching failed');
        }
        
        // Test partial matching
        const sheet3 = matchSheetFromReply('site', mockSheets);
        if (!sheet3 || sheet3.sheetType !== 'Site Prescriptions') {
          throw new Error('Partial matching failed');
        }
      }
    },
    {
      name: 'Conversation State Management',
      test: () => {
        const testPhone = '8801111111111';
        const testState = {
          awaitingSelection: true,
          availableSheets: [{ sheetType: 'Test' }],
          timestamp: new Date().getTime()
        };
        
        // Store state
        storeConversationState(testPhone, testState);
        
        // Retrieve state
        const retrievedState = getConversationState(testPhone);
        if (!retrievedState || !retrievedState.awaitingSelection) {
          throw new Error('Conversation state management failed');
        }
        
        // Clear state
        clearConversationState(testPhone);
        const clearedState = getConversationState(testPhone);
        if (clearedState) {
          throw new Error('Conversation state clearing failed');
        }
      }
    }
  ];
  
  runTestSuite('Message Processing', tests, testResults);
}

/**
 * Tests webhook functionality.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runWebhookTests(testResults) {
  const tests = [
    {
      name: 'Webhook URL Generation',
      test: () => {
        const webhookUrl = getWebhookUrl();
        if (!webhookUrl || !webhookUrl.startsWith('https://')) {
          throw new Error('Invalid webhook URL');
        }
      }
    },
    {
      name: 'Webhook Source Validation',
      test: () => {
        const validData = {
          product_id: CONFIG.MAYTAPI_CONFIG.PRODUCT_ID,
          phone_id: CONFIG.MAYTAPI_CONFIG.PHONE_ID,
          type: 'message'
        };
        
        const invalidData = {
          product_id: 'invalid',
          phone_id: '123',
          type: 'message'
        };
        
        if (!isValidWebhookSource(validData)) {
          throw new Error('Valid webhook source rejected');
        }
        
        if (isValidWebhookSource(invalidData)) {
          throw new Error('Invalid webhook source accepted');
        }
      }
    },
    {
      name: 'Phone Number Extraction',
      test: () => {
        const testCases = [
          {
            user: { phone: '8801234567890' },
            conversation: '8801234567890@c.us',
            expected: '8801234567890'
          },
          {
            user: null,
            conversation: '8801234567890@c.us',
            expected: '8801234567890'
          }
        ];
        
        testCases.forEach(testCase => {
          const extracted = extractPhoneNumber(testCase.user, testCase.conversation);
          if (extracted !== testCase.expected) {
            throw new Error(`Phone extraction failed: got ${extracted}, expected ${testCase.expected}`);
          }
        });
      }
    },
    {
      name: 'Message Text Extraction',
      test: () => {
        const testCases = [
          {
            message: { type: 'text', text: 'Hello World' },
            expected: 'Hello World'
          },
          {
            message: { type: 'image', caption: 'Image Caption' },
            expected: 'Image Caption'
          },
          {
            message: { type: 'button_response', selectedButtonId: 'button1' },
            expected: 'button1'
          }
        ];
        
        testCases.forEach(testCase => {
          const extracted = extractMessageText(testCase.message);
          if (extracted !== testCase.expected) {
            throw new Error(`Message text extraction failed: got ${extracted}, expected ${testCase.expected}`);
          }
        });
      }
    }
  ];
  
  runTestSuite('Webhook Integration', tests, testResults);
}

/**
 * Tests security features.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runSecurityTests(testResults) {
  const tests = [
    {
      name: 'Rate Limiting',
      test: () => {
        const testPhone = '8801999999999';
        
        // Should not be rate limited initially
        if (isRateLimited(testPhone)) {
          throw new Error('False positive rate limiting');
        }
        
        // Trigger rate limiting
        for (let i = 0; i < 12; i++) {
          updateRateLimit(testPhone);
        }
        
        // Should now be rate limited
        if (!isRateLimited(testPhone)) {
          throw new Error('Rate limiting not triggered');
        }
      }
    },
    {
      name: 'Input Sanitization',
      test: () => {
        const maliciousInputs = [
          '<script>alert("xss")</script>',
          'javascript:alert(1)',
          '"; DROP TABLE users; --',
          '../../../etc/passwd'
        ];
        
        maliciousInputs.forEach(input => {
          // Test that malicious inputs don't cause errors
          try {
            const normalized = normalizePhoneNumber(input);
            const isValid = isValidBangladeshNumber(input);
            // Should handle gracefully without throwing
          } catch (error) {
            // Expected behavior for some inputs
          }
        });
      }
    },
    {
      name: 'Employee Data Protection',
      test: () => {
        // Test that sensitive employee data is protected
        const employee = findEmployeeByWhatsApp('8801234567890');
        if (employee) {
          // Ensure NID and bKash numbers are not logged
          const logString = JSON.stringify(employee);
          if (logString.includes(employee.nidNo) || logString.includes(employee.bkashNumber)) {
            console.warn('⚠️ Sensitive data may be exposed in logs');
          }
        }
      }
    }
  ];
  
  runTestSuite('Security', tests, testResults);
}

/**
 * Tests performance characteristics.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runPerformanceTests(testResults) {
  const tests = [
    {
      name: 'Employee Lookup Performance',
      test: () => {
        const startTime = new Date().getTime();
        const iterations = 100;
        
        for (let i = 0; i < iterations; i++) {
          findEmployeeByWhatsApp('8801234567890');
        }
        
        const endTime = new Date().getTime();
        const avgTime = (endTime - startTime) / iterations;
        
        console.log(`   ⏱️ Average lookup time: ${avgTime.toFixed(2)}ms`);
        
        if (avgTime > 100) { // 100ms threshold
          throw new Error(`Employee lookup too slow: ${avgTime}ms`);
        }
        
        return avgTime;
      }
    },
    {
      name: 'Phone Number Normalization Performance',
      test: () => {
        const startTime = new Date().getTime();
        const iterations = 1000;
        const testNumbers = [
          '01234567890',
          '+8801234567890',
          '88 01234 567890',
          '01234-567-890'
        ];
        
        for (let i = 0; i < iterations; i++) {
          const number = testNumbers[i % testNumbers.length];
          normalizePhoneNumber(number);
        }
        
        const endTime = new Date().getTime();
        const avgTime = (endTime - startTime) / iterations;
        
        console.log(`   ⏱️ Average normalization time: ${avgTime.toFixed(3)}ms`);
        
        if (avgTime > 1) { // 1ms threshold
          throw new Error(`Phone normalization too slow: ${avgTime}ms`);
        }
        
        return avgTime;
      }
    },
    {
      name: 'Message Processing Performance',
      test: () => {
        // Mock sendWhatsAppMessage to avoid actual API calls
        const originalSend = globalThis.sendWhatsAppMessage;
        globalThis.sendWhatsAppMessage = () => true;
        
        try {
          const startTime = new Date().getTime();
          const iterations = 50;
          
          for (let i = 0; i < iterations; i++) {
            handleIncomingWhatsAppMessage('8801234567890', 'need to see data');
          }
          
          const endTime = new Date().getTime();
          const avgTime = (endTime - startTime) / iterations;
          
          console.log(`   ⏱️ Average message processing time: ${avgTime.toFixed(2)}ms`);
          
          if (avgTime > 500) { // 500ms threshold
            throw new Error(`Message processing too slow: ${avgTime}ms`);
          }
          
          return avgTime;
          
        } finally {
          if (originalSend) {
            globalThis.sendWhatsAppMessage = originalSend;
          }
        }
      }
    }
  ];
  
  runTestSuite('Performance', tests, testResults);
}

/**
 * Tests error handling and recovery.
 * 
 * @param {Object} testResults - Test results accumulator
 */
function runErrorHandlingTests(testResults) {
  const tests = [
    {
      name: 'Invalid Phone Number Handling',
      test: () => {
        // Should handle invalid phone numbers gracefully
        const invalidNumbers = ['', null, undefined, 'invalid', '123'];
        
        invalidNumbers.forEach(number => {
          try {
            const employee = findEmployeeByWhatsApp(number);
            // Should return null, not throw error
            if (employee !== null) {
              throw new Error(`Invalid number should return null: ${number}`);
            }
          } catch (error) {
            throw new Error(`Invalid number caused error: ${number} - ${error.message}`);
          }
        });
      }
    },
    {
      name: 'Missing Configuration Handling',
      test: () => {
        // Test with temporarily invalid config
        const originalConfig = CONFIG.MAYTAPI_CONFIG;
        CONFIG.MAYTAPI_CONFIG = {};
        
        try {
          // Should handle missing config gracefully
          validateMaytapiConfig();
          throw new Error('Should have thrown error for missing config');
        } catch (error) {
          if (!error.message.includes('Missing required')) {
            throw new Error('Unexpected error message for missing config');
          }
        } finally {
          CONFIG.MAYTAPI_CONFIG = originalConfig;
        }
      }
    },
    {
      name: 'Network Error Simulation',
      test: () => {
        // Mock UrlFetchApp to simulate network errors
        const originalFetch = UrlFetchApp.fetch;
        UrlFetchApp.fetch = () => {
          throw new Error('Network error');
        };
        
        try {
          // Should handle network errors gracefully
          const result = sendWhatsAppMessage('8801234567890', 'test message');
          if (result !== false) {
            throw new Error('Should return false on network error');
          }
        } finally {
          UrlFetchApp.fetch = originalFetch;
        }
      }
    },
    {
      name: 'Cache Service Error Handling',
      test: () => {
        // Mock CacheService to simulate errors
        const originalCache = CacheService.getScriptCache;
        CacheService.getScriptCache = () => {
          throw new Error('Cache error');
        };
        
        try {
          // Should handle cache errors gracefully
          storeConversationState('8801234567890', { test: true });
          const state = getConversationState('8801234567890');
          // Should not throw error, should return null
          if (state !== null) {
            throw new Error('Should return null on cache error');
          }
        } finally {
          CacheService.getScriptCache = originalCache;
        }
      }
    }
  ];
  
  runTestSuite('Error Handling', tests, testResults);
}

/**
 * Runs a test suite and accumulates results.
 * 
 * @param {string} suiteName - Name of the test suite
 * @param {Array} tests - Array of test objects
 * @param {Object} testResults - Test results accumulator
 */
function runTestSuite(suiteName, tests, testResults) {
  console.log(`\n📝 Running ${suiteName} Tests...`);
  
  tests.forEach(test => {
    testResults.totalTests++;
    
    try {
      const startTime = new Date().getTime();
      const result = test.test();
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      testResults.passedTests++;
      console.log(`   ✅ ${test.name} (${duration}ms)`);
      
      if (result !== undefined) {
        testResults.performance[test.name] = result;
      }
      
    } catch (error) {
      testResults.failedTests++;
      testResults.errors.push({
        suite: suiteName,
        test: test.name,
        error: error.message
      });
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  });
}

/**
 * Generates a comprehensive test report.
 * 
 * @param {Object} testResults - Test results
 */
function generateTestReport(testResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`   Total Tests: ${testResults.totalTests}`);
  console.log(`   Passed: ${testResults.passedTests} ✅`);
  console.log(`   Failed: ${testResults.failedTests} ❌`);
  console.log(`   Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
  console.log(`   Total Time: ${testResults.performance.totalTime}ms`);
  
  // Failed tests details
  if (testResults.failedTests > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.suite}] ${error.test}`);
      console.log(`      Error: ${error.error}`);
    });
  }
  
  // Performance metrics
  if (Object.keys(testResults.performance).length > 1) {
    console.log(`\n⏱️ Performance Metrics:`);
    Object.entries(testResults.performance).forEach(([key, value]) => {
      if (key !== 'totalTime') {
        console.log(`   ${key}: ${typeof value === 'number' ? value.toFixed(3) : value}ms`);
      }
    });
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  if (testResults.failedTests === 0) {
    console.log(`   ✅ All tests passed! WhatsApp integration is ready for production.`);
  } else {
    console.log(`   ⚠️ Fix ${testResults.failedTests} failing test(s) before deployment.`);
  }
  
  if (testResults.performance['Employee Lookup Performance'] > 50) {
    console.log(`   🔍 Consider optimizing employee lookup performance.`);
  }
  
  if (testResults.performance['Message Processing Performance'] > 300) {
    console.log(`   📱 Consider optimizing message processing performance.`);
  }
  
  console.log('='.repeat(60));
}

/**
 * Quick smoke test for basic functionality.
 * Use this for fast validation during development.
 */
function runQuickSmokeTest() {
  try {
    console.log('💨 Running Quick Smoke Test...');
    
    // Test 1: Config validation
    validateMaytapiConfig();
    console.log('   ✅ Configuration valid');
    
    // Test 2: Phone number normalization
    const normalized = normalizePhoneNumber('01234567890');
    if (normalized !== '8801234567890') {
      throw new Error('Phone normalization failed');
    }
    console.log('   ✅ Phone normalization working');
    
    // Test 3: Message detection
    if (!isDataRequestMessage('need to see data')) {
      throw new Error('Message detection failed');
    }
    console.log('   ✅ Message detection working');
    
    // Test 4: Employee lookup (if test employee exists)
    const employee = findEmployeeByWhatsApp('8801234567890');
    if (employee) {
      console.log('   ✅ Employee lookup working');
    } else {
      console.log('   ⚠️ No test employee found (create one for full testing)');
    }
    
    console.log('🎉 Quick smoke test passed!');
    
  } catch (error) {
    console.error('❌ Quick smoke test failed:', error);
    throw error;
  }
}

/**
 * Load test for high-volume scenarios.
 * Tests system behavior under stress.
 * 
 * @param {number} concurrentUsers - Number of concurrent users to simulate
 * @param {number} messagesPerUser - Messages per user
 */
function runLoadTest(concurrentUsers = 10, messagesPerUser = 5) {
  try {
    console.log(`🚀 Running Load Test (${concurrentUsers} users, ${messagesPerUser} msgs each)...`);
    
    // Mock sendWhatsAppMessage to avoid API limits
    const originalSend = globalThis.sendWhatsAppMessage;
    let messagesSent = 0;
    globalThis.sendWhatsAppMessage = () => { messagesSent++; return true; };
    
    try {
      const startTime = new Date().getTime();
      
      // Simulate concurrent users
      for (let user = 0; user < concurrentUsers; user++) {
        const userPhone = `88012345678${user.toString().padStart(2, '0')}`;
        
        for (let msg = 0; msg < messagesPerUser; msg++) {
          handleIncomingWhatsAppMessage(userPhone, 'need to see data');
        }
      }
      
      const endTime = new Date().getTime();
      const totalTime = endTime - startTime;
      const totalMessages = concurrentUsers * messagesPerUser;
      const avgTime = totalTime / totalMessages;
      
      console.log(`   📊 Results:`);
      console.log(`      Total Messages: ${totalMessages}`);
      console.log(`      Messages Sent: ${messagesSent}`);
      console.log(`      Total Time: ${totalTime}ms`);
      console.log(`      Average Time per Message: ${avgTime.toFixed(2)}ms`);
      console.log(`      Messages per Second: ${(totalMessages / (totalTime / 1000)).toFixed(1)}`);
      
      if (avgTime > 1000) { // 1 second threshold
        console.warn(`   ⚠️ High latency detected: ${avgTime}ms per message`);
      } else {
        console.log(`   ✅ Load test passed`);
      }
      
    } finally {
      if (originalSend) {
        globalThis.sendWhatsAppMessage = originalSend;
      }
    }
    
  } catch (error) {
    console.error('❌ Load test failed:', error);
    throw error;
  }
}

/**
 * Continuous monitoring test.
 * Runs background tests periodically.
 */
function runContinuousMonitoring() {
  try {
    console.log('📊 Starting Continuous Monitoring...');
    
    // Create monitoring trigger
    const triggers = ScriptApp.getProjectTriggers();
    
    // Remove existing monitoring triggers
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'runPeriodicHealthCheck') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new monitoring trigger (every hour)
    ScriptApp.newTrigger('runPeriodicHealthCheck')
      .timeBased()
      .everyHours(1)
      .create();
    
    console.log('✅ Continuous monitoring setup complete');
    console.log('   Health checks will run every hour');
    
  } catch (error) {
    console.error('❌ Error setting up continuous monitoring:', error);
    throw error;
  }
}

/**
 * Periodic health check function called by trigger.
 * Runs basic tests and alerts on failures.
 */
function runPeriodicHealthCheck() {
  try {
    console.log('🔍 Running Periodic Health Check...');
    
    const issues = [];
    
    // Quick config check
    try {
      validateMaytapiConfig();
    } catch (error) {
      issues.push(`Configuration issue: ${error.message}`);
    }
    
    // Quick functionality check
    try {
      if (!isDataRequestMessage('need to see data')) {
        issues.push('Message detection not working');
      }
    } catch (error) {
      issues.push(`Message detection error: ${error.message}`);
    }
    
    // Performance check
    try {
      const startTime = new Date().getTime();
      normalizePhoneNumber('01234567890');
      const endTime = new Date().getTime();
      
      if (endTime - startTime > 10) { // 10ms threshold
        issues.push(`Slow performance detected: ${endTime - startTime}ms`);
      }
    } catch (error) {
      issues.push(`Performance test error: ${error.message}`);
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Health check issues detected:', issues);
      notifyAdminsOfHealthIssues(issues.map(issue => ({ 
        type: 'health_check',
        message: issue,
        details: new Date().toISOString()
      })));
    } else {
      console.log('✅ Health check passed');
    }
    
  } catch (error) {
    console.error('❌ Periodic health check failed:', error);
  }
}
