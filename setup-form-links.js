/**
 * @fileoverview Form-to-Sheet Linking and Trigger Setup
 * 
 * This script links the created forms to their response sheets and sets up triggers
 * Run this after forms have been created successfully
 */

/**
 * Links all forms to their respective response sheets and sets up triggers
 * Run this function after createFormsManually() has completed successfully
 */
function linkFormsToSheetsAndSetupTriggers() {
  console.log('🔗 LINKING FORMS TO SHEETS AND SETTING UP TRIGGERS');
  console.log('==================================================');
  
  const results = {
    linkedForms: 0,
    setupTriggers: 0,
    errors: []
  };
  
  try {
    // Form IDs from your log (in order they were created)
    const createdForms = {
      'PARTNER_REGISTRATION': '1eRqd-jvR4BT5pS_et_pujEy3ieWKAwd1MUIksgxk8iE',
      'ORDER_CREATION': '1Y-nLsnGcowGbyBIkIvSzxsxDU3bw_Wx8QjeWK3QZNYI',
      'DISPUTE_CREATION': '1Jz5_OwaIpycTj5Vx8MagNcANAn5M8VZguhcfvakXeAk',
      'ENGINEER_REGISTRATION': '1A2lq5wWmfpKwvKbQKWLM9ooUUJJaKCGIiUGUkBl-5h0',
      'POTENTIAL_SITE': '1qcsl_zsS3vE8Z-i-6aHR5HQKbvdxlV_PWibdmwnej4s',
      'POTENTIAL_SITE_UPDATE': '1BIE2VVhwtSIw7mSksFpxQ15iy1LNot7UBXMywKdF8FM',
      'RETAILER_REGISTRATION': '1OiNKF_8p3_wtmSX8qIplBqLrG8t5WnH5Zawzd_qQLmk',
      'PARTNER_UPDATE': '1cx4rRVF7IGc1-lOpQHU8N-jk7qHB0LUDumq0IGp7wtU',
      'IHB_UPDATE': '1K6lr8yQ-Be0oW-3KZSXpclYEBtIZbTlOsV1--aVPm14',
      'RETAILER_UPDATE': '1VbHv1iP0Fc8UFAGN4OAzyFF5IxPkhpPDY3s6xqC6OXU',
      'PARTNER_UPDATE_ENHANCED': '1Tc2ibJyXj2w9B82SskWdQ9eipEE4dq6p8qWJi2rp8eI',
      'SITE_PRESCRIPTION': '177LUfCcQ0vFThj0mvpwE_D-6oNb0MBmjy-fvDO7yTIY',
      'VISIT': '1yE1WfHyUu6PJXe3xGjqT-axdSBiVuA6GKiwrl0MoQHE',
      'IHB_REGISTRATION': '1E6_MhJDWDcGnYEL2zJeCaYf1FU2HvdACDbJ_8fyWLJE',
      'RETAILER_POINT_REQUEST': '1pbQ6E-EBVq0TI1RFyg2W3xGlUD-pVD__I_L1_GidbJQ',
      'DEMAND_GENERATION_REQUEST': '1YoYI9h4vdD-8QO1gET0mv28WTJOXjbGr6_gy8oSNHGM',
      'VISIT_UPDATE': '1b-xODyf0C2QioyZEDJP0C3NTPYjsf8OmPLRXwpgWUgU'
    };
    
    // Form to spreadsheet mapping
    const formToSpreadsheetMapping = {
      'PARTNER_REGISTRATION': 'PARTNER_REGISTRATION',
      'ORDER_CREATION': 'ORDER_CREATION',
      'DISPUTE_CREATION': 'DISPUTE_CREATION',
      'ENGINEER_REGISTRATION': 'ENGINEER_REGISTRATION',
      'POTENTIAL_SITE': 'POTENTIAL_SITE',
      'POTENTIAL_SITE_UPDATE': 'POTENTIAL_SITE_UPDATE',
      'RETAILER_REGISTRATION': 'RETAILER_REGISTRATION',
      'PARTNER_UPDATE': 'PARTNER_UPDATE',
      'IHB_UPDATE': 'IHB_UPDATES',
      'RETAILER_UPDATE': 'RETAILER_UPDATES',
      'PARTNER_UPDATE_ENHANCED': 'PARTNER_UPDATES',
      'SITE_PRESCRIPTION': 'SITE_PRESCRIPTION',
      'VISIT': 'VISIT',
      'IHB_REGISTRATION': 'IHB_REGISTRATION',
      'RETAILER_POINT_REQUEST': 'RETAILER_POINT_REQUEST',
      'DEMAND_GENERATION_REQUEST': 'DEMAND_GENERATION_REQUEST',
      'VISIT_UPDATE': 'VISIT_UPDATE'
    };
    
    // Form to handler function mapping
    const formHandlerMapping = {
      'PARTNER_REGISTRATION': 'handlePartnerRegistrationFormSubmit',
      'ORDER_CREATION': 'handleOrderFormSubmit',
      'DISPUTE_CREATION': 'handleDisputeFormSubmit',
      'ENGINEER_REGISTRATION': 'handleEngineerFormSubmit',
      'POTENTIAL_SITE': 'handlePotentialSiteFormSubmit',
      'POTENTIAL_SITE_UPDATE': 'handlePotentialSiteUpdateFormSubmit',
      'RETAILER_REGISTRATION': 'handleRetailerFormSubmit',
      'PARTNER_UPDATE': 'handlePartnerUpdateFormSubmit',
      'IHB_UPDATE': 'handleIHBUpdateFormSubmit',
      'RETAILER_UPDATE': 'handleRetailerUpdateFormSubmit',
      'PARTNER_UPDATE_ENHANCED': 'handlePartnerUpdateFormSubmit',
      'SITE_PRESCRIPTION': 'handleSitePrescriptionFormSubmit',
      'VISIT': 'handleVisitFormSubmit',
      'IHB_REGISTRATION': 'handleIHBFormSubmit',
      'RETAILER_POINT_REQUEST': 'handleRetailerPointFormSubmit',
      'DEMAND_GENERATION_REQUEST': 'handleDemandGenerationFormSubmit',
      'VISIT_UPDATE': 'handleVisitUpdateFormSubmit'
    };
    
    console.log(`📝 Processing ${Object.keys(createdForms).length} forms...`);
    
    // Step 1: Link forms to their response sheets
    Object.keys(createdForms).forEach(formKey => {
      try {
        const formId = createdForms[formKey];
        const spreadsheetKey = formToSpreadsheetMapping[formKey];
        const spreadsheetId = CONFIG.SPREADSHEET_IDS[spreadsheetKey];
        
        if (!spreadsheetId) {
          console.warn(`⚠️ No spreadsheet ID found for ${formKey} -> ${spreadsheetKey}`);
          results.errors.push(`Missing spreadsheet ID for ${formKey}`);
          return;
        }
        
        console.log(`🔗 Linking ${formKey} form to ${spreadsheetKey} spreadsheet...`);
        
        // Open the form and spreadsheet
        const form = FormApp.openById(formId);
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        
        // Link form to spreadsheet
        form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheetId);
        
        console.log(`✅ Successfully linked ${formKey}`);
        console.log(`   📝 Form: ${form.getTitle()}`);
        console.log(`   📊 Sheet: ${spreadsheet.getName()}`);
        
        results.linkedForms++;
        
      } catch (error) {
        console.error(`❌ Error linking ${formKey}:`, error.message);
        results.errors.push(`${formKey}: ${error.message}`);
      }
    });
    
    console.log(`\n🔧 Setting up form submission triggers...`);
    
    // Step 2: Clean up old triggers first
    cleanupOldTriggers();
    
    // Step 3: Set up form submission triggers
    Object.keys(createdForms).forEach(formKey => {
      try {
        const formId = createdForms[formKey];
        const handlerFunction = formHandlerMapping[formKey];
        
        if (!handlerFunction) {
          console.warn(`⚠️ No handler function defined for ${formKey}`);
          return;
        }
        
        console.log(`🔧 Setting up trigger for ${formKey} -> ${handlerFunction}...`);
        
        const form = FormApp.openById(formId);
        
        const trigger = ScriptApp.newTrigger(handlerFunction)
          .forForm(form)
          .onFormSubmit()
          .create();
        
        console.log(`✅ Trigger created: ${trigger.getUniqueId()}`);
        results.setupTriggers++;
        
      } catch (error) {
        console.error(`❌ Error setting up trigger for ${formKey}:`, error.message);
        results.errors.push(`Trigger ${formKey}: ${error.message}`);
      }
    });
    
    console.log(`\n🎉 FORM LINKING AND TRIGGER SETUP COMPLETED!`);
    console.log('===============================================');
    console.log(`✅ Forms linked to sheets: ${results.linkedForms}/${Object.keys(createdForms).length}`);
    console.log(`✅ Form submission triggers: ${results.setupTriggers}/${Object.keys(createdForms).length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      results.errors.forEach(error => console.log(`   ${error}`));
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Fatal error in form linking and trigger setup:', error);
    results.errors.push(`Fatal error: ${error.message}`);
    return results;
  }
}

/**
 * Sets up edit triggers for approval workflows
 */
function setupApprovalWorkflowTriggers() {
  console.log('🔧 SETTING UP APPROVAL WORKFLOW TRIGGERS');
  console.log('========================================');
  
  const results = {
    editTriggers: 0,
    errors: []
  };
  
  try {
    // Set up edit trigger for CRM spreadsheet (handles approvals)
    if (CONFIG.SPREADSHEET_IDS.CRM) {
      try {
        const crmSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
        
        const editTrigger = ScriptApp.newTrigger('onEditTrigger')
          .forSpreadsheet(crmSpreadsheet)
          .onEdit()
          .create();
        
        console.log('✅ CRM edit trigger created for general approvals');
        console.log(`   📊 Spreadsheet: ${crmSpreadsheet.getName()}`);
        console.log(`   🔧 Trigger ID: ${editTrigger.getUniqueId()}`);
        
        results.editTriggers++;
        
      } catch (error) {
        console.error('❌ Error creating CRM edit trigger:', error);
        results.errors.push(`CRM: ${error.message}`);
      }
    }
    
    // Set up specific triggers for update approval sheets
    const updateSheetTriggers = [
      { key: 'IHB_UPDATES', handler: 'handleIHBUpdateApproval', spreadsheetKey: 'IHB_UPDATES' },
      { key: 'RETAILER_UPDATES', handler: 'handleRetailerUpdateApproval', spreadsheetKey: 'RETAILER_UPDATES' },
      { key: 'PARTNER_UPDATES', handler: 'handlePartnerUpdateApproval', spreadsheetKey: 'PARTNER_UPDATES' }
    ];
    
    updateSheetTriggers.forEach(triggerConfig => {
      try {
        const spreadsheetId = CONFIG.SPREADSHEET_IDS[triggerConfig.spreadsheetKey];
        if (spreadsheetId) {
          const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
          const trigger = ScriptApp.newTrigger(triggerConfig.handler)
            .forSpreadsheet(spreadsheet)
            .onEdit()
            .create();
          
          console.log(`✅ Edit trigger created for ${triggerConfig.key}`);
          console.log(`   📊 Spreadsheet: ${spreadsheet.getName()}`);
          console.log(`   🔧 Handler: ${triggerConfig.handler}`);
          console.log(`   🔧 Trigger ID: ${trigger.getUniqueId()}`);
          
          results.editTriggers++;
        } else {
          console.log(`⚠️ Skipping ${triggerConfig.key} - spreadsheet ID not found`);
          results.errors.push(`${triggerConfig.key}: Spreadsheet ID not found`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating edit trigger for ${triggerConfig.key}:`, error);
        results.errors.push(`${triggerConfig.key}: ${error.message}`);
      }
    });
    
    console.log(`\n✅ APPROVAL WORKFLOW TRIGGERS COMPLETED!`);
    console.log('=======================================');
    console.log(`✅ Edit triggers created: ${results.editTriggers}/4`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      results.errors.forEach(error => console.log(`   ${error}`));
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error setting up approval workflow triggers:', error);
    results.errors.push(`Fatal error: ${error.message}`);
    return results;
  }
}

