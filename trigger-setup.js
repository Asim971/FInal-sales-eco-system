/**
 * @fileoverview Trigger Setup for Schema Migration and Order Updates
 * This file contains functions to set up and manage triggers for the new schema
 */

/**
 * Sets up all necessary triggers for the updated order and potential site system
 * This function should be run after deploying the schema changes
 * @return {Object} Setup result
 */
function setupMigrationTriggers() {
  try {
    console.log('🔧 Setting up migration triggers...');
    
    const setupResult = {
      success: true,
      triggers: [],
      errors: []
    };
    
    // 1. Set up form submission triggers for updated forms
    console.log('Setting up form submission triggers...');
    
    // Order Update Form Trigger
    if (CONFIG.SPREADSHEET_IDS.ORDER_UPDATE) {
      try {
        const orderUpdateTrigger = ScriptApp.newTrigger('onOrderUpdateFormSubmit')
          .timeBased()
          .everyMinutes(1) // Check every minute for new submissions
          .create();
        
        setupResult.triggers.push({
          type: 'Form Submission',
          form: 'Order Update',
          triggerId: orderUpdateTrigger.getUniqueId(),
          function: 'onOrderUpdateFormSubmit'
        });
      } catch (error) {
        setupResult.errors.push(`Failed to set up Order Update trigger: ${error.message}`);
      }
    }
    
    // Potential Site Update Form Trigger
    if (CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE_UPDATE) {
      try {
        const siteUpdateTrigger = ScriptApp.newTrigger('onPotentialSiteUpdateFormSubmit')
          .timeBased()
          .everyMinutes(1) // Check every minute for new submissions
          .create();
        
        setupResult.triggers.push({
          type: 'Form Submission',
          form: 'Potential Site Update',
          triggerId: siteUpdateTrigger.getUniqueId(),
          function: 'onPotentialSiteUpdateFormSubmit'
        });
      } catch (error) {
        setupResult.errors.push(`Failed to set up Potential Site Update trigger: ${error.message}`);
      }
    }
    
    // 2. Set up sheet edit triggers for real-time updates
    console.log('Setting up sheet edit triggers...');
    
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      
      const editTrigger = ScriptApp.newTrigger('onSheetEditForMigration')
        .forSpreadsheet(ss)
        .onEdit()
        .create();
      
      setupResult.triggers.push({
        type: 'Sheet Edit',
        spreadsheet: 'CRM',
        triggerId: editTrigger.getUniqueId(),
        function: 'onSheetEditForMigration'
      });
    } catch (error) {
      setupResult.errors.push(`Failed to set up sheet edit trigger: ${error.message}`);
    }
    
    // 3. Set up time-based trigger for periodic migration checks
    console.log('Setting up periodic migration check trigger...');
    
    try {
      const periodicTrigger = ScriptApp.newTrigger('checkAndRunMigrationIfNeeded')
        .timeBased()
        .everyHours(1) // Check every hour
        .create();
      
      setupResult.triggers.push({
        type: 'Periodic Check',
        interval: 'Every Hour',
        triggerId: periodicTrigger.getUniqueId(),
        function: 'checkAndRunMigrationIfNeeded'
      });
    } catch (error) {
      setupResult.errors.push(`Failed to set up periodic check trigger: ${error.message}`);
    }
    
    console.log(`✅ Trigger setup completed. ${setupResult.triggers.length} triggers created.`);
    
    if (setupResult.errors.length > 0) {
      setupResult.success = false;
      console.warn('⚠️ Some triggers failed to set up:', setupResult.errors);
    }
    
    return setupResult;
    
  } catch (error) {
    console.error('❌ Failed to set up migration triggers:', error);
    return {
      success: false,
      error: error.message,
      triggers: [],
      errors: [error.message]
    };
  }
}

/**
 * Trigger function for order update form submissions
 * This function is called when the order update form is submitted
 * @param {Event} e - Form submission event
 */
function onOrderUpdateFormSubmit(e) {
  try {
    console.log('📝 Order update form submitted');
    
    // Check if this is actually a form submission or just a periodic check
    if (!e || !e.values) {
      // This is a periodic check, look for new submissions
      checkForNewOrderUpdateSubmissions();
      return;
    }
    
    // Process the form submission
    const formData = parseOrderUpdateFormData(e.values);
    const submitterEmail = formData.emailAddress || Session.getActiveUser().getEmail();
    
    // Handle the order update
    const result = handleExistingOrderUpdate(formData, submitterEmail);
    
    if (result.success) {
      console.log('✅ Order update processed successfully');
      
      // Send confirmation email
      sendOrderUpdateConfirmation(submitterEmail, result);
      
    } else {
      console.error('❌ Order update failed:', result.error);
      
      // Send error notification
      sendOrderUpdateError(submitterEmail, result);
    }
    
  } catch (error) {
    console.error('Error in onOrderUpdateFormSubmit:', error);
  }
}

