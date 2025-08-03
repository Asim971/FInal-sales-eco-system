/**
 * @fileo  switch (sheetName) {
    case CONFIG.SHEET_NAMES.RETAILER_APPROVALS:This file contains the trigger functions for the Anwar Sales Ecosystem.
 */

/**
 * The main onEdit trigger function.
 * This function is called whenever a user edits a cell in the spreadsheet.
 * @param {Object} e The event object.
 */
function onEditTrigger(e) {
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  switch (sheetName) {
    case CONFIG.SHEET_NAMES.RETAILER_APPROVALS:
      handleRetailerApprovalsEdit(e);
      break;
    case CONFIG.SHEET_NAMES.SITE_PRESCRIPTION_APPROVALS:
      handleSitePrescriptionApprovalsEdit(e);
      break;
    case CONFIG.SHEET_NAMES.IHB_APPROVALS:
      handleIHBApprovalsEdit(e);
      break;
    case CONFIG.SHEET_NAMES.DEMAND_GENERATION_REQUESTS:
      handleDemandGenerationRequestsEdit(e);
      break;
  }
}

/**
 * The main onFormSubmit trigger function.
 * This function is called whenever a form is submitted.
 * @param {Object} e The event object.
 */
function onFormSubmitTrigger(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ssId = ss.getId();

  switch (ssId) {
    case CONFIG.SPREADSHEET_IDS.ENGINEER_REGISTRATION:
      handleEngineerFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.ENGINEER_UPDATE:
      handleEngineerUpdateFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE:
      handlePotentialSiteFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE_UPDATE:
      handlePotentialSiteUpdateFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION:
      handleRetailerFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.PARTNER_UPDATE:
      handlePartnerUpdateFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION:
      handlePartnerRegistrationFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.ORDER_CREATION:
      handleOrderFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.DISPUTE_CREATION:
      handleDisputeFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.SITE_PRESCRIPTION:
      handleSitePrescriptionFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.VISIT:
      handleVisitFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.VISIT_UPDATE:
      handleVisitUpdateFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.IHB_REGISTRATION:
      handleIHBFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST:
      handleRetailerPointFormSubmit(e);
      break;
    case CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST:
      handleDemandGenerationFormSubmit(e);
      break;
  }
}

/**
 * Creates the triggers for the application.
 * This function should be run once to set up the triggers.
 * It first deletes all existing triggers to ensure a clean setup.
 */
