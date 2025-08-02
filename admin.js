/**
 * @fileoverview This file contains administrative functions for the project.
 */

/**
 * Creates a dedicated "Control Panel" spreadsheet and sets up the Admin menu trigger.
 * This function needs to be run manually once from the Apps Script editor.
 */
function createAdminControlPanel() {
  // 1. Create the new spreadsheet
  const ss = SpreadsheetApp.create('Anwar Sales Ecosystem - Control Panel');
  const url = ss.getUrl();
  
  // 2. Create an installable trigger for this specific spreadsheet
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(ss)
    .onOpen()
    .create();
    
  // 3. Log the URL for the user
  Logger.log(`Admin Control Panel created. Please open it to continue setup: ${url}`);
  SpreadsheetApp.getUi().alert(`Admin Control Panel created!`, `Please open it to continue setup: ${url}`, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Creates trigger specifically for the Retailer Point Request form.
 * Call this after creating the form with setupRetailerPointRequestForm().
 */
function createRetailerPointRequestTrigger() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST;
    
    if (!spreadsheetId || spreadsheetId === '1RPR_SPREADSHEET_ID_TO_BE_REPLACED') {
      ui.alert('Error', 'Please first create the Retailer Point Request form using "🏪 Setup Retailer Point Request Form" menu option, then update the spreadsheet ID in config.js', ui.ButtonSet.OK);
      return;
    }
    
    // Check if trigger already exists
    const existingTriggers = ScriptApp.getProjectTriggers();
    const existingTrigger = existingTriggers.find(trigger => 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
      trigger.getTriggerSourceId() === spreadsheetId
    );
    
    if (existingTrigger) {
      ui.alert('Info', 'Trigger for Retailer Point Request form already exists.', ui.ButtonSet.OK);
      return;
    }
    
    // Create the trigger
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    ui.alert('Success', 'Trigger created successfully for Retailer Point Request form submissions!', ui.ButtonSet.OK);
    Logger.log('Created trigger for Retailer Point Request form: ' + spreadsheetId);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error creating Retailer Point Request trigger: ' + error.toString());
  }
}
