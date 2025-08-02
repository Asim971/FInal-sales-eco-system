/**
 * @fileoverview This file contains the project setup functionality.
 */

/**
 * Safely gets the UI context if available, or returns null if not in UI context.
 * @returns {Ui|null} The UI object or null if not available
 */
function getSafeUi() {
  try {
    return SpreadsheetApp.getUi();
  } catch (error) {
    // Not in UI context (e.g., running from script editor)
    return null;
  }
}

/**
 * Shows a message either via UI alert or console log depending on context.
 * @param {string} title - The title of the message
 * @param {string} message - The message content
 * @param {string} type - The type: 'info', 'error', 'success'
 */
function showMessage(title, message, type = 'info') {
  const ui = getSafeUi();
  
  if (ui) {
    // Running in UI context - show alert
    ui.alert(title, message, ui.ButtonSet.OK);
  } else {
    // Running from script editor - use console
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${emoji} ${title}: ${message}`);
  }
}

/**
 * Creates the entire project structure including Sheets and Forms.
 */
function setupProject() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Project Setup', 'Please enter the Google Drive Folder ID where the project should be created:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) {
    return; // User cancelled
  }

  const folderId = response.getResponseText();
  const folder = DriveApp.getFolderById(folderId);

  if (!folder) {
    ui.alert('Error', `Could not find a folder with the ID: ${folderId}`, ui.ButtonSet.OK);
    return;
  }

  ui.alert('Setup Started', 'The project setup will now begin. This may take a few minutes. You will be notified upon completion.', ui.ButtonSet.OK);

  // Create Spreadsheets
  const crmSS = SpreadsheetApp.create('Anwar Sales - CRM');
  const crmFile = DriveApp.getFileById(crmSS.getId());
  crmFile.moveTo(folder);
  Logger.log(`Created Spreadsheet: ${crmSS.getName()} in folder ${folder.getName()}`);
  
  // Add all sheets to the CRM spreadsheet with proper headers
  const sheetNames = Object.values(CONFIG.SHEET_NAMES);
  let sheetsCreated = 0;
  
  sheetNames.forEach(sheetName => {
    if (typeof sheetName === 'string') {
      try {
        verifyAndHealSheet(sheetName, crmSS);
        sheetsCreated++;
        Logger.log(`Successfully created/verified sheet: ${sheetName}`);
      } catch (error) {
        Logger.log(`Error creating sheet ${sheetName}: ${error.toString()}`);
      }
    }
  });
  
  // Only delete Sheet1 if we have successfully created other sheets
  if (sheetsCreated > 0) {
    const defaultSheet = crmSS.getSheetByName('Sheet1');
    if (defaultSheet && crmSS.getSheets().length > 1) {
      try {
        crmSS.deleteSheet(defaultSheet);
        Logger.log('Successfully deleted default Sheet1');
      } catch (error) {
        Logger.log(`Could not delete Sheet1: ${error.toString()}`);
      }
    }
  }


  // Create Forms
  for (const formKey in CONFIG.FORMS) {
    const formConfig = CONFIG.FORMS[formKey];
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection if specified
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      // Add help text if specified
      if (item.helpText && formItem) {
        formItem.setHelpText(item.helpText);
      }
    });
    Logger.log(`Created Form: ${form.getTitle()} and linked Spreadsheet.`);
  }

  ui.alert('Setup Complete', 'All necessary Spreadsheets and Forms have been created in the specified folder.', ui.ButtonSet.OK);
}

/**
 * Creates a form from the configuration with a menu-driven interface.
 */
function createFormFromConfig() {
  const ui = SpreadsheetApp.getUi();
  
  // Get list of available forms from CONFIG
  const formKeys = Object.keys(CONFIG.FORMS);
  const formChoices = formKeys.map(key => `${key} - ${CONFIG.FORMS[key].title}`);
  
  // Show form selection dialog
  const formSelection = ui.prompt(
    'Select Form to Create',
    `Choose a form to create:\n\n${formChoices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')}\n\nEnter the number (1-${formChoices.length}):`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (formSelection.getSelectedButton() !== ui.Button.OK) {
    return; // User cancelled
  }
  
  const selectedIndex = parseInt(formSelection.getResponseText().trim()) - 1;
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= formKeys.length) {
    ui.alert('Error', 'Invalid selection. Please enter a valid number.', ui.ButtonSet.OK);
    return;
  }
  
  const selectedFormKey = formKeys[selectedIndex];
  const formConfig = CONFIG.FORMS[selectedFormKey];
  
  // Get folder ID
  const folderPrompt = ui.prompt(
    'Google Drive Folder',
    `Creating: ${formConfig.title}\n\nPlease enter the Google Drive folder ID where you want to create this form and its response spreadsheet:`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (folderPrompt.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const folderId = folderPrompt.getResponseText().trim();
  if (!folderId) {
    ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const folder = DriveApp.getFolderById(folderId);
    ui.alert('Setup Started', `Creating ${formConfig.title} form and spreadsheet. Please wait...`, ui.ButtonSet.OK);
    
    const result = createFormWithConfig(selectedFormKey, formConfig, folder);
    
    const message = `${formConfig.title} created successfully!

Form URL: ${result.form.getPublishedUrl()}
Spreadsheet URL: ${result.spreadsheet.getUrl()}
Spreadsheet ID: ${result.spreadsheet.getId()}

Important: Please update the CONFIG.SPREADSHEET_IDS.${selectedFormKey} 
in your config.js file with this spreadsheet ID: ${result.spreadsheet.getId()}

The form submission trigger has been automatically created.`;
    
    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
    Logger.log(`Created ${formConfig.title} Form: ${result.form.getTitle()}`);
    Logger.log(`Form URL: ${result.form.getPublishedUrl()}`);
    Logger.log(`Spreadsheet ID: ${result.spreadsheet.getId()}`);
    
  } catch (error) {
    ui.alert('Error', `Failed to create ${formConfig.title}: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error in createFormFromConfig for ${selectedFormKey}: ${error.toString()}`);
  }
}

/**
 * Universal form creation function using configuration.
 * @param {string} formKey - The key from CONFIG.FORMS
 * @param {Object} formConfig - The form configuration object
 * @param {Folder} folder - The Google Drive folder to create files in
 * @returns {Object} Object containing the created form and spreadsheet
 */
function createFormWithConfig(formKey, formConfig, folder) {
  try {
    // Create the form
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection if specified
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    // Create response spreadsheet
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Add form items from configuration
    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      // Add help text if specified
      if (item.helpText && formItem) {
        formItem.setHelpText(item.helpText);
      }
    });

    // Create the form submission trigger
    try {
      ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
        .forSpreadsheet(ss.getId())
        .onFormSubmit()
        .create();
      Logger.log(`Created form submission trigger for ${formConfig.title}`);
    } catch (triggerError) {
      Logger.log(`Error creating trigger for ${formConfig.title}: ${triggerError.toString()}`);
      // Continue anyway as the form was created successfully
    }

    // Ensure the CRM spreadsheet has the corresponding approval sheet if needed
    try {
      const approvalSheetKey = `${formKey}_APPROVALS`;
      if (CONFIG.SCHEMAS[approvalSheetKey] && CONFIG.SHEET_NAMES[approvalSheetKey]) {
        const crmSS = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
        getOrCreateSheet(crmSS, CONFIG.SHEET_NAMES[approvalSheetKey], CONFIG.SCHEMAS[approvalSheetKey]);
        Logger.log(`Created/verified ${CONFIG.SHEET_NAMES[approvalSheetKey]} sheet in CRM spreadsheet`);
      }
    } catch (crmError) {
      Logger.log(`Error with CRM sheet for ${formKey}: ${crmError.toString()}`);
    }
    
    return {
      form: form,
      spreadsheet: ss
    };
    
  } catch (error) {
    Logger.log(`Error in createFormWithConfig for ${formKey}: ${error.toString()}`);
    throw error;
  }
}

