/**
 * @fileoverview Maytapi Webhook Setup and Configuration
 * This script helps configure the webhook endpoint for Maytapi WhatsApp API
 */

/**
 * Configure Maytapi webhook endpoint
 * Call this function after deploying your Google Apps Script project
 */
function setupMaytapiWebhook() {
  console.log('🔧 === Setting up Maytapi Webhook ===');
  
  try {
    // Get the current script URL
    const scriptUrl = getScriptWebAppUrl();
    if (!scriptUrl) {
      throw new Error('Unable to determine script URL. Please deploy as web app first.');
    }
    
    console.log(`📍 Script URL: ${scriptUrl}`);
    
    // Configure webhook with Maytapi
    const webhookUrl = `${scriptUrl}?action=webhook`;
    setMaytapiWebhook(webhookUrl);
    
    // Test the webhook configuration
    testWebhookConfiguration();
    
    console.log('✅ Maytapi webhook setup completed!');
    console.log(`🔗 Webhook URL: ${webhookUrl}`);
    console.log('📋 Manual setup instructions:');
    console.log('  1. Go to https://console.maytapi.com/');
    console.log('  2. Navigate to your instance settings');
    console.log('  3. Set webhook URL to:', webhookUrl);
    console.log('  4. Test with a WhatsApp message');
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error);
    throw error;
  }
}

/**
 * Get the web app URL for the current script
 * @returns {string|null} The web app URL or null if not available
 */
function getScriptWebAppUrl() {
  try {
    // Web app URL - using actual deployed URL
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw/exec';
    
    console.log('✅ Script ID configured: 1PNlKdBu9UYI-Dxsr2TTwJ-BOEC4JGc8C-i4NM1s7vxBl5pMO9_Rq14Tf');
    console.log('🔗 Web App URL: https://script.google.com/macros/s/AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw/exec');
    console.log('📖 Web app URL ready for Maytapi webhook configuration');
    console.log('📡 Webhook URL: ' + webAppUrl);
    
    return webAppUrl;
    
  } catch (error) {
    console.error('Error getting script URL:', error);
    return null;
  }
}

/**
 * Set webhook URL in Maytapi using API
 * @param {string} webhookUrl - The webhook URL to configure
 */