/**
 * Trigger function for potential site update form submissions
 * This function is called when the potential site update form is submitted
 * @param {Event} e - Form submission event
 */
function onPotentialSiteUpdateFormSubmit(e) {
  try {
    console.log('🏗️ Potential site update form submitted');
    
    // Check if this is actually a form submission or just a periodic check
    if (!e || !e.values) {
      // This is a periodic check, look for new submissions
      checkForNewPotentialSiteUpdateSubmissions();
      return;
    }
    
    // Process the form submission
    const formData = parsePotentialSiteUpdateFormData(e.values);
    const submitterEmail = formData.emailAddress || Session.getActiveUser().getEmail();
    
    // Handle the potential site update
    const result = handlePotentialSiteUpdateFormSubmit(formData, submitterEmail);
    
    if (result.success) {
      console.log('✅ Potential site update processed successfully');
      
      // Send confirmation email
      sendPotentialSiteUpdateConfirmation(submitterEmail, result);
      
    } else {
      console.error('❌ Potential site update failed:', result.error);
      
      // Send error notification
      sendPotentialSiteUpdateError(submitterEmail, result);
    }
    
  } catch (error) {
    console.error('Error in onPotentialSiteUpdateFormSubmit:', error);
  }
}

/**
 * Sheet edit trigger for handling real-time migration needs
 * @param {Event} e - Edit event
 */
function onSheetEditForMigration(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Only process edits on Orders or Potential Site Approvals sheets
    if (sheetName !== CONFIG.SHEET_NAMES.ORDERS && sheetName !== 'Potential Site Approvals') {
      return;
    }
    
    console.log(`📊 Sheet edit detected in ${sheetName}`);
    
    // Check if the edit affects the schema structure
    const editedRange = e.range;
    
    // If editing headers (row 1), check if migration is needed
    if (editedRange.getRow() === 1) {
      console.log('Header row edited, checking if migration is needed...');
      
      setTimeout(() => {
        if (isMigrationNeeded()) {
          console.log('⚠️ Migration needed due to header changes');
          // You might want to send a notification here
        }
      }, 1000); // Delay to allow the edit to complete
    }
    
    // Handle data validation for new schema
    validateEditAgainstNewSchema(e);
    
  } catch (error) {
    console.error('Error in onSheetEditForMigration:', error);
  }
}

/**
 * Periodic trigger to check if migration is needed and run it if necessary
 */
function checkAndRunMigrationIfNeeded() {
  try {
    console.log('🔍 Checking if migration is needed...');
    
    if (isMigrationNeeded()) {
      console.log('⚠️ Migration is needed, running migration...');
      
      const migrationResult = runSchemaMigration();
      
      if (migrationResult.success) {
        console.log('✅ Automatic migration completed successfully');
      } else {
        console.error('❌ Automatic migration failed:', migrationResult.error);
        
        // Send alert to administrators
        sendMigrationAlert(migrationResult);
      }
    } else {
      console.log('✅ No migration needed');
    }
    
  } catch (error) {
    console.error('Error in checkAndRunMigrationIfNeeded:', error);
  }
}

/**
 * Checks for new order update submissions
 */
function checkForNewOrderUpdateSubmissions() {
  try {
    // Implementation would check the order update spreadsheet for new submissions
    // and process them accordingly
    console.log('Checking for new order update submissions...');
    
    // This is a placeholder - actual implementation would read from the update sheet
    
  } catch (error) {
    console.error('Error checking for new order update submissions:', error);
  }
}

/**
 * Checks for new potential site update submissions
 */
function checkForNewPotentialSiteUpdateSubmissions() {
  try {
    // Implementation would check the potential site update spreadsheet for new submissions
    // and process them accordingly
    console.log('Checking for new potential site update submissions...');
    
    // This is a placeholder - actual implementation would read from the update sheet
    
  } catch (error) {
    console.error('Error checking for new potential site update submissions:', error);
  }
}

/**
 * Parses order update form data from form submission values
 * @param {Array} values - Form submission values
 * @return {Object} Parsed form data
 */
function parseOrderUpdateFormData(values) {
  try {
    // Map form values to object based on ORDER_UPDATE form structure
    return {
      timestamp: values[0] || new Date(),
      emailAddress: values[1] || '',
      orderId: values[2] || '',
      updateType: values[3] || '',
      newOrderType: values[4] || '',
      newSpecialInstructions: values[5] || '',
      engineerRequired: values[6] || '',
      partnerRequired: values[7] || '',
      newDeliveryNoteLink: values[8] || '',
      newSiteImagesLink: values[9] || '',
      newAdditionalDocsLink: values[10] || '',
      newStatus: values[11] || '',
      assignedEngineerId: values[12] || '',
      assignedPartnerId: values[13] || '',
      updateReason: values[14] || '',
      updateRelatedPotentialSite: values[15] || '',
      processingNotes: values[16] || ''
    };
  } catch (error) {
    console.error('Error parsing order update form data:', error);
    return {};
  }
}

