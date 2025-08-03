/**
 * @fileoverview Deployment Script for Schema Migration
 * This file contains the main deployment functions to coordinate the entire migration process
 */

/**
 * Main deployment function that orchestrates the entire migration and setup process
 * This function should be run when deploying the schema changes
 * @param {Object} options - Deployment options
 * @return {Object} Deployment result
 */
function deploySchemaChanges(options = {}) {
  try {
    console.log('🚀 Starting deployment of schema changes...');
    console.log('Deployment options:', options);
    
    const deploymentResult = {
      success: true,
      timestamp: new Date().toISOString(),
      steps: [],
      errors: [],
      warnings: []
    };
    
    // Step 1: Pre-deployment validation
    console.log('\n📋 Step 1: Pre-deployment validation');
    const preValidation = validatePreDeployment();
    deploymentResult.steps.push({
      step: 'Pre-deployment validation',
      success: preValidation.success,
      result: preValidation
    });
    
    if (!preValidation.success && !options.forceDeployment) {
      throw new Error(`Pre-deployment validation failed: ${preValidation.error}`);
    }
    
    // Step 2: Create system backup
    console.log('\n💾 Step 2: Creating system backup');
    const backupResult = createSystemBackup();
    deploymentResult.steps.push({
      step: 'System backup',
      success: backupResult.success,
      result: backupResult
    });
    
    if (!backupResult.success) {
      throw new Error(`System backup failed: ${backupResult.error}`);
    }
    
    // Step 3: Run schema migration
    console.log('\n🔄 Step 3: Running schema migration');
    const migrationResult = runSchemaMigration();
    deploymentResult.steps.push({
      step: 'Schema migration',
      success: migrationResult.success,
      result: migrationResult
    });
    
    if (!migrationResult.success) {
      throw new Error(`Schema migration failed: ${migrationResult.error}`);
    }
    
    // Step 4: Set up triggers
    console.log('\n⚙️ Step 4: Setting up triggers');
    const triggerSetup = setupMigrationTriggers();
    deploymentResult.steps.push({
      step: 'Trigger setup',
      success: triggerSetup.success,
      result: triggerSetup
    });
    
    if (!triggerSetup.success) {
      deploymentResult.warnings.push('Some triggers failed to set up');
    }
    
    // Step 5: Validate deployment
    console.log('\n✅ Step 5: Post-deployment validation');
    const postValidation = validatePostDeployment();
    deploymentResult.steps.push({
      step: 'Post-deployment validation',
      success: postValidation.success,
      result: postValidation
    });
    
    if (!postValidation.success) {
      deploymentResult.warnings.push('Post-deployment validation issues detected');
    }
    
    // Step 6: Initialize update forms
    console.log('\n📝 Step 6: Initializing update forms');
    const formInitialization = initializeUpdateForms();
    deploymentResult.steps.push({
      step: 'Form initialization',
      success: formInitialization.success,
      result: formInitialization
    });
    
    // Step 7: Send deployment notifications
    console.log('\n📧 Step 7: Sending deployment notifications');
    try {
      sendDeploymentNotifications(deploymentResult);
      deploymentResult.steps.push({
        step: 'Deployment notifications',
        success: true,
        result: { message: 'Notifications sent successfully' }
      });
    } catch (notificationError) {
      deploymentResult.warnings.push(`Notification error: ${notificationError.message}`);
    }
    
    // Summary
    const successfulSteps = deploymentResult.steps.filter(step => step.success).length;
    const totalSteps = deploymentResult.steps.length;
    
    console.log(`\n🎯 Deployment Summary: ${successfulSteps}/${totalSteps} steps completed successfully`);
    
    if (deploymentResult.warnings.length > 0) {
      console.warn('⚠️ Warnings:', deploymentResult.warnings);
    }
    
    console.log('✅ Schema changes deployment completed!');
    
    return deploymentResult;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    
    // Attempt rollback if requested
    if (options.autoRollbackOnFailure) {
      console.log('🔄 Attempting automatic rollback...');
      try {
        const rollbackResult = rollbackDeployment();
        console.log('Rollback result:', rollbackResult);
      } catch (rollbackError) {
        console.error('❌ Rollback also failed:', rollbackError);
      }
    }
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      steps: deploymentResult?.steps || []
    };
  }
}

