/**
 * @fileoverview Maytapi WhatsApp Integration Setup and Management
 * This script handles the complete setup and management of Maytapi WhatsApp webhook integration
 * including webhook configuration, testing, and monitoring.
 * 
 * Features:
 * - Automated webhook setup with Maytapi API
 * - Webhook URL validation and testing
 * - Integration health monitoring
 * - Error recovery and retry mechanisms
 * - Comprehensive logging and diagnostics
 */

/**
 * Main setup function to configure Maytapi webhook integration.
 * Run this function once to set up the complete WhatsApp integration.
 */
function setupMaytapiIntegration() {
  try {
    console.log('🚀 Starting Maytapi WhatsApp Integration Setup...');
    
    // Step 1: Validate configuration
    console.log('\n1️⃣ Validating configuration...');
    validateMaytapiConfig();
    console.log('✅ Configuration validation passed');
    
    // Step 2: Deploy and get webhook URL
    console.log('\n2️⃣ Getting webhook URL...');
    const webhookUrl = getWebhookUrl();
    console.log(`✅ Webhook URL: ${webhookUrl}`);
    
    // Step 3: Set up webhook with Maytapi
    console.log('\n3️⃣ Setting up webhook with Maytapi...');
    const webhookResponse = configureWebhook(webhookUrl);
    console.log('✅ Webhook configured successfully');
    
    // Step 4: Test webhook functionality
    console.log('\n4️⃣ Testing webhook functionality...');
    testWebhookSetup();
    console.log('✅ Webhook tests passed');
    
    // Step 5: Set up monitoring
    console.log('\n5️⃣ Setting up monitoring...');
    setupWebhookMonitoring();
    console.log('✅ Monitoring configured');
    
    console.log('\n🎉 Maytapi WhatsApp Integration Setup Complete!');
    console.log('\n📋 Setup Summary:');
    console.log(`   🔗 Webhook URL: ${webhookUrl}`);
    console.log(`   📱 Product ID: ${CONFIG.MAYTAPI_CONFIG.PRODUCT_ID}`);
    console.log(`   📞 Phone ID: ${CONFIG.MAYTAPI_CONFIG.PHONE_ID}`);
    console.log(`   ✅ Status: Active`);
    
    return {
      success: true,
      webhookUrl: webhookUrl,
      response: webhookResponse
    };
    
  } catch (error) {
    console.error('❌ Maytapi integration setup failed:', error);
    throw error;
  }
}

/**
 * Validates Maytapi configuration settings.
 * Throws error if configuration is invalid or missing.
 */
function validateMaytapiConfig() {
  const requiredFields = [
    'PRODUCT_ID',
    'PHONE_ID', 
    'API_KEY',
    'API_URL'
  ];
  
  for (const field of requiredFields) {
    if (!CONFIG.MAYTAPI_CONFIG[field]) {
      throw new Error(`Missing required Maytapi configuration: ${field}`);
    }
  }
  
  // Validate API key format
  const apiKey = CONFIG.MAYTAPI_CONFIG.API_KEY;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(apiKey)) {
    throw new Error('Invalid API key format. Expected UUID format.');
  }
  
  // Validate product ID format
  const productId = CONFIG.MAYTAPI_CONFIG.PRODUCT_ID;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(productId)) {
    throw new Error('Invalid product ID format. Expected UUID format.');
  }
  
  // Validate phone ID format
  const phoneId = CONFIG.MAYTAPI_CONFIG.PHONE_ID;
  if (!/^\d+$/.test(phoneId)) {
    throw new Error('Invalid phone ID format. Expected numeric value.');
  }
  
  console.log('✅ All configuration fields validated');
}

/**
 * Gets the current deployed webhook URL.
 * Auto-detects the URL or uses manual configuration.
 * 
 * @returns {string} Webhook URL
 */
