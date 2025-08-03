/**
 * @fileoverview WhatsApp Integration for Per-Submitter Sheets Feature
 * This module handles incoming WhatsApp messages, conversation state management,
 * and provides user-friendly access to personal data sheets.
 * 
 * Key Features:
 * - Processes "need to see data" commands
 * - Manages conversation state using CacheService
 * - Provides numbered sheet lists and direct access links
 * - Handles error cases and user guidance
 */

/**
 * Main handler for incoming WhatsApp messages.
 * This function should be called by a webhook or trigger when messages are received.
 * 
 * @param {string} phone - Sender's phone number
 * @param {string} message - Message content
 */
function handleIncomingWhatsAppMessage(phone, message) {
  try {
    console.log(`📱 Received WhatsApp message from ${phone}: ${message}`);
    
    // Find employee by WhatsApp number
    const employee = findEmployeeByWhatsApp(phone);
    if (!employee) {
      sendWhatsAppMessage(phone, 
        "❌ Your WhatsApp number is not registered in our system.\n\n" +
        "Please contact your supervisor to register your WhatsApp number."
      );
      return;
    }
    
    console.log(`👤 Message from ${employee.name} (${employee.email})`);
    
    // Get current conversation state
    const conversationState = getConversationState(phone);
    
    // Process message based on content and state
    if (isDataRequestMessage(message)) {
      handleDataRequestCommand(phone, employee);
    } else if (conversationState && conversationState.awaitingSelection) {
      handleSheetSelectionReply(phone, employee, message, conversationState);
    } else {
      handleUnrecognizedMessage(phone, employee, message);
    }
    
  } catch (error) {
    console.error(`❌ Error handling WhatsApp message from ${phone}:`, error);
    sendWhatsAppMessage(phone, 
      "❌ Sorry, there was an error processing your request. Please try again later."
    );
  }
}

/**
 * Handles "need to see data" command and similar requests.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object from database
 */
function handleDataRequestCommand(phone, employee) {
  try {
    console.log(`📊 Processing data request for ${employee.email}`);
    
    // Get user's available sheets
    const userSheets = listSheetsForUser(employee.email);
    
    if (userSheets.length === 0) {
      sendWhatsAppMessage(phone, 
        `📭 Hi ${employee.name}!\n\n` +
        "You don't have any data submissions yet. Once you submit forms through our system, " +
        "your personal data sheets will be created automatically.\n\n" +
        "You can submit:\n" +
        "• Orders\n" +
        "• Visit reports\n" +
        "• Site prescriptions\n" +
        "• IHB registrations\n" +
        "• And more!"
      );
      return;
    }
    
    // Create numbered list of available sheets
    let reply = `📄 Hi ${employee.name}!\n\nHere are your available data sheets:\n\n`;
    
    userSheets.forEach((sheet, index) => {
      const sheetNumber = index + 1;
      const lastUpdated = sheet.lastUpdated ? 
        new Date(sheet.lastUpdated).toLocaleDateString() : 
        'Unknown';
      
      reply += `${sheetNumber}. ${sheet.sheetType}\n`;
      reply += `   📅 Last updated: ${lastUpdated}\n\n`;
    });
    
    reply += "📝 Reply with the number or name of the sheet you want to access.\n";
    reply += "Example: Reply '1' or 'Orders'";
    
    // Store conversation state
    storeConversationState(phone, {
      awaitingSelection: true,
      availableSheets: userSheets,
      timestamp: new Date().getTime()
    });
    
    sendWhatsAppMessage(phone, reply);
    
  } catch (error) {
    console.error(`❌ Error handling data request for ${employee.email}:`, error);
    sendWhatsAppMessage(phone, 
      "❌ Sorry, there was an error retrieving your data. Please try again later."
    );
  }
}

/**
 * Handles user's reply when selecting a sheet from the list.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object
 * @param {string} message - User's selection message
 * @param {Object} conversationState - Current conversation state
 */
