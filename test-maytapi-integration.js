/**
 * @fileoverview Test functions for Maytapi WhatsApp Integration
 * This file contains comprehensive tests for webhook handling and message processing
 */

/**
 * Test the improved Maytapi webhook integration with realistic payloads
 */
function testMaytapiWebhookIntegration() {
  console.log('🧪 === Testing Maytapi Webhook Integration ===');
  
  try {
    // Test 1: Text message webhook
    console.log('\n📱 Test 1: Text Message Webhook');
    testTextMessageWebhook();
    
    // Test 2: Media message with caption
    console.log('\n🖼️ Test 2: Media Message with Caption');
    testMediaMessageWebhook();
    
    // Test 3: Status webhook
    console.log('\n📶 Test 3: Status Change Webhook');
    testStatusWebhook();
    
    // Test 4: Acknowledgment webhook
    console.log('\n✅ Test 4: Message Acknowledgment Webhook');
    testAckWebhook();
    
    // Test 5: Error webhook
    console.log('\n🚨 Test 5: Error Webhook');
    testErrorWebhook();
    
    // Test 6: Invalid webhook data
    console.log('\n⚠️ Test 6: Invalid Webhook Data');
    testInvalidWebhook();
    
    console.log('\n✅ All Maytapi webhook tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Maytapi webhook test failed:', error);
    throw error;
  }
}

/**
 * Test text message webhook handling
 */