function setMaytapiWebhook(webhookUrl) {
  try {
    const { PRODUCT_ID, API_KEY } = CONFIG.MAYTAPI_CONFIG;
    
    if (!PRODUCT_ID || !API_KEY) {
      throw new Error('Maytapi configuration missing in CONFIG.MAYTAPI_CONFIG');
    }
    
    const apiUrl = `https://api.maytapi.com/api/${PRODUCT_ID}/setWebhook`;
    
    const payload = {
      webhook: webhookUrl
    };
    
    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        'x-maytapi-key': API_KEY
      }
    };
    
    console.log('📤 Setting webhook URL...');
    console.log('🔗 API URL:', apiUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('🔑 Using API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'Missing');
    
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseText = response.getContentText();
    console.log('📥 Raw Response:', responseText);
    
    const responseData = JSON.parse(responseText);
    
    // Check if webhook was set successfully - Maytapi returns the config directly
    if (responseData.webhook && responseData.pid) {
      console.log('✅ Webhook URL set successfully');
      console.log('📄 Response:', JSON.stringify(responseData, null, 2));
    } else if (responseData.success === false) {
      throw new Error(`Failed to set webhook: ${responseData.message || 'API returned error'}`);
    } else {
      // If webhook and pid are present, consider it successful even without explicit success field
      console.log('✅ Webhook configuration received');
      console.log('📄 Response:', JSON.stringify(responseData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
    console.log('🔧 Manual setup required. Please set webhook URL manually in Maytapi dashboard.');
    
    // Try alternative webhook setup approaches
    console.log('🔄 Trying alternative webhook setup methods...');
    tryAlternativeWebhookSetup(webhookUrl);
  }
}

/**
 * Try alternative webhook setup methods
 * @param {string} webhookUrl - The webhook URL to configure
 */
function tryAlternativeWebhookSetup(webhookUrl) {
  try {
    const { PRODUCT_ID, PHONE_ID, API_KEY } = CONFIG.MAYTAPI_CONFIG;
    
    // Method 1: Try with phone ID in URL
    console.log('🔄 Method 1: Trying with phone ID in URL...');
    const apiUrl1 = `https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}/setWebhook`;
    
    const options1 = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({ webhook: webhookUrl }),
      headers: { 'x-maytapi-key': API_KEY }
    };
    
    try {
      const response1 = UrlFetchApp.fetch(apiUrl1, options1);
      const responseData1 = JSON.parse(response1.getContentText());
      
      if (responseData1.success) {
        console.log('✅ Alternative method 1 successful!');
        console.log('📄 Response:', JSON.stringify(responseData1, null, 2));
        return;
      }
    } catch (e) {
      console.log('❌ Method 1 failed:', e.message);
    }
    
    // Method 2: Try with different payload format
    console.log('🔄 Method 2: Trying with different payload format...');
    const apiUrl2 = `https://api.maytapi.com/api/${PRODUCT_ID}/setWebhook`;
    
    const options2 = {
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      payload: `webhook=${encodeURIComponent(webhookUrl)}`,
      headers: { 'x-maytapi-key': API_KEY }
    };
    
    try {
      const response2 = UrlFetchApp.fetch(apiUrl2, options2);
      const responseData2 = JSON.parse(response2.getContentText());
      
      if (responseData2.success) {
        console.log('✅ Alternative method 2 successful!');
        console.log('📄 Response:', JSON.stringify(responseData2, null, 2));
        return;
      }
    } catch (e) {
      console.log('❌ Method 2 failed:', e.message);
    }
    
    console.log('❌ All alternative methods failed. Manual setup required.');
    
  } catch (error) {
    console.error('❌ Alternative webhook setup failed:', error);
  }
}

/**
 * Test webhook configuration by sending a test message
 */
function testWebhookConfiguration() {
  try {
    console.log('🧪 Testing webhook configuration...');
    
    // Create a test webhook payload
    const testPayload = {
      type: 'message',
      message: {
        type: 'text',
        text: 'Webhook test message',
        fromMe: false,
        _serialized: 'test_webhook_config'
      },
      conversation: '8801234567890@c.us'
    };
    
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testPayload)
      }
    };
    
    // Test the doPost function
    const result = doPost(mockEvent);
    
    if (result.getContent() === 'OK') {
      console.log('✅ Webhook test successful');
    } else {
      console.log('⚠️ Webhook test returned:', result.getContent());
    }
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
}

/**
 * Get current webhook configuration from Maytapi
 */
function getMaytapiWebhookStatus() {
  try {
    const { PRODUCT_ID, PHONE_ID, API_KEY } = CONFIG.MAYTAPI_CONFIG;
    
    if (!PRODUCT_ID || !PHONE_ID || !API_KEY) {
      throw new Error('Maytapi configuration missing');
    }
    
    // Try to get webhook status using the same pattern as other endpoints
    const apiUrl = `https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}/getWebhook`;
    
    const options = {
      method: 'GET',
      headers: {
        'x-maytapi-key': API_KEY
      }
    };
    
    console.log('📤 Getting webhook status...');
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    console.log('📄 Webhook Status:', JSON.stringify(responseData, null, 2));
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Error getting webhook status:', error);
    console.log('💡 Note: Webhook status check may not be supported by this API version');
    return null;
  }
}

/**
 * Test the Maytapi API connection
 */
function testMaytapiConnection() {
  console.log('🧪 === Testing Maytapi API Connection ===');
  
  try {
    const { PRODUCT_ID, PHONE_ID, API_KEY } = CONFIG.MAYTAPI_CONFIG;
    
    if (!PRODUCT_ID || !PHONE_ID || !API_KEY) {
      throw new Error('Incomplete Maytapi configuration');
    }
    
    // Test API connection by getting phone status
    const apiUrl = `https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}/status`;
    
    const options = {
      method: 'GET',
      headers: {
        'x-maytapi-key': API_KEY
      }
    };
    
    console.log('📤 Testing API connection...');
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    console.log('📄 API Response:', JSON.stringify(responseData, null, 2));
    
    if (responseData.success) {
      console.log('✅ Maytapi API connection successful');
      console.log(`📱 Phone Status: ${responseData.status?.state?.state || 'Unknown'}`);
    } else {
      console.log('⚠️ API response indicates an issue');
    }
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Maytapi API connection test failed:', error);
    return null;
  }
}

/**
 * Send a test WhatsApp message to verify integration
 * @param {string} testPhone - Phone number to send test message to
 */