/**
 * Parses potential site update form data from form submission values
 * @param {Array} values - Form submission values
 * @return {Object} Parsed form data
 */
function parsePotentialSiteUpdateFormData(values) {
  try {
    // Map form values to object based on POTENTIAL_SITE_UPDATE_ENHANCED form structure
    return {
      timestamp: values[0] || new Date(),
      emailAddress: values[1] || '',
      siteId: values[2] || '',
      updateType: values[3] || '',
      newSiteName: values[4] || '',
      newAddress: values[5] || '',
      newLatitude: values[6] || '',
      newLongitude: values[7] || '',
      newIhbId: values[8] || '',
      newIhbName: values[9] || '',
      newStartBuilding: values[10] || '',
      newEndBuilding: values[11] || '',
      newProjectAddress: values[12] || '',
      newEstimatedQuantity: values[13] || '',
      newDeliveryTimeline: values[14] || '',
      newCustomTimeline: values[15] || '',
      newStatus: values[16] || '',
      newEngineerId: values[17] || '',
      newEngineerName: values[18] || '',
      newPartnerId: values[19] || '',
      newPartnerName: values[20] || '',
      assignmentDate: values[21] || '',
      updateReason: values[22] || '',
      updateRelatedOrders: values[23] || '',
      supportingDocuments: values[24] || ''
    };
  } catch (error) {
    console.error('Error parsing potential site update form data:', error);
    return {};
  }
}

/**
 * Validates an edit against the new schema requirements
 * @param {Event} e - Edit event
 */
function validateEditAgainstNewSchema(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    const editedRange = e.range;
    const newValue = editedRange.getValue();
    
    // Validation logic based on the new schema
    if (sheetName === CONFIG.SHEET_NAMES.ORDERS) {
      validateOrderFieldEdit(editedRange, newValue);
    } else if (sheetName === 'Potential Site Approvals') {
      validatePotentialSiteFieldEdit(editedRange, newValue);
    }
    
  } catch (error) {
    console.error('Error validating edit against new schema:', error);
  }
}

/**
 * Validates order field edits
 * @param {Range} range - Edited range
 * @param {*} value - New value
 */
function validateOrderFieldEdit(range, value) {
  try {
    const headers = range.getSheet().getRange(1, 1, 1, range.getSheet().getLastColumn()).getValues()[0];
    const columnIndex = range.getColumn() - 1;
    const fieldName = headers[columnIndex];
    
    // Validate based on field type
    switch (fieldName) {
      case 'Order Type':
        const validOrderTypes = ['Cement Order', 'Rod Order', 'Brick Order', 'Sand Order', 'Stone Chips Order', 'Full Construction Package', 'Other'];
        if (value && !validOrderTypes.includes(value)) {
          console.warn(`Invalid order type: ${value}`);
        }
        break;
        
      case 'Status':
        const validStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
        if (value && !validStatuses.includes(value)) {
          console.warn(`Invalid status: ${value}`);
        }
        break;
        
      case 'Engineer Required':
      case 'Partner Required':
        if (value && !['Yes', 'No'].includes(value)) {
          console.warn(`Invalid Yes/No value for ${fieldName}: ${value}`);
        }
        break;
    }
    
  } catch (error) {
    console.error('Error validating order field edit:', error);
  }
}

/**
 * Validates potential site field edits
 * @param {Range} range - Edited range
 * @param {*} value - New value
 */
function validatePotentialSiteFieldEdit(range, value) {
  try {
    const headers = range.getSheet().getRange(1, 1, 1, range.getSheet().getLastColumn()).getValues()[0];
    const columnIndex = range.getColumn() - 1;
    const fieldName = headers[columnIndex];
    
    // Validate based on field type
    switch (fieldName) {
      case 'Delivery Timeline':
        const validTimelines = ['Within 24 hours', 'Within 3 days', 'Within 1 week', 'Within 2 weeks', 'Custom timeline'];
        if (value && !validTimelines.includes(value)) {
          console.warn(`Invalid delivery timeline: ${value}`);
        }
        break;
        
      case 'Status':
        const validStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
        if (value && !validStatuses.includes(value)) {
          console.warn(`Invalid status: ${value}`);
        }
        break;
        
      case 'Lat':
      case 'Long':
        if (value && isNaN(parseFloat(value))) {
          console.warn(`Invalid coordinate value for ${fieldName}: ${value}`);
        }
        break;
    }
    
  } catch (error) {
    console.error('Error validating potential site field edit:', error);
  }
}

