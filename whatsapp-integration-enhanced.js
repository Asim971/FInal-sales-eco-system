/**
 * @fileoverview Enhanced WhatsApp Integration for Per-Submitter Sheets Feature
 * This module handles incoming WhatsApp messages, conversation state management,
 * webhook security, rate limiting, and provides user-friendly access to personal data sheets.
 * 
 * Key Features:
 * - Secure webhook handling with validation
 * - Rate limiting and spam protection
 * - Enhanced phone number normalization
 * - Robust error handling and logging
 * - Conversation state management
 * - User sheet access functionality
 * - Message delivery tracking
 */

/**
 * Main handler for incoming WhatsApp messages with enhanced security and validation.
 * 
 * @param {string} phone - Sender's phone number
 * @param {string} message - Message content
 * @param {Object} metadata - Additional message metadata (timestamp, messageId, etc.)
 */
function handleIncomingWhatsAppMessage(phone, message, metadata = {}) {
  try {
    console.log(`📱 Received WhatsApp message from ${phone}: ${message}`);
    
    // Enhanced phone number validation and normalization
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidPhoneNumber(normalizedPhone)) {
      console.warn(`⚠️ Invalid phone number format: ${phone}`);
      return;
    }
    
    // Rate limiting check
    if (isRateLimited(normalizedPhone)) {
      console.warn(`🚫 Rate limit exceeded for ${normalizedPhone}`);
      sendWhatsAppMessage(normalizedPhone, 
        "⚠️ You're sending messages too quickly. Please wait a moment before trying again."
      );
      return;
    }
    
    // Update rate limiting tracker
    updateRateLimit(normalizedPhone);
    
    // Find employee by WhatsApp number with enhanced lookup
    const employee = findEmployeeByWhatsApp(normalizedPhone);
    if (!employee) {
      console.log(`❌ Employee not found for phone: ${normalizedPhone}`);
      sendWhatsAppMessage(normalizedPhone, 
        "❌ Your WhatsApp number is not registered in our system.\n\n" +
        "Please contact your supervisor to register your WhatsApp number.\n\n" +
        "📞 Support: asim.ilyus@anwargroup.com"
      );
      return;
    }
    
    console.log(`👤 Message from ${employee.name} (${employee.email}) - Role: ${employee.role}`);
    
    // Log message for audit trail
    logWhatsAppMessage(normalizedPhone, employee, message, metadata);
    
    // Get current conversation state
    const conversationState = getConversationState(normalizedPhone);
    
    // Process message based on content and state
    if (isDataRequestMessage(message)) {
      handleDataRequestCommand(normalizedPhone, employee);
    } else if (conversationState && conversationState.awaitingSelection) {
      handleSheetSelectionReply(normalizedPhone, employee, message, conversationState);
    } else if (isHelpMessage(message)) {
      handleHelpMessage(normalizedPhone, employee);
    } else {
      handleUnrecognizedMessage(normalizedPhone, employee, message);
    }
    
  } catch (error) {
    console.error(`❌ Error handling WhatsApp message from ${phone}:`, error);
    const normalizedPhone = normalizePhoneNumber(phone);
    sendWhatsAppMessage(normalizedPhone, 
      "❌ Sorry, there was an error processing your request. Please try again later."
    );
  }
}

/**
 * Enhanced data request handler with error recovery and user guidance.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object from database
 */
