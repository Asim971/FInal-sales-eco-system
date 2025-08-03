/**
 * @fileoverview Comprehensive notification system for the Anwar Sales Ecosystem.
 * Implements role-based notification hierarchy as per FORM_SUBMISSION_NOTIFICATION_GUIDE.md
 */

/**
 * Sends a WhatsApp message using the Maytapi API.
 * @param {string} phone The phone number to send the message to.
 * @param {string} message The message to send.
 * @param {Object} options Optional settings for the message.
 */
function sendWhatsAppMessage(phone, message, options = {}) {
  const { API_URL, API_KEY, MAX_MESSAGE_LENGTH } = CONFIG.MAYTAPI_CONFIG;

  // Truncate message if too long
  let finalMessage = message;
  if (message.length > MAX_MESSAGE_LENGTH) {
    finalMessage = message.substring(0, MAX_MESSAGE_LENGTH - 50) + '\n\n[Message truncated due to length]';
  }

  const payload = {
    'to_number': phone,
    'type': 'text',
    'message': finalMessage
  };

  const requestOptions = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-maytapi-key': API_KEY
    }
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, requestOptions);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.success) {
      Logger.log(`✅ WhatsApp message sent successfully to ${phone}`);
      return { success: true, response: responseData };
    } else {
      Logger.log(`❌ WhatsApp API error: ${responseData.message || 'Unknown error'}`);
      return { success: false, error: responseData.message };
    }
  } catch (error) {
    Logger.log(`❌ Error sending WhatsApp message to ${phone}: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Sends email notification
 * @param {string} email Recipient email address
 * @param {string} subject Email subject
 * @param {string} body Email body
 * @param {Object} options Optional email settings
 */
function sendEmailNotification(email, subject, body, options = {}) {
  try {
    const config = CONFIG.NOTIFICATION_CONFIG.EMAIL_NOTIFICATIONS;
    
    if (!config.ENABLED) {
      Logger.log('📧 Email notifications are disabled');
      return { success: false, reason: 'Email notifications disabled' };
    }

    const finalSubject = config.SUBJECT_PREFIX + subject;
    
    const emailOptions = {
      name: 'Anwar Sales Ecosystem',
      replyTo: 'noreply@anwargroup.com'
    };

    if (config.INCLUDE_HTML && options.htmlBody) {
      emailOptions.htmlBody = options.htmlBody;
    }

    if (options.cc) {
      emailOptions.cc = options.cc;
    }

    MailApp.sendEmail(email, finalSubject, body, emailOptions);
    
    Logger.log(`✅ Email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ Error sending email to ${email}: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Central notification dispatcher - implements role-based notification hierarchy
 * @param {Object} notificationData Notification data object
 */
function sendFormNotification(notificationData) {
  try {
    if (!CONFIG.NOTIFICATION_CONFIG.ENABLED) {
      Logger.log('📢 Notifications are disabled in configuration');
      return { success: false, reason: 'Notifications disabled' };
    }

    // Validate required data
    if (!notificationData.formType || !notificationData.submitterEmail || !notificationData.formData) {
      throw new Error('Missing required notification data: formType, submitterEmail, or formData');
    }

    Logger.log(`📢 Processing notification for ${notificationData.formType} from ${notificationData.submitterEmail}`);

    // Determine submitter role and territory
    const submitterInfo = getSubmitterInfo(notificationData.submitterEmail);
    
    // Always send confirmation to submitter first (unless it's a status update notification)
    if (!notificationData.formType.includes('_STATUS_UPDATE') && 
        !notificationData.formType.includes('_APPROVAL') && 
        !notificationData.formType.includes('_REJECTION')) {
      sendSubmitterConfirmation(notificationData, submitterInfo);
    }
    
    // Get notification recipients based on form type and submitter role
    const recipients = getNotificationRecipients(
      notificationData.formType,
      submitterInfo.role,
      submitterInfo.territory,
      notificationData.territory
    );

    if (recipients.length === 0) {
      Logger.log('⚠️ No notification recipients found, using fallback');
      return sendFallbackNotification(notificationData);
    }

    // Send notifications at different levels with timing
    const results = sendTimedNotifications(recipients, notificationData, submitterInfo);
    
    Logger.log(`✅ Notification processing completed for ${notificationData.formType}`);
    return { success: true, results: results };

  } catch (error) {
    Logger.log(`❌ Error in sendFormNotification: ${error.toString()}`);
    return sendEmergencyNotification(notificationData, error);
  }
}

/**
 * Sends confirmation message to form submitter
 * @param {Object} notificationData Notification data object
 * @param {Object} submitterInfo Submitter information
 */
function sendSubmitterConfirmation(notificationData, submitterInfo) {
  try {
    Logger.log(`📧 Sending confirmation to submitter: ${notificationData.submitterEmail}`);
    
    // Generate submitter confirmation message
    const confirmationMessage = generateSubmitterConfirmationMessage(notificationData, submitterInfo);
    
    // Send WhatsApp confirmation if submitter has WhatsApp number
    if (submitterInfo.whatsappNumber) {
      const whatsappResult = sendWhatsAppMessage(submitterInfo.whatsappNumber, confirmationMessage);
      Logger.log(`📱 WhatsApp confirmation sent to submitter: ${whatsappResult.success}`);
    }
    
    // Send email confirmation if email notifications are enabled
    if (CONFIG.NOTIFICATION_CONFIG.EMAIL_NOTIFICATIONS.ENABLED && notificationData.submitterEmail) {
      const emailSubject = `Confirmation: ${notificationData.formType} Submitted Successfully`;
      const emailBody = generateSubmitterConfirmationEmail(notificationData, submitterInfo);
      const emailResult = sendEmailNotification(notificationData.submitterEmail, emailSubject, emailBody);
      Logger.log(`📧 Email confirmation sent to submitter: ${emailResult.success}`);
    }
    
    return { success: true };
    
  } catch (error) {
    Logger.log(`❌ Error sending submitter confirmation: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Generates confirmation message for submitter
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @return {string} Formatted confirmation message
 */
function generateSubmitterConfirmationMessage(notificationData, submitterInfo) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  
  let message = `✅ **FORM SUBMITTED SUCCESSFULLY**\n\n`;
  
  message += `📋 **Form Type:** ${notificationData.formType.replace(/_/g, ' ')}\n`;
  message += `🕐 **Submission Time:** ${timestamp}\n`;
  
  if (submitterInfo.name) {
    message += `👤 **Submitted By:** ${submitterInfo.name}\n`;
  }
  
  if (notificationData.territory) {
    message += `🌍 **Territory:** ${notificationData.territory}\n`;
  }
  
  message += `\n📝 **Submitted Details:**\n`;
  
  // Add key form data
  Object.entries(notificationData.formData).forEach(([key, value]) => {
    if (value && key !== 'email' && key !== 'timestamp' && !key.includes('Link') && !key.includes('Upload')) {
      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      message += `• **${displayKey}:** ${value}\n`;
    }
  });
  
  message += `\n🔄 **Next Steps:**\n`;
  message += `• Your submission is being reviewed by the appropriate team\n`;
  message += `• You will receive updates on the approval status\n`;
  message += `• For urgent queries, contact your territory manager\n\n`;
  
  message += `Thank you for your submission!\n`;
  message += `Anwar Sales Ecosystem - Automated Confirmation`;
  
  return message;
}

/**
 * Generates confirmation email body for submitter
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @return {string} Formatted email body
 */
function generateSubmitterConfirmationEmail(notificationData, submitterInfo) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  
  let body = `Dear ${submitterInfo.name || 'User'},\n\n`;
  body += `Your ${notificationData.formType.replace(/_/g, ' ')} has been submitted successfully.\n\n`;
  body += `Submission Details:\n`;
  body += `- Submission time: ${timestamp}\n`;
  body += `- Territory: ${notificationData.territory || 'Not specified'}\n\n`;
  
  body += `Form Data:\n`;
  Object.entries(notificationData.formData).forEach(([key, value]) => {
    if (value && key !== 'email' && key !== 'timestamp') {
      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      body += `- ${displayKey}: ${value}\n`;
    }
  });
  
  body += `\nNext Steps:\n`;
  body += `- Your submission is being reviewed by the appropriate team\n`;
  body += `- You will receive updates on the approval status\n`;
  body += `- For urgent queries, contact your territory manager\n\n`;
  
  body += `Thank you for your submission.\n\n`;
  body += `Best regards,\n`;
  body += `Anwar Sales Ecosystem\n`;
  body += `Automated Confirmation System`;
  
  return body;
}

/**
 * Gets submitter information including role and territory
 * @param {string} email Submitter email
 * @return {Object} Submitter info object
 */
function getSubmitterInfo(email) {
  try {
    // Check if submitter is an employee
    const employeeSheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM)
      .getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
    
    if (!employeeSheet) {
      Logger.log('⚠️ Employee sheet not found, treating as external submitter');
      return { role: 'EXTERNAL', territory: null, isEmployee: false };
    }

    const data = employeeSheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    const roleColIndex = headers.indexOf('Role');
    const territoryColIndex = headers.indexOf('Territory');

    if (emailColIndex === -1) {
      Logger.log('⚠️ Email column not found in employee sheet');
      return { role: 'EXTERNAL', territory: null, isEmployee: false };
    }

    // Find employee by email
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] && data[i][emailColIndex].toLowerCase() === email.toLowerCase()) {
        return {
          role: data[i][roleColIndex] || 'UNKNOWN',
          territory: data[i][territoryColIndex] || null,
          name: data[i][headers.indexOf('Employee Name')] || 'Unknown',
          whatsappNumber: data[i][headers.indexOf('WhatsApp Number')] || null,
          isEmployee: true
        };
      }
    }

    Logger.log(`⚠️ Employee not found for email: ${email}, treating as external`);
    return { role: 'EXTERNAL', territory: null, isEmployee: false };

  } catch (error) {
    Logger.log(`❌ Error getting submitter info: ${error.toString()}`);
    return { role: 'EXTERNAL', territory: null, isEmployee: false };
  }
}

/**
 * Gets notification recipients based on form type and submitter role
 * @param {string} formType Type of form submitted
 * @param {string} submitterRole Role of the submitter
 * @param {string} submitterTerritory Territory of the submitter
 * @param {string} formTerritory Territory specified in the form
 * @return {Array} Array of notification recipient objects
 */
function getNotificationRecipients(formType, submitterRole, submitterTerritory, formTerritory) {
  try {
    const notificationRules = CONFIG.NOTIFICATION_CONFIG.FORM_NOTIFICATIONS[formType];
    
    if (!notificationRules) {
      Logger.log(`⚠️ No notification rules found for form type: ${formType}`);
      return [];
    }

    const roleRules = notificationRules[submitterRole] || notificationRules['ANY'] || notificationRules['EXTERNAL'];
    
    if (!roleRules) {
      Logger.log(`⚠️ No notification rules found for role: ${submitterRole} in form: ${formType}`);
      return [];
    }

    const recipients = [];
    const territory = formTerritory || submitterTerritory;

    // Process L1, L2, L3 notification levels
    ['L1', 'L2', 'L3'].forEach(level => {
      if (roleRules[level]) {
        roleRules[level].forEach(recipientRole => {
          const employees = findEmployeesByRole(recipientRole, territory);
          employees.forEach(employee => {
            recipients.push({
              ...employee,
              notificationLevel: level,
              role: recipientRole,
              timing: CONFIG.NOTIFICATION_CONFIG.TIMING[level === 'L1' ? 'IMMEDIATE' : level === 'L2' ? 'PRIMARY' : 'SECONDARY']
            });
          });
        });
      }
    });

    Logger.log(`📋 Found ${recipients.length} notification recipients for ${formType}`);
    return recipients;

  } catch (error) {
    Logger.log(`❌ Error getting notification recipients: ${error.toString()}`);
    return [];
  }
}

/**
 * Finds employees by role and territory
 * @param {string} role Employee role to find
 * @param {string} territory Territory to search in
 * @return {Array} Array of matching employees
 */
function findEmployeesByRole(role, territory) {
  try {
    // Safety check for role parameter
    if (!role || typeof role !== 'string') {
      console.log('❌ Invalid role parameter:', role);
      return [];
    }
    
    const employeeSheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM)
      .getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
    
    if (!employeeSheet) {
      Logger.log('⚠️ Employee sheet not found');
      return [];
    }

    const data = employeeSheet.getDataRange().getValues();
    const headers = data[0];
    
    const roleColIndex = headers.indexOf('Role');
    const territoryColIndex = headers.indexOf('Territory');
    const nameColIndex = headers.indexOf('Employee Name');
    const emailColIndex = headers.indexOf('Email');
    const whatsappColIndex = headers.indexOf('WhatsApp Number');

    const employees = [];

    for (let i = 1; i < data.length; i++) {
      const employeeRole = data[i][roleColIndex];
      const employeeTerritory = data[i][territoryColIndex];
      
      // Safety check for employeeRole
      if (!employeeRole || typeof employeeRole !== 'string') {
        continue;
      }
      
      // Match role (exact or contains)
      const roleMatch = employeeRole && (
        employeeRole.toUpperCase() === role.toUpperCase() ||
        employeeRole.toUpperCase().includes(role.toUpperCase()) ||
        role.toUpperCase().includes(employeeRole.toUpperCase())
      );

      // Match territory (if specified)
      const territoryMatch = !territory || !employeeTerritory || 
        employeeTerritory.toLowerCase().includes(territory.toLowerCase()) ||
        territory.toLowerCase().includes(employeeTerritory.toLowerCase());

      if (roleMatch && territoryMatch) {
        employees.push({
          name: data[i][nameColIndex] || 'Unknown',
          email: data[i][emailColIndex] || null,
          whatsappNumber: data[i][whatsappColIndex] || null,
          role: employeeRole,
          territory: employeeTerritory
        });
      }
    }

    Logger.log(`👥 Found ${employees.length} employees for role: ${role}, territory: ${territory}`);
    return employees;

  } catch (error) {
    Logger.log(`❌ Error finding employees by role: ${error.toString()}`);
    return [];
  }
}

/**
 * Sends notifications with timing levels
 * @param {Array} recipients Array of recipients
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @return {Object} Results of notification attempts
 */
function sendTimedNotifications(recipients, notificationData, submitterInfo) {
  const results = {
    immediate: [],
    primary: [],
    secondary: [],
    errors: []
  };

  try {
    // Group recipients by notification level
    const levelGroups = {
      L1: recipients.filter(r => r.notificationLevel === 'L1'),
      L2: recipients.filter(r => r.notificationLevel === 'L2'),
      L3: recipients.filter(r => r.notificationLevel === 'L3')
    };

    // Send immediate notifications (L1)
    levelGroups.L1.forEach(recipient => {
      const result = sendIndividualNotification(recipient, notificationData, submitterInfo, 'IMMEDIATE');
      results.immediate.push(result);
    });

    // Schedule primary notifications (L2) - 30 minutes delay
    if (levelGroups.L2.length > 0) {
      ScriptApp.newTrigger('sendPrimaryNotifications')
        .timeBased()
        .after(30 * 60 * 1000) // 30 minutes in milliseconds
        .create();
      
      // Store notification data for delayed execution
      PropertiesService.getScriptProperties().setProperty(
        'pendingL2Notifications',
        JSON.stringify({
          recipients: levelGroups.L2,
          notificationData: notificationData,
          submitterInfo: submitterInfo
        })
      );
    }

    // Schedule secondary notifications (L3) - 60 minutes delay
    if (levelGroups.L3.length > 0) {
      ScriptApp.newTrigger('sendSecondaryNotifications')
        .timeBased()
        .after(60 * 60 * 1000) // 60 minutes in milliseconds
        .create();
      
      // Store notification data for delayed execution
      PropertiesService.getScriptProperties().setProperty(
        'pendingL3Notifications',
        JSON.stringify({
          recipients: levelGroups.L3,
          notificationData: notificationData,
          submitterInfo: submitterInfo
        })
      );
    }

    Logger.log(`📊 Notification timing: ${results.immediate.length} immediate, ${levelGroups.L2.length} primary scheduled, ${levelGroups.L3.length} secondary scheduled`);
    return results;

  } catch (error) {
    Logger.log(`❌ Error in sendTimedNotifications: ${error.toString()}`);
    results.errors.push(error.toString());
    return results;
  }
}

/**
 * Sends individual notification to a recipient
 * @param {Object} recipient Recipient information
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @param {string} timing Notification timing level
 * @return {Object} Result of notification attempt
 */
function sendIndividualNotification(recipient, notificationData, submitterInfo, timing) {
  try {
    // Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(notificationData, submitterInfo, recipient, timing);
    
    // Send WhatsApp notification
    let whatsappResult = { success: false };
    if (recipient.whatsappNumber) {
      whatsappResult = sendWhatsAppMessage(recipient.whatsappNumber, whatsappMessage);
    }

    // Send email notification
    let emailResult = { success: false };
    if (recipient.email && CONFIG.NOTIFICATION_CONFIG.EMAIL_NOTIFICATIONS.ENABLED) {
      const emailSubject = `${notificationData.formType} - New Submission`;
      const emailBody = generateEmailBody(notificationData, submitterInfo, recipient);
      emailResult = sendEmailNotification(recipient.email, emailSubject, emailBody);
    }

    const result = {
      recipient: recipient.name,
      role: recipient.role,
      timing: timing,
      whatsapp: whatsappResult,
      email: emailResult,
      success: whatsappResult.success || emailResult.success
    };

    Logger.log(`📤 Notification sent to ${recipient.name} (${recipient.role}) - WhatsApp: ${whatsappResult.success}, Email: ${emailResult.success}`);
    return result;

  } catch (error) {
    Logger.log(`❌ Error sending individual notification to ${recipient.name}: ${error.toString()}`);
    return {
      recipient: recipient.name,
      role: recipient.role,
      timing: timing,
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generates WhatsApp message based on template
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @param {Object} recipient Recipient information
 * @param {string} timing Notification timing
 * @return {string} Formatted WhatsApp message
 */
function generateWhatsAppMessage(notificationData, submitterInfo, recipient, timing) {
  const template = CONFIG.NOTIFICATION_CONFIG.WHATSAPP_TEMPLATES.FORM_SUBMISSION;
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  
  let message = `${template.TITLE}\n\n`;
  
  message += `📋 **Form Type:** ${notificationData.formType}\n`;
  
  if (template.INCLUDE_SUBMITTER && submitterInfo.name) {
    message += `👤 **Submitted By:** ${submitterInfo.name} (${submitterInfo.role})\n`;
  }
  
  message += `📧 **Email:** ${notificationData.submitterEmail}\n`;
  
  if (template.INCLUDE_TERRITORY && notificationData.territory) {
    message += `🌍 **Territory:** ${notificationData.territory}\n`;
  }
  
  if (template.INCLUDE_TIMESTAMP) {
    message += `🕐 **Time:** ${timestamp}\n`;
  }
  
  message += `⚡ **Priority:** ${timing}\n\n`;
  
  // Add form-specific data
  message += `📝 **Form Details:**\n`;
  Object.entries(notificationData.formData).forEach(([key, value]) => {
    if (value && key !== 'email' && key !== 'timestamp') {
      message += `• **${key}:** ${value}\n`;
    }
  });
  
  message += `\n👋 **Hi ${recipient.name}**, this requires your attention as ${recipient.role}.\n\n`;
  message += `${template.FOOTER}`;
  
  return message;
}

/**
 * Generates email body
 * @param {Object} notificationData Notification data
 * @param {Object} submitterInfo Submitter information
 * @param {Object} recipient Recipient information
 * @return {string} Formatted email body
 */
function generateEmailBody(notificationData, submitterInfo, recipient) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  
  let body = `Dear ${recipient.name},\n\n`;
  body += `A new ${notificationData.formType} has been submitted and requires your attention.\n\n`;
  body += `Submission Details:\n`;
  body += `- Submitted by: ${submitterInfo.name || 'Unknown'} (${submitterInfo.role})\n`;
  body += `- Email: ${notificationData.submitterEmail}\n`;
  body += `- Territory: ${notificationData.territory || 'Not specified'}\n`;
  body += `- Submission time: ${timestamp}\n\n`;
  
  body += `Form Data:\n`;
  Object.entries(notificationData.formData).forEach(([key, value]) => {
    if (value && key !== 'email' && key !== 'timestamp') {
      body += `- ${key}: ${value}\n`;
    }
  });
  
  body += `\nPlease review and take appropriate action.\n\n`;
  body += `Best regards,\n`;
  body += `Anwar Sales Ecosystem\n`;
  body += `Automated Notification System`;
  
  return body;
}

/**
 * Sends fallback notification when no specific recipients found
 * @param {Object} notificationData Notification data
 * @return {Object} Result of fallback notification
 */
function sendFallbackNotification(notificationData) {
  try {
    Logger.log('🔄 Sending fallback notification to emergency contacts');
    
    const emergencyContacts = CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS;
    const message = `⚠️ **FALLBACK NOTIFICATION**\n\nNo specific recipients found for ${notificationData.formType} from ${notificationData.submitterEmail}.\n\nPlease assign appropriate personnel to handle this submission.\n\nAnwar Sales Ecosystem - Automated Notification`;
    
    const results = [];
    
    // Send to system admin
    if (emergencyContacts.SYSTEM_ADMIN.EMAIL) {
      const result = sendEmailNotification(
        emergencyContacts.SYSTEM_ADMIN.EMAIL,
        'Fallback Notification Required',
        message
      );
      results.push(result);
    }
    
    return { success: true, fallback: true, results: results };
    
  } catch (error) {
    Logger.log(`❌ Error in fallback notification: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Sends emergency notification for system errors
 * @param {Object} notificationData Original notification data
 * @param {Error} error Error that occurred
 * @return {Object} Result of emergency notification
 */
function sendEmergencyNotification(notificationData, error) {
  try {
    Logger.log('🚨 Sending emergency notification due to system error');
    
    const emergencyContacts = CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS;
    const message = `🚨 **EMERGENCY NOTIFICATION**\n\nError processing notification for ${notificationData.formType}:\n\nError: ${error.toString()}\n\nSubmitter: ${notificationData.submitterEmail}\n\nImmediate attention required.\n\nAnwar Sales Ecosystem - Error Alert`;
    
    // Send to system admin
    if (emergencyContacts.SYSTEM_ADMIN.EMAIL) {
      sendEmailNotification(
        emergencyContacts.SYSTEM_ADMIN.EMAIL,
        'URGENT: Notification System Error',
        message
      );
    }
    
    return { success: true, emergency: true };
    
  } catch (emergencyError) {
    Logger.log(`❌ Critical error in emergency notification: ${emergencyError.toString()}`);
    return { success: false, critical: true, error: emergencyError.toString() };
  }
}

// Trigger functions for delayed notifications

/**
 * Sends primary (L2) notifications - called by trigger after 30 minutes
 */
function sendPrimaryNotifications() {
  try {
    const pendingData = PropertiesService.getScriptProperties().getProperty('pendingL2Notifications');
    if (!pendingData) {
      Logger.log('⚠️ No pending L2 notifications found');
      return;
    }
    
    const { recipients, notificationData, submitterInfo } = JSON.parse(pendingData);
    
    recipients.forEach(recipient => {
      sendIndividualNotification(recipient, notificationData, submitterInfo, 'PRIMARY');
    });
    
    // Clean up stored data
    PropertiesService.getScriptProperties().deleteProperty('pendingL2Notifications');
    Logger.log(`✅ Sent ${recipients.length} primary (L2) notifications`);
    
  } catch (error) {
    Logger.log(`❌ Error in sendPrimaryNotifications: ${error.toString()}`);
  }
}

/**
 * Sends secondary (L3) notifications - called by trigger after 60 minutes
 */
function sendSecondaryNotifications() {
  try {
    const pendingData = PropertiesService.getScriptProperties().getProperty('pendingL3Notifications');
    if (!pendingData) {
      Logger.log('⚠️ No pending L3 notifications found');
      return;
    }
    
    const { recipients, notificationData, submitterInfo } = JSON.parse(pendingData);
    
    recipients.forEach(recipient => {
      sendIndividualNotification(recipient, notificationData, submitterInfo, 'SECONDARY');
    });
    
    // Clean up stored data
    PropertiesService.getScriptProperties().deleteProperty('pendingL3Notifications');
    Logger.log(`✅ Sent ${recipients.length} secondary (L3) notifications`);
    
  } catch (error) {
    Logger.log(`❌ Error in sendSecondaryNotifications: ${error.toString()}`);
  }
}

/**
 * Test function for notification system
 */
function testNotificationSystem() {
  const testData = {
    formType: 'PARTNER_REGISTRATION',
    submitterEmail: 'test@example.com',
    territory: 'Dhaka North',
    formData: {
      partnerName: 'Test Partner',
      contactNumber: '01700000000',
      partnerType: 'Site Engineer'
    }
  };
  
  Logger.log('🧪 Testing notification system...');
  const result = sendFormNotification(testData);
  Logger.log('🧪 Test result:', result);
  
  return result;
}