/**
 * Creates a form with configuration using default folder or prompting for folder.
 * This is a wrapper for createFormWithConfig that handles the folder parameter.
 * @param {string} formKey - The key of the form configuration in CONFIG.FORMS
 * @returns {Object} Result object with success status and form/spreadsheet references
 */
function createFormWithConfigSimple(formKey) {
  // Get the form configuration
  const formConfig = CONFIG.FORMS[formKey];
  if (!formConfig) {
    throw new Error(`Form configuration not found for key: ${formKey}`);
  }
  
  const ui = getSafeUi();
  let folder;
  
  if (ui) {
    // Running in UI context - prompt for folder
    const folderPrompt = ui.prompt(
      'Google Drive Folder',
      `Creating: ${formConfig.title}\n\nPlease enter the Google Drive folder ID where you want to create this form and its response spreadsheet:`,
      ui.ButtonSet.OK_CANCEL
    );
    
    if (folderPrompt.getSelectedButton() !== ui.Button.OK) {
      throw new Error('Setup cancelled by user');
    }
    
    const folderId = folderPrompt.getResponseText().trim();
    if (!folderId) {
      throw new Error('No folder ID provided');
    }
    
    folder = DriveApp.getFolderById(folderId);
  } else {
    // Running from script editor - use root folder or create a default one
    const folderName = 'Anwar Sales Ecosystem Forms';
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      folder = folders.next();
      console.log(`Using existing folder: ${folderName}`);
    } else {
      folder = DriveApp.createFolder(folderName);
      console.log(`Created new folder: ${folderName}`);
    }
  }
  
  return createFormWithConfig(formKey, formConfig, folder);
}