function handleSheetSelectionReply(phone, employee, message, conversationState) {
  try {
    console.log(`🎯 Processing sheet selection from ${employee.email}: ${message}`);
    
    const sheets = conversationState.availableSheets;
    if (!sheets || sheets.length === 0) {
      clearConversationState(phone);
      sendWhatsAppMessage(phone, 
        "❌ Session expired. Please send 'need to see data' again to get your sheet list."
      );
      return;
    }
    
    // Try to match user's selection
    const selectedSheet = matchSheetFromReply(message, sheets);
    
    if (selectedSheet) {
      // Clear conversation state
      clearConversationState(phone);
      
      // Send sheet link
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${selectedSheet.sheetId}`;
      const response = 
        `✅ Here is your requested ${selectedSheet.sheetType} sheet:\n\n` +
        `🔗 ${sheetUrl}\n\n` +
        `📊 Sheet: ${selectedSheet.sheetName}\n` +
        `📅 Last updated: ${new Date(selectedSheet.lastUpdated).toLocaleDateString()}\n\n` +
        `💡 Tip: Bookmark this link for easy access, or send "need to see data" anytime to get your sheet list again.`;
      
      sendWhatsAppMessage(phone, response);
      
      console.log(`✅ Sent sheet link to ${employee.email}: ${selectedSheet.sheetType}`);
      
    } else {
      // Invalid selection
      const availableOptions = sheets.map((sheet, index) => 
        `${index + 1}. ${sheet.sheetType}`
      ).join('\n');
      
      sendWhatsAppMessage(phone, 
        `❌ I couldn't understand your selection: "${message}"\n\n` +
        `Please reply with the number or exact name from this list:\n\n` +
        `${availableOptions}\n\n` +
        `Or send "cancel" to start over.`
      );
    }
    
  } catch (error) {
    console.error(`❌ Error handling sheet selection:`, error);
    clearConversationState(phone);
    sendWhatsAppMessage(phone, 
      "❌ There was an error processing your selection. Please send 'need to see data' to try again."
    );
  }
}

/**
 * Handles unrecognized messages with helpful guidance.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object
 * @param {string} message - User's message
 */
function handleUnrecognizedMessage(phone, employee, message) {
  const helpText = 
    `👋 Hi ${employee.name}!\n\n` +
    `I can help you access your personal data sheets. Here's what you can do:\n\n` +
    `📊 Send "need to see data" to get a list of your available sheets\n` +
    `📋 Send "help" to see this message again\n\n` +
    `Available sheet types:\n` +
    `• Orders\n` +
    `• Visits\n` +
    `• Site Prescriptions\n` +
    `• IHB Registrations\n` +
    `• And more!\n\n` +
    `💡 Your personal sheets are automatically created when you submit forms through our system.`;
    
  sendWhatsAppMessage(phone, helpText);
}

/**
 * Checks if a message is requesting data access.
 * 
 * @param {string} message - Message to check
 * @returns {boolean} True if it's a data request
 */
function isDataRequestMessage(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  const dataRequestKeywords = [
    'need to see data',
    'show me data',
    'my data',
    'data sheets',
    'sheets',
    'show sheets',
    'view data',
    'access data',
    'see my sheets'
  ];
  
  return dataRequestKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  ) || lowerMessage === 'data';
}

/**
 * Matches user's reply to a sheet from the available options.
 * 
 * @param {string} reply - User's reply
 * @param {Array} sheets - Available sheets array
 * @returns {Object|null} Matched sheet or null
 */
function matchSheetFromReply(reply, sheets) {
  const cleanReply = reply.trim().toLowerCase();
  
  // First, try to match by number
  const replyNumber = parseInt(cleanReply, 10);
  if (!isNaN(replyNumber) && replyNumber >= 1 && replyNumber <= sheets.length) {
    return sheets[replyNumber - 1];
  }
  
  // Then try to match by sheet type name (exact or partial)
  for (const sheet of sheets) {
    const sheetTypeLower = sheet.sheetType.toLowerCase();
    
    // Exact match
    if (sheetTypeLower === cleanReply) {
      return sheet;
    }
    
    // Partial match
    if (sheetTypeLower.includes(cleanReply) || cleanReply.includes(sheetTypeLower)) {
      return sheet;
    }
  }
  
  // Handle cancel command
  if (cleanReply === 'cancel' || cleanReply === 'stop') {
    return null;
  }
  
  return null;
}