function testTextMessageWebhook() {
  const webhookPayload = {
    "product_id": "55968f1b-01dc-4f02-baca-af83b92ca455",
    "phone_id": "90126",
    "message": {
      "id": "3EB081AF26FADE6416D8",
      "type": "text",
      "text": "need to see data",
      "fromMe": false,
      "mentions": []
    },
    "user": {
      "id": "8801234567890@c.us",
      "name": "Test Employee",
      "phone": "8801234567890",
      "image": "https://pps.whatsapp.net/v/..."
    },
    "conversation": "8801234567890@c.us",
    "receiver": "905307654321",
    "timestamp": 1643723887,
    "type": "message"
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log('📤 Sending text message webhook...');
  const result = doPost(mockEvent);
  console.log('📥 Webhook response:', result.getContent());
}

/**
 * Test media message with caption webhook handling
 */
function testMediaMessageWebhook() {
  const webhookPayload = {
    "product_id": "55968f1b-01dc-4f02-baca-af83b92ca455",
    "phone_id": "90126",
    "message": {
      "id": "3EB081AF26FADE6416D9",
      "type": "image",
      "caption": "show my orders",
      "fromMe": false,
      "mentions": []
    },
    "user": {
      "id": "8801234567890@c.us",
      "name": "Test Employee",
      "phone": "8801234567890",
      "image": "https://pps.whatsapp.net/v/..."
    },
    "conversation": "8801234567890@c.us",
    "receiver": "905307654321",
    "timestamp": 1643723887,
    "type": "message"
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log('📤 Sending media message webhook...');
  const result = doPost(mockEvent);
  console.log('📥 Webhook response:', result.getContent());
}

/**
 * Test status change webhook handling
 */
function testStatusWebhook() {
  const webhookPayload = {
    type: 'status',
    phone_id: '90126',
    status: 'connected'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log('📤 Sending status webhook...');
  const result = doPost(mockEvent);
  console.log('📥 Webhook response:', result.getContent());
}

/**
 * Test message acknowledgment webhook handling
 */
function testAckWebhook() {
  const webhookPayload = {
    type: 'ack',
    data: [
      {
        msgId: 'false_8801234567890@c.us_3EB0C6D4F26A2E5F25E8',
        ackType: 'sent'
      },
      {
        msgId: 'false_8801234567890@c.us_3EB0C6D4F26A2E5F25E9',
        ackType: 'delivered'
      }
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log('📤 Sending ack webhook...');
  const result = doPost(mockEvent);
  console.log('📥 Webhook response:', result.getContent());
}

/**
 * Test error webhook handling
 */
function testErrorWebhook() {
  const webhookPayload = {
    type: 'error',
    error: {
      code: 'PHONE_NOT_CONNECTED',
      message: 'Phone is not connected to WhatsApp'
    },
    phone_id: '90126'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log('📤 Sending error webhook...');
  const result = doPost(mockEvent);
  console.log('📥 Webhook response:', result.getContent());
}

/**
 * Test invalid webhook data handling
 */
function testInvalidWebhook() {
  const testCases = [
    // Empty request
    null,
    
    // No postData
    {},
    
    // No contents
    { postData: {} },
    
    // Invalid JSON
    { postData: { contents: 'invalid json' } },
    
    // Unknown webhook type
    { postData: { contents: JSON.stringify({ type: 'unknown' }) } }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`📤 Sending invalid webhook case ${index + 1}...`);
    try {
      const result = doPost(testCase);
      console.log(`📥 Webhook response: ${result.getContent()}`);
    } catch (error) {
      console.log(`⚠️ Expected error for case ${index + 1}:`, error.message);
    }
  });
}

/**
 * Test complete user interaction flow with realistic scenario
 */
function testCompleteUserFlow() {
  console.log('🧪 === Testing Complete User Interaction Flow ===');
  
  try {
    const userPhone = '8801234567890';
    const userEmail = 'test@example.com';
    
    // Setup test environment
    console.log('🏗️ Setting up test environment...');
    setupTestEnvironment(userPhone, userEmail);
    
    // Step 1: User sends "need to see data"
    console.log('\n📱 Step 1: User requests data access');
    simulateUserMessage(userPhone, 'need to see data');
    
    // Step 2: User selects a sheet by number
    console.log('\n📱 Step 2: User selects sheet by number');
    simulateUserMessage(userPhone, '1');
    
    // Step 3: User tries an invalid selection
    console.log('\n📱 Step 3: User makes invalid selection');
    simulateUserMessage(userPhone, 'invalid');
    
    // Step 4: User asks for help
    console.log('\n📱 Step 4: User asks for help');
    simulateUserMessage(userPhone, 'help');
    
    console.log('\n✅ Complete user flow test completed!');
    
  } catch (error) {
    console.error('❌ Complete user flow test failed:', error);
    throw error;
  }
}

/**
 * Setup test environment with employee and user sheets
 * @param {string} phone - Test phone number
 * @param {string} email - Test email
 */
function setupTestEnvironment(phone, email) {
  // Add test employee if not exists
  const employee = findEmployeeByWhatsApp(phone);
  if (!employee) {
    const testEmployee = {
      name: 'Test User',
      role: 'BDO',
      email: email,
      contactNumber: phone,
      whatsappNumber: phone,
      bkashNumber: phone,
      nidNo: '1234567890123'
    };
    addEmployee(testEmployee);
    console.log('👤 Added test employee');
  }
  
  // Create test user sheets
  getOrCreateUserSheet(email, 'Orders');
  getOrCreateUserSheet(email, 'Visits');
  console.log('📊 Created test user sheets');
}

/**
 * Simulate a user message through webhook
 * @param {string} phone - User phone number
 * @param {string} message - Message content
 */
function simulateUserMessage(phone, message) {
  const webhookPayload = {
    type: 'message',
    message: {
      type: 'text',
      text: message,
      fromMe: false,
      _serialized: `false_${phone}@c.us_${Date.now()}`
    },
    conversation: `${phone}@c.us`
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(webhookPayload)
    }
  };
  
  console.log(`📤 User message: "${message}"`);
  const result = doPost(mockEvent);
  console.log(`📥 Response: ${result.getContent()}`);
}

/**
 * Test webhook performance with multiple concurrent requests
 */
function testWebhookPerformance() {
  console.log('🧪 === Testing Webhook Performance ===');
  
  const startTime = new Date().getTime();
  const messageCount = 10;
  
  try {
    for (let i = 0; i < messageCount; i++) {
      const webhookPayload = {
        type: 'message',
        message: {
          type: 'text',
          text: `Test message ${i + 1}`,
          fromMe: false,
          _serialized: `false_8801234567890@c.us_${Date.now()}_${i}`
        },
        conversation: '8801234567890@c.us'
      };
      
      const mockEvent = {
        postData: {
          contents: JSON.stringify(webhookPayload)
        }
      };
      
      doPost(mockEvent);
    }
    
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    const avgTime = duration / messageCount;
    
    console.log(`⏱️ Processed ${messageCount} messages in ${duration}ms`);
    console.log(`📊 Average processing time: ${avgTime.toFixed(2)}ms per message`);
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  }
}

/**
 * Run all Maytapi integration tests
 */
function runAllMaytapiTests() {
  console.log('🚀 === Running All Maytapi Integration Tests ===');
  
  try {
    // Basic webhook tests
    testMaytapiWebhookIntegration();
    
    // Complete user flow
    testCompleteUserFlow();
    
    // Performance testing
    testWebhookPerformance();
    
    console.log('\n🎉 All Maytapi integration tests passed successfully!');
    console.log('📋 Next steps:');
    console.log('  1. Deploy the updated webhook handler to Google Apps Script');
    console.log('  2. Configure the webhook URL in your Maytapi dashboard');
    console.log('  3. Test with real WhatsApp messages');
    
  } catch (error) {
    console.error('❌ Maytapi integration tests failed:', error);
    throw error;
  }
}