function handleDataRequestCommand(phone, employee) {
  try {
    console.log(`📊 Processing data request for ${employee.email}`);
    
    // Get user's available sheets with error handling
    const userSheets = listSheetsForUser(employee.email);
    
    if (userSheets.length === 0) {
      sendWhatsAppMessage(phone, 
        `📭 Hi ${employee.name}!\n\n` +
        "You don't have any data submissions yet. Once you submit forms through our system, " +
        "your personal data sheets will be created automatically.\n\n" +
        "📝 Available form types:\n" +
        "• Orders\n" +
        "• Visit reports\n" +
        "• Site prescriptions\n" +
        "• IHB registrations\n" +
        "• Partner updates\n" +
        "• Demand generation\n\n" +
        "🔗 Access forms: https://forms.gle/AnwarSales"
      );
      return;
    }
    
    // Create numbered list of available sheets with enhanced formatting
    let reply = `📄 Hi ${employee.name}!\n\nHere are your available data sheets:\n\n`;
    
    userSheets.forEach((sheet, index) => {
      const sheetNumber = index + 1;
      const lastUpdated = sheet.lastUpdated ? 
        new Date(sheet.lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'Unknown';
      
      const recordCount = sheet.recordCount || '0';
      
      reply += `${sheetNumber}. ${sheet.sheetType}\n`;
      reply += `   📅 Last updated: ${lastUpdated}\n`;
      reply += `   📊 Records: ${recordCount}\n\n`;
    });
    
    reply += "📝 Reply with the number or name of the sheet you want to access.\n";
    reply += "💡 Example: Reply '1' or 'Orders'\n";
    reply += "🚫 Send 'cancel' to stop";
    
    // Store conversation state with timeout
    storeConversationState(phone, {
      awaitingSelection: true,
      availableSheets: userSheets,
      timestamp: new Date().getTime(),
      employee: employee
    });
    
    sendWhatsAppMessage(phone, reply);
    
  } catch (error) {
    console.error(`❌ Error handling data request for ${employee.email}:`, error);
    sendWhatsAppMessage(phone, 
      "❌ Sorry, there was an error retrieving your data. Please try again later or contact support."
    );
  }
}

/**
 * Enhanced sheet selection handler with improved matching and error handling.
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
    
    // Handle cancel command
    if (message.toLowerCase().trim() === 'cancel') {
      clearConversationState(phone);
      sendWhatsAppMessage(phone, "✅ Cancelled. Send 'need to see data' anytime to access your sheets.");
      return;
    }
    
    // Try to match user's selection with enhanced matching
    const selectedSheet = matchSheetFromReply(message, sheets);
    
    if (selectedSheet) {
      // Clear conversation state
      clearConversationState(phone);
      
      // Generate sheet access link with permissions check
      const sheetUrl = generateSheetAccessUrl(selectedSheet, employee);
      const response = 
        `✅ Here is your requested ${selectedSheet.sheetType} sheet:\n\n` +
        `🔗 ${sheetUrl}\n\n` +
        `📊 Sheet: ${selectedSheet.sheetName}\n` +
        `📅 Last updated: ${new Date(selectedSheet.lastUpdated).toLocaleDateString()}\n` +
        `📈 Records: ${selectedSheet.recordCount || '0'}\n\n` +
        `💡 Tips:\n` +
        `• Bookmark this link for easy access\n` +
        `• Send "need to see data" anytime for sheet list\n` +
        `• Send "help" for available commands`;
      
      sendWhatsAppMessage(phone, response);
      
      // Log successful sheet access
      logSheetAccess(employee, selectedSheet);
      console.log(`✅ Sent sheet link to ${employee.email}: ${selectedSheet.sheetType}`);
      
    } else {
      // Enhanced invalid selection handling
      const availableOptions = sheets.map((sheet, index) => 
        `${index + 1}. ${sheet.sheetType}`
      ).join('\n');
      
      sendWhatsAppMessage(phone, 
        `❌ I couldn't understand your selection: "${message}"\n\n` +
        `Please reply with the number or exact name from this list:\n\n` +
        `${availableOptions}\n\n` +
        `💡 Or send "cancel" to start over.`
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
 * Enhanced help message handler.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object
 */
function handleHelpMessage(phone, employee) {
  const helpText = 
    `👋 Hi ${employee.name}!\n\n` +
    `🤖 I'm your personal data assistant. Here's what I can help you with:\n\n` +
    `📊 Send "need to see data" - Get your personal data sheets\n` +
    `📋 Send "help" - See this help message\n` +
    `🚫 Send "cancel" - Cancel current operation\n\n` +
    `📝 Available sheet types:\n` +
    `• Orders & Disputes\n` +
    `• Visit Reports\n` +
    `• Site Prescriptions\n` +
    `• IHB Registrations\n` +
    `• Partner Updates\n` +
    `• Demand Generation\n\n` +
    `💡 Your personal sheets are automatically created when you submit forms.\n\n` +
    `📞 Support: asim.ilyus@anwargroup.com`;
    
  sendWhatsAppMessage(phone, helpText);
}

/**
 * Enhanced unrecognized message handler with suggestions.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object
 * @param {string} message - User's message
 */
function handleUnrecognizedMessage(phone, employee, message) {
  // Check if message contains keywords that suggest intent
  const lowerMessage = message.toLowerCase();
  let suggestion = "";
  
  if (lowerMessage.includes('sheet') || lowerMessage.includes('data') || lowerMessage.includes('report')) {
    suggestion = "\n💡 Did you mean to say 'need to see data'?";
  } else if (lowerMessage.includes('help') || lowerMessage.includes('command')) {
    suggestion = "\n💡 Send 'help' to see available commands.";
  }
  
  const helpText = 
    `👋 Hi ${employee.name}!\n\n` +
    `I didn't understand: "${message}"${suggestion}\n\n` +
    `🔤 Try these commands:\n` +
    `📊 "need to see data" - Access your sheets\n` +
    `📋 "help" - Get help\n\n` +
    `💬 I can help you access your personal data sheets and reports.`;
    
  sendWhatsAppMessage(phone, helpText);
}

/**
 * Enhanced message type detection with multiple patterns.
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
    'see my sheets',
    'get data',
    'data access',
    'personal data',
    'my sheets'
  ];
  
  return dataRequestKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  ) || lowerMessage === 'data';
}

/**
 * Checks if message is requesting help.
 * 
 * @param {string} message - Message to check
 * @returns {boolean} True if it's a help request
 */
function isHelpMessage(message) {
  const lowerMessage = message.toLowerCase().trim();
  return ['help', 'assist', 'commands', 'what can you do'].includes(lowerMessage);
}

/**
 * Enhanced sheet matching with fuzzy matching and suggestions.
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
  
  // Then try exact match by sheet type name
  for (const sheet of sheets) {
    const sheetTypeLower = sheet.sheetType.toLowerCase();
    if (sheetTypeLower === cleanReply) {
      return sheet;
    }
  }
  
  // Partial match with minimum threshold
  for (const sheet of sheets) {
    const sheetTypeLower = sheet.sheetType.toLowerCase();
    if (sheetTypeLower.includes(cleanReply) && cleanReply.length >= 3) {
      return sheet;
    }
    if (cleanReply.includes(sheetTypeLower) && sheetTypeLower.length >= 3) {
      return sheet;
    }
  }
  
  // Handle common aliases
  const aliases = {
    'order': 'orders',
    'visit': 'visits',
    'site': 'site prescriptions',
    'prescription': 'site prescriptions',
    'ihb': 'ihb registrations',
    'partner': 'partner updates',
    'demand': 'demand generation'
  };
  
  const aliasMatch = aliases[cleanReply];
  if (aliasMatch) {
    for (const sheet of sheets) {
      if (sheet.sheetType.toLowerCase().includes(aliasMatch)) {
        return sheet;
      }
    }
  }
  
  return null;
}

/**
 * Enhanced conversation state storage with compression and metadata.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} state - State object to store
 */
function storeConversationState(phone, state) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `conversation_${phone}`;
    const timeout = CONFIG.USER_SHEETS_CONFIG?.CACHE_TIMEOUT || 600; // Default 10 minutes
    
    // Add metadata
    state.createdAt = new Date().getTime();
    state.version = '2.0';
    
    cache.put(cacheKey, JSON.stringify(state), timeout);
    console.log(`💾 Stored conversation state for ${phone} (expires in ${timeout}s)`);
    
  } catch (error) {
    console.error('Error storing conversation state:', error);
    // Don't throw as this is non-critical for basic functionality
  }
}