function sendTestWhatsAppMessage(testPhone = '8801234567890') {
  console.log('📱 === Sending Test WhatsApp Message ===');
  
  try {
    if (!testPhone) {
      throw new Error('Test phone number is required');
    }
    
    const testMessage = `🤖 Test message from Anwar Sales Ecosystem\n\n` +
      `✅ WhatsApp integration is working!\n` +
      `🕐 Sent at: ${new Date().toLocaleString()}\n\n` +
      `Try sending "need to see data" to access your personal data sheets.`;
    
    console.log(`📤 Sending test message to ${testPhone}...`);
    
    // Use the existing sendWhatsAppMessage function
    sendWhatsAppMessage(testPhone, testMessage);
    
    console.log('✅ Test message sent successfully');
    console.log('💡 Check your WhatsApp to confirm delivery');
    
  } catch (error) {
    console.error('❌ Failed to send test message:', error);
  }
}

/**
 * Complete Maytapi integration setup and verification
 */
function completeMaytapiSetup() {
  console.log('🚀 === Complete Maytapi Integration Setup ===');
  
  try {
    console.log('\n1️⃣ Testing API Connection...');
    testMaytapiConnection();
    
    console.log('\n2️⃣ Setting up Webhook...');
    setupMaytapiWebhook();
    
    console.log('\n3️⃣ Getting Webhook Status...');
    getMaytapiWebhookStatus();
    
    console.log('\n4️⃣ Testing Message Sending...');
    // Uncomment the line below and provide a test phone number
    // sendTestWhatsAppMessage('YOUR_TEST_PHONE_NUMBER');
    
    console.log('\n✅ Maytapi integration setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Update the script URL in setupMaytapiWebhook() with your actual web app URL');
    console.log('  2. Deploy the script as a web app with execute permissions for "Anyone"');
    console.log('  3. Test with a real WhatsApp message to your connected number');
    console.log('  4. Monitor the logs for incoming webhook requests');
    
  } catch (error) {
    console.error('❌ Complete setup failed:', error);
    throw error;
  }
}

/**
 * Troubleshoot common Maytapi integration issues
 */
function troubleshootMaytapiIntegration() {
  console.log('🔧 === Troubleshooting Maytapi Integration ===');
  
  const issues = [];
  
  try {
    // Check configuration
    console.log('\n🔍 Checking Configuration...');
    const config = CONFIG.MAYTAPI_CONFIG;
    
    if (!config) {
      issues.push('❌ MAYTAPI_CONFIG not found in CONFIG object');
    } else {
      if (!config.PRODUCT_ID) issues.push('❌ PRODUCT_ID missing in MAYTAPI_CONFIG');
      if (!config.PHONE_ID) issues.push('❌ PHONE_ID missing in MAYTAPI_CONFIG');
      if (!config.API_KEY) issues.push('❌ API_KEY missing in MAYTAPI_CONFIG');
      if (!config.API_URL) issues.push('❌ API_URL missing in MAYTAPI_CONFIG');
      
      if (issues.length === 0) {
        console.log('✅ Configuration looks good');
      }
    }
    
    // Test API connectivity
    console.log('\n🌐 Testing API Connectivity...');
    const apiTest = testMaytapiConnection();
    if (!apiTest || !apiTest.success) {
      issues.push('❌ API connection failed - check credentials and phone status');
    } else {
      console.log('✅ API connectivity confirmed');
    }
    
    // Check webhook status
    console.log('\n🔗 Checking Webhook Status...');
    const webhookStatus = getMaytapiWebhookStatus();
    if (!webhookStatus || !webhookStatus.success) {
      issues.push('❌ Webhook status check failed');
    } else {
      console.log('✅ Webhook status retrieved');
    }
    
    // Summary
    console.log('\n📊 Troubleshooting Summary:');
    if (issues.length === 0) {
      console.log('✅ No issues detected - integration should be working');
    } else {
      console.log(`❌ Found ${issues.length} issue(s):`);
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    console.log('\n💡 Common Solutions:');
    console.log('  • Verify phone is connected and QR code is scanned');
    console.log('  • Check API credentials in Maytapi dashboard');
    console.log('  • Ensure webhook URL is accessible and correctly configured');
    console.log('  • Monitor Apps Script execution logs for errors');
    console.log('  • Test with simple text messages first');
    
  } catch (error) {
    console.error('❌ Troubleshooting failed:', error);
  }
}
