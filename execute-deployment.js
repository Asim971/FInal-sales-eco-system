/**
 * @fileoverview Quick Execution Script for Schema Migration
 * Simple functions to execute the deployment process
 */

/**
 * Main execution function - Run this to deploy schema changes
 * This is the primary function to call for deployment
 */
function executeDeployment() {
  try {
    console.log('🚀 Starting Schema Migration Deployment...');
    console.log('Time:', new Date().toISOString());
    
    // Run the complete deployment
    const result = deploySchemaChanges({
      forceDeployment: false,
      autoRollbackOnFailure: true
    });
    
    // Display results
    console.log('\n📊 DEPLOYMENT RESULTS:');
    console.log('Success:', result.success);
    console.log('Timestamp:', result.timestamp);
    
    if (result.steps) {
      console.log('\n📋 Step Summary:');
      result.steps.forEach((step, index) => {
        const status = step.success ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${step.step}`);
      });
    }
    
    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`- ${warning}`));
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(result.success ? '✅ DEPLOYMENT SUCCESSFUL!' : '❌ DEPLOYMENT FAILED!');
    console.log('='.repeat(50));
    
    return result;
    
  } catch (error) {
    console.error('❌ Deployment execution failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test the deployment without making changes
 * Run this first to check if system is ready
 */
function testDeploymentReadiness() {
  try {
    console.log('🧪 Testing Deployment Readiness...');
    
    const testResult = testDeployment();
    
    console.log('\n📊 TEST RESULTS:');
    console.log('Ready for deployment:', testResult.success);
    
    if (testResult.tests) {
      console.log('\n🔍 Individual Tests:');
      testResult.tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.test}:`, test.result);
      });
    }
    
    if (testResult.success) {
      console.log('\n✅ System is ready for deployment!');
      console.log('💡 Run executeDeployment() to proceed');
    } else {
      console.log('\n❌ System has issues that need to be resolved');
    }
    
    return testResult;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Quick status check
 * See current state of the system
 */
function checkSystemStatus() {
  try {
    console.log('📊 System Status Check...');
    
    const status = {
      timestamp: new Date().toISOString(),
      migrationNeeded: false,
      triggersActive: 0,
      sheetsReady: false,
      formsConfigured: false
    };
    
    // Check if migration is needed
    try {
      status.migrationNeeded = isMigrationNeeded();
    } catch (error) {
      console.warn('Could not check migration status:', error.message);
    }
    
    // Check triggers
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const migrationTriggers = triggers.filter(trigger => 
        ['onOrderUpdateFormSubmit', 'onPotentialSiteUpdateFormSubmit', 'checkAndRunMigrationIfNeeded']
        .includes(trigger.getHandlerFunction())
      );
      status.triggersActive = migrationTriggers.length;
    } catch (error) {
      console.warn('Could not check triggers:', error.message);
    }
    
    // Check sheets
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      const orderSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
      const siteSheet = ss.getSheetByName('Potential Site Approvals');
      status.sheetsReady = !!(orderSheet && siteSheet);
    } catch (error) {
      console.warn('Could not check sheets:', error.message);
    }
    
    // Check forms
    try {
      status.formsConfigured = !!(CONFIG.FORMS.ORDER_UPDATE && CONFIG.FORMS.POTENTIAL_SITE_UPDATE_ENHANCED);
    } catch (error) {
      console.warn('Could not check forms:', error.message);
    }
    
    console.log('\n📋 STATUS SUMMARY:');
    console.log('Migration needed:', status.migrationNeeded);
    console.log('Active triggers:', status.triggersActive);
    console.log('Sheets ready:', status.sheetsReady);
    console.log('Forms configured:', status.formsConfigured);
    
    const overallStatus = !status.migrationNeeded && 
                         status.triggersActive > 0 && 
                         status.sheetsReady && 
                         status.formsConfigured;
    
    console.log('\n🎯 OVERALL STATUS:', overallStatus ? '✅ SYSTEM READY' : '⚠️ NEEDS ATTENTION');
    
    return status;
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Setup triggers manually if needed
 */
function setupTriggersManually() {
  try {
    console.log('⚙️ Setting up triggers manually...');
    
    const result = setupMigrationTriggers();
    
    console.log('\n📊 TRIGGER SETUP RESULTS:');
    console.log('Success:', result.success);
    
    if (result.triggers) {
      console.log('\n📋 Triggers Created:');
      result.triggers.forEach((trigger, index) => {
        const status = trigger.status === 'SUCCESS' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${trigger.function} (${trigger.type})`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`- ${error}`));
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Manual trigger setup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run migration manually if needed
 */
function runMigrationManually() {
  try {
    console.log('🔄 Running migration manually...');
    
    const result = runSchemaMigration();
    
    console.log('\n📊 MIGRATION RESULTS:');
    console.log('Success:', result.success);
    
    if (result.migratedSheets) {
      console.log('\n📋 Migrated Sheets:');
      result.migratedSheets.forEach(sheet => {
        console.log(`✅ ${sheet.sheetName}: ${sheet.fieldsTransferred} fields transferred`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`- ${error}`));
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Manual migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Emergency function - Force deployment with minimal checks
 * Use only if normal deployment fails and you're sure it's safe
 */
function forceDeploymentEmergency() {
  console.log('🚨 EMERGENCY FORCE DEPLOYMENT');
  console.log('⚠️ This bypasses safety checks!');
  
  const result = deploySchemaChanges({
    forceDeployment: true,
    autoRollbackOnFailure: false
  });
  
  console.log('Emergency deployment result:', result);
  return result;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🚀 SCHEMA MIGRATION DEPLOYMENT HELP

Available Functions:
===================

1. testDeploymentReadiness()
   - Tests if system is ready for deployment
   - Run this FIRST to check system state
   - Safe to run multiple times

2. executeDeployment()
   - Main deployment function
   - Runs complete schema migration
   - Creates backups automatically
   - Run this to deploy changes

3. checkSystemStatus()
   - Quick status check
   - Shows current system state
   - Useful for monitoring

4. setupTriggersManually()
   - Sets up triggers manually
   - Use if trigger setup fails during deployment

5. runMigrationManually()
   - Runs schema migration manually
   - Use if migration fails during deployment

6. forceDeploymentEmergency()
   - Emergency force deployment
   - USE ONLY if normal deployment fails
   - Bypasses safety checks

Recommended Order:
================
1. testDeploymentReadiness()  // Check if ready
2. executeDeployment()        // Run deployment
3. checkSystemStatus()        // Verify success

For Issues:
==========
- Check console output for error details
- Review DEPLOYMENT_GUIDE.md for troubleshooting
- Contact system administrator if needed
`);
}

// Auto-show help when script loads
console.log('📚 Schema Migration Deployment Scripts Loaded');
console.log('💡 Run showHelp() for available commands');
console.log('🚀 Run testDeploymentReadiness() to start');