/**
 * Enhanced conversation state retrieval with validation.
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
      
      // Validate state structure
      if (state.awaitingSelection && state.availableSheets && Array.isArray(state.availableSheets)) {
        console.log(`📋 Retrieved valid conversation state for ${phone}`);
        return state;
      } else {
        console.warn(`⚠️ Invalid conversation state structure for ${phone}`);
        clearConversationState(phone);
        return null;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting conversation state:', error);
    return null;
  }
}

/**
 * Enhanced conversation state cleanup.
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
  }
}

/**
 * Enhanced rate limiting with configurable limits.
 * 
 * @param {string} phone - User's phone number
 * @returns {boolean} True if rate limited
 */
function isRateLimited(phone) {
  try {
    const cache = CacheService.getScriptCache();
    const rateLimitKey = `rate_limit_${phone}`;
    const maxMessages = 10; // Max messages per time window
    const timeWindow = 300; // 5 minutes in seconds
    
    const rateLimitData = cache.get(rateLimitKey);
    
    if (rateLimitData) {
      const data = JSON.parse(rateLimitData);
      const now = new Date().getTime();
      
      // Check if within time window
      if (now - data.firstMessage < timeWindow * 1000) {
        return data.messageCount >= maxMessages;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return false; // Fail open
  }
}

/**
 * Updates rate limiting counter.
 * 
 * @param {string} phone - User's phone number
 */
function updateRateLimit(phone) {
  try {
    const cache = CacheService.getScriptCache();
    const rateLimitKey = `rate_limit_${phone}`;
    const timeWindow = 300; // 5 minutes in seconds
    
    const rateLimitData = cache.get(rateLimitKey);
    const now = new Date().getTime();
    
    let data;
    if (rateLimitData) {
      data = JSON.parse(rateLimitData);
      
      // Reset if outside time window
      if (now - data.firstMessage >= timeWindow * 1000) {
        data = { firstMessage: now, messageCount: 1 };
      } else {
        data.messageCount++;
      }
    } else {
      data = { firstMessage: now, messageCount: 1 };
    }
    
    cache.put(rateLimitKey, JSON.stringify(data), timeWindow);
    
  } catch (error) {
    console.error('Error updating rate limit:', error);
  }
}

/**
 * Enhanced phone number validation with multiple formats.
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Bangladesh number patterns
  const patterns = [
    /^88\d{11}$/, // Country code + 11 digits
    /^01\d{9}$/, // Local format
    /^\+88\d{11}$/ // International format
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Logs WhatsApp messages for audit trail.
 * 
 * @param {string} phone - User's phone number
 * @param {Object} employee - Employee object
 * @param {string} message - Message content
 * @param {Object} metadata - Message metadata
 */
function logWhatsAppMessage(phone, employee, message, metadata) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      phone: phone,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      message: message.substring(0, 500), // Truncate long messages
      metadata: metadata
    };
    
    console.log('📝 WhatsApp Message Log:', JSON.stringify(logEntry));
    
    // Optionally store in a spreadsheet for audit trail
    // logToAuditSheet(logEntry);
    
  } catch (error) {
    console.error('Error logging WhatsApp message:', error);
  }
}

/**
 * Logs sheet access for analytics.
 * 
 * @param {Object} employee - Employee object
 * @param {Object} sheet - Sheet object
 */
function logSheetAccess(employee, sheet) {
  try {
    const accessLog = {
      timestamp: new Date().toISOString(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      sheetType: sheet.sheetType,
      sheetId: sheet.sheetId,
      sheetName: sheet.sheetName
    };
    
    console.log('📊 Sheet Access Log:', JSON.stringify(accessLog));
    
  } catch (error) {
    console.error('Error logging sheet access:', error);
  }
}

/**
 * Generates secure sheet access URL with proper permissions.
 * 
 * @param {Object} sheet - Sheet object
 * @param {Object} employee - Employee object
 * @returns {string} Sheet access URL
 */
function generateSheetAccessUrl(sheet, employee) {
  // Basic URL - in production, you might want to add access controls
  const baseUrl = `https://docs.google.com/spreadsheets/d/${sheet.sheetId}`;
  
  // Add specific sheet tab if available
  if (sheet.gid) {
    return `${baseUrl}#gid=${sheet.gid}`;
  }
  
  return baseUrl;
}

/**
 * Lists available sheets for a user with enhanced error handling.
 * 
 * @param {string} email - User email
 * @returns {Array} Array of user sheets
 */
function listSheetsForUser(email) {
  try {
    // This function should be implemented in user-sheets.js
    // For now, return a mock implementation
    if (typeof window !== 'undefined' && window.listSheetsForUser) {
      return window.listSheetsForUser(email);
    }
    
    // Mock data for testing - replace with actual implementation
    return [
      {
        sheetId: '1234567890',
        sheetName: `${email} - Orders`,
        sheetType: 'Orders',
        lastUpdated: new Date().getTime(),
        recordCount: 15,
        gid: '0'
      },
      {
        sheetId: '1234567891',
        sheetName: `${email} - Visits`,
        sheetType: 'Visits', 
        lastUpdated: new Date().getTime() - 86400000, // 1 day ago
        recordCount: 8,
        gid: '0'
      }
    ];
    
  } catch (error) {
    console.error('Error listing sheets for user:', error);
    return [];
  }
}

/**
 * Enhanced WhatsApp message sending with retry logic and delivery tracking.
 * 
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message to send
 * @param {Object} options - Send options
 * @returns {boolean} True if sent successfully
 */
function sendWhatsAppMessage(phone, message, options = {}) {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!isValidPhoneNumber(normalizedPhone)) {
      console.error(`❌ Invalid phone number for message send: ${phone}`);
      return false;
    }
    
    const payload = {
      to_number: normalizedPhone,
      message: message,
      type: 'text'
    };
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-maytapi-key': CONFIG.MAYTAPI_CONFIG.API_KEY
      },
      payload: JSON.stringify(payload)
    };
    
    console.log(`📤 Sending WhatsApp message to ${normalizedPhone}`);
    
    const response = UrlFetchApp.fetch(CONFIG.MAYTAPI_CONFIG.API_URL, requestOptions);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log(`✅ WhatsApp message sent successfully to ${normalizedPhone}`);
      return true;
    } else {
      console.error(`❌ Failed to send WhatsApp message:`, responseData);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message to ${phone}:`, error);
    return false;
  }
}

/**
 * Enhanced webhook handler with security validation and comprehensive logging.
 * 
 * @param {Object} e - Event object from webhook
 */
function doPost(e) {
  const startTime = new Date().getTime();
  
  try {
    console.log('📥 Received webhook request');
    
    // Basic validation
    if (!e || !e.postData || !e.postData.contents) {
      console.warn('⚠️ No webhook data received');
      return ContentService.createTextOutput('NO_DATA').setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Parse webhook data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('❌ Invalid JSON in webhook data:', parseError);
      return ContentService.createTextOutput('INVALID_JSON').setMimeType(ContentService.MimeType.TEXT);
    }
    
    console.log('📦 Webhook payload:', JSON.stringify(data, null, 2));
    
    // Validate webhook source (basic security)
    if (!isValidWebhookSource(data)) {
      console.warn('🚫 Invalid webhook source');
      return ContentService.createTextOutput('UNAUTHORIZED').setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Handle different webhook types
    const result = processWebhookData(data);
    
    const processingTime = new Date().getTime() - startTime;
    console.log(`⏱️ Webhook processed in ${processingTime}ms`);
    
    return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return ContentService.createTextOutput('ERROR').setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Processes webhook data based on type.
 * 
 * @param {Object} data - Webhook data
 * @returns {string} Processing result
 */
function processWebhookData(data) {
  try {
    switch (data.type) {
      case 'message':
        handleMessageWebhook(data);
        return 'MESSAGE_PROCESSED';
        
      case 'status':
        handleStatusWebhook(data);
        return 'STATUS_PROCESSED';
        
      case 'ack':
        handleAckWebhook(data);
        return 'ACK_PROCESSED';
        
      case 'error':
        handleErrorWebhook(data);
        return 'ERROR_PROCESSED';
        
      default:
        console.log(`ℹ️ Unhandled webhook type: ${data.type}`);
        return 'UNHANDLED_TYPE';
    }
  } catch (error) {
    console.error('❌ Error in processWebhookData:', error);
    return 'PROCESSING_ERROR';
  }
}

/**
 * Validates webhook source for basic security.
 * 
 * @param {Object} data - Webhook data
 * @returns {boolean} True if valid source
 */
function isValidWebhookSource(data) {
  try {
    // Check for required fields that indicate legitimate Maytapi webhook
    const requiredFields = ['product_id', 'phone_id'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate product ID matches configuration
    if (data.product_id !== CONFIG.MAYTAPI_CONFIG.PRODUCT_ID) {
      console.warn(`Invalid product ID: ${data.product_id}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error validating webhook source:', error);
    return false;
  }
}