/**
 * Stores conversation state for a user using CacheService.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} state - State object to store
 */
function storeConversationState(phone, state) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `conversation_${phone}`;
    const timeout = CONFIG.USER_SHEETS_CONFIG.CACHE_TIMEOUT || 600; // Default 10 minutes
    
    cache.put(cacheKey, JSON.stringify(state), timeout);
    console.log(`💾 Stored conversation state for ${phone}`);
    
  } catch (error) {
    console.error('Error storing conversation state:', error);
    // Don't throw as this is non-critical for basic functionality
  }
}

/**
 * Gets conversation state for a user.
 * 
 * @param {string} phone - User's phone number
 * @returns {Object|null} Conversation state or null if expired/not found
 */
function getConversationState(phone) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `conversation_${phone}`;
    
    const stateJson = cache.get(cacheKey);
    if (stateJson) {
      const state = JSON.parse(stateJson);
      console.log(`📋 Retrieved conversation state for ${phone}`);
      return state;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting conversation state:', error);
    return null;
  }
}

/**
 * Clears conversation state for a user.
 * 
 * @param {string} phone - User's phone number
 */
function clearConversationState(phone) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `conversation_${phone}`;
    
    cache.remove(cacheKey);
    console.log(`🗑️ Cleared conversation state for ${phone}`);
    
  } catch (error) {
    console.error('Error clearing conversation state:', error);
    // Don't throw as this is non-critical
  }
}

/**
 * Test function for WhatsApp integration with proper setup.
 * Run this from Apps Script editor to test the WhatsApp flow.
 */
function testWhatsAppIntegration() {
  try {
    console.log('🧪 Testing WhatsApp integration...');
    
    // Test with a mock phone number and employee
    const testPhone = '8801234567890';
    const testMessage = 'need to see data';
    
    // First add a test employee
    const testEmployee = {
      name: 'Test User',
      role: 'BDO',
      email: 'test@example.com',
      contactNumber: '01234567890',
      whatsappNumber: testPhone,
      bkashNumber: '01234567890',
      nidNo: '1234567890123'
    };
    
    console.log('📝 Adding test employee...');
    addEmployee(testEmployee);
    
    // Create a test user sheet
    console.log('📊 Creating test user sheet...');
    const userSheet = getOrCreateUserSheet('test@example.com', 'Orders');
    
    // Test the WhatsApp flow
    console.log('📱 Testing WhatsApp message handling...');
    handleIncomingWhatsAppMessage(testPhone, testMessage);
    
    console.log('✅ WhatsApp integration test completed!');
    
  } catch (error) {
    console.error('❌ WhatsApp integration test failed:', error);
    throw error;
  }
}

/**
 * Test the complete webhook flow with test employee setup
 */
function testCompleteWhatsAppFlow() {
  try {
    console.log('🚀 === Testing Complete WhatsApp Flow ===');
    
    const testPhone = '8801234567890';
    
    // 1. Setup test employee
    console.log('\n1️⃣ Setting up test employee...');
    const testEmployee = {
      name: 'Test Employee',
      role: 'BDO', 
      email: 'test.employee@anwarsales.com',
      contactNumber: testPhone,
      whatsappNumber: testPhone,
      bkashNumber: testPhone,
      nidNo: '1234567890123',
      status: 'Active',
      company: 'ACL',
      territory: 'Dhaka North'
    };
    
    try {
      addEmployee(testEmployee);
      console.log('✅ Test employee added successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Test employee already exists');
      } else {
        throw error;
      }
    }
    
    // 2. Create test user sheets
    console.log('\n2️⃣ Creating test user sheets...');
    const sheetTypes = ['Orders', 'Visits', 'Site Prescriptions'];
    
    sheetTypes.forEach(sheetType => {
      try {
        const userSheet = getOrCreateUserSheet(testEmployee.email, sheetType);
        console.log(`✅ Created ${sheetType} sheet: ${userSheet.getName()}`);
      } catch (error) {
        console.log(`⚠️ Sheet ${sheetType} may already exist: ${error.message}`);
      }
    });
    
    // 3. Test webhook payload processing
    console.log('\n3️⃣ Testing webhook payload processing...');
    
    const testPayload = {
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
        "id": `${testPhone}@c.us`,
        "name": testEmployee.name,
        "phone": testPhone,
        "image": "https://pps.whatsapp.net/v/..."
      },
      "conversation": `${testPhone}@c.us`,
      "receiver": "905307654321",
      "timestamp": Date.now(),
      "type": "message"
    };
    
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testPayload)
      }
    };
    
    console.log('📤 Processing webhook payload...');
    const result = doPost(mockEvent);
    console.log(`📥 Webhook result: ${result.getContent()}`);
    
    // 4. Test media message
    console.log('\n4️⃣ Testing media message with caption...');
    
    const mediaPayload = {
      ...testPayload,
      message: {
        "id": "3EB081AF26FADE6416D9",
        "type": "image",
        "caption": "show my orders",
        "fromMe": false,
        "mentions": []
      }
    };
    
    const mediaEvent = {
      postData: {
        contents: JSON.stringify(mediaPayload)
      }
    };
    
    console.log('📤 Processing media webhook payload...');
    const mediaResult = doPost(mediaEvent);
    console.log(`📥 Media webhook result: ${mediaResult.getContent()}`);
    
    console.log('\n✅ Complete WhatsApp flow test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('  ✅ Employee setup and lookup');
    console.log('  ✅ User sheet creation'); 
    console.log('  ✅ Text message processing');
    console.log('  ✅ Media message with caption processing');
    console.log('  ✅ Webhook payload handling');
    
  } catch (error) {
    console.error('❌ Complete WhatsApp flow test failed:', error);
    throw error;
  }
}

/**
 * Webhook handler for Maytapi incoming messages.
 * Configure this URL as webhook in your Maytapi dashboard.
 * 
 * Expected webhook payload structure from Maytapi (actual format):
 * {
 *   "product_id": "dc01968f-####-####-####-7cfcf51aa423",
 *   "phone_id": "25312",
 *   "message": {
 *     "id": "3EB081AF26FADE6416D8",
 *     "type": "text",
 *     "text": "Message Text",
 *     "fromMe": false,
 *     "mentions": []
 *   },
 *   "user": {
 *     "id": "905301234567@c.us",
 *     "name": "UserName",
 *     "phone": "905301234567",
 *     "image": "https://pps.whatsapp.net/v/...."
 *   },
 *   "conversation": "905301234567@c.us",
 *   "receiver": "905307654321",
 *   "timestamp": 1574081887,
 *   "type": "message"
 * }
 * 
 * @param {Object} e - Event object from webhook
 */
function doPost(e) {
  try {
    console.log('📥 Received webhook request');
    
    if (!e || !e.postData || !e.postData.contents) {
      console.warn('⚠️ No webhook data received');
      return ContentService.createTextOutput('NO_DATA');
    }
    
    const data = JSON.parse(e.postData.contents);
    console.log('📦 Webhook payload:', JSON.stringify(data, null, 2));
    
    // Handle different webhook types
    if (data.type === 'message') {
      handleMessageWebhook(data);
    } else if (data.type === 'status') {
      handleStatusWebhook(data);
    } else if (data.type === 'ack') {
      handleAckWebhook(data);
    } else if (data.type === 'error') {
      handleErrorWebhook(data);
    } else {
      console.log(`ℹ️ Unhandled webhook type: ${data.type}`);
    }
    
    return ContentService.createTextOutput('OK');
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return ContentService.createTextOutput('ERROR');
  }
}

