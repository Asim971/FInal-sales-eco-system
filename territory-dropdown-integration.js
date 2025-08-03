/**
 * @fileoverview Territory Dropdown Update Integration Guide
 * Complete setup guide for the territory dropdown update system
 */

/**
 * Complete setup for territory dropdown updates
 */
function setupTerritoryDropdownSystem() {
  console.log('🗺️ SETTING UP TERRITORY DROPDOWN UPDATE SYSTEM');
  console.log('===============================================');
  
  let setupSteps = [];
  let errors = [];
  
  try {
    // Step 1: Verify CRM and Location Map
    console.log('Step 1: Verifying CRM and Location Map...');
    try {
      const territories = getTerritoryListFromCRM();
      if (territories && territories.length > 0) {
        console.log(`✅ Step 1: Found ${territories.length} territories in Location Map`);
        setupSteps.push(`CRM Location Map verified - ${territories.length} territories`);
      } else {
        throw new Error('No territories found in CRM Location Map');
      }
    } catch (error) {
      console.log(`❌ Step 1 Failed: ${error.message}`);
      errors.push(`CRM Location Map: ${error.message}`);
    }
    
    // Step 2: Test form access
    console.log('\nStep 2: Testing form accessibility...');
    const testForms = [
      { name: 'Demand Generation', id: CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST },
      { name: 'Partner Registration', id: CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION },
      { name: 'Order Creation', id: CONFIG.SPREADSHEET_IDS.ORDER_CREATION }
    ];
    
    let accessibleForms = 0;
    testForms.forEach(form => {
      try {
        const spreadsheet = SpreadsheetApp.openById(form.id);
        const formUrl = spreadsheet.getFormUrl();
        if (formUrl) {
          console.log(`✅ ${form.name} form accessible`);
          accessibleForms++;
        }
      } catch (error) {
        console.log(`❌ ${form.name} form not accessible: ${error.message}`);
        errors.push(`${form.name} form: ${error.message}`);
      }
    });
    
    setupSteps.push(`Form accessibility: ${accessibleForms}/${testForms.length} forms accessible`);
    
    // Step 3: Update all territory dropdowns
    console.log('\nStep 3: Updating all territory dropdowns...');
    try {
      const updateResult = updateAllTerritoryDropdowns();
      if (updateResult.success) {
        console.log(`✅ Step 3: Updated ${updateResult.updatedForms.length} forms`);
        setupSteps.push(`Territory dropdowns updated: ${updateResult.updatedForms.length} forms`);
        
        if (updateResult.failedForms.length > 0) {
          console.log(`⚠️ ${updateResult.failedForms.length} forms failed to update`);
          updateResult.failedForms.forEach(form => {
            errors.push(`Form update failed: ${form.name} - ${form.error}`);
          });
        }
      } else {
        throw new Error(updateResult.error || 'Territory dropdown update failed');
      }
    } catch (error) {
      console.log(`❌ Step 3 Failed: ${error.message}`);
      errors.push(`Territory dropdown update: ${error.message}`);
    }
    
    // Step 4: Setup automatic trigger
    console.log('\nStep 4: Setting up automatic update trigger...');
    try {
      const triggerResult = setupTerritoryUpdateTrigger();
      if (triggerResult.success) {
        console.log(`✅ Step 4: Automatic trigger created (${triggerResult.frequency})`);
        setupSteps.push(`Automatic trigger: Created with ID ${triggerResult.triggerId}`);
      } else {
        throw new Error(triggerResult.error || 'Trigger setup failed');
      }
    } catch (error) {
      console.log(`❌ Step 4 Failed: ${error.message}`);
      errors.push(`Trigger setup: ${error.message}`);
    }
    
    // Step 5: Test the complete system
    console.log('\nStep 5: Testing complete system...');
    try {
      const testResult = testTerritoryDropdownUpdate();
      const passRate = testResult.passed / (testResult.passed + testResult.failed);
      
      if (passRate >= 0.75) {
        console.log(`✅ Step 5: System test passed (${testResult.passed}/${testResult.passed + testResult.failed})`);
        setupSteps.push(`System test: ${testResult.passed}/${testResult.passed + testResult.failed} tests passed`);
      } else {
        console.log(`⚠️ Step 5: System test had issues (${testResult.passed}/${testResult.passed + testResult.failed})`);
        errors.push(`System test: Only ${testResult.passed}/${testResult.passed + testResult.failed} tests passed`);
      }
    } catch (error) {
      console.log(`❌ Step 5 Failed: ${error.message}`);
      errors.push(`System test: ${error.message}`);
    }
    
    // Setup Summary
    console.log('\n📊 SETUP SUMMARY');
    console.log('================');
    console.log(`✅ Successful steps: ${setupSteps.length}`);
    console.log(`❌ Issues found: ${errors.length}`);
    
    if (setupSteps.length > 0) {
      console.log('\n✅ Completed Setup Steps:');
      setupSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Issues Found:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Next Steps
    console.log('\n💡 WHAT HAPPENS NEXT:');
    console.log('=====================');
    
    if (errors.length === 0) {
      console.log('🎉 SETUP COMPLETE! Territory dropdown system is fully operational.');
      console.log('');
      console.log('✅ Your system now:');
      console.log('   - Automatically updates territory dropdowns every 6 hours');
      console.log('   - Syncs all forms with CRM Location Map data');
      console.log('   - Sends email notifications about updates');
      console.log('   - Includes smart change detection to avoid unnecessary updates');
      console.log('');
      console.log('🛠️ Manual Controls:');
      console.log('   - updateAllTerritoryDropdowns() - Force update now');
      console.log('   - showTerritoryUpdateStatus() - Check system status');
      console.log('   - checkAndUpdateTerritories() - Smart update check');
    } else {
      console.log('⚠️ SETUP COMPLETED WITH ISSUES');
      console.log('');
      console.log('🔧 To resolve issues:');
      console.log('1. Address the errors listed above');
      console.log('2. Re-run setupTerritoryDropdownSystem()');
      console.log('3. Or run individual functions to fix specific problems');
      console.log('');
      console.log('📞 Common Solutions:');
      console.log('   - Forms not accessible: Run createAllFormsStandalone() first');
      console.log('   - No territories: Add territory data to CRM Location Map sheet');
      console.log('   - Permission errors: Check spreadsheet access permissions');
    }
    
    console.log('===============================================');
    
    return {
      success: errors.length === 0,
      setupSteps: setupSteps,
      errors: errors,
      summary: `${setupSteps.length} steps completed, ${errors.length} issues found`
    };
    
  } catch (error) {
    console.error('❌ Setup failed completely:', error);
    return {
      success: false,
      error: error.message,
      setupSteps: setupSteps,
      errors: [...errors, `Setup failed: ${error.message}`]
    };
  }
}

/**
 * Integration with main deployment system
 */
function integrateWithMainDeployment() {
  console.log('🔗 INTEGRATING TERRITORY UPDATES WITH MAIN DEPLOYMENT');
  console.log('=====================================================');
  
  try {
    console.log('1. Running main system health check...');
    // This assumes the main diagnostic function exists
    if (typeof diagnoseFormDataFlow === 'function') {
      const healthCheck = diagnoseFormDataFlow();
      
      if (healthCheck.severity !== 'HEALTHY' && healthCheck.issues.length > 0) {
        console.log('⚠️ Main system has issues. Fix these first:');
        healthCheck.issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('');
        console.log('💡 Run fixFormDataFlowIssues() first, then return here');
        return false;
      }
    }
    
    console.log('2. Setting up territory dropdown system...');
    const setupResult = setupTerritoryDropdownSystem();
    
    if (setupResult.success) {
      console.log('3. Integration successful! 🎉');
      console.log('');
      console.log('🎯 YOUR COMPLETE SYSTEM NOW INCLUDES:');
      console.log('=====================================');
      console.log('✅ Form data flow to CRM and individual sheets');
      console.log('✅ Error handling and validation');
      console.log('✅ Automatic territory dropdown updates');
      console.log('✅ Smart change detection');
      console.log('✅ Email notifications');
      console.log('✅ Manual override controls');
      console.log('');
      console.log('🚀 System is production-ready!');
      
      return true;
    } else {
      console.log('3. Integration had issues. Review above and fix before proceeding.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
    return false;
  }
}

/**
 * Quick start guide for territory dropdown updates
 */
function quickStartTerritoryUpdates() {
  console.log('⚡ QUICK START: Territory Dropdown Updates');
  console.log('=========================================');
  console.log('');
  
  console.log('🎯 PURPOSE:');
  console.log('Keep all form territory dropdowns synchronized with your CRM Location Map data');
  console.log('');
  
  console.log('⚡ QUICK SETUP (3 steps):');
  console.log('1. setupTerritoryDropdownSystem() - Complete automated setup');
  console.log('2. Wait for confirmation message');
  console.log('3. Done! System runs automatically every 6 hours');
  console.log('');
  
  console.log('🛠️ MANUAL CONTROLS:');
  console.log('- updateAllTerritoryDropdowns() - Update all forms immediately');
  console.log('- showTerritoryUpdateStatus() - Check current status');
  console.log('- forceUpdateAllTerritories() - Force update and save state');
  console.log('');
  
  console.log('📋 REQUIREMENTS:');
  console.log('✓ CRM spreadsheet with Location Map sheet');
  console.log('✓ Territory data in Location Map (column B)');
  console.log('✓ Forms created and accessible');
  console.log('✓ Proper permissions on spreadsheets');
  console.log('');
  
  console.log('🔄 HOW IT WORKS:');
  console.log('1. Reads territories from CRM Location Map sheet');
  console.log('2. Updates dropdown choices in all forms');
  console.log('3. Only updates when territories actually change');
  console.log('4. Sends email notifications about updates');
  console.log('5. Runs automatically every 6 hours');
  console.log('');
  
  console.log('💡 READY TO START?');
  console.log('Run: setupTerritoryDropdownSystem()');
  console.log('=========================================');
}

/**
 * Show integration status with main system
 */
function showTerritoryIntegrationStatus() {
  console.log('📊 TERRITORY UPDATE INTEGRATION STATUS');
  console.log('======================================');
  
  try {
    // Check main system
    console.log('🏠 Main System Status:');
    if (typeof CONFIG !== 'undefined' && CONFIG.SPREADSHEET_IDS) {
      console.log('   ✅ CONFIG loaded');
      console.log(`   📊 Spreadsheets configured: ${Object.keys(CONFIG.SPREADSHEET_IDS).length}`);
    } else {
      console.log('   ❌ CONFIG not loaded');
    }
    
    // Check CRM access
    try {
      const crmSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      const locationMapSheet = crmSpreadsheet.getSheetByName('Location Map');
      const territoryCount = locationMapSheet ? locationMapSheet.getLastRow() - 1 : 0;
      console.log(`   ✅ CRM accessible with ${territoryCount} territories`);
    } catch (error) {
      console.log(`   ❌ CRM access issue: ${error.message}`);
    }
    
    // Check territory system
    console.log('');
    console.log('🗺️ Territory Update System Status:');
    
    // Check if functions exist
    const requiredFunctions = [
      'updateAllTerritoryDropdowns',
      'getTerritoryListFromCRM', 
      'setupTerritoryUpdateTrigger',
      'checkAndUpdateTerritories'
    ];
    
    requiredFunctions.forEach(funcName => {
      try {
        const func = eval(funcName);
        if (typeof func === 'function') {
          console.log(`   ✅ ${funcName} available`);
        } else {
          console.log(`   ❌ ${funcName} not a function`);
        }
      } catch (error) {
        console.log(`   ❌ ${funcName} not found`);
      }
    });
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    const territoryTrigger = triggers.find(t => t.getHandlerFunction() === 'onLocationMapUpdate');
    
    if (territoryTrigger) {
      console.log('   ✅ Automatic update trigger active');
    } else {
      console.log('   ⚠️ Automatic update trigger not found');
    }
    
    // Check last update
    const properties = PropertiesService.getScriptProperties();
    const lastUpdate = properties.getProperty('LAST_UPDATE_TIME');
    
    if (lastUpdate) {
      console.log(`   📅 Last update: ${new Date(lastUpdate).toLocaleString()}`);
    } else {
      console.log('   📅 No update history found');
    }
    
    console.log('');
    console.log('🎯 QUICK ACTIONS:');
    console.log('- setupTerritoryDropdownSystem() - Complete setup');
    console.log('- integrateWithMainDeployment() - Full integration');
    console.log('- quickStartTerritoryUpdates() - See quick start guide');
    
    console.log('======================================');
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

// Auto-load integration guide
console.log('🔗 Territory Dropdown Integration System Loaded');
console.log('⚡ Run quickStartTerritoryUpdates() for quick setup guide');
console.log('🔧 Run setupTerritoryDropdownSystem() for complete automated setup');
console.log('📊 Run showTerritoryIntegrationStatus() to check current state');