/**
 * Creates all available forms at once.
 */
function createAllForms() {
  const ui = SpreadsheetApp.getUi();
  
  const folderPrompt = ui.prompt(
    'Create All Forms',
    'This will create ALL forms from the configuration.\n\nPlease enter the Google Drive folder ID where you want to create all forms and spreadsheets:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (folderPrompt.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const folderId = folderPrompt.getResponseText().trim();
  if (!folderId) {
    ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const folder = DriveApp.getFolderById(folderId);
    ui.alert('Setup Started', 'Creating all forms and spreadsheets. This may take several minutes. Please wait...', ui.ButtonSet.OK);
    
    const results = [];
    const formKeys = Object.keys(CONFIG.FORMS);
    
    for (const formKey of formKeys) {
      try {
        const formConfig = CONFIG.FORMS[formKey];
        const result = createFormWithConfig(formKey, formConfig, folder);
        results.push({
          key: formKey,
          title: formConfig.title,
          formUrl: result.form.getPublishedUrl(),
          spreadsheetId: result.spreadsheet.getId(),
          success: true
        });
        Logger.log(`Successfully created: ${formConfig.title}`);
      } catch (error) {
        results.push({
          key: formKey,
          title: CONFIG.FORMS[formKey].title,
          error: error.message,
          success: false
        });
        Logger.log(`Failed to create ${formKey}: ${error.toString()}`);
      }
    }
    
    // Generate summary message
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    let message = `Form Creation Summary:
✅ Successfully created: ${successful.length} forms
❌ Failed: ${failed.length} forms

IMPORTANT: Please update the following spreadsheet IDs in your config.js file:

${successful.map(r => `CONFIG.SPREADSHEET_IDS.${r.key} = '${r.spreadsheetId}';`).join('\n')}

Form URLs:
${successful.map(r => `${r.title}: ${r.formUrl}`).join('\n')}`;

    if (failed.length > 0) {
      message += `\n\nFailed forms:\n${failed.map(r => `❌ ${r.title}: ${r.error}`).join('\n')}`;
    }
    
    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', `Failed to create forms: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error in createAllForms: ${error.toString()}`);
  }
}

/**
 * Creates triggers for all configured form spreadsheets.
 */
function createAllFormTriggers() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('Setup Started', 'Creating triggers for all configured forms. Please wait...', ui.ButtonSet.OK);
  
  const results = [];
  const formSpreadsheetIds = [
    { key: 'ENGINEER_REGISTRATION', id: CONFIG.SPREADSHEET_IDS.ENGINEER_REGISTRATION, name: 'Engineer Registration' },
    { key: 'ENGINEER_UPDATE', id: CONFIG.SPREADSHEET_IDS.ENGINEER_UPDATE, name: 'Engineer Update' },
    { key: 'POTENTIAL_SITE', id: CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE, name: 'Potential Site' },
    { key: 'POTENTIAL_SITE_UPDATE', id: CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE_UPDATE, name: 'Potential Site Update' },
    { key: 'RETAILER_REGISTRATION', id: CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION, name: 'Retailer Registration' },
    { key: 'PARTNER_UPDATE', id: CONFIG.SPREADSHEET_IDS.PARTNER_UPDATE, name: 'Partner Update' },
    { key: 'PARTNER_REGISTRATION', id: CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION, name: 'Partner Registration' },
    { key: 'ORDER_CREATION', id: CONFIG.SPREADSHEET_IDS.ORDER_CREATION, name: 'Order Creation' },
    { key: 'DISPUTE_CREATION', id: CONFIG.SPREADSHEET_IDS.DISPUTE_CREATION, name: 'Dispute Creation' },
    { key: 'SITE_PRESCRIPTION', id: CONFIG.SPREADSHEET_IDS.SITE_PRESCRIPTION, name: 'Site Prescription' },
    { key: 'VISIT', id: CONFIG.SPREADSHEET_IDS.VISIT, name: 'Visit' },
    { key: 'VISIT_UPDATE', id: CONFIG.SPREADSHEET_IDS.VISIT_UPDATE, name: 'Visit Update' },
    { key: 'IHB_REGISTRATION', id: CONFIG.SPREADSHEET_IDS.IHB_REGISTRATION, name: 'IHB Registration' },
    { key: 'RETAILER_POINT_REQUEST', id: CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST, name: 'Retailer Point Request' }
  ];
  
  for (const form of formSpreadsheetIds) {
    try {
      if (form.id && form.id !== '' && !form.id.includes('Replace with actual ID')) {
        ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
          .forSpreadsheet(form.id)
          .onFormSubmit()
          .create();
        
        results.push({
          name: form.name,
          key: form.key,
          id: form.id,
          success: true
        });
        Logger.log(`Created trigger for ${form.name}: ${form.id}`);
      } else {
        results.push({
          name: form.name,
          key: form.key,
          id: form.id || 'Not configured',
          success: false,
          error: 'Spreadsheet ID not configured'
        });
      }
    } catch (error) {
      results.push({
        name: form.name,
        key: form.key,
        id: form.id,
        success: false,
        error: error.message
      });
      Logger.log(`Failed to create trigger for ${form.name}: ${error.toString()}`);
    }
  }
  
  // Create CRM edit trigger
  try {
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_EDIT)
      .forSpreadsheet(CONFIG.SPREADSHEET_IDS.CRM)
      .onEdit()
      .create();
    
    results.push({
      name: 'CRM Edit Trigger',
      key: 'CRM',
      id: CONFIG.SPREADSHEET_IDS.CRM,
      success: true
    });
    Logger.log(`Created CRM edit trigger: ${CONFIG.SPREADSHEET_IDS.CRM}`);
    
  } catch (error) {
    results.push({
      name: 'CRM Edit Trigger',
      key: 'CRM',
      id: CONFIG.SPREADSHEET_IDS.CRM,
      success: false,
      error: error.message
    });
    Logger.log(`Failed to create CRM edit trigger: ${error.toString()}`);
  }
  
  // Generate summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  let message = `Trigger Creation Summary:
✅ Successfully created: ${successful.length} triggers
❌ Failed: ${failed.length} triggers

Successful triggers:
${successful.map(r => `✅ ${r.name}`).join('\n')}`;

  if (failed.length > 0) {
    message += `\n\nFailed triggers:
${failed.map(r => `❌ ${r.name}: ${r.error}`).join('\n')}

Note: Failed triggers are usually due to missing or invalid spreadsheet IDs in config.js`;
  }
  
  ui.alert('Trigger Creation Complete', message, ui.ButtonSet.OK);
}

/**
 * Creates specifically the Retailer Point Request form and sets up its trigger.
 */
function setupRetailerPointRequestForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Check if the form already exists
    const existingSpreadsheetId = CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST;
    if (existingSpreadsheetId && existingSpreadsheetId !== '1RPR_SPREADSHEET_ID_TO_BE_REPLACED') {
      const response = ui.alert('Form Already Exists', 
        'A Retailer Point Request form appears to already exist. Do you want to create a new one?', 
        ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        return;
      }
    }
    
    const response = ui.prompt('Setup Retailer Point Request Form', 
      'Please enter the Google Drive Folder ID where the form should be created:', 
      ui.ButtonSet.OK_CANCEL);

    if (response.getSelectedButton() !== ui.Button.OK) {
      return; // User cancelled
    }

    const folderId = response.getResponseText().trim();
    if (!folderId) {
      ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      ui.alert('Error', `Could not find a folder with the ID: ${folderId}`, ui.ButtonSet.OK);
      return;
    }

    ui.alert('Setup Started', 'Creating Retailer Point Request form and spreadsheet. Please wait...', ui.ButtonSet.OK);

    // Create the form
    const formConfig = CONFIG.FORMS.RETAILER_POINT_REQUEST;
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    // Create response spreadsheet
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Add form items
    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      // Add help text if specified
      if (item.helpText && formItem) {
        formItem.setHelpText(item.helpText);
      }
    });

    // Create the trigger for this form
    try {
      ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
        .forSpreadsheet(ss.getId())
        .onFormSubmit()
        .create();
      Logger.log('Created form submission trigger for Retailer Point Request form');
    } catch (triggerError) {
      Logger.log('Error creating trigger: ' + triggerError.toString());
      // Continue anyway as the form was created successfully
    }

    // Ensure the CRM spreadsheet has the Retailer Point Requests sheet
    try {
      const crmSS = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      getOrCreateSheet(crmSS, CONFIG.SHEET_NAMES.RETAILER_POINT_REQUESTS, CONFIG.SCHEMAS.RETAILER_POINT_REQUESTS);
      Logger.log('Created/verified Retailer Point Requests sheet in CRM spreadsheet');
    } catch (crmError) {
      Logger.log('Error with CRM sheet: ' + crmError.toString());
    }

    const message = `Retailer Point Request form created successfully!