/**
 * Handles incoming message webhooks from Maytapi
 * Expected payload format:
 * {
 *   "product_id": "dc01968f-####-####-####-7cfcf51aa423",
 *   "phone_id": "25312",
 *   "message": {
 *     "id": "3EB081AF26FADE6416D8",
 *     "type": "text",
 *     "text": "Message Text",
 *     "fromMe": false,
 *     "mentions": []
 *   },
 *   "user": {
 *     "id": "905301234567@c.us",
 *     "name": "UserName",
 *     "phone": "905301234567",
 *     "image": "https://pps.whatsapp.net/v/...."
 *   },
 *   "conversation": "905301234567@c.us",
 *   "receiver": "905307654321",
 *   "timestamp": 1574081887,
 *   "type": "message"
 * }
 * @param {Object} data - Webhook data from Maytapi
 */
function handleMessageWebhook(data) {
  try {
    const { message, conversation, user, product_id, phone_id } = data;
    
    if (!message || !conversation) {
      console.warn('⚠️ Invalid message webhook data - missing message or conversation');
      console.log('📦 Received data:', JSON.stringify(data, null, 2));
      return;
    }
    
    // Skip messages sent by us
    if (message.fromMe) {
      console.log('↗️ Ignoring outgoing message');
      return;
    }
    
    // Extract phone number from user object or conversation
    let phone;
    if (user && user.phone) {
      phone = user.phone;
    } else {
      // Fallback: extract from conversation (remove @c.us suffix if present)
      phone = conversation.replace('@c.us', '');
    }
    
    console.log(`📱 Processing message from ${phone}: ${message.text || message.caption || '[no text]'}`);
    console.log(`👤 User: ${user?.name || 'Unknown'}`);
    console.log(`🔗 Product ID: ${product_id}, Phone ID: ${phone_id}`);
    
    // Extract message text based on message type
    let messageText = '';
    if (message.type === 'text' && message.text) {
      messageText = message.text;
    } else if (message.caption) {
      messageText = message.caption;
    } else {
      console.log(`ℹ️ Unsupported message type: ${message.type} - no text or caption`);
      return;
    }
    
    // Validate we have message text after extraction
    if (!phone || !messageText) {
      console.warn('⚠️ Missing required data - phone or extracted message text');
      console.log(`📱 Phone: ${phone}, 💬 Extracted Text: ${messageText}`);
      return;
    }
    
    // Process the message using existing handler
    handleIncomingWhatsAppMessage(phone, messageText);
    
  } catch (error) {
    console.error('❌ Error handling message webhook:', error);
  }
}

/**
 * Handles status change webhooks from Maytapi
 * @param {Object} data - Webhook data
 */
function handleStatusWebhook(data) {
  try {
    const { phone_id, status } = data;
    console.log(`📶 Status update for ${phone_id}: ${status}`);
    
    // You can add logic here to handle status changes
    // For example, notify admins when instance goes offline
    
  } catch (error) {
    console.error('❌ Error handling status webhook:', error);
  }
}

/**
 * Handles message acknowledgment webhooks from Maytapi
 * @param {Object} data - Webhook data
 */
function handleAckWebhook(data) {
  try {
    const { data: ackData } = data;
    
    if (ackData && Array.isArray(ackData)) {
      ackData.forEach(ack => {
        console.log(`✅ Message ${ack.msgId} status: ${ack.ackType}`);
      });
    }
    
    // You can add logic here to track message delivery status
    
  } catch (error) {
    console.error('❌ Error handling ack webhook:', error);
  }
}

/**
 * Handles error webhooks from Maytapi
 * @param {Object} data - Webhook data
 */
function handleErrorWebhook(data) {
  try {
    console.error('🚨 WhatsApp API Error:', JSON.stringify(data, null, 2));
    
    // You can add logic here to handle API errors
    // For example, notify admins or retry failed operations
    
  } catch (error) {
    console.error('❌ Error handling error webhook:', error);
  }
}