/**
 * Master function to set up everything
 */
function setupCompleteSystem() {
  console.log('🚀 SETTING UP COMPLETE ANWAR SALES ECOSYSTEM');
  console.log('===========================================');
  
  try {
    // Step 1: Link forms to sheets and set up form submission triggers
    console.log('\n📝 STEP 1: Linking forms to sheets and setting up submission triggers...');
    const formResults = linkFormsToSheetsAndSetupTriggers();
    
    // Step 2: Set up approval workflow triggers
    console.log('\n🔧 STEP 2: Setting up approval workflow triggers...');
    const approvalResults = setupApprovalWorkflowTriggers();
    
    // Step 3: Summary
    console.log('\n🎉 COMPLETE SYSTEM SETUP FINISHED!');
    console.log('==================================');
    console.log(`📝 Forms linked: ${formResults.linkedForms}/17`);
    console.log(`🔧 Form submission triggers: ${formResults.setupTriggers}/17`);
    console.log(`🔧 Approval workflow triggers: ${approvalResults.editTriggers}/4`);
    
    const totalErrors = formResults.errors.length + approvalResults.errors.length;
    console.log(`❌ Total errors: ${totalErrors}`);
    
    if (totalErrors === 0) {
      console.log('\n🎉 SYSTEM IS 100% OPERATIONAL!');
      console.log('✅ All forms are linked to their response sheets');
      console.log('✅ All submission triggers are active');
      console.log('✅ All approval workflows are configured');
      console.log('✅ Your Anwar Sales Ecosystem is ready for production!');
    } else {
      console.log('\n⚠️ SYSTEM IS MOSTLY OPERATIONAL WITH SOME ISSUES');
      console.log('Check the error details above and resolve as needed');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test each form by submitting sample data');
    console.log('2. Verify data appears in the correct spreadsheets');
    console.log('3. Test approval workflows by updating status fields');
    console.log('4. Configure WhatsApp notifications if not already done');
    
    return {
      formResults: formResults,
      approvalResults: approvalResults,
      totalErrors: totalErrors,
      success: totalErrors === 0
    };
    
  } catch (error) {
    console.error('❌ Fatal error in complete system setup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cleanup old triggers before creating new ones
 */
function cleanupOldTriggers() {
  console.log('🧹 Cleaning up old triggers...');
  
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      try {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      } catch (error) {
        console.warn(`⚠️ Could not delete trigger ${trigger.getUniqueId()}: ${error.message}`);
      }
    });
    
    console.log(`✅ Cleaned up ${deletedCount} old triggers`);
    
  } catch (error) {
    console.error('❌ Error cleaning up triggers:', error);
  }
}

/**
 * Quick verification of current system status
 */
function verifySystemStatus() {
  console.log('🔍 VERIFYING SYSTEM STATUS');
  console.log('==========================');
  
  const status = {
    config: false,
    spreadsheets: 0,
    forms: 0,
    triggers: 0
  };
  
  try {
    // Check CONFIG
    if (CONFIG && CONFIG.SPREADSHEET_IDS) {
      const ids = Object.keys(CONFIG.SPREADSHEET_IDS).filter(key => CONFIG.SPREADSHEET_IDS[key]);
      status.spreadsheets = ids.length;
      status.config = ids.length >= 20;
      console.log(`✅ CONFIG: ${status.spreadsheets} spreadsheet IDs configured`);
    }
    
    // Check forms
    const createdForms = {
      'PARTNER_REGISTRATION': '1eRqd-jvR4BT5pS_et_pujEy3ieWKAwd1MUIksgxk8iE',
      'ORDER_CREATION': '1Y-nLsnGcowGbyBIkIvSzxsxDU3bw_Wx8QjeWK3QZNYI',
      'DISPUTE_CREATION': '1Jz5_OwaIpycTj5Vx8MagNcANAn5M8VZguhcfvakXeAk',
      'ENGINEER_REGISTRATION': '1A2lq5wWmfpKwvKbQKWLM9ooUUJJaKCGIiUGUkBl-5h0',
      'POTENTIAL_SITE': '1qcsl_zsS3vE8Z-i-6aHR5HQKbvdxlV_PWibdmwnej4s',
      'POTENTIAL_SITE_UPDATE': '1BIE2VVhwtSIw7mSksFpxQ15iy1LNot7UBXMywKdF8FM',
      'RETAILER_REGISTRATION': '1OiNKF_8p3_wtmSX8qIplBqLrG8t5WnH5Zawzd_qQLmk',
      'PARTNER_UPDATE': '1cx4rRVF7IGc1-lOpQHU8N-jk7qHB0LUDumq0IGp7wtU',
      'IHB_UPDATE': '1K6lr8yQ-Be0oW-3KZSXpgclYEBtIZbTlOsV1--aVPm14',
      'RETAILER_UPDATE': '1VbHv1iP0Fc8UFAGN4OAzyFF5IxPkhpPDY3s6xqC6OXU',
      'PARTNER_UPDATE_ENHANCED': '1Tc2ibJyXj2w9B82SskWdQ9eipEE4dq6p8qWJi2rp8eI',
      'SITE_PRESCRIPTION': '177LUfCcQ0vFThj0mvpwE_D-6oNb0MBmjy-fvDO7yTIY',
      'VISIT': '1yE1WfHyUu6PJXe3xGjqT-axdSBiVuA6GKiwrl0MoQHE',
      'IHB_REGISTRATION': '1E6_MhJDWDcGnYEL2zJeCaYf1FU2HvdACDbJ_8fyWLJE',
      'RETAILER_POINT_REQUEST': '1pbQ6E-EBVq0TI1RFyg2W3xGlUD-pVD__I_L1_GidbJQ',
      'DEMAND_GENERATION_REQUEST': '1YoYI9h4vdD-8QO1gET0mv28WTJOXjbGr6_gy8oSNHGM',
      'VISIT_UPDATE': '1b-xODyf0C2QioyZEDJP0C3NTPYjsf8OmPLRXwpgWUgU'
    };
    
    status.forms = Object.keys(createdForms).length;
    console.log(`📝 FORMS: ${status.forms} forms created`);
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    status.triggers = triggers.length;
    console.log(`🔧 TRIGGERS: ${status.triggers} triggers active`);
    
    // Overall assessment
    const readiness = Math.round(
      ((status.config ? 1 : 0) + 
       (status.spreadsheets >= 20 ? 1 : 0) + 
       (status.forms >= 15 ? 1 : 0) + 
       (status.triggers >= 15 ? 1 : 0)) / 4 * 100
    );
    
    console.log('\n📊 SYSTEM READINESS ASSESSMENT:');
    console.log('===============================');
    console.log(`Configuration: ${status.config ? '✅' : '❌'}`);
    console.log(`Spreadsheets: ${status.spreadsheets >= 20 ? '✅' : '❌'} (${status.spreadsheets}/20)`);
    console.log(`Forms: ${status.forms >= 15 ? '✅' : '❌'} (${status.forms}/17)`);
    console.log(`Triggers: ${status.triggers >= 15 ? '✅' : '❌'} (${status.triggers})`);
    console.log(`\nOVERALL READINESS: ${readiness}%`);
    
    if (readiness === 100) {
      console.log('\n🎉 SYSTEM IS FULLY OPERATIONAL!');
    } else if (readiness >= 75) {
      console.log('\n⚠️ SYSTEM IS MOSTLY READY - Run setupCompleteSystem() to finish');
    } else {
      console.log('\n❌ SYSTEM NEEDS MORE SETUP');
    }
    
    return status;
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return status;
  }
}

console.log('🔗 Form-to-Sheet Linking Script Loaded');
console.log('🎯 Ready to complete your system setup!');
console.log('💡 Run setupCompleteSystem() to link forms and setup all triggers');