Form URL: ${form.getPublishedUrl()}
Spreadsheet URL: ${ss.getUrl()}
Spreadsheet ID: ${ss.getId()}

Important: Please update the CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST 
in your config.js file with this spreadsheet ID: ${ss.getId()}`;

    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
    Logger.log(`Created Retailer Point Request Form: ${form.getTitle()}`);
    Logger.log(`Form URL: ${form.getPublishedUrl()}`);
    Logger.log(`Spreadsheet ID: ${ss.getId()}`);

  } catch (error) {
    ui.alert('Error', `Failed to create Retailer Point Request form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupRetailerPointRequestForm: ' + error.toString());
  }
}

/**
 * Creates specifically the Visit form and sets up its trigger.
 */
function setupVisitForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Check if the form already exists
    const existingSpreadsheetId = CONFIG.SPREADSHEET_IDS.VISIT;
    if (existingSpreadsheetId && existingSpreadsheetId !== '1-nSNDZaUcNRK088teWgQVZjKpU9RIZXq2o_ZcOuptJc') {
      const response = ui.alert('Form Already Exists', 
        'A Visit form appears to already exist. Do you want to create a new one?', 
        ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        return;
      }
    }
    
    const response = ui.prompt('Setup Visit Form', 
      'Please enter the Google Drive Folder ID where the form should be created:', 
      ui.ButtonSet.OK_CANCEL);

    if (response.getSelectedButton() !== ui.Button.OK) {
      return; // User cancelled
    }

    const folderId = response.getResponseText().trim();
    if (!folderId) {
      ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      ui.alert('Error', `Could not find a folder with the ID: ${folderId}`, ui.ButtonSet.OK);
      return;
    }

    ui.alert('Setup Started', 'Creating Visit form and spreadsheet. Please wait...', ui.ButtonSet.OK);

    // Create the form
    const formConfig = CONFIG.FORMS.VISIT;
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    // Create response spreadsheet
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Add form items
    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      if (formItem && item.helpText) {
        formItem.setHelpText(item.helpText);
      }
    });

    // Create the form submission trigger
    const trigger = ScriptApp.newTrigger('onFormSubmitTrigger')
      .forSpreadsheet(ss.getId())
      .onFormSubmit()
      .create();

    // Ensure the CRM spreadsheet has the Visits sheet
    try {
      const crmSS = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      getOrCreateSheet(crmSS, CONFIG.SHEET_NAMES.VISITS, CONFIG.SCHEMAS.VISITS);
      Logger.log('Created/verified Visits sheet in CRM spreadsheet');
    } catch (crmError) {
      Logger.log('Error with CRM sheet: ' + crmError.toString());
    }

    const message = `Visit form created successfully!

Form URL: ${form.getPublishedUrl()}
Spreadsheet URL: ${ss.getUrl()}
Spreadsheet ID: ${ss.getId()}

Important: Please update the CONFIG.SPREADSHEET_IDS.VISIT 
in your config.js file with this spreadsheet ID: ${ss.getId()}

The form submission trigger has been automatically created.`;

    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
    Logger.log(`Created Visit Form: ${form.getTitle()}`);
    Logger.log(`Form URL: ${form.getPublishedUrl()}`);
    Logger.log(`Spreadsheet ID: ${ss.getId()}`);
    Logger.log(`Trigger created for Visit form submissions`);

  } catch (error) {
    ui.alert('Error', `Failed to create Visit form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupVisitForm: ' + error.toString());
  }
}

/**
 * Creates specifically the Visit Update form and sets up its trigger.
 */
function setupVisitUpdateForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Check if the form already exists
    const existingSpreadsheetId = CONFIG.SPREADSHEET_IDS.VISIT_UPDATE;
    if (existingSpreadsheetId && existingSpreadsheetId !== '1VU_SPREADSHEET_ID_TO_BE_REPLACED') {
      const response = ui.alert('Form Already Exists', 
        'A Visit Update form appears to already exist. Do you want to create a new one?', 
        ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        return;
      }
    }
    
    const response = ui.prompt('Setup Visit Update Form', 
      'Please enter the Google Drive Folder ID where the form should be created:', 
      ui.ButtonSet.OK_CANCEL);

    if (response.getSelectedButton() !== ui.Button.OK) {
      return; // User cancelled
    }

    const folderId = response.getResponseText().trim();
    if (!folderId) {
      ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      ui.alert('Error', `Could not find a folder with the ID: ${folderId}`, ui.ButtonSet.OK);
      return;
    }

    ui.alert('Setup Started', 'Creating Visit Update form and spreadsheet. Please wait...', ui.ButtonSet.OK);

    // Create the form
    const formConfig = CONFIG.FORMS.VISIT_UPDATE;
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    // Create response spreadsheet
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Add form items
    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      // Add help text if specified
      if (item.helpText && formItem) {
        formItem.setHelpText(item.helpText);
      }
    });

    // Create the trigger for this form
    try {
      ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
        .forSpreadsheet(ss.getId())
        .onFormSubmit()
        .create();
      Logger.log('Created form submission trigger for Visit Update form');
    } catch (triggerError) {
      Logger.log('Error creating trigger: ' + triggerError.toString());
      // Continue anyway as the form was created successfully
    }

    const message = `Visit Update form created successfully!

Form URL: ${form.getPublishedUrl()}
Spreadsheet URL: ${ss.getUrl()}
Spreadsheet ID: ${ss.getId()}

Important: Please update the CONFIG.SPREADSHEET_IDS.VISIT_UPDATE 
in your config.js file with this spreadsheet ID: ${ss.getId()}

Instructions:
1. Use this form to update existing visit records
2. Only the original submitter or admins can update visits
3. Only fill in fields you want to update (leave others blank)
4. Visit ID is required to identify which visit to update`;

    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
    Logger.log(`Created Visit Update Form: ${form.getTitle()}`);
    Logger.log(`Form URL: ${form.getPublishedUrl()}`);
    Logger.log(`Spreadsheet ID: ${ss.getId()}`);

  } catch (error) {
    ui.alert('Error', `Failed to create Visit Update form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupVisitUpdateForm: ' + error.toString());
  }
}