function getWebhookUrl() {
  try {
    // Try to get the URL from ScriptApp
    const deploymentId = getDeploymentId();
    if (deploymentId) {
      return `https://script.google.com/macros/s/${deploymentId}/exec`;
    }
    
    // Fallback to manual configuration
    const manualUrl = CONFIG.MAYTAPI_CONFIG.WEBHOOK_URL;
    if (manualUrl && manualUrl !== 'YOUR_WEBHOOK_URL_HERE') {
      return manualUrl;
    }
    
    throw new Error('Could not determine webhook URL. Please deploy as web app first or set WEBHOOK_URL in config.');
    
  } catch (error) {
    console.error('Error getting webhook URL:', error);
    throw error;
  }
}

/**
 * Attempts to get the deployment ID from the current script.
 * This is a best-effort approach since ScriptApp doesn't directly provide this.
 * 
 * @returns {string|null} Deployment ID or null if not found
 */
function getDeploymentId() {
  try {
    // This is a workaround since ScriptApp doesn't directly provide deployment ID
    // In practice, you'll need to manually set this after deployment
    
    // Check if deployment ID is set in config
    if (CONFIG.MAYTAPI_CONFIG.DEPLOYMENT_ID) {
      return CONFIG.MAYTAPI_CONFIG.DEPLOYMENT_ID;
    }
    
    // For now, return null to force manual configuration
    return null;
    
  } catch (error) {
    console.error('Error getting deployment ID:', error);
    return null;
  }
}

/**
 * Configures webhook URL with Maytapi API.
 * 
 * @param {string} webhookUrl - Webhook URL to configure
 * @returns {Object} API response
 */
function configureWebhook(webhookUrl) {
  try {
    const apiUrl = `https://api.maytapi.com/api/${CONFIG.MAYTAPI_CONFIG.PRODUCT_ID}/setWebhook`;
    
    const payload = {
      webhook: webhookUrl
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
    
    console.log(`📤 Configuring webhook: ${webhookUrl}`);
    
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());
    
    if (responseCode === 200) {
      console.log('✅ Webhook configured successfully');
      console.log('📊 Response:', JSON.stringify(responseData, null, 2));
      
      // Validate response data
      validateWebhookResponse(responseData, webhookUrl);
      
      return responseData;
    } else {
      console.error(`❌ Webhook configuration failed with code ${responseCode}:`, responseData);
      throw new Error(`Webhook configuration failed: ${responseCode} - ${JSON.stringify(responseData)}`);
    }
    
  } catch (error) {
    console.error('❌ Error configuring webhook:', error);
    throw error;
  }
}

/**
 * Validates webhook configuration response from Maytapi.
 * 
 * @param {Object} response - API response
 * @param {string} expectedUrl - Expected webhook URL
 */
function validateWebhookResponse(response, expectedUrl) {
  if (!response.webhook || response.webhook !== expectedUrl) {
    throw new Error(`Webhook URL mismatch. Expected: ${expectedUrl}, Got: ${response.webhook}`);
  }
  
  if (!response.ack_delivery) {
    console.warn('⚠️ ACK delivery is disabled. Message delivery status won\'t be tracked.');
  }
  
  if (response.phone_limit && response.phone_limit < 1) {
    throw new Error('Phone limit is 0. Cannot send/receive messages.');
  }
  
  console.log('✅ Webhook response validated');
}

/**
 * Tests webhook setup by sending a test message.
 */
function testWebhookSetup() {
  try {
    console.log('🧪 Testing webhook setup...');
    
    // Test 1: Webhook endpoint accessibility
    console.log('   Testing webhook endpoint...');
    testWebhookEndpoint();
    
    // Test 2: Employee lookup functionality
    console.log('   Testing employee lookup...');
    testEmployeeLookup();
    
    // Test 3: Message processing
    console.log('   Testing message processing...');
    testMessageProcessing();
    
    console.log('✅ All webhook tests passed');
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    throw error;
  }
}

/**
 * Tests if webhook endpoint is accessible and responding.
 */