/**
 * Validates system state before deployment
 * @return {Object} Validation result
 */
function validatePreDeployment() {
  try {
    console.log('Validating pre-deployment state...');
    
    const validation = {
      success: true,
      checks: [],
      errors: []
    };
    
    // Check 1: Verify spreadsheet access
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
      validation.checks.push({
        check: 'CRM Spreadsheet Access',
        status: 'PASS',
        message: 'Can access CRM spreadsheet'
      });
    } catch (error) {
      validation.checks.push({
        check: 'CRM Spreadsheet Access',
        status: 'FAIL',
        message: `Cannot access CRM spreadsheet: ${error.message}`
      });
      validation.errors.push('CRM spreadsheet access failed');
    }
    
    // Check 2: Verify required sheets exist
    const requiredSheets = [CONFIG.SHEET_NAMES.ORDERS, 'Potential Site Approvals'];
    requiredSheets.forEach(sheetName => {
      try {
        const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          validation.checks.push({
            check: `Sheet: ${sheetName}`,
            status: 'PASS',
            message: 'Sheet exists'
          });
        } else {
          validation.checks.push({
            check: `Sheet: ${sheetName}`,
            status: 'FAIL',
            message: 'Sheet not found'
          });
          validation.errors.push(`Required sheet not found: ${sheetName}`);
        }
      } catch (error) {
        validation.checks.push({
          check: `Sheet: ${sheetName}`,
          status: 'ERROR',
          message: error.message
        });
        validation.errors.push(`Error checking sheet ${sheetName}: ${error.message}`);
      }
    });
    
    // Check 3: Verify configuration integrity
    try {
      if (!CONFIG.SCHEMAS.ORDERS || !CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS) {
        throw new Error('Schema configuration missing');
      }
      validation.checks.push({
        check: 'Configuration Integrity',
        status: 'PASS',
        message: 'Configuration is valid'
      });
    } catch (error) {
      validation.checks.push({
        check: 'Configuration Integrity',
        status: 'FAIL',
        message: error.message
      });
      validation.errors.push('Configuration integrity check failed');
    }
    
    // Check 4: Verify permissions
    try {
      // Test if we can create triggers
      const testTrigger = ScriptApp.newTrigger('testFunction')
        .timeBased()
        .after(60000) // 1 minute
        .create();
      
      // Clean up test trigger
      ScriptApp.deleteTrigger(testTrigger);
      
      validation.checks.push({
        check: 'Trigger Permissions',
        status: 'PASS',
        message: 'Can create and delete triggers'
      });
    } catch (error) {
      validation.checks.push({
        check: 'Trigger Permissions',
        status: 'FAIL',
        message: `Cannot manage triggers: ${error.message}`
      });
      validation.errors.push('Insufficient permissions for triggers');
    }
    
    validation.success = validation.errors.length === 0;
    
    console.log(`Pre-deployment validation: ${validation.success ? 'PASS' : 'FAIL'}`);
    
    return validation;
    
  } catch (error) {
    console.error('Error in pre-deployment validation:', error);
    return {
      success: false,
      error: error.message,
      checks: []
    };
  }
}

/**
 * Creates a comprehensive system backup before deployment
 * @return {Object} Backup result
 */
function createSystemBackup() {
  try {
    console.log('Creating comprehensive system backup...');
    
    const backupResult = {
      success: true,
      timestamp: new Date().toISOString(),
      backups: [],
      errors: []
    };
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup all relevant sheets
    const sheetsToBackup = [
      CONFIG.SHEET_NAMES.ORDERS,
      'Potential Site Approvals',
      CONFIG.SHEET_NAMES.EMPLOYEES,
      CONFIG.SHEET_NAMES.VISITS,
      CONFIG.SHEET_NAMES.DISPUTES
    ];
    
    sheetsToBackup.forEach(sheetName => {
      try {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          const backup = sheet.copyTo(ss);
          const backupName = `${sheetName}_PreMigration_${timestamp}`;
          backup.setName(backupName);
          
          backupResult.backups.push({
            originalSheet: sheetName,
            backupSheet: backupName,
            status: 'SUCCESS'
          });
          
          console.log(`✅ Backed up: ${sheetName} -> ${backupName}`);
        } else {
          backupResult.backups.push({
            originalSheet: sheetName,
            backupSheet: null,
            status: 'SKIPPED',
            reason: 'Sheet not found'
          });
        }
      } catch (error) {
        backupResult.errors.push(`Failed to backup ${sheetName}: ${error.message}`);
        backupResult.backups.push({
          originalSheet: sheetName,
          backupSheet: null,
          status: 'FAILED',
          error: error.message
        });
      }
    });
    
    // Create deployment log sheet
    try {
      const logSheet = ss.insertSheet(`DeploymentLog_${timestamp}`);
      const logHeaders = ['Timestamp', 'Event', 'Status', 'Details', 'User'];
      logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
      
      // Format header
      const headerRange = logSheet.getRange(1, 1, 1, logHeaders.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      // Log deployment start
      logSheet.getRange(2, 1, 1, 5).setValues([[
        new Date(),
        'Deployment Started',
        'INFO',
        'Schema migration deployment initiated',
        Session.getActiveUser().getEmail()
      ]]);
      
      backupResult.deploymentLogSheet = `DeploymentLog_${timestamp}`;
      
      console.log(`✅ Created deployment log: ${backupResult.deploymentLogSheet}`);
      
    } catch (error) {
      backupResult.errors.push(`Failed to create deployment log: ${error.message}`);
    }
    
    backupResult.success = backupResult.errors.length === 0;
    
    console.log(`System backup: ${backupResult.success ? 'SUCCESS' : 'PARTIAL'}`);
    
    return backupResult;
    
  } catch (error) {
    console.error('Error creating system backup:', error);
    return {
      success: false,
      error: error.message,
      backups: []
    };
  }
}

/**
 * Validates system state after deployment
 * @return {Object} Validation result
 */
function validatePostDeployment() {
  try {
    console.log('Validating post-deployment state...');
    
    const validation = {
      success: true,
      checks: [],
      warnings: []
    };
    
    // Check 1: Verify schema migration
    const migrationCheck = isMigrationNeeded();
    validation.checks.push({
      check: 'Schema Migration',
      status: migrationCheck ? 'FAIL' : 'PASS',
      message: migrationCheck ? 'Migration still needed' : 'Schema is up to date'
    });
    
    if (migrationCheck) {
      validation.success = false;
    }
    
    // Check 2: Verify new form configurations
    try {
      const orderUpdateForm = CONFIG.FORMS.ORDER_UPDATE;
      const siteUpdateForm = CONFIG.FORMS.POTENTIAL_SITE_UPDATE_ENHANCED;
      
      if (orderUpdateForm && siteUpdateForm) {
        validation.checks.push({
          check: 'Form Configurations',
          status: 'PASS',
          message: 'Update forms are configured'
        });
      } else {
        validation.checks.push({
          check: 'Form Configurations',
          status: 'FAIL',
          message: 'Update forms not properly configured'
        });
        validation.success = false;
      }
    } catch (error) {
      validation.checks.push({
        check: 'Form Configurations',
        status: 'ERROR',
        message: error.message
      });
    }
    
    // Check 3: Verify triggers are set up
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const migrationTriggers = triggers.filter(trigger => 
        ['onOrderUpdateFormSubmit', 'onPotentialSiteUpdateFormSubmit', 'checkAndRunMigrationIfNeeded']
        .includes(trigger.getHandlerFunction())
      );
      
      validation.checks.push({
        check: 'Migration Triggers',
        status: migrationTriggers.length > 0 ? 'PASS' : 'WARN',
        message: `${migrationTriggers.length} migration triggers found`
      });
      
      if (migrationTriggers.length === 0) {
        validation.warnings.push('No migration triggers found');
      }
    } catch (error) {
      validation.checks.push({
        check: 'Migration Triggers',
        status: 'ERROR',
        message: error.message
      });
    }
    
    // Check 4: Test update functions
    try {
      // Test if update functions are accessible
      if (typeof handleOrderUpdateFormSubmit === 'function' && 
          typeof handlePotentialSiteUpdateFormSubmit === 'function') {
        validation.checks.push({
          check: 'Update Functions',
          status: 'PASS',
          message: 'Update functions are available'
        });
      } else {
        validation.checks.push({
          check: 'Update Functions',
          status: 'FAIL',
          message: 'Update functions not available'
        });
        validation.success = false;
      }
    } catch (error) {
      validation.checks.push({
        check: 'Update Functions',
        status: 'ERROR',
        message: error.message
      });
    }
    
    console.log(`Post-deployment validation: ${validation.success ? 'PASS' : 'ISSUES DETECTED'}`);
    
    return validation;
    
  } catch (error) {
    console.error('Error in post-deployment validation:', error);
    return {
      success: false,
      error: error.message,
      checks: []
    };
  }
}

/**
 * Initializes the update forms and their corresponding sheets
 * @return {Object} Initialization result
 */
function initializeUpdateForms() {
  try {
    console.log('Initializing update forms...');
    
    const initResult = {
      success: true,
      forms: [],
      errors: []
    };
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Initialize Order Updates sheet
    try {
      const orderUpdatesSheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.ORDER_UPDATES, CONFIG.SCHEMAS.ORDER_UPDATES);
      initResult.forms.push({
        form: 'Order Updates',
        sheet: CONFIG.SHEET_NAMES.ORDER_UPDATES,
        status: 'SUCCESS'
      });
      console.log('✅ Order Updates sheet initialized');
    } catch (error) {
      initResult.errors.push(`Order Updates sheet initialization failed: ${error.message}`);
      initResult.forms.push({
        form: 'Order Updates',
        sheet: CONFIG.SHEET_NAMES.ORDER_UPDATES,
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Initialize Potential Site Updates sheet
    try {
      const siteUpdatesSheet = getOrCreateSheet(ss, CONFIG.SHEET_NAMES.POTENTIAL_SITE_UPDATES, CONFIG.SCHEMAS.POTENTIAL_SITE_UPDATES);
      initResult.forms.push({
        form: 'Potential Site Updates',
        sheet: CONFIG.SHEET_NAMES.POTENTIAL_SITE_UPDATES,
        status: 'SUCCESS'
      });
      console.log('✅ Potential Site Updates sheet initialized');
    } catch (error) {
      initResult.errors.push(`Potential Site Updates sheet initialization failed: ${error.message}`);
      initResult.forms.push({
        form: 'Potential Site Updates',
        sheet: CONFIG.SHEET_NAMES.POTENTIAL_SITE_UPDATES,
        status: 'FAILED',
        error: error.message
      });
    }
    
    initResult.success = initResult.errors.length === 0;
    
    console.log(`Form initialization: ${initResult.success ? 'SUCCESS' : 'PARTIAL'}`);
    
    return initResult;
    
  } catch (error) {
    console.error('Error initializing update forms:', error);
    return {
      success: false,
      error: error.message,
      forms: []
    };
  }
}

/**
 * Sends notifications about the deployment
 * @param {Object} deploymentResult - Result of the deployment
 */
function sendDeploymentNotifications(deploymentResult) {
  try {
    console.log('Sending deployment notifications...');
    
    const adminEmails = [
      CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS.SYSTEM_ADMIN.EMAIL,
      CONFIG.NOTIFICATION_CONFIG.EMERGENCY_CONTACTS.BUSINESS_HEAD.EMAIL
    ].filter(Boolean);
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for deployment notifications');
      return;
    }
    
    const subject = deploymentResult.success 
      ? '✅ Schema Migration Deployment Successful'
      : '❌ Schema Migration Deployment Failed';
    
    const statusSummary = deploymentResult.steps.map(step => 
      `${step.success ? '✅' : '❌'} ${step.step}`
    ).join('\n');
    
    const body = `Schema migration deployment has been completed.

Status: ${deploymentResult.success ? 'SUCCESS' : 'FAILED'}
Timestamp: ${deploymentResult.timestamp}

Step Summary:
${statusSummary}

${deploymentResult.warnings.length > 0 ? `\nWarnings:\n${deploymentResult.warnings.join('\n')}` : ''}

${deploymentResult.errors.length > 0 ? `\nErrors:\n${deploymentResult.errors.join('\n')}` : ''}

Please review the system and ensure all functionality is working as expected.`;
    
    adminEmails.forEach(email => {
      MailApp.sendEmail(email, subject, body);
    });
    
    console.log('✅ Deployment notifications sent');
    
  } catch (error) {
    console.error('Error sending deployment notifications:', error);
    throw error;
  }
}

/**
 * Rolls back the deployment if something goes wrong
 * @return {Object} Rollback result
 */
function rollbackDeployment() {
  try {
    console.log('🔄 Rolling back deployment...');
    
    // This would restore from the backup created in createSystemBackup()
    // Implementation would depend on the specific backup strategy
    
    console.log('⚠️ Rollback functionality needs to be implemented based on backup strategy');
    
    return {
      success: false,
      message: 'Rollback functionality not yet implemented',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error during rollback:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Quick deployment function for testing
 * @return {Object} Deployment result
 */
function quickDeploy() {
  return deploySchemaChanges({
    forceDeployment: false,
    autoRollbackOnFailure: true
  });
}

/**
 * Force deployment function (bypasses pre-deployment validation)
 * @return {Object} Deployment result
 */
function forceDeploy() {
  return deploySchemaChanges({
    forceDeployment: true,
    autoRollbackOnFailure: false
  });
}

/**
 * Test deployment function (runs validation without making changes)
 * @return {Object} Test result
 */
function testDeployment() {
  try {
    console.log('🧪 Testing deployment readiness...');
    
    const testResult = {
      success: true,
      tests: [],
      timestamp: new Date().toISOString()
    };
    
    // Run pre-deployment validation
    const preValidation = validatePreDeployment();
    testResult.tests.push({
      test: 'Pre-deployment validation',
      result: preValidation
    });
    
    // Test migration detection
    const migrationNeeded = isMigrationNeeded();
    testResult.tests.push({
      test: 'Migration needed check',
      result: { migrationNeeded: migrationNeeded }
    });
    
    // Test configuration integrity
    const configTest = {
      orderUpdateForm: !!CONFIG.FORMS.ORDER_UPDATE,
      siteUpdateForm: !!CONFIG.FORMS.POTENTIAL_SITE_UPDATE_ENHANCED,
      orderSchema: !!CONFIG.SCHEMAS.ORDERS,
      siteSchema: !!CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS
    };
    
    testResult.tests.push({
      test: 'Configuration test',
      result: configTest
    });
    
    testResult.success = testResult.tests.every(test => 
      test.result.success !== false
    );
    
    console.log(`Deployment test: ${testResult.success ? 'READY' : 'NOT READY'}`);
    
    return testResult;
    
  } catch (error) {
    console.error('Error testing deployment:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