/**
 * Creates specifically the Site Prescription form and sets up its trigger.
 */
function setupSitePrescriptionForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Ask for the folder ID where the forms should be stored
    const response = ui.prompt('Setup Site Prescription Form', 
      'Please enter the Google Drive folder ID where you want to create the Site Prescription form and spreadsheet:', 
      ui.ButtonSet.OK_CANCEL);
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return; // User cancelled
    }

    const folderId = response.getResponseText().trim();
    if (!folderId) {
      ui.alert('Error', 'Please provide a valid folder ID.', ui.ButtonSet.OK);
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      ui.alert('Error', `Could not find a folder with the ID: ${folderId}`, ui.ButtonSet.OK);
      return;
    }

    ui.alert('Setup Started', 'Creating Site Prescription form and spreadsheet. Please wait...', ui.ButtonSet.OK);

    // Create the form
    const formConfig = CONFIG.FORMS.SITE_PRESCRIPTION;
    const form = FormApp.create(formConfig.title);
    const formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(folder);
    
    // Enable automatic email collection
    if (formConfig.collectEmail) {
      form.setCollectEmail(true);
    }
    
    // Create response spreadsheet
    const ss = SpreadsheetApp.create(formConfig.title + ' (Responses)');
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Add form items
    formConfig.items.forEach(item => {
      let formItem;
      switch (item.type) {
        case 'TEXT':
          formItem = form.addTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'PARAGRAPH_TEXT':
          formItem = form.addParagraphTextItem().setTitle(item.title).setRequired(item.required || false);
          break;
        case 'MULTIPLE_CHOICE':
          formItem = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.choices).setRequired(item.required || false);
          break;
        case 'FILE_UPLOAD':
          formItem = form.addFileUploadItem().setTitle(item.title).setRequired(item.required || false);
          break;
      }
      
      // Add help text if specified
      if (item.helpText && formItem) {
        formItem.setHelpText(item.helpText);
      }
    });

    // Create the trigger for this form
    try {
      ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
        .forSpreadsheet(ss.getId())
        .onFormSubmit()
        .create();
      Logger.log('Created form submission trigger for Site Prescription form');
    } catch (triggerError) {
      Logger.log('Error creating trigger: ' + triggerError.toString());
      // Continue anyway as the form was created successfully
    }

    // Ensure the CRM spreadsheet has the Site Prescription Approvals sheet
    try {
      const crmSS = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      getOrCreateSheet(crmSS, CONFIG.SHEET_NAMES.SITE_PRESCRIPTION_APPROVALS, CONFIG.SCHEMAS.SITE_PRESCRIPTION_APPROVALS);
      Logger.log('Created/verified Site Prescription Approvals sheet in CRM spreadsheet');
    } catch (crmError) {
      Logger.log('Error with CRM sheet: ' + crmError.toString());
    }

    const message = `Site Prescription form created successfully!

Form URL: ${form.getPublishedUrl()}
Spreadsheet URL: ${ss.getUrl()}
Spreadsheet ID: ${ss.getId()}

Important: Please update the CONFIG.SPREADSHEET_IDS.SITE_PRESCRIPTION 
in your config.js file with this spreadsheet ID: ${ss.getId()}

The form submission trigger has been automatically created.`;

    ui.alert('Setup Complete', message, ui.ButtonSet.OK);
    
    Logger.log(`Created Site Prescription Form: ${form.getTitle()}`);
    Logger.log(`Form URL: ${form.getPublishedUrl()}`);
    Logger.log(`Spreadsheet ID: ${ss.getId()}`);
    Logger.log(`Trigger created for Site Prescription form submissions`);

  } catch (error) {
    ui.alert('Error', `Failed to create Site Prescription form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupSitePrescriptionForm: ' + error.toString());
  }
}

/**
 * Sets up the Potential Site Update form and spreadsheet.
 */
function setupPotentialSiteUpdateForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('Setup Started', 'Setting up Potential Site Update form. Please wait...', ui.ButtonSet.OK);
    
    const result = createFormWithConfig('POTENTIAL_SITE_UPDATE');
    
    if (result.success) {
      let message = `✅ Potential Site Update Form Setup Complete!\n\n`;
      message += `📋 Form Name: ${result.form.getTitle()}\n`;
      message += `🔗 Form URL: ${result.form.getPublishedUrl()}\n`;
      message += `📊 Spreadsheet: ${result.spreadsheet.getName()}\n`;
      message += `🆔 Spreadsheet ID: ${result.spreadsheet.getId()}\n\n`;
      message += `⚠️ Important: Please update config.js with the new spreadsheet ID:\n`;
      message += `POTENTIAL_SITE_UPDATE: '${result.spreadsheet.getId()}'`;
      
      ui.alert('Setup Complete', message, ui.ButtonSet.OK);
      
      Logger.log(`✅ Potential Site Update form setup completed successfully`);
      Logger.log(`Form URL: ${result.form.getPublishedUrl()}`);
      Logger.log(`Spreadsheet ID: ${result.spreadsheet.getId()}`);
      
    } else {
      ui.alert('Setup Failed', `Failed to create form: ${result.error}`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to setup Potential Site Update form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupPotentialSiteUpdateForm: ' + error.toString());
  }
}

/**
 * Sets up the Partner Update form and spreadsheet.
 */
function setupPartnerUpdateForm() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.alert('Setup Started', 'Setting up Partner Update form. Please wait...', ui.ButtonSet.OK);
    
    const result = createFormWithConfig('PARTNER_UPDATE');
    
    if (result.success) {
      let message = `✅ Partner Update Form Setup Complete!\n\n`;
      message += `📋 Form Name: ${result.form.getTitle()}\n`;
      message += `🔗 Form URL: ${result.form.getPublishedUrl()}\n`;
      message += `📊 Spreadsheet: ${result.spreadsheet.getName()}\n`;
      message += `🆔 Spreadsheet ID: ${result.spreadsheet.getId()}\n\n`;
      message += `⚠️ Important: Please update config.js with the new spreadsheet ID:\n`;
      message += `PARTNER_UPDATE: '${result.spreadsheet.getId()}'`;
      
      ui.alert('Setup Complete', message, ui.ButtonSet.OK);
      
      Logger.log(`✅ Partner Update form setup completed successfully`);
      Logger.log(`Form URL: ${result.form.getPublishedUrl()}`);
      Logger.log(`Spreadsheet ID: ${result.spreadsheet.getId()}`);
      
    } else {
      ui.alert('Setup Failed', `Failed to create form: ${result.error}`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to setup Partner Update form: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in setupPartnerUpdateForm: ' + error.toString());
  }
}

/**
 * Sets up the Order Creation form and spreadsheet.
 * Can be run from both UI context (menu) and script editor.
 */
function setupOrderCreationForm() {
  const ui = getSafeUi();
  
  try {
    showMessage('Setup Started', 'Setting up User Order Creation form. Please wait...', 'info');
    
    const result = createFormWithConfigSimple('ORDER_CREATION');
    
    if (result.form && result.spreadsheet) {
      let message = `✅ User Order Creation Form Setup Complete!\n\n`;
      message += `📋 Form Name: ${result.form.getTitle()}\n`;
      message += `🔗 Form URL: ${result.form.getPublishedUrl()}\n`;
      message += `📊 Spreadsheet: ${result.spreadsheet.getName()}\n`;
      message += `🆔 Spreadsheet ID: ${result.spreadsheet.getId()}\n\n`;
      message += `⚠️ Important: Please update config.js with the new spreadsheet ID:\n`;
      message += `ORDER_CREATION: '${result.spreadsheet.getId()}'\n\n`;
      message += `🎯 Form Features:\n`;
      message += `• Potential Site ID tagging\n`;
      message += `• Multiple order types (Cement, Rod, Brick, etc.)\n`;
      message += `• Territory-wise notifications\n`;
      message += `• Engineer and Partner requirements\n`;
      message += `• Document upload support\n`;
      message += `• Automatic order ID generation (ORD-001 format)\n\n`;
      message += `📋 Instructions:\n`;
      message += `1. Users must provide valid Potential Site ID (P.S-XXX)\n`;
      message += `2. Site must be "Approved" status\n`;
      message += `3. Territory-based notifications sent automatically\n`;
      message += `4. Order tracking in CRM Orders sheet\n\n`;
      message += `The form submission trigger has been automatically created.`;
      
      showMessage('Setup Complete', message, 'success');
      
      console.log(`✅ Order Creation form setup completed successfully`);
      console.log(`Form URL: ${result.form.getPublishedUrl()}`);
      console.log(`Spreadsheet ID: ${result.spreadsheet.getId()}`);
      
    } else {
      showMessage('Setup Failed', `Failed to create form: Missing form or spreadsheet in result`, 'error');
    }
    
  } catch (error) {
    showMessage('Error', `Failed to setup Order Creation form: ${error.message}`, 'error');
    console.log('Error in setupOrderCreationForm: ' + error.toString());
  }
}

/**
 * Creates and sets up the Demand Generation Request form.
 */
function setupDemandGenerationRequestForm() {
  const ui = getSafeUi();
  
  try {
    showMessage('Setup Started', 'Setting up Demand Generation Request form. Please wait...', 'info');
    
    const result = createFormWithConfigSimple('DEMAND_GENERATION_REQUEST');
    
    if (result.form && result.spreadsheet) {
      let message = `✅ Demand Generation Request Form Setup Complete!\n\n`;
      message += `📋 Form Name: ${result.form.getTitle()}\n`;
      message += `🔗 Form URL: ${result.form.getPublishedUrl()}\n`;
      message += `📊 Spreadsheet: ${result.spreadsheet.getName()}\n`;
      message += `🆔 Spreadsheet ID: ${result.spreadsheet.getId()}\n\n`;
      message += `⚠️ Important: Please update config.js with the new spreadsheet ID:\n`;
      message += `DEMAND_GENERATION_REQUEST: '${result.spreadsheet.getId()}'\n\n`;
      message += `🎯 Form Features:\n`;
      message += `• ASM submission with territory validation\n`;
      message += `• Territory, Bazaar, and Area dropdowns\n`;
      message += `• Business Unit selection (AIL/ACL)\n`;
      message += `• BD Incharge notifications and review\n`;
      message += `• Approval/rejection workflow\n`;
      message += `• Automatic request ID generation (DGR-YYYYMMDD-XXX)\n\n`;
      message += `📋 Instructions:\n`;
      message += `1. ASMs submit demand generation requests\n`;
      message += `2. BD Incharge receives notification for review\n`;
      message += `3. BD Incharge approves/rejects with notes\n`;
      message += `4. ASM receives status notification\n`;
      message += `5. Request tracking in CRM Demand Generation Requests sheet\n\n`;
      message += `👥 Access Control:\n`;
      message += `• Submission: ASM role only\n`;
      message += `• Review: BD Incharge role\n`;
      message += `• Fallback: BDO role as backup reviewer\n\n`;
      message += `The form submission trigger has been automatically created.`;
      
      showMessage('Setup Complete', message, 'success');
      
      console.log(`✅ Demand Generation Request form setup completed successfully`);
      console.log(`Form URL: ${result.form.getPublishedUrl()}`);
      console.log(`Spreadsheet ID: ${result.spreadsheet.getId()}`);
      
    } else {
      showMessage('Setup Failed', `Failed to create form: Missing form or spreadsheet in result`, 'error');
    }
    
  } catch (error) {
    showMessage('Error', `Failed to setup Demand Generation Request form: ${error.message}`, 'error');
    console.log('Error in setupDemandGenerationRequestForm: ' + error.toString());
  }
}