function testWebhookEndpoint() {
  try {
    const webhookUrl = getWebhookUrl();
    
    // Create a test POST request to simulate webhook call
    const testPayload = {
      test: true,
      timestamp: new Date().getTime()
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(testPayload)
    };
    
    // Note: This will test the endpoint but won't trigger normal webhook processing
    // due to missing required fields
    const response = UrlFetchApp.fetch(webhookUrl, options);
    
    if (response.getResponseCode() === 200) {
      console.log('   ✅ Webhook endpoint is accessible');
    } else {
      throw new Error(`Webhook endpoint returned ${response.getResponseCode()}`);
    }
    
  } catch (error) {
    console.error('   ❌ Webhook endpoint test failed:', error);
    throw error;
  }
}

/**
 * Tests employee lookup functionality.
 */
function testEmployeeLookup() {
  try {
    // Create a test employee for lookup
    const testEmployee = {
      name: 'Webhook Test User',
      role: 'BDO',
      email: 'webhook.test@anwarsales.com',
      contactNumber: '8801234567890',
      whatsappNumber: '8801234567890',
      bkashNumber: '01234567890',
      nidNo: '1234567890123',
      status: 'Active'
    };
    
    // Try to find existing employee first
    let employee = findEmployeeByWhatsApp('8801234567890');
    
    if (!employee) {
      // Add test employee
      const employeeId = addEmployee(testEmployee);
      if (!employeeId) {
        throw new Error('Failed to create test employee');
      }
      
      // Verify lookup works
      employee = findEmployeeByWhatsApp('8801234567890');
      if (!employee) {
        throw new Error('Employee lookup failed after creation');
      }
    }
    
    console.log('   ✅ Employee lookup working correctly');
    
  } catch (error) {
    console.error('   ❌ Employee lookup test failed:', error);
    throw error;
  }
}

/**
 * Tests message processing logic.
 */
function testMessageProcessing() {
  try {
    const testPhone = '8801234567890';
    const testMessage = 'need to see data';
    
    // This will test the message processing without actually sending WhatsApp messages
    // by temporarily overriding the sendWhatsAppMessage function
    const originalSend = globalThis.sendWhatsAppMessage;
    let messagesSent = [];
    
    globalThis.sendWhatsAppMessage = function(phone, message) {
      messagesSent.push({ phone, message });
      console.log(`   📤 Mock message to ${phone}: ${message.substring(0, 50)}...`);
      return true;
    };
    
    try {
      // Test message processing
      handleIncomingWhatsAppMessage(testPhone, testMessage);
      
      if (messagesSent.length === 0) {
        throw new Error('No messages were sent during test');
      }
      
      console.log(`   ✅ Message processing working (${messagesSent.length} messages sent)`);
      
    } finally {
      // Restore original function
      if (originalSend) {
        globalThis.sendWhatsAppMessage = originalSend;
      }
    }
    
  } catch (error) {
    console.error('   ❌ Message processing test failed:', error);
    throw error;
  }
}

/**
 * Sets up webhook monitoring and health checks.
 */
function setupWebhookMonitoring() {
  try {
    console.log('📊 Setting up webhook monitoring...');
    
    // Create monitoring triggers
    setupMonitoringTriggers();
    
    // Initialize monitoring data
    initializeMonitoringData();
    
    console.log('✅ Monitoring setup complete');
    
  } catch (error) {
    console.error('❌ Error setting up monitoring:', error);
    throw error;
  }
}

/**
 * Creates time-based triggers for monitoring.
 */
function setupMonitoringTriggers() {
  try {
    // Delete existing monitoring triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'monitorWebhookHealth') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new monitoring trigger (every 15 minutes)
    ScriptApp.newTrigger('monitorWebhookHealth')
      .timeBased()
      .everyMinutes(15)
      .create();
    
    console.log('   ✅ Monitoring triggers created');
    
  } catch (error) {
    console.error('   ❌ Error creating monitoring triggers:', error);
  }
}

/**
 * Initializes monitoring data storage.
 */
function initializeMonitoringData() {
  try {
    const cache = CacheService.getScriptCache();
    
    const monitoringData = {
      setupTimestamp: new Date().getTime(),
      lastHealthCheck: new Date().getTime(),
      webhookUrl: getWebhookUrl(),
      status: 'active',
      messageCount: 0,
      errorCount: 0
    };
    
    cache.put('webhook_monitoring', JSON.stringify(monitoringData), 21600); // 6 hours
    
    console.log('   ✅ Monitoring data initialized');
    
  } catch (error) {
    console.error('   ❌ Error initializing monitoring data:', error);
  }
}

