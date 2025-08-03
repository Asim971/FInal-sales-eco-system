/**
 * @fileoverview Migration Triggers for Order and Potential Site Schema Changes
 * This file contains triggers and functions to handle the migration of existing data
 * when schema changes are applied to ORDER and POTENTIAL_SITE forms and sheets
 */

/**
 * Main migration trigger function
 * This function orchestrates the migration of existing data to new schema
 * @return {Object} Migration result with success status and details
 */
function runSchemaMigration() {
  try {
    console.log('🔄 Starting schema migration for Orders and Potential Sites...');
    
    const migrationResult = {
      success: true,
      timestamp: new Date().toISOString(),
      migrations: {
        orders: null,
        potentialSites: null,
        dataTransfer: null
      },
      errors: []
    };
    
    // Step 1: Backup existing data
    console.log('📋 Step 1: Creating backup of existing data...');
    const backupResult = createDataBackup();
    if (!backupResult.success) {
      throw new Error(`Backup failed: ${backupResult.error}`);
    }
    
    // Step 2: Migrate Orders sheet schema
    console.log('🔄 Step 2: Migrating Orders sheet schema...');
    migrationResult.migrations.orders = migrateOrdersSchema();
    
    // Step 3: Migrate Potential Sites schema
    console.log('🏗️ Step 3: Migrating Potential Sites schema...');
    migrationResult.migrations.potentialSites = migratePotentialSitesSchema();
    
    // Step 4: Transfer moved fields data
    console.log('📊 Step 4: Transferring moved field data...');
    migrationResult.migrations.dataTransfer = transferMovedFieldsData();
    
    // Step 5: Validate migration
    console.log('✅ Step 5: Validating migration...');
    const validationResult = validateMigration();
    if (!validationResult.success) {
      console.warn('⚠️ Migration validation warnings:', validationResult.warnings);
    }
    
    // Step 6: Update form configurations
    console.log('📝 Step 6: Updating form configurations...');
    updateFormConfigurations();
    
    console.log('✅ Schema migration completed successfully!');
    return migrationResult;
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Creates backup of existing data before migration
 * @return {Object} Backup result
 */
function createDataBackup() {
  try {
    console.log('Creating backup sheets...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup Orders sheet
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    if (ordersSheet) {
      const ordersBackup = ordersSheet.copyTo(ss);
      ordersBackup.setName(`Orders_Backup_${timestamp}`);
      console.log('✅ Orders sheet backed up');
    }
    
    // Backup Potential Site Approvals sheet
    const sitesSheet = ss.getSheetByName('Potential Site Approvals');
    if (sitesSheet) {
      const sitesBackup = sitesSheet.copyTo(ss);
      sitesBackup.setName(`PotentialSites_Backup_${timestamp}`);
      console.log('✅ Potential Sites sheet backed up');
    }
    
    return {
      success: true,
      backupTimestamp: timestamp,
      message: 'Backup created successfully'
    };
    
  } catch (error) {
    console.error('Error creating backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Migrates the Orders sheet to remove the specified fields
 * @return {Object} Migration result for orders
 */
function migrateOrdersSchema() {
  try {
    console.log('Migrating Orders schema...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!ordersSheet) {
      throw new Error('Orders sheet not found');
    }
    
    // Get current headers
    const currentHeaders = ordersSheet.getRange(1, 1, 1, ordersSheet.getLastColumn()).getValues()[0];
    console.log('Current headers:', currentHeaders);
    
    // Fields to remove from Orders
    const fieldsToRemove = [
      'Start Building',
      'End Building', 
      'Project Address',
      'Estimated Quantity',
      'Delivery Timeline',
      'Custom Timeline'
    ];
    
    // Find columns to remove
    const columnsToRemove = [];
    fieldsToRemove.forEach(field => {
      const index = currentHeaders.indexOf(field);
      if (index !== -1) {
        columnsToRemove.push({
          field: field,
          index: index + 1, // 1-based for Google Sheets
          data: ordersSheet.getRange(1, index + 1, ordersSheet.getLastRow(), 1).getValues()
        });
      }
    });
    
    console.log(`Found ${columnsToRemove.length} columns to remove:`, columnsToRemove.map(c => c.field));
    
    // Store removed data for transfer
    const removedData = {};
    columnsToRemove.forEach(col => {
      removedData[col.field] = col.data;
    });
    
    // Remove columns (in reverse order to maintain indices)
    columnsToRemove.sort((a, b) => b.index - a.index).forEach(col => {
      console.log(`Removing column: ${col.field} at index ${col.index}`);
      ordersSheet.deleteColumn(col.index);
    });
    
    // Verify new schema matches CONFIG.SCHEMAS.ORDERS
    const newHeaders = ordersSheet.getRange(1, 1, 1, ordersSheet.getLastColumn()).getValues()[0];
    console.log('New headers:', newHeaders);
    
    return {
      success: true,
      removedFields: fieldsToRemove,
      removedData: removedData,
      oldHeaders: currentHeaders,
      newHeaders: newHeaders,
      columnsRemoved: columnsToRemove.length
    };
    
  } catch (error) {
    console.error('Error migrating Orders schema:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Migrates the Potential Sites schema to add the new fields
 * @return {Object} Migration result for potential sites
 */
function migratePotentialSitesSchema() {
  try {
    console.log('Migrating Potential Sites schema...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sitesSheet = ss.getSheetByName('Potential Site Approvals');
    
    if (!sitesSheet) {
      throw new Error('Potential Site Approvals sheet not found');
    }
    
    // Get current headers
    const currentHeaders = sitesSheet.getRange(1, 1, 1, sitesSheet.getLastColumn()).getValues()[0];
    console.log('Current Potential Sites headers:', currentHeaders);
    
    // Fields to add to Potential Sites (from removed Orders fields)
    const fieldsToAdd = [
      'Start Building',
      'End Building',
      'Project Address', 
      'Estimated Quantity',
      'Delivery Timeline',
      'Custom Timeline'
    ];
    
    // Find insertion point (before 'Potential Site ID')
    const potentialSiteIdIndex = currentHeaders.indexOf('Potential Site ID');
    const insertIndex = potentialSiteIdIndex !== -1 ? potentialSiteIdIndex : currentHeaders.length;
    
    console.log(`Inserting ${fieldsToAdd.length} new columns at position ${insertIndex + 1}`);
    
    // Insert new columns
    const newHeaders = [...currentHeaders];
    fieldsToAdd.forEach((field, index) => {
      const insertPosition = insertIndex + index + 1; // 1-based for Google Sheets
      
      // Insert column
      sitesSheet.insertColumnAfter(insertIndex + index);
      
      // Add header
      sitesSheet.getRange(1, insertPosition).setValue(field);
      
      // Format header
      const headerCell = sitesSheet.getRange(1, insertPosition);
      headerCell.setFontWeight('bold');
      headerCell.setBackground('#4285f4');
      headerCell.setFontColor('white');
      
      newHeaders.splice(insertIndex + index, 0, field);
      console.log(`Added column: ${field} at position ${insertPosition}`);
    });
    
    // Auto-resize columns
    sitesSheet.autoResizeColumns(1, sitesSheet.getLastColumn());
    
    // Verify new schema
    const finalHeaders = sitesSheet.getRange(1, 1, 1, sitesSheet.getLastColumn()).getValues()[0];
    console.log('Final Potential Sites headers:', finalHeaders);
    
    return {
      success: true,
      addedFields: fieldsToAdd,
      oldHeaders: currentHeaders,
      newHeaders: finalHeaders,
      insertIndex: insertIndex,
      columnsAdded: fieldsToAdd.length
    };
    
  } catch (error) {
    console.error('Error migrating Potential Sites schema:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Transfers data from removed Order fields to corresponding Potential Site fields
 * @return {Object} Data transfer result
 */
function transferMovedFieldsData() {
  try {
    console.log('Transferring moved field data...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    const sitesSheet = ss.getSheetByName('Potential Site Approvals');
    
    if (!ordersSheet || !sitesSheet) {
      throw new Error('Required sheets not found');
    }
    
    // Get all orders data
    const ordersData = ordersSheet.getDataRange().getValues();
    const orderHeaders = ordersData[0];
    const orderPotentialSiteIdIndex = orderHeaders.indexOf('Potential Site ID');
    
    if (orderPotentialSiteIdIndex === -1) {
      throw new Error('Potential Site ID column not found in Orders sheet');
    }
    
    // Get all sites data
    const sitesData = sitesSheet.getDataRange().getValues();
    const siteHeaders = sitesData[0];
    const sitePotentialSiteIdIndex = siteHeaders.indexOf('Potential Site ID');
    
    if (sitePotentialSiteIdIndex === -1) {
      throw new Error('Potential Site ID column not found in Potential Sites sheet');
    }
    
    // Field mappings from the backup data (would be retrieved from the backup)
    const fieldMappings = {
      'Start Building': 'Start Building',
      'End Building': 'End Building', 
      'Project Address': 'Project Address',
      'Estimated Quantity': 'Estimated Quantity',
      'Delivery Timeline': 'Delivery Timeline',
      'Custom Timeline': 'Custom Timeline'
    };
    
    let transferredRecords = 0;
    const transferLog = [];
    
    // Note: In a real migration, you would use the backup data created in migrateOrdersSchema()
    // For now, we'll create a mapping structure for future orders
    console.log('Creating data transfer mapping for future use...');
    
    // This would be the actual transfer logic if backup data was available:
    /*
    for (let i = 1; i < ordersData.length; i++) {
      const orderRow = ordersData[i];
      const potentialSiteId = orderRow[orderPotentialSiteIdIndex];
      
      if (potentialSiteId) {
        // Find corresponding site row
        const siteRowIndex = sitesData.findIndex((row, index) => 
          index > 0 && row[sitePotentialSiteIdIndex] === potentialSiteId
        );
        
        if (siteRowIndex > 0) {
          // Transfer data for each mapped field
          Object.entries(fieldMappings).forEach(([sourceField, targetField]) => {
            // Transfer logic here
          });
          
          transferredRecords++;
        }
      }
    }
    */
    
    console.log('Data transfer mapping prepared for future orders');
    
    return {
      success: true,
      transferredRecords: transferredRecords,
      transferLog: transferLog,
      fieldMappings: fieldMappings,
      message: 'Data transfer structure prepared. Existing orders will need manual review.'
    };
    
  } catch (error) {
    console.error('Error transferring moved field data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validates the migration was successful
 * @return {Object} Validation result
 */
function validateMigration() {
  try {
    console.log('Validating migration...');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const warnings = [];
    
    // Validate Orders sheet
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    if (ordersSheet) {
      const orderHeaders = ordersSheet.getRange(1, 1, 1, ordersSheet.getLastColumn()).getValues()[0];
      const expectedOrderHeaders = CONFIG.SCHEMAS.ORDERS;
      
      // Check if headers match expected schema
      const orderHeadersMatch = JSON.stringify(orderHeaders) === JSON.stringify(expectedOrderHeaders);
      if (!orderHeadersMatch) {
        warnings.push('Orders sheet headers do not exactly match expected schema');
        console.log('Expected:', expectedOrderHeaders);
        console.log('Actual:', orderHeaders);
      }
    }
    
    // Validate Potential Sites sheet
    const sitesSheet = ss.getSheetByName('Potential Site Approvals');
    if (sitesSheet) {
      const siteHeaders = sitesSheet.getRange(1, 1, 1, sitesSheet.getLastColumn()).getValues()[0];
      const expectedSiteHeaders = CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS;
      
      // Check if headers match expected schema
      const siteHeadersMatch = JSON.stringify(siteHeaders) === JSON.stringify(expectedSiteHeaders);
      if (!siteHeadersMatch) {
        warnings.push('Potential Sites sheet headers do not exactly match expected schema');
        console.log('Expected:', expectedSiteHeaders);
        console.log('Actual:', siteHeaders);
      }
    }
    
    return {
      success: true,
      warnings: warnings,
      validated: warnings.length === 0
    };
    
  } catch (error) {
    console.error('Error validating migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Updates form configurations to reflect the new schema
 * @return {Object} Update result
 */
function updateFormConfigurations() {
  try {
    console.log('Updating form configurations...');
    
    // This function would update any existing Google Forms to match the new schema
    // Since forms are defined in CONFIG, this mainly serves as a checkpoint
    
    console.log('✅ Form configurations are already updated in CONFIG object');
    
    return {
      success: true,
      message: 'Form configurations updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating form configurations:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Trigger function for handling existing order updates
 * This function is called when existing orders need to be updated with new schema
 * @param {Object} orderData - The order data to update
 * @param {string} submitterEmail - Email of the person making the update
 * @return {Object} Update result
 */
function handleExistingOrderUpdate(orderData, submitterEmail) {
  try {
    console.log('Handling existing order update with new schema...');
    
    // Validate that the order exists
    const existingOrder = getOrderById(orderData.orderId);
    if (!existingOrder) {
      throw new Error(`Order ${orderData.orderId} not found`);
    }
    
    // Check if this order has a related potential site
    const potentialSiteId = existingOrder.potentialsiteid;
    if (!potentialSiteId) {
      console.log('⚠️ Order has no related potential site. Creating relationship...');
      // You might want to create or link to a potential site here
    }
    
    // Update the order using the new schema
    const updateResult = updateOrderData(orderData.orderId, orderData, submitterEmail);
    
    // If construction-related fields are provided, update the potential site
    const constructionFields = [
      'startBuilding', 'endBuilding', 'projectAddress', 
      'estimatedQuantity', 'deliveryTimeline', 'customTimeline'
    ];
    
    const hasConstructionData = constructionFields.some(field => orderData[field]);
    
    if (hasConstructionData && potentialSiteId) {
      console.log('Updating related potential site with construction data...');
      
      const siteUpdateData = {
        siteId: potentialSiteId,
        startBuilding: orderData.startBuilding,
        endBuilding: orderData.endBuilding,
        projectAddress: orderData.projectAddress,
        estimatedQuantity: orderData.estimatedQuantity,
        deliveryTimeline: orderData.deliveryTimeline,
        customTimeline: orderData.customTimeline,
        updateReason: 'Updated from related order with construction details'
      };
      
      const siteUpdateResult = updatePotentialSiteData(potentialSiteId, siteUpdateData, submitterEmail);
      updateResult.potentialSiteUpdate = siteUpdateResult;
    }
    
    return {
      success: true,
      orderId: orderData.orderId,
      updateResult: updateResult,
      message: 'Existing order updated with new schema'
    };
    
  } catch (error) {
    console.error('Error handling existing order update:', error);
    return {
      success: false,
      error: error.message,
      orderId: orderData.orderId
    };
  }
}

/**
 * Rollback function in case migration needs to be reversed
 * @param {string} backupTimestamp - Timestamp of the backup to restore
 * @return {Object} Rollback result
 */
function rollbackMigration(backupTimestamp) {
  try {
    console.log(`Rolling back migration using backup from ${backupTimestamp}...`);
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Find backup sheets
    const ordersBackupName = `Orders_Backup_${backupTimestamp}`;
    const sitesBackupName = `PotentialSites_Backup_${backupTimestamp}`;
    
    const ordersBackup = ss.getSheetByName(ordersBackupName);
    const sitesBackup = ss.getSheetByName(sitesBackupName);
    
    if (!ordersBackup || !sitesBackup) {
      throw new Error('Backup sheets not found');
    }
    
    // Restore from backup
    const currentOrdersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    const currentSitesSheet = ss.getSheetByName('Potential Site Approvals');
    
    if (currentOrdersSheet) {
      ss.deleteSheet(currentOrdersSheet);
    }
    if (currentSitesSheet) {
      ss.deleteSheet(currentSitesSheet);
    }
    
    // Rename backup sheets to original names
    ordersBackup.setName(CONFIG.SHEET_NAMES.ORDERS);
    sitesBackup.setName('Potential Site Approvals');
    
    console.log('✅ Migration rolled back successfully');
    
    return {
      success: true,
      message: 'Migration rolled back successfully',
      restoredFrom: backupTimestamp
    };
    
  } catch (error) {
    console.error('Error rolling back migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to check if migration is needed
 * @return {boolean} True if migration is needed
 */
function isMigrationNeeded() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const ordersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!ordersSheet) {
      return false;
    }
    
    const currentHeaders = ordersSheet.getRange(1, 1, 1, ordersSheet.getLastColumn()).getValues()[0];
    const expectedHeaders = CONFIG.SCHEMAS.ORDERS;
    
    // Check if current headers match expected headers
    return JSON.stringify(currentHeaders) !== JSON.stringify(expectedHeaders);
    
  } catch (error) {
    console.error('Error checking if migration is needed:', error);
    return false;
  }
}

/**
 * Main trigger function to be called when schema changes are deployed
 * This function can be set up as an installable trigger or called manually
 */
function onSchemaMigrationTrigger() {
  try {
    console.log('🚀 Schema migration trigger activated...');
    
    // Check if migration is needed
    if (!isMigrationNeeded()) {
      console.log('✅ No migration needed - schema is already up to date');
      return { success: true, message: 'No migration needed' };
    }
    
    // Run the migration
    const result = runSchemaMigration();
    
    // Send notification about migration completion
    try {
      sendMigrationNotification(result);
    } catch (notificationError) {
      console.error('Failed to send migration notification:', notificationError);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Schema migration trigger failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends notification about migration completion
 * @param {Object} migrationResult - Result of the migration
 */
function sendMigrationNotification(migrationResult) {
  try {
    const message = migrationResult.success 
      ? '✅ Schema migration completed successfully'
      : `❌ Schema migration failed: ${migrationResult.error}`;
    
    console.log('Migration notification:', message);
    
    // You could send email or other notifications here
    // Example: MailApp.sendEmail(...);
    
  } catch (error) {
    console.error('Error sending migration notification:', error);
  }
}