/**
 * Sends order update confirmation
 * @param {string} email - Recipient email
 * @param {Object} result - Update result
 */
function sendOrderUpdateConfirmation(email, result) {
  try {
    const subject = `Order Update Confirmation - ${result.orderId}`;
    const body = `Your order update request has been processed successfully.
    
Order ID: ${result.orderId}
Update Status: ✅ Success
Processed At: ${new Date().toISOString()}

Thank you for using the Anwar Sales Ecosystem.`;
    
    MailApp.sendEmail(email, subject, body);
    console.log(`Confirmation email sent to ${email}`);
    
  } catch (error) {
    console.error('Error sending order update confirmation:', error);
  }
}

/**
 * Sends potential site update confirmation
 * @param {string} email - Recipient email
 * @param {Object} result - Update result
 */
function sendPotentialSiteUpdateConfirmation(email, result) {
  try {
    const subject = `Potential Site Update Confirmation - ${result.siteId}`;
    const body = `Your potential site update request has been processed successfully.
    
Site ID: ${result.siteId}
Update Status: ✅ Success
Processed At: ${new Date().toISOString()}

Thank you for using the Anwar Sales Ecosystem.`;
    
    MailApp.sendEmail(email, subject, body);
    console.log(`Confirmation email sent to ${email}`);
    
  } catch (error) {
    console.error('Error sending potential site update confirmation:', error);
  }
}

/**
 * Sends order update error notification
 * @param {string} email - Recipient email
 * @param {Object} result - Update result with error
 */
function sendOrderUpdateError(email, result) {
  try {
    const subject = `Order Update Failed - ${result.orderId}`;
    const body = `Your order update request could not be processed.
    
Order ID: ${result.orderId}
Error: ${result.error}
Attempted At: ${new Date().toISOString()}

Please check your submission and try again. If the problem persists, contact support.`;
    
    MailApp.sendEmail(email, subject, body);
    console.log(`Error notification sent to ${email}`);
    
  } catch (error) {
    console.error('Error sending order update error notification:', error);
  }
}

/**
 * Sends potential site update error notification
 * @param {string} email - Recipient email
 * @param {Object} result - Update result with error
 */
function sendPotentialSiteUpdateError(email, result) {
  try {
    const subject = `Potential Site Update Failed - ${result.siteId}`;
    const body = `Your potential site update request could not be processed.
    
Site ID: ${result.siteId}
Error: ${result.error}
Attempted At: ${new Date().toISOString()}

Please check your submission and try again. If the problem persists, contact support.`;
    
    MailApp.sendEmail(email, subject, body);
    console.log(`Error notification sent to ${email}`);
    
  } catch (error) {
    console.error('Error sending potential site update error notification:', error);
  }
}

/**
 * Sends migration alert to administrators
 * @param {Object} migrationResult - Migration result
 */
function sendMigrationAlert(migrationResult) {
  try {
    const adminEmails = [
      CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS.SYSTEM_ADMIN.EMAIL,
      CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS.BUSINESS_HEAD.EMAIL
    ].filter(Boolean);
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for migration alerts');
      return;
    }
    
    const subject = 'Schema Migration Alert - Action Required';
    const body = `Schema migration has failed and requires manual intervention.
    
Error: ${migrationResult.error}
Timestamp: ${migrationResult.timestamp}

Please check the system and run the migration manually if needed.`;
    
    adminEmails.forEach(email => {
      MailApp.sendEmail(email, subject, body);
    });
    
    console.log('Migration alert sent to administrators');
    
  } catch (error) {
    console.error('Error sending migration alert:', error);
  }
}

/**
 * Removes all migration triggers (for cleanup)
 * @return {Object} Cleanup result
 */
function removeMigrationTriggers() {
  try {
    console.log('🧹 Removing migration triggers...');
    
    const triggers = ScriptApp.getProjectTriggers();
    const migrationTriggerFunctions = [
      'onOrderUpdateFormSubmit',
      'onPotentialSiteUpdateFormSubmit',
      'onSheetEditForMigration',
      'checkAndRunMigrationIfNeeded'
    ];
    
    let removedCount = 0;
    
    triggers.forEach(trigger => {
      if (migrationTriggerFunctions.includes(trigger.getHandlerFunction())) {
        ScriptApp.deleteTrigger(trigger);
        removedCount++;
        console.log(`Removed trigger: ${trigger.getHandlerFunction()}`);
      }
    });
    
    console.log(`✅ Removed ${removedCount} migration triggers`);
    
    return {
      success: true,
      removedCount: removedCount,
      message: 'Migration triggers removed successfully'
    };
    
  } catch (error) {
    console.error('❌ Failed to remove migration triggers:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