/**
 * Monitors webhook health and performance.
 * This function is called by a time-based trigger.
 */
function monitorWebhookHealth() {
  try {
    console.log('🔍 Monitoring webhook health...');
    
    const cache = CacheService.getScriptCache();
    const monitoringDataJson = cache.get('webhook_monitoring');
    
    if (!monitoringDataJson) {
      console.warn('⚠️ No monitoring data found. Reinitializing...');
      initializeMonitoringData();
      return;
    }
    
    const monitoringData = JSON.parse(monitoringDataJson);
    
    // Check webhook status with Maytapi
    const webhookStatus = checkWebhookStatus();
    
    // Update monitoring data
    monitoringData.lastHealthCheck = new Date().getTime();
    monitoringData.webhookStatus = webhookStatus;
    
    // Check for issues
    const issues = detectHealthIssues(monitoringData);
    
    if (issues.length > 0) {
      console.warn('⚠️ Health issues detected:', issues);
      notifyAdminsOfHealthIssues(issues);
    } else {
      console.log('✅ Webhook health check passed');
    }
    
    // Save updated monitoring data
    cache.put('webhook_monitoring', JSON.stringify(monitoringData), 21600);
    
  } catch (error) {
    console.error('❌ Error monitoring webhook health:', error);
  }
}

/**
 * Checks current webhook status with Maytapi API.
 * 
 * @returns {Object} Webhook status information
 */
function checkWebhookStatus() {
  try {
    const apiUrl = `https://api.maytapi.com/api/${CONFIG.MAYTAPI_CONFIG.PRODUCT_ID}`;
    
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-maytapi-key': CONFIG.MAYTAPI_CONFIG.API_KEY
      }
    };
    
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    return {
      status: 'active',
      response: responseData,
      timestamp: new Date().getTime()
    };
    
  } catch (error) {
    console.error('Error checking webhook status:', error);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().getTime()
    };
  }
}

/**
 * Detects potential health issues with the webhook integration.
 * 
 * @param {Object} monitoringData - Current monitoring data
 * @returns {Array} Array of detected issues
 */
function detectHealthIssues(monitoringData) {
  const issues = [];
  const now = new Date().getTime();
  
  // Check if webhook status is error
  if (monitoringData.webhookStatus && monitoringData.webhookStatus.status === 'error') {
    issues.push({
      type: 'webhook_error',
      message: 'Webhook API check failed',
      details: monitoringData.webhookStatus.error
    });
  }
  
  // Check if last health check was too long ago
  const lastCheckAge = now - monitoringData.lastHealthCheck;
  if (lastCheckAge > 30 * 60 * 1000) { // 30 minutes
    issues.push({
      type: 'stale_monitoring',
      message: 'Health check hasn\'t run recently',
      details: `Last check: ${new Date(monitoringData.lastHealthCheck).toISOString()}`
    });
  }
  
  // Check error rate
  if (monitoringData.errorCount > 0 && monitoringData.messageCount > 0) {
    const errorRate = monitoringData.errorCount / monitoringData.messageCount;
    if (errorRate > 0.1) { // 10% error rate
      issues.push({
        type: 'high_error_rate',
        message: 'High error rate detected',
        details: `Error rate: ${(errorRate * 100).toFixed(1)}%`
      });
    }
  }
  
  return issues;
}

/**
 * Notifies administrators of health issues.
 * 
 * @param {Array} issues - Array of detected issues
 */
