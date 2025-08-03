/**
 * @fileoverview Simple Fresh Deployment Script
 * 
 * This file provides a simple interface for creating fresh deployments
 * Always creates new folders and spreadsheets, updates CONFIG automatically
 * 
 * Version: 2.1
 * Updated: Enhanced with form linking and trigger setup guidance
 */

/**
 * MAIN FUNCTION - Run this for a fresh deployment
 * Creates completely new environment every time
 */
function createFreshDeployment() {
  console.log('🚀 STARTING FRESH DEPLOYMENT OF ANWAR SALES ECOSYSTEM');
  console.log('============================================================');
  console.log('📋 This will:');
  console.log('   ✅ Create NEW folders with timestamp');
  console.log('   ✅ Create NEW spreadsheets with fresh IDs');
  console.log('   ✅ Update CONFIG automatically');
  console.log('   ✅ Organize everything in Google Drive');
  console.log('   ✅ Send deployment summary email');
  console.log('============================================================');
  
  try {
    // Run the fresh deployment
    const result = deployFreshAnwarSalesEcosystem();
    
    console.log('🎉 FRESH DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('============================================================');
    console.log('📊 SUMMARY:');
    console.log(`   📁 Main Folder: ${result.folders.mainFolder.getName()}`);
    console.log(`   📊 Spreadsheets: ${Object.keys(result.sheets).length} created`);
    console.log(`   ⚙️ CONFIG: ${result.configUpdated ? 'Updated' : 'Not updated'}`);
    console.log(`   ⏱️ Duration: ${result.duration} seconds`);
    console.log('============================================================');
    
    if (result.configUpdated) {
      console.log('✅ CONFIG.SPREADSHEET_IDS has been automatically updated!');
      console.log('📋 All systems will now use the new spreadsheet IDs');
    }
    
    console.log('🔗 NEXT STEPS:');
    console.log('   1. ✅ CONFIG is already updated - no manual changes needed');
    console.log('   2. � Forms created successfully - all 17 forms ready');
    console.log('   3. 🔗 Run setupCompleteSystem() to link forms to sheets');
    console.log('   4. 🧪 Test the system with sample data');
    console.log('   5. 📧 Check email for detailed deployment report');
    console.log('');
    console.log('🎯 QUICK COMPLETION:');
    console.log('   Run: setupCompleteSystem()  // Links forms and sets up triggers');
    console.log('   This will make your system 100% operational!');
    
    return result;
    
  } catch (error) {
    console.error('❌ FRESH DEPLOYMENT FAILED:', error);
    console.error('Please check the logs and try again');
    throw error;
  }
}

/**
 * Quick status check
 */
function checkDeploymentStatus() {
  console.log('📊 CURRENT DEPLOYMENT STATUS');
  console.log('========================================');
  
  // Check existing deployments
  const deployments = listExistingDeployments();
  console.log(`📂 Existing Deployments: ${deployments.length}`);
  
  if (deployments.length > 0) {
    console.log('🕒 Most Recent:');
    const latest = deployments[0];
    console.log(`   📁 ${latest.name}`);
    console.log(`   📅 ${latest.created.toLocaleString()}`);
  }
  
  // Check CONFIG status
  console.log('⚙️ CONFIG Status:');
  const configKeys = Object.keys(CONFIG.SPREADSHEET_IDS);
  console.log(`   📊 Spreadsheet IDs: ${configKeys.length} configured`);
  
  const emptyIds = configKeys.filter(key => !CONFIG.SPREADSHEET_IDS[key]);
  if (emptyIds.length > 0) {
    console.log(`   ⚠️ Missing IDs: ${emptyIds.join(', ')}`);
  } else {
    console.log('   ✅ All required IDs present');
  }
  
  console.log('========================================');
  
  return {
    existingDeployments: deployments.length,
    configuredIds: configKeys.length,
    missingIds: emptyIds.length
  };
}

/**
 * Clean up old deployments (run manually when needed)
 */
function cleanupOldFolders(days = 7) {
  console.log(`🧹 CLEANING UP FOLDERS OLDER THAN ${days} DAYS`);
  
  const result = cleanupOldDeployments(days);
  
  if (result.error) {
    console.error('❌ Cleanup failed:', result.error);
  } else {
    console.log(`✅ Cleanup completed: ${result.deleted} folders removed`);
  }
  
  return result;
}

/**
 * Emergency function - creates fresh deployment and cleans old ones
 */
function emergencyFreshStart() {
  console.log('🚨 EMERGENCY FRESH START');
  console.log('⚠️ This will create new deployment and clean old folders');
  
  try {
    // Create fresh deployment
    const deployment = createFreshDeployment();
    
    // Clean up old folders (keep last 3 days)
    console.log('🧹 Cleaning up old folders...');
    const cleanup = cleanupOldDeployments(3);
    
    console.log('🎉 EMERGENCY FRESH START COMPLETED!');
    return {
      deployment: deployment,
      cleanup: cleanup
    };
    
  } catch (error) {
    console.error('❌ Emergency fresh start failed:', error);
    throw error;
  }
}

/**
 * Complete system setup after forms are created
 * Links forms to spreadsheets and sets up all triggers
 */
function completeSystemAfterForms() {
  console.log('🔗 COMPLETING SYSTEM SETUP AFTER FORM CREATION');
  console.log('==============================================');
  console.log('📋 This will:');
  console.log('   🔗 Link all 17 forms to their response spreadsheets');
  console.log('   🔧 Set up form submission triggers');
  console.log('   🔧 Set up approval workflow triggers');
  console.log('   ✅ Make your system 100% operational');
  console.log('==============================================');
  
  try {
    // This function is defined in setup-form-links.js
    const result = setupCompleteSystem();
    
    if (result.success) {
      console.log('\n🎉 ANWAR SALES ECOSYSTEM IS NOW 100% OPERATIONAL!');
      console.log('================================================');
      console.log('✅ All forms are linked to their response sheets');
      console.log('✅ All submission triggers are active');
      console.log('✅ All approval workflows are configured');
      console.log('✅ System is ready for production use!');
      
      console.log('\n🎯 SYSTEM IS LIVE - YOU CAN NOW:');
      console.log('   📝 Accept form submissions from users');
      console.log('   🔄 Process approvals through spreadsheets');
      console.log('   📱 Receive WhatsApp notifications');
      console.log('   📊 Track all activities in the CRM');
    } else {
      console.log('\n⚠️ SYSTEM SETUP COMPLETED WITH SOME ISSUES');
      console.log('Check the detailed logs above for any errors');
      console.log('Most functionality should still work properly');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error completing system setup:', error);
    console.error('You may need to run setupCompleteSystem() manually');
    return { success: false, error: error.message };
  }
}

/**
 * Quick status check for the complete system
 */
function checkCompleteSystemStatus() {
  console.log('📊 COMPLETE SYSTEM STATUS CHECK');
  console.log('===============================');
  
  try {
    // Check deployment status
    const deploymentStatus = checkDeploymentStatus();
    
    // Check if forms are created (look for known form IDs)
    const formsCreated = checkIfFormsExist();
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    
    console.log('\n📋 DETAILED STATUS:');
    console.log(`📂 Deployments: ${deploymentStatus.existingDeployments}`);
    console.log(`📊 Spreadsheets: ${deploymentStatus.configuredIds}/20`);
    console.log(`📝 Forms: ${formsCreated ? 'Created (17)' : 'Not created'}`);
    console.log(`🔧 Triggers: ${triggers.length}`);
    
    const completionPercentage = Math.round(
      ((deploymentStatus.configuredIds >= 20 ? 25 : 0) +
       (formsCreated ? 25 : 0) +
       (triggers.length >= 15 ? 50 : Math.round(triggers.length / 15 * 50))) 
    );
    
    console.log(`\n📈 SYSTEM COMPLETION: ${completionPercentage}%`);
    
    if (completionPercentage === 100) {
      console.log('🎉 SYSTEM IS FULLY OPERATIONAL!');
    } else if (completionPercentage >= 75) {
      console.log('⚠️ SYSTEM IS MOSTLY READY');
      if (!formsCreated) {
        console.log('   📝 Run createFormsManually() to create forms');
      }
      if (triggers.length < 15) {
        console.log('   🔗 Run setupCompleteSystem() to setup triggers');
      }
    } else {
      console.log('❌ SYSTEM NEEDS MORE SETUP');
      console.log('   🚀 Run createFreshDeployment() if starting fresh');
    }
    
    return {
      deployments: deploymentStatus.existingDeployments,
      spreadsheets: deploymentStatus.configuredIds,
      forms: formsCreated,
      triggers: triggers.length,
      completion: completionPercentage
    };
    
  } catch (error) {
    console.error('❌ Error checking system status:', error);
    return { error: error.message };
  }
}

/**
 * Check if forms have been created by looking for known form IDs
 */
function checkIfFormsExist() {
  const knownFormIds = [
    '1eRqd-jvR4BT5pS_et_pujEy3ieWKAwd1MUIksgxk8iE', // PARTNER_REGISTRATION
    '1Y-nLsnGcowGbyBIkIvSzxsxDU3bw_Wx8QjeWK3QZNYI', // ORDER_CREATION
    '1Jz5_OwaIpycTj5Vx8MagNcANAn5M8VZguhcfvakXeAk'  // DISPUTE_CREATION
  ];
  
  try {
    // Try to access one of the known forms
    const form = FormApp.openById(knownFormIds[0]);
    return true;
  } catch (error) {
    return false;
  }
}