function createTriggers() {
  // First, delete all existing triggers
  console.log('🗑️ Deleting all existing triggers...');
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(trigger => {
    try {
      ScriptApp.deleteTrigger(trigger);
      console.log(`Deleted trigger: ${trigger.getHandlerFunction()}`);
    } catch (error) {
      console.warn(`Failed to delete trigger: ${error.message}`);
    }
  });
  console.log(`✅ Deleted ${existingTriggers.length} existing triggers`);

  // Now create all triggers fresh
  console.log('🔨 Creating fresh triggers...');
  
  // CRM Edit trigger
  try {
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_EDIT)
      .forSpreadsheet(CONFIG.SPREADSHEET_IDS.CRM)
      .onEdit()
      .create();
    console.log('✅ Created CRM edit trigger');
  } catch (error) {
    console.error(`Failed to create CRM edit trigger: ${error.message}`);
  }

  // Form submission triggers - only create if spreadsheet ID is valid
  const formTriggers = [
    { name: 'Engineer Registration', id: CONFIG.SPREADSHEET_IDS.ENGINEER_REGISTRATION },
    { name: 'Engineer Update', id: CONFIG.SPREADSHEET_IDS.ENGINEER_UPDATE },
    { name: 'Potential Site', id: CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE },
    { name: 'Potential Site Update', id: CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE_UPDATE },
    { name: 'Retailer Registration', id: CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION },
    { name: 'Partner Update', id: CONFIG.SPREADSHEET_IDS.PARTNER_UPDATE },
    { name: 'Partner Registration', id: CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION },
    { name: 'Order Creation', id: CONFIG.SPREADSHEET_IDS.ORDER_CREATION },
    { name: 'Dispute Creation', id: CONFIG.SPREADSHEET_IDS.DISPUTE_CREATION },
    { name: 'Site Prescription', id: CONFIG.SPREADSHEET_IDS.SITE_PRESCRIPTION },
    { name: 'Visit', id: CONFIG.SPREADSHEET_IDS.VISIT },
    { name: 'Visit Update', id: CONFIG.SPREADSHEET_IDS.VISIT_UPDATE },
    { name: 'IHB Registration', id: CONFIG.SPREADSHEET_IDS.IHB_REGISTRATION },
    { name: 'Retailer Point Request', id: CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST },
    { name: 'Demand Generation Request', id: CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST }
  ];

  let successCount = 0;
  let skipCount = 0;
  
  formTriggers.forEach(({ name, id }) => {
    try {
      // Skip if ID is not properly configured
      if (!id || id === '' || id.includes('Replace with actual ID') || id.includes('TO_BE_REPLACED')) {
        console.warn(`⚠️ Skipping ${name} trigger - spreadsheet ID not configured`);
        skipCount++;
        return;
      }

      ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
        .forSpreadsheet(id)
        .onFormSubmit()
        .create();
      
      console.log(`✅ Created ${name} form trigger`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to create ${name} trigger: ${error.message}`);
    }
  });

  console.log(`🎉 Trigger creation complete! Created: ${successCount}, Skipped: ${skipCount}, Total attempted: ${formTriggers.length + 1}`);
}

/**
 * Safely deletes all existing triggers without UI prompts.
 * Used internally by trigger recreation functions.
 * @return {number} Number of triggers deleted
 */
function deleteAllTriggersQuietly() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
        console.log(`Deleted trigger: ${trigger.getHandlerFunction()}`);
      } catch (error) {
        console.warn(`Failed to delete trigger ${trigger.getHandlerFunction()}: ${error.message}`);
      }
    });
    
    console.log(`✅ Quietly deleted ${deletedCount} triggers`);
    return deletedCount;
    
  } catch (error) {
    console.error('Error in deleteAllTriggersQuietly: ' + error.toString());
    return 0;
  }
}

/**
 * Creates a trigger specifically for the Visit form
 */
function createVisitFormTrigger() {
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.VISIT;
    
    if (!spreadsheetId || spreadsheetId === '1-nSNDZaUcNRK088teWgQVZjKpU9RIZXq2o_ZcOuptJc') {
      throw new Error('Visit form spreadsheet ID not configured. Please set up the Visit form first.');
    }

    // Check for and delete existing trigger for this spreadsheet
    const triggers = ScriptApp.getProjectTriggers();
    const existingTriggers = triggers.filter(trigger => 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
      trigger.getTriggerSourceId() === spreadsheetId
    );

    // Delete existing triggers for this form
    existingTriggers.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        console.log(`Deleted existing Visit form trigger: ${trigger.getHandlerFunction()}`);
      } catch (error) {
        console.warn(`Failed to delete existing trigger: ${error.message}`);
      }
    });

    // Create new trigger
    const trigger = ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();

    console.log('✅ Created Visit form trigger successfully');
    return trigger;

  } catch (error) {
    Logger.log('Error creating Visit form trigger: ' + error.toString());
    throw error;
  }
}

/**
 * Creates a trigger specifically for the Visit Update form
 */
function createVisitUpdateFormTrigger() {
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.VISIT_UPDATE;
    
    if (!spreadsheetId || spreadsheetId === '1VU_SPREADSHEET_ID_TO_BE_REPLACED') {
      throw new Error('Visit Update form spreadsheet ID not configured. Please set up the Visit Update form first.');
    }

    // Check for and delete existing trigger for this spreadsheet
    const triggers = ScriptApp.getProjectTriggers();
    const existingTriggers = triggers.filter(trigger => 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
      trigger.getTriggerSourceId() === spreadsheetId
    );

    // Delete existing triggers for this form
    existingTriggers.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        console.log(`Deleted existing Visit Update form trigger: ${trigger.getHandlerFunction()}`);
      } catch (error) {
        console.warn(`Failed to delete existing trigger: ${error.message}`);
      }
    });

    // Create new trigger
    const trigger = ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();

    console.log('✅ Created Visit Update form trigger successfully');
    return trigger;

  } catch (error) {
    Logger.log('Error creating Visit Update form trigger: ' + error.toString());
    throw error;
  }
}

/**
 * Menu function to create Visit form trigger
 */
function createVisitFormTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    createVisitFormTrigger();
    ui.alert('Success', 'Visit form trigger created successfully!', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Error', `Failed to create Visit form trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in createVisitFormTriggerMenu: ' + error.toString());
  }
}

/**
 * Menu function to create Visit Update form trigger
 */
function createVisitUpdateFormTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    createVisitUpdateFormTrigger();
    ui.alert('Success', 'Visit Update form trigger created successfully!', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Error', `Failed to create Visit Update form trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in createVisitUpdateFormTriggerMenu: ' + error.toString());
  }
}

/**
 * Menu function to create all triggers with confirmation
 */
function createAllTriggersMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get current trigger count
    const existingTriggers = ScriptApp.getProjectTriggers();
    const triggerCount = existingTriggers.length;
    
    // Ask for confirmation if there are existing triggers
    if (triggerCount > 0) {
      const response = ui.alert(
        'Recreate All Triggers',
        `This will delete all ${triggerCount} existing triggers and create fresh ones.\n\nDo you want to continue?`,
        ui.ButtonSet.YES_NO
      );
      
      if (response !== ui.Button.YES) {
        ui.alert('Cancelled', 'Trigger recreation cancelled by user.', ui.ButtonSet.OK);
        return;
      }
    }
    
    // Show progress message
    ui.alert('Creating Triggers', 'Deleting existing triggers and creating fresh ones. Please wait...', ui.ButtonSet.OK);
    
    // Create all triggers
    createTriggers();
    
    // Get final trigger count
    const newTriggers = ScriptApp.getProjectTriggers();
    const newTriggerCount = newTriggers.length;
    
    // Show success message with details
    let message = `✅ Trigger recreation completed!\n\n`;
    message += `• Deleted: ${triggerCount} old triggers\n`;
    message += `• Created: ${newTriggerCount} new triggers\n\n`;
    message += `All form submission and edit triggers have been refreshed.`;
    
    ui.alert('Success', message, ui.ButtonSet.OK);
    
    console.log(`🎉 All triggers recreated successfully! Old: ${triggerCount}, New: ${newTriggerCount}`);
    
  } catch (error) {
    const errorMessage = `Failed to recreate triggers: ${error.message}\n\nPlease check the console for detailed error information.`;
    ui.alert('Error', errorMessage, ui.ButtonSet.OK);
    console.error('Error in createAllTriggersMenu: ' + error.toString());
  }
}