function notifyAdminsOfHealthIssues(issues) {
  try {
    const adminEmail = 'asim.ilyus@anwargroup.com';
    const subject = '🚨 WhatsApp Webhook Health Alert';
    
    let body = `WhatsApp webhook health issues detected:\n\n`;
    
    issues.forEach((issue, index) => {
      body += `${index + 1}. ${issue.type.toUpperCase()}\n`;
      body += `   Message: ${issue.message}\n`;
      body += `   Details: ${issue.details}\n\n`;
    });
    
    body += `Timestamp: ${new Date().toISOString()}\n\n`;
    body += `Please check the WhatsApp integration configuration and logs.\n\n`;
    body += `This is an automated alert from the Anwar Sales Ecosystem.`;
    
    MailApp.sendEmail(adminEmail, subject, body);
    console.log('📧 Health issue notification sent to admins');
    
  } catch (error) {
    console.error('Error notifying admins of health issues:', error);
  }
}

/**
 * Gets current webhook monitoring status.
 * 
 * @returns {Object} Current monitoring status
 */
function getWebhookMonitoringStatus() {
  try {
    const cache = CacheService.getScriptCache();
    const monitoringDataJson = cache.get('webhook_monitoring');
    
    if (!monitoringDataJson) {
      return { status: 'not_initialized' };
    }
    
    const monitoringData = JSON.parse(monitoringDataJson);
    
    return {
      status: 'active',
      data: monitoringData,
      uptime: new Date().getTime() - monitoringData.setupTimestamp,
      lastCheck: new Date(monitoringData.lastHealthCheck).toISOString()
    };
    
  } catch (error) {
    console.error('Error getting monitoring status:', error);
    return { status: 'error', error: error.message };
  }
}

/**
 * Resets webhook configuration and monitoring.
 * Use this function to completely reset the integration.
 */
function resetWebhookIntegration() {
  try {
    console.log('🔄 Resetting webhook integration...');
    
    // Clear monitoring data
    const cache = CacheService.getScriptCache();
    cache.remove('webhook_monitoring');
    
    // Delete monitoring triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'monitorWebhookHealth') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    console.log('✅ Webhook integration reset complete');
    console.log('💡 Run setupMaytapiIntegration() to reconfigure');
    
  } catch (error) {
    console.error('❌ Error resetting webhook integration:', error);
    throw error;
  }
}

/**
 * Displays comprehensive webhook integration status.
 */
function showWebhookStatus() {
  try {
    console.log('📊 WhatsApp Webhook Integration Status');
    console.log('=====================================');
    
    // Configuration status
    console.log('\n🔧 Configuration:');
    try {
      validateMaytapiConfig();
      console.log('   ✅ Configuration valid');
    } catch (error) {
      console.log(`   ❌ Configuration invalid: ${error.message}`);
    }
    
    // Webhook URL
    console.log('\n🔗 Webhook URL:');
    try {
      const webhookUrl = getWebhookUrl();
      console.log(`   ✅ ${webhookUrl}`);
    } catch (error) {
      console.log(`   ❌ ${error.message}`);
    }
    
    // Monitoring status
    console.log('\n📊 Monitoring:');
    const monitoringStatus = getWebhookMonitoringStatus();
    if (monitoringStatus.status === 'active') {
      console.log('   ✅ Active');
      console.log(`   📅 Last check: ${monitoringStatus.lastCheck}`);
      console.log(`   ⏱️ Uptime: ${Math.round(monitoringStatus.uptime / 1000 / 60)} minutes`);
    } else {
      console.log(`   ❌ ${monitoringStatus.status}`);
    }
    
    // API connectivity
    console.log('\n🌐 API Connectivity:');
    try {
      const apiStatus = checkWebhookStatus();
      if (apiStatus.status === 'active') {
        console.log('   ✅ Connected to Maytapi API');
      } else {
        console.log(`   ❌ API Error: ${apiStatus.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
    
    console.log('\n=====================================');
    
  } catch (error) {
    console.error('❌ Error showing webhook status:', error);
  }
}

/**
 * Quick setup function for development/testing.
 * This creates a minimal setup without full monitoring.
 */
function quickSetupWebhook() {
  try {
    console.log('⚡ Quick webhook setup...');
    
    validateMaytapiConfig();
    const webhookUrl = getWebhookUrl();
    const response = configureWebhook(webhookUrl);
    
    console.log('✅ Quick setup complete!');
    return response;
    
  } catch (error) {
    console.error('❌ Quick setup failed:', error);
    throw error;
  }
}