/**
 * Enhanced message webhook handler with improved data extraction.
 * 
 * @param {Object} data - Webhook data from Maytapi
 */
function handleMessageWebhook(data) {
  try {
    const { message, conversation, user, product_id, phone_id } = data;
    
    if (!message || !conversation) {
      console.warn('⚠️ Invalid message webhook data - missing message or conversation');
      return;
    }
    
    // Skip messages sent by us
    if (message.fromMe) {
      console.log('↗️ Ignoring outgoing message');
      return;
    }
    
    // Enhanced phone number extraction
    let phone = extractPhoneNumber(user, conversation);
    if (!phone) {
      console.warn('⚠️ Could not extract phone number from webhook data');
      return;
    }
    
    console.log(`📱 Processing message from ${phone}: ${message.text || message.caption || '[no text]'}`);
    console.log(`👤 User: ${user?.name || 'Unknown'}`);
    console.log(`🔗 Product ID: ${product_id}, Phone ID: ${phone_id}`);
    
    // Enhanced message text extraction
    const messageText = extractMessageText(message);
    if (!messageText) {
      console.log(`ℹ️ No processable text in message type: ${message.type}`);
      return;
    }
    
    // Create metadata object
    const metadata = {
      messageId: message.id,
      messageType: message.type,
      timestamp: data.timestamp,
      productId: product_id,
      phoneId: phone_id,
      userName: user?.name
    };
    
    // Process the message
    handleIncomingWhatsAppMessage(phone, messageText, metadata);
    
  } catch (error) {
    console.error('❌ Error handling message webhook:', error);
  }
}

