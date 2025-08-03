/**
 * @fileoverview Main entry point for Anwar Sales Ecosystem
 * Contai      .addSubMenu(S      .addSubMenu(SpreadsheetApp.getUi().createMenu('🔧 Admin Functions')
          .addItem('🏪 Setup Retailer Point Request Form', 'setupRetailerPointRequestForm')
          .addItem('📅 Setup Visit Form', 'setupVisitForm')
          .addItem('📝 Setup Visit Update Form', 'setupVisitUpdateForm')
          .addItem('📈 Setup Demand Generation Request Form', 'setupDemandGenerationRequestForm')
          .addSeparator()
          .addItem('🔗 Create All Triggers', 'createAllTriggersMenu')
          .addItem('🔗 Create Visit Form Trigger', 'createVisitFormTriggerMenu')
          .addItem('🔗 Create Visit Update Trigger', 'createVisitUpdateFormTriggerMenu')
          .addItem('🔗 Create Retailer Point Request Trigger', 'createRetailerPointRequestTrigger')
          .addItem('🔗 Create Demand Generation Request Trigger', 'createDemandGenerationTriggerMenu'))tApp.getUi().createMenu('🔧 Admin Functions')
          .addItem('📋 Create Form from Config', 'createFormFromConfig')
          .addItem('📋 Create All Forms', 'createAllForms')
          .addSeparator()
          .addItem('🏪 Setup Retailer Point Request Form', 'setupRetailerPointRequestForm')
          .addItem('📅 Setup Visit Form', 'setupVisitForm')
          .addItem('📝 Setup Visit Update Form', 'setupVisitUpdateForm')
          .addItem('💊 Setup Site Prescription Form', 'setupSitePrescriptionForm')
          .addItem('🏗️ Setup Potential Site Update Form', 'setupPotentialSiteUpdateForm')
          .addItem('🤝 Setup Partner Update Form', 'setupPartnerUpdateForm')
          .addItem('📦 Setup Order Creation Form', 'setupOrderCreationForm')
          .addSeparator()
          .addItem('🔗 Trigger Management', 'createTriggerManagementMenu')
          .addItem('🔗 Create All Triggers', 'createAllFormTriggers')
          .addItem('🔗 Create Visit Form Trigger', 'createVisitFormTriggerMenu')
          .addItem('🔗 Create Visit Update Trigger', 'createVisitUpdateFormTriggerMenu')
          .addItem('🔗 Create Potential Site Update Trigger', 'createPotentialSiteUpdateTriggerMenu')
          .addItem('🔗 Create Partner Update Trigger', 'createPartnerUpdateTriggerMenu')
          .addItem('🔗 Create Order Creation Trigger', 'createOrderCreationTriggerMenu')
          .addItem('🔗 Create Retailer Point Request Trigger', 'createRetailerPointRequestTrigger'))reation and core administrative functions
 */

/**
 * Menu function to create a trigger for form submissions.
 */
function createFormTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.prompt(
    'Create Form Trigger',
    'Enter the spreadsheet ID of the form responses spreadsheet:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const spreadsheetId = response.getResponseText().trim();
  if (!spreadsheetId) {
    ui.alert('Error', 'Please provide a valid spreadsheet ID.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    ui.alert('Success', `Form submission trigger created successfully for spreadsheet: ${spreadsheetId}`, ui.ButtonSet.OK);
    Logger.log(`Created form submission trigger for spreadsheet: ${spreadsheetId}`);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error creating form trigger: ${error.toString()}`);
  }
}

/**
 * Menu function to create edit triggers for the CRM spreadsheet.
 */
function createCRMEditTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_EDIT)
      .forSpreadsheet(CONFIG.SPREADSHEET_IDS.CRM)
      .onEdit()
      .create();
    
    ui.alert('Success', `Edit trigger created successfully for CRM spreadsheet.`, ui.ButtonSet.OK);
    Logger.log(`Created edit trigger for CRM spreadsheet: ${CONFIG.SPREADSHEET_IDS.CRM}`);
    
  } catch (error) {
    ui.alert('Error', `Failed to create CRM edit trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error creating CRM edit trigger: ${error.toString()}`);
  }
}

/**
 * This function runs when a spreadsheet that has an installable trigger for it is opened.
 * It creates the main menu for the application.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('Anwar Sales Admin')
      .addItem('1. Setup Project', 'setupProject')
      .addSeparator()
      .addItem('📊 Initialize CRM Sheets', 'initializeCRMSpreadsheet')
      .addItem('📋 Create All Required Sheets', 'createAllRequiredSheetsMenu')
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu('🔧 Admin Functions')
          .addItem('🏪 Setup Retailer Point Request Form', 'setupRetailerPointRequestForm')
          .addItem('� Setup Visit Form', 'setupVisitForm')
          .addItem('📝 Setup Visit Update Form', 'setupVisitUpdateForm')
          .addSeparator()
          .addItem('🔗 Create All Triggers', 'createAllTriggersMenu')
          .addItem('🔗 Create Visit Form Trigger', 'createVisitFormTriggerMenu')
          .addItem('� Create Visit Update Trigger', 'createVisitUpdateFormTriggerMenu')
          .addItem('🔗 Create Retailer Point Request Trigger', 'createRetailerPointRequestTrigger'))
      .addSeparator()
      .addItem('Verify & Heal Sheets', 'verifyAllSheets')
      .addSeparator()
      .addItem('👥 Add Employee', 'addEmployeeMenu')
      .addItem('📋 View Employees', 'viewEmployeesMenu')
      .addItem('Migrate to New Employee System', 'migrateToNewEmployeeSystem')
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu('🧪 Test Functions')
          .addSubMenu(SpreadsheetApp.getUi().createMenu('🏢 Test Visit Functions')
              .addItem('Quick Visit Test', 'quickVisitTest')
              .addItem('Full Visit Test Suite', 'runAllVisitTests')
              .addItem('Test Visit Config', 'testVisitFormConfig')
              .addItem('Test Visit ID Generation', 'testVisitIdGeneration')
              .addItem('Test Client Lookup', 'testClientLookup')
              .addItem('Test Visit Update', 'testVisitUpdate')
              .addItem('Test Visit Update Form', 'testVisitUpdateFormSubmission'))
          .addSubMenu(SpreadsheetApp.getUi().createMenu('🏠 Test IHB Functions')
              .addItem('Test IHB Form Config', 'testIHBFormConfig')
              .addItem('Test IHB Submission', 'testIHBFormSubmission')
              .addItem('Test IHB Approval', 'testIHBApproval'))
          .addSubMenu(SpreadsheetApp.getUi().createMenu('🏪 Test Retailer Point Functions')
              .addItem('Test Retailer Point Form Config', 'testRetailerPointFormConfig')
              .addItem('Test Retailer Point Submission', 'testRetailerPointFormSubmission')
              .addItem('Test ASM Lookup', 'testASMLookup'))
          .addSeparator()
          .addItem('🔍 Debug Sheet Creation', 'debugSheetCreation')
          .addItem('🛠️ Safe Sheet Creation', 'testSafeSheetCreation'))
      .addToUi();
}

/**
 * Quick test function for visit functionality
 */
function quickVisitTest() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    console.log('🧪 Running Quick Visit Test...');
    
    // Test 1: Configuration
    const configResult = testVisitFormConfig();
    console.log(`Configuration Test: ${configResult ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test 2: ID Generation
    const idResult = testVisitIdGeneration();
    console.log(`ID Generation Test: ${idResult ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test 3: Client Lookup
    const lookupResult = testClientLookup();
    console.log(`Client Lookup Test: ${lookupResult ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = configResult && idResult && lookupResult;
    
    let message = `Quick Visit Test Results:\n\n`;
    message += `✅ Configuration: ${configResult ? 'PASSED' : 'FAILED'}\n`;
    message += `✅ ID Generation: ${idResult ? 'PASSED' : 'FAILED'}\n`;
    message += `✅ Client Lookup: ${lookupResult ? 'PASSED' : 'FAILED'}\n\n`;
    message += `Overall: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`;
    
    ui.alert('Quick Visit Test', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', `Quick visit test failed: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error in quickVisitTest: ' + error.toString());
  }
}

/**
 * Verifies all sheets defined in the CONFIG against the active spreadsheet.
 */
function verifyAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = Object.values(CONFIG.SHEET_NAMES);
  sheetNames.forEach(sheetName => {
    if (typeof sheetName === 'string') {
        verifyAndHealSheet(sheetName, ss);
    }
  });
  SpreadsheetApp.getUi().alert('Sheet verification and healing complete.');
}

/**
 * Menu wrapper function for creating all required sheets
 */
function createAllRequiredSheetsMenu() {
  try {
    const result = createAllRequiredSheets(CONFIG.SPREADSHEET_IDS.CRM);
    
    let message = `Sheet Creation Results:\n\n`;
    message += `✅ Created: ${result.sheetsCreated.length} sheets\n`;
    message += `⏭️ Skipped: ${result.sheetsSkipped.length} sheets\n`;
    message += `❌ Errors: ${result.errors.length} errors\n\n`;
    
    if (result.sheetsCreated.length > 0) {
      message += `Created Sheets:\n${result.sheetsCreated.join('\n')}\n\n`;
    }
    
    if (result.sheetsSkipped.length > 0) {
      message += `Skipped Sheets:\n${result.sheetsSkipped.join('\n')}\n\n`;
    }
    
    if (result.errors.length > 0) {
      message += `Errors:\n${result.errors.join('\n')}`;
    }
    
    SpreadsheetApp.getUi().alert('Sheet Creation Complete', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', `Failed to create sheets: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Menu function to add a new employee to the system.
 */
function addEmployeeMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Get employee details from user
    const nameResponse = ui.prompt('Add Employee', 'Enter employee name:', ui.ButtonSet.OK_CANCEL);
    if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const emailResponse = ui.prompt('Add Employee', 'Enter employee email:', ui.ButtonSet.OK_CANCEL);
    if (emailResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const roleResponse = ui.prompt('Add Employee', 'Enter employee role (BDO, CRO, SR, ASM):', ui.ButtonSet.OK_CANCEL);
    if (roleResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const contactResponse = ui.prompt('Add Employee', 'Enter contact number:', ui.ButtonSet.OK_CANCEL);
    if (contactResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const whatsappResponse = ui.prompt('Add Employee', 'Enter WhatsApp number:', ui.ButtonSet.OK_CANCEL);
    if (whatsappResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const bkashResponse = ui.prompt('Add Employee', 'Enter bKash number (optional):', ui.ButtonSet.OK_CANCEL);
    if (bkashResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const nidResponse = ui.prompt('Add Employee', 'Enter NID number (optional):', ui.ButtonSet.OK_CANCEL);
    if (nidResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const companyResponse = ui.prompt('Add Employee', 'Enter company (ACL, AIL, or leave blank):', ui.ButtonSet.OK_CANCEL);
    if (companyResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const territoryResponse = ui.prompt('Add Employee', 'Enter territory (optional):', ui.ButtonSet.OK_CANCEL);
    if (territoryResponse.getSelectedButton() !== ui.Button.OK) return;
    
    const areaResponse = ui.prompt('Add Employee', 'Enter area (optional):', ui.ButtonSet.OK_CANCEL);
    if (areaResponse.getSelectedButton() !== ui.Button.OK) return;
    
    // Create employee object
    const employee = {
      name: nameResponse.getResponseText().trim(),
      role: roleResponse.getResponseText().trim().toUpperCase(),
      email: emailResponse.getResponseText().trim(),
      contactNumber: contactResponse.getResponseText().trim(),
      whatsappNumber: whatsappResponse.getResponseText().trim(),
      bkashNumber: bkashResponse.getResponseText().trim(),
      nidNo: nidResponse.getResponseText().trim(),
      company: companyResponse.getResponseText().trim(),
      territory: territoryResponse.getResponseText().trim(),
      area: areaResponse.getResponseText().trim(),
      status: 'Active',
      hireDate: new Date().toLocaleDateString(),
      notes: 'Added via admin menu'
    };
    
    // Validate role
    if (!['BDO', 'CRO', 'SR', 'ASM'].includes(employee.role)) {
      ui.alert('Error', 'Invalid role. Please use BDO, CRO, SR, or ASM.', ui.ButtonSet.OK);
      return;
    }
    
    // Add employee
    const employeeId = addEmployee(employee);
    
    if (employeeId) {
      ui.alert('Success', `Employee added successfully!\nEmployee ID: ${employeeId}\nName: ${employee.name}\nRole: ${employee.role}`, ui.ButtonSet.OK);
    } else {
      ui.alert('Error', 'Failed to add employee. Please check the logs.', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', `Failed to add employee: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error in addEmployeeMenu: ${error.toString()}`);
  }
}

/**
 * Menu function to view existing employees.
 */
function viewEmployeesMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
    
    if (!sheet) {
      ui.alert('Error', 'Employees sheet not found. Please initialize CRM sheets first.', ui.ButtonSet.OK);
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('No Employees', 'No employees found in the system.', ui.ButtonSet.OK);
      return;
    }
    
    let message = 'Current Employees:\n\n';
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      message += `ID: ${row[0]}\n`;
      message += `Name: ${row[1]}\n`;
      message += `Role: ${row[2]}\n`;
      message += `Email: ${row[3]}\n`;
      message += `Contact: ${row[4]}\n`;
      message += `WhatsApp: ${row[5]}\n`;
      message += `Company: ${row[10]}\n`;
      message += `Territory: ${row[11]}\n`;
      message += `Area: ${row[12]}\n`;
      message += `Status: ${row[8]}\n`;
      message += '---\n';
    }
    
    ui.alert('Employees List', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('Error', `Failed to view employees: ${error.message}`, ui.ButtonSet.OK);
    Logger.log(`Error in viewEmployeesMenu: ${error.toString()}`);
  }
}

/**
 * Creates a menu for trigger management
 */
function createTriggerManagementMenu() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Trigger Management',
    'Choose an option:\n\n1. Create ALL form triggers\n2. View current triggers\n3. Delete all triggers',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (response === ui.Button.YES) {
    createAllFormTriggers();
  } else if (response === ui.Button.NO) {
    viewCurrentTriggers();
  } else if (response === ui.Button.CANCEL) {
    deleteAllTriggers();
  }
}

/**
 * Views all current triggers
 */
function viewCurrentTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const ui = SpreadsheetApp.getUi();
  
  if (triggers.length === 0) {
    ui.alert('No Triggers Found', 'There are no triggers currently installed for this project.', ui.ButtonSet.OK);
    return;
  }
  
  let message = `Current Triggers (${triggers.length} total):\n\n`;
  
  triggers.forEach((trigger, index) => {
    const eventType = trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT ? 'Form Submit' : 
                     trigger.getEventType() === ScriptApp.EventType.ON_EDIT ? 'Sheet Edit' : 'Other';
    const handlerFunction = trigger.getHandlerFunction();
    const source = trigger.getTriggerSourceId() || 'Unknown';
    
    message += `${index + 1}. ${handlerFunction} (${eventType})\n   Source: ${source}\n\n`;
  });
  
  ui.alert('Current Triggers', message, ui.ButtonSet.OK);
}

/**
 * Deletes all triggers (with confirmation)
 */
function deleteAllTriggers() {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  
  if (triggers.length === 0) {
    ui.alert('No Triggers', 'There are no triggers to delete.', ui.ButtonSet.OK);
    return;
  }
  
  const response = ui.alert(
    'Confirm Deletion',
    `Are you sure you want to delete all ${triggers.length} triggers? This action cannot be undone.`,
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    
    ui.alert('Success', `Deleted ${triggers.length} triggers successfully.`, ui.ButtonSet.OK);
  }
}

/**
 * Menu function to create a trigger for potential site update form submissions.
 */
function createPotentialSiteUpdateTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE_UPDATE;
    
    if (!spreadsheetId || spreadsheetId === '' || spreadsheetId.includes('Replace with actual ID')) {
      ui.alert('Error', 'Please first create the Potential Site Update form and update the spreadsheet ID in config.js', ui.ButtonSet.OK);
      return;
    }
    
    // Check for and delete existing triggers for this spreadsheet
    const existingTriggers = ScriptApp.getProjectTriggers();
    const triggersToDelete = existingTriggers.filter(trigger => 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
      trigger.getTriggerSourceId() === spreadsheetId
    );
    
    // Delete existing triggers
    let deletedCount = 0;
    triggersToDelete.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete existing trigger: ${error.message}`);
      }
    });
    
    // Create the new trigger
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    let message = 'Trigger created successfully for Potential Site Update form submissions!';
    if (deletedCount > 0) {
      message = `Replaced ${deletedCount} existing trigger(s) with new trigger for Potential Site Update form submissions!`;
    }
    
    ui.alert('Success', message, ui.ButtonSet.OK);
    Logger.log('Created trigger for Potential Site Update form: ' + spreadsheetId);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error creating Potential Site Update trigger: ' + error.toString());
  }
}

/**
 * Menu function to create a trigger for partner update form submissions.
 */
function createPartnerUpdateTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.PARTNER_UPDATE;
    
    if (!spreadsheetId || spreadsheetId === '' || spreadsheetId.includes('Replace with actual ID')) {
      ui.alert('Error', 'Please first create the Partner Update form and update the spreadsheet ID in config.js', ui.ButtonSet.OK);
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
      ui.alert('Info', 'Trigger for Partner Update form already exists.', ui.ButtonSet.OK);
      return;
    }
    
    // Create the trigger
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    ui.alert('Success', 'Trigger created successfully for Partner Update form submissions!', ui.ButtonSet.OK);
    Logger.log('Created trigger for Partner Update form: ' + spreadsheetId);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error creating Partner Update trigger: ' + error.toString());
  }
}

/**
 * Menu function to create a trigger for order creation form submissions.
 */
function createOrderCreationTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.ORDER_CREATION;
    
    if (!spreadsheetId || spreadsheetId === '' || spreadsheetId.includes('Replace with actual ID')) {
      ui.alert('Error', 'Please first create the Order Creation form and update the spreadsheet ID in config.js', ui.ButtonSet.OK);
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
      ui.alert('Info', 'Trigger for Order Creation form already exists.', ui.ButtonSet.OK);
      return;
    }
    
    // Create the trigger
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    ui.alert('Success', 'Trigger created successfully for Order Creation form submissions!', ui.ButtonSet.OK);
    Logger.log('Created trigger for Order Creation form: ' + spreadsheetId);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error creating Order Creation trigger: ' + error.toString());
  }
}

/**
 * Menu function to create a trigger for demand generation request form submissions.
 */
function createDemandGenerationTriggerMenu() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const spreadsheetId = CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST;
    
    if (!spreadsheetId || spreadsheetId === '' || spreadsheetId.includes('Replace with actual ID')) {
      ui.alert('Error', 'Please first create the Demand Generation Request form and update the spreadsheet ID in config.js', ui.ButtonSet.OK);
      return;
    }
    
    // Check for and delete existing triggers for this spreadsheet
    const existingTriggers = ScriptApp.getProjectTriggers();
    const triggersToDelete = existingTriggers.filter(trigger => 
      trigger.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT &&
      trigger.getTriggerSourceId() === spreadsheetId
    );
    
    // Delete existing triggers
    let deletedCount = 0;
    triggersToDelete.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete existing trigger: ${error.message}`);
      }
    });
    
    // Create the new trigger
    ScriptApp.newTrigger(CONFIG.TRIGGERS.ON_FORM_SUBMIT)
      .forSpreadsheet(spreadsheetId)
      .onFormSubmit()
      .create();
    
    let message = 'Trigger created successfully for Demand Generation Request form submissions!';
    if (deletedCount > 0) {
      message = `Replaced ${deletedCount} existing trigger(s) with new trigger for Demand Generation Request form submissions!`;
    }
    
    ui.alert('Success', message, ui.ButtonSet.OK);
    Logger.log('Created trigger for Demand Generation Request form: ' + spreadsheetId);
    
  } catch (error) {
    ui.alert('Error', `Failed to create trigger: ${error.message}`, ui.ButtonSet.OK);
    Logger.log('Error creating Demand Generation Request trigger: ' + error.toString());
  }
}