/**
 * @fileoverview Territory Dropdown Update System
 * This system automatically updates territory dropdowns in all forms to match the Location Map data
 */

/**
 * Main function to update all territory dropdowns across all forms
 */
function updateAllTerritoryDropdowns() {
  console.log('🗺️ UPDATING ALL TERRITORY DROPDOWNS');
  console.log('===================================');
  
  try {
    // Get territories from CRM Location Map
    const territories = getTerritoryListFromCRM();
    
    if (!territories || territories.length === 0) {
      console.log('⚠️ No territories found in Location Map');
      return {
        success: false,
        message: 'No territories found in CRM Location Map'
      };
    }
    
    console.log(`📍 Found ${territories.length} territories in Location Map`);
    console.log('Territories:', territories.slice(0, 5).join(', ') + (territories.length > 5 ? '...' : ''));
    
    // List of forms that need territory dropdown updates
    const formsToUpdate = [
      {
        id: CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST,
        name: 'Demand Generation Request',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.PARTNER_REGISTRATION,
        name: 'Partner Registration', 
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.RETAILER_REGISTRATION,
        name: 'Retailer Registration',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.ORDER_CREATION,
        name: 'Order Creation',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.VISIT,
        name: 'Visit Form',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE,
        name: 'Potential Site',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.DISPUTE_CREATION,
        name: 'Dispute Creation',
        fieldTitle: 'Territory'
      },
      {
        id: CONFIG.SPREADSHEET_IDS.RETAILER_POINT_REQUEST,
        name: 'Retailer Point Request',
        fieldTitle: 'Territory'
      }
    ];
    
    let updatedForms = [];
    let failedForms = [];
    
    // Update each form
    formsToUpdate.forEach(formInfo => {
      try {
        console.log(`\n🔄 Updating ${formInfo.name}...`);
        
        const result = updateTerritoryDropdownInForm(formInfo.id, formInfo.fieldTitle, territories);
        
        if (result.success) {
          updatedForms.push(formInfo.name);
          console.log(`✅ ${formInfo.name} - Territory dropdown updated`);
        } else {
          failedForms.push({
            name: formInfo.name,
            error: result.error
          });
          console.log(`❌ ${formInfo.name} - Failed: ${result.error}`);
        }
        
      } catch (error) {
        failedForms.push({
          name: formInfo.name,
          error: error.message
        });
        console.log(`❌ ${formInfo.name} - Error: ${error.message}`);
      }
    });
    
    // Summary
    console.log('\n📊 UPDATE SUMMARY:');
    console.log(`✅ Successfully updated: ${updatedForms.length} forms`);
    console.log(`❌ Failed to update: ${failedForms.length} forms`);
    
    if (updatedForms.length > 0) {
      console.log('\n✅ Updated Forms:');
      updatedForms.forEach(name => console.log(`   - ${name}`));
    }
    
    if (failedForms.length > 0) {
      console.log('\n❌ Failed Forms:');
      failedForms.forEach(form => console.log(`   - ${form.name}: ${form.error}`));
    }
    
    console.log('===================================');
    
    return {
      success: updatedForms.length > 0,
      updatedForms: updatedForms,
      failedForms: failedForms,
      totalTerritories: territories.length
    };
    
  } catch (error) {
    console.error('❌ Failed to update territory dropdowns:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get unique territory list from CRM Location Map
 */
function getTerritoryListFromCRM() {
  try {
    console.log('📊 Reading territories from CRM Location Map...');
    
    const crmSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const locationMapSheet = crmSpreadsheet.getSheetByName('Location Map');
    
    if (!locationMapSheet) {
      throw new Error('Location Map sheet not found in CRM');
    }
    
    const lastRow = locationMapSheet.getLastRow();
    if (lastRow <= 1) {
      throw new Error('No data found in Location Map sheet');
    }
    
    // Assuming Territory is in column B (index 1)
    const territoryColumn = locationMapSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    
    // Extract unique territories
    const territories = [...new Set(territoryColumn.map(row => row[0]).filter(territory => territory && territory.toString().trim() !== ''))];
    
    // Sort territories alphabetically
    territories.sort();
    
    console.log(`📍 Found ${territories.length} unique territories`);
    
    return territories;
    
  } catch (error) {
    console.error('❌ Error reading territories from CRM:', error);
    throw error;
  }
}

/**
 * Update territory dropdown in a specific form
 */
function updateTerritoryDropdownInForm(spreadsheetId, fieldTitle, territories) {
  try {
    // Get the form associated with this spreadsheet
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const form = FormApp.openByUrl(spreadsheet.getFormUrl());
    
    if (!form) {
      return {
        success: false,
        error: 'Form not found or not linked to spreadsheet'
      };
    }
    
    // Find the territory field
    const items = form.getItems();
    let territoryItem = null;
    
    for (let item of items) {
      if (item.getTitle().toLowerCase().includes(fieldTitle.toLowerCase()) || 
          item.getTitle().toLowerCase().includes('territory')) {
        if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE || 
            item.getType() === FormApp.ItemType.LIST) {
          territoryItem = item;
          break;
        }
      }
    }
    
    if (!territoryItem) {
      return {
        success: false,
        error: `Territory field "${fieldTitle}" not found in form`
      };
    }
    
    // Update the choices
    if (territoryItem.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
      const multipleChoiceItem = territoryItem.asMultipleChoiceItem();
      multipleChoiceItem.setChoiceValues(territories);
    } else if (territoryItem.getType() === FormApp.ItemType.LIST) {
      const listItem = territoryItem.asListItem();
      listItem.setChoiceValues(territories);
    }
    
    return {
      success: true,
      fieldType: territoryItem.getType(),
      choicesCount: territories.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Set up automatic trigger to update territory dropdowns when Location Map changes
 */
function setupTerritoryUpdateTrigger() {
  console.log('⚙️ SETTING UP TERRITORY UPDATE TRIGGER');
  console.log('=====================================');
  
  try {
    // Delete existing territory update triggers
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onLocationMapUpdate') {
        ScriptApp.deleteTrigger(trigger);
        console.log('🗑️ Removed existing territory update trigger');
      }
    });
    
    // Create new trigger on CRM spreadsheet for Location Map changes
    const crmSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    const trigger = ScriptApp.newTrigger('onLocationMapUpdate')
      .timeBased()
      .everyHours(6) // Check every 6 hours
      .create();
    
    console.log('✅ Territory update trigger created');
    console.log('   Function: onLocationMapUpdate');
    console.log('   Frequency: Every 6 hours');
    console.log('   Purpose: Update territory dropdowns when Location Map changes');
    
    // Also create a manual trigger for immediate updates
    console.log('');
    console.log('💡 MANUAL UPDATE OPTIONS:');
    console.log('   - updateAllTerritoryDropdowns() - Update all forms now');
    console.log('   - checkAndUpdateTerritories() - Smart update (only if changed)');
    
    console.log('=====================================');
    
    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      frequency: 'Every 6 hours'
    };
    
  } catch (error) {
    console.error('❌ Failed to setup territory update trigger:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Trigger function that runs automatically to check for territory updates
 */
function onLocationMapUpdate() {
  console.log('🔄 AUTO-TRIGGER: Checking for territory updates...');
  
  try {
    // Check if territories have changed since last update
    const result = checkAndUpdateTerritories();
    
    if (result.updated) {
      console.log(`✅ Territory dropdowns updated: ${result.updatedForms.length} forms`);
      
      // Send notification email about the update
      if (CONFIG.NOTIFICATION_EMAIL) {
        sendTerritoryUpdateNotification(result);
      }
    } else {
      console.log('ℹ️ No territory updates needed');
    }
    
  } catch (error) {
    console.error('❌ Auto-territory update failed:', error);
    
    // Send error notification
    if (CONFIG.NOTIFICATION_EMAIL) {
      sendTerritoryUpdateErrorNotification(error);
    }
  }
}

/**
 * Smart territory update - only updates if territories have actually changed
 */
function checkAndUpdateTerritories() {
  console.log('🔍 SMART TERRITORY UPDATE CHECK');
  console.log('==============================');
  
  try {
    // Get current territories
    const currentTerritories = getTerritoryListFromCRM();
    
    // Get last known territories from script properties
    const properties = PropertiesService.getScriptProperties();
    const lastTerritoriesJson = properties.getProperty('LAST_TERRITORIES');
    
    let needsUpdate = true;
    
    if (lastTerritoriesJson) {
      const lastTerritories = JSON.parse(lastTerritoriesJson);
      
      // Compare territories
      if (JSON.stringify(lastTerritories.sort()) === JSON.stringify(currentTerritories.sort())) {
        needsUpdate = false;
        console.log('ℹ️ Territories unchanged since last update');
      } else {
        console.log('🔄 Territory changes detected');
        console.log(`   Previous count: ${lastTerritories.length}`);
        console.log(`   Current count: ${currentTerritories.length}`);
      }
    } else {
      console.log('🆕 First time setup - will update all territories');
    }
    
    if (needsUpdate) {
      // Update all territory dropdowns
      const updateResult = updateAllTerritoryDropdowns();
      
      if (updateResult.success) {
        // Save current territories for next comparison
        properties.setProperty('LAST_TERRITORIES', JSON.stringify(currentTerritories));
        properties.setProperty('LAST_UPDATE_TIME', new Date().toISOString());
        
        console.log('✅ Territories updated and saved for future comparison');
      }
      
      return {
        updated: true,
        ...updateResult
      };
    } else {
      return {
        updated: false,
        message: 'No changes detected'
      };
    }
    
  } catch (error) {
    console.error('❌ Smart territory update check failed:', error);
    throw error;
  }
}

/**
 * Send notification email about territory updates
 */
function sendTerritoryUpdateNotification(result) {
  try {
    const subject = '🗺️ Territory Dropdowns Updated - Anwar Sales Ecosystem';
    
    const body = `
Territory Dropdown Update Notification
=====================================

The territory dropdowns in your forms have been automatically updated based on changes in the CRM Location Map.

Update Summary:
✅ Successfully Updated: ${result.updatedForms.length} forms
❌ Failed Updates: ${result.failedForms.length} forms
📍 Total Territories: ${result.totalTerritories}

Updated Forms:
${result.updatedForms.map(form => `- ${form}`).join('\n')}

${result.failedForms.length > 0 ? `
Failed Forms:
${result.failedForms.map(form => `- ${form.name}: ${form.error}`).join('\n')}
` : ''}

Next automatic check: In 6 hours

This is an automated notification from the Anwar Sales Ecosystem.
Time: ${new Date().toLocaleString()}
    `;
    
    GmailApp.sendEmail(
      CONFIG.NOTIFICATION_EMAIL,
      subject,
      body
    );
    
  } catch (error) {
    console.log('⚠️ Failed to send territory update notification:', error.message);
  }
}

/**
 * Send error notification email
 */
function sendTerritoryUpdateErrorNotification(error) {
  try {
    const subject = '⚠️ Territory Update Error - Anwar Sales Ecosystem';
    
    const body = `
Territory Update Error Notification
=================================

An error occurred while trying to update territory dropdowns automatically.

Error Details:
${error.message}

Time: ${new Date().toLocaleString()}

Please check the system manually by running:
- diagnoseFormDataFlow()
- updateAllTerritoryDropdowns()

This is an automated error notification from the Anwar Sales Ecosystem.
    `;
    
    GmailApp.sendEmail(
      CONFIG.NOTIFICATION_EMAIL,
      subject,
      body
    );
    
  } catch (mailError) {
    console.log('⚠️ Failed to send error notification:', mailError.message);
  }
}

/**
 * Manual trigger to force update all territories immediately
 */
function forceUpdateAllTerritories() {
  console.log('🚀 FORCE UPDATE ALL TERRITORIES');
  console.log('==============================');
  
  const result = updateAllTerritoryDropdowns();
  
  if (result.success) {
    // Save current state
    const territories = getTerritoryListFromCRM();
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('LAST_TERRITORIES', JSON.stringify(territories));
    properties.setProperty('LAST_UPDATE_TIME', new Date().toISOString());
    
    console.log('✅ Force update completed and state saved');
  }
  
  return result;
}

/**
 * Show current territory update status
 */
function showTerritoryUpdateStatus() {
  console.log('📊 TERRITORY UPDATE SYSTEM STATUS');
  console.log('=================================');
  
  try {
    // Check current territories
    const territories = getTerritoryListFromCRM();
    console.log(`📍 Current territories in Location Map: ${territories.length}`);
    
    // Check last update info
    const properties = PropertiesService.getScriptProperties();
    const lastUpdate = properties.getProperty('LAST_UPDATE_TIME');
    const lastTerritories = properties.getProperty('LAST_TERRITORIES');
    
    if (lastUpdate) {
      console.log(`🕒 Last update: ${new Date(lastUpdate).toLocaleString()}`);
    } else {
      console.log('🆕 No previous updates recorded');
    }
    
    if (lastTerritories) {
      const lastCount = JSON.parse(lastTerritories).length;
      console.log(`📊 Last known territory count: ${lastCount}`);
      
      if (lastCount !== territories.length) {
        console.log('⚠️ Territory count has changed! Update needed.');
      } else {
        console.log('✅ Territory count unchanged');
      }
    }
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    const territoryTrigger = triggers.find(t => t.getHandlerFunction() === 'onLocationMapUpdate');
    
    if (territoryTrigger) {
      console.log('✅ Territory update trigger is active');
      console.log(`   Trigger ID: ${territoryTrigger.getUniqueId()}`);
    } else {
      console.log('❌ Territory update trigger not found');
      console.log('   Run setupTerritoryUpdateTrigger() to create it');
    }
    
    console.log('');
    console.log('🛠️ AVAILABLE COMMANDS:');
    console.log('- updateAllTerritoryDropdowns() - Update all forms now');
    console.log('- checkAndUpdateTerritories() - Smart update (only if changed)');
    console.log('- forceUpdateAllTerritories() - Force update and save state');
    console.log('- setupTerritoryUpdateTrigger() - Setup automatic updates');
    
    console.log('=================================');
    
  } catch (error) {
    console.error('❌ Error checking territory update status:', error);
  }
}

// Auto-load notification
console.log('🗺️ Territory Dropdown Update System Loaded');
console.log('💡 Run updateAllTerritoryDropdowns() to update all forms');
console.log('⚙️ Run setupTerritoryUpdateTrigger() for automatic updates');
console.log('📊 Run showTerritoryUpdateStatus() to check current status');