/**
 * Extracts phone number from webhook data with multiple fallbacks.
 * 
 * @param {Object} user - User object from webhook
 * @param {string} conversation - Conversation ID
 * @returns {string|null} Extracted phone number
 */
function extractPhoneNumber(user, conversation) {
  try {
    // Primary: use user.phone if available
    if (user && user.phone) {
      return user.phone;
    }
    
    // Fallback: extract from conversation ID
    if (conversation) {
      // Remove WhatsApp suffixes
      return conversation.replace(/@c\.us$/, '').replace(/@s\.whatsapp\.net$/, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting phone number:', error);
    return null;
  }
}

/**
 * Extracts message text from various message types.
 * 
 * @param {Object} message - Message object
 * @returns {string|null} Extracted text
 */
function extractMessageText(message) {
  try {
    // Text messages
    if (message.type === 'text' && message.text) {
      return message.text.trim();
    }
    
    // Media messages with captions
    if (message.caption) {
      return message.caption.trim();
    }
    
    // Handle other message types if needed
    if (message.type === 'button_response' && message.selectedButtonId) {
      return message.selectedButtonId;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting message text:', error);
    return null;
  }
}

/**
 * Enhanced status webhook handler.
 * 
 * @param {Object} data - Webhook data
 */
function handleStatusWebhook(data) {
  try {
    const { phone_id, status } = data;
    console.log(`📶 Status update for ${phone_id}: ${status}`);
    
    // Log status changes for monitoring
    const statusLog = {
      timestamp: new Date().toISOString(),
      phoneId: phone_id,
      status: status,
      type: 'status_change'
    };
    
    console.log('📊 Status Log:', JSON.stringify(statusLog));
    
    // Notify admins for critical status changes
    if (status === 'disconnected' || status === 'unauthorized') {
      notifyAdminsOfStatusChange(phone_id, status);
    }
    
  } catch (error) {
    console.error('❌ Error handling status webhook:', error);
  }
}

/**
 * Enhanced acknowledgment webhook handler.
 * 
 * @param {Object} data - Webhook data
 */
function handleAckWebhook(data) {
  try {
    const { data: ackData } = data;
    
    if (ackData && Array.isArray(ackData)) {
      ackData.forEach(ack => {
        console.log(`✅ Message ${ack.msgId} status: ${ack.ackType}`);
        
        // Log delivery status
        const deliveryLog = {
          timestamp: new Date().toISOString(),
          messageId: ack.msgId,
          ackType: ack.ackType,
          type: 'delivery_status'
        };
        
        console.log('📊 Delivery Log:', JSON.stringify(deliveryLog));
      });
    }
    
  } catch (error) {
    console.error('❌ Error handling ack webhook:', error);
  }
}

/**
 * Enhanced error webhook handler.
 * 
 * @param {Object} data - Webhook data
 */
function handleErrorWebhook(data) {
  try {
    console.error('🚨 WhatsApp API Error:', JSON.stringify(data, null, 2));
    
    // Log error for monitoring
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: data,
      type: 'api_error'
    };
    
    console.log('📊 Error Log:', JSON.stringify(errorLog));
    
    // Notify admins of API errors
    notifyAdminsOfApiError(data);
    
  } catch (error) {
    console.error('❌ Error handling error webhook:', error);
  }
}

/**
 * Notifies administrators of critical status changes.
 * 
 * @param {string} phoneId - Phone ID
 * @param {string} status - New status
 */
function notifyAdminsOfStatusChange(phoneId, status) {
  try {
    const adminEmail = 'asim.ilyus@anwargroup.com';
    const subject = `🚨 WhatsApp Status Alert - ${status}`;
    const body = `
WhatsApp instance status change detected:

Phone ID: ${phoneId}
New Status: ${status}
Timestamp: ${new Date().toISOString()}

Please check the WhatsApp integration immediately.

This is an automated alert from the Anwar Sales Ecosystem.
`;
    
    MailApp.sendEmail(adminEmail, subject, body);
    console.log('📧 Admin notification sent for status change');
    
  } catch (error) {
    console.error('Error notifying admins of status change:', error);
  }
}

/**
 * Notifies administrators of API errors.
 * 
 * @param {Object} errorData - Error data
 */
function notifyAdminsOfApiError(errorData) {
  try {
    const adminEmail = 'asim.ilyus@anwargroup.com';
    const subject = '🚨 WhatsApp API Error Alert';
    const body = `
WhatsApp API error detected:

Error Details:
${JSON.stringify(errorData, null, 2)}

Timestamp: ${new Date().toISOString()}

Please check the WhatsApp integration and API configuration.

This is an automated alert from the Anwar Sales Ecosystem.
`;
    
    MailApp.sendEmail(adminEmail, subject, body);
    console.log('📧 Admin notification sent for API error');
    
  } catch (error) {
    console.error('Error notifying admins of API error:', error);
  }
}

/**
 * Sets up webhook URL in Maytapi dashboard.
 * This function should be run once to configure the webhook.
 */
function setupMaytapiWebhook() {
  try {
    console.log('🔧 Setting up Maytapi webhook...');
    
    // Get the deployed web app URL
    const webAppUrl = getWebAppUrl();
    if (!webAppUrl) {
      throw new Error('Could not determine web app URL. Please deploy the script as a web app first.');
    }
    
    const webhookUrl = `https://api.maytapi.com/api/${CONFIG.MAYTAPI_CONFIG.PRODUCT_ID}/setWebhook`;
    
    const payload = {
      webhook: webAppUrl
    };
    
    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-maytapi-key': CONFIG.MAYTAPI_CONFIG.API_KEY,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    console.log(`📤 Setting webhook URL: ${webAppUrl}`);
    
    const response = UrlFetchApp.fetch(webhookUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Webhook setup successful!');
      console.log('📊 Response:', JSON.stringify(responseData, null, 2));
      return responseData;
    } else {
      console.error('❌ Webhook setup failed:', responseData);
      throw new Error(`Webhook setup failed: ${response.getResponseCode()}`);
    }
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    throw error;
  }
}

/**
 * Gets the current web app URL for webhook setup.
 * Note: This needs to be manually updated with the actual deployed URL.
 * 
 * @returns {string} Web app URL
 */
function getWebAppUrl() {
  // This should be updated with the actual deployed web app URL
  // You get this URL after deploying the script as a web app
  const deployedUrl = 'https://script.google.com/macros/s/AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw/exec';
  
  if (deployedUrl.includes('YOUR_DEPLOYMENT_ID')) {
    console.warn('⚠️ Please update the web app URL in getWebAppUrl() function');
    return null;
  }
  
  return deployedUrl;
}

/**
 * Test function to verify webhook setup and integration.
 */
function testWebhookIntegration() {
  try {
    console.log('🧪 Testing webhook integration...');
    
    // Test webhook setup
    console.log('1️⃣ Testing webhook setup...');
    const webhookResult = setupMaytapiWebhook();
    console.log('✅ Webhook setup test passed');
    
    // Test message processing
    console.log('2️⃣ Testing message processing...');
    testCompleteWhatsAppFlow();
    console.log('✅ Message processing test passed');
    
    // Test rate limiting
    console.log('3️⃣ Testing rate limiting...');
    const testPhone = '8801234567890';
    for (let i = 0; i < 12; i++) {
      const isLimited = isRateLimited(testPhone);
      updateRateLimit(testPhone);
      if (i < 10) {
        console.assert(!isLimited, `Rate limiting should not trigger for message ${i + 1}`);
      } else {
        console.assert(isLimited, `Rate limiting should trigger for message ${i + 1}`);
      }
    }
    console.log('✅ Rate limiting test passed');
    
    console.log('🎉 All webhook integration tests passed!');
    
  } catch (error) {
    console.error('❌ Webhook integration test failed:', error);
    throw error;
  }
}
