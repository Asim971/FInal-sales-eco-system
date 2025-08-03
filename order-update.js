/**
 * @fileoverview Order Update System - Handles updates to existing orders and potential sites
 * This module provides functionality to update order information and related potential site data
 */

/**
 * Handles order update form submissions
 * @param {Object} formData - The form submission data
 * @param {string} submitterEmail - Email of the person submitting the update
 * @return {Object} Result object with success status and any errors
 */
function handleOrderUpdateFormSubmit(formData, submitterEmail) {
  try {
    console.log('Processing order update form submission...');
    
    // Validate required fields
    const validation = validateOrderUpdateData(formData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Get the existing order data
    const existingOrder = getOrderById(formData.orderId);
    if (!existingOrder) {
      throw new Error(`Order not found: ${formData.orderId}`);
    }
    
    // Update the order
    const updateResult = updateOrderData(formData.orderId, formData, submitterEmail);
    
    // If potential site updates are included, update the potential site as well
    if (formData.updatePotentialSite === 'Yes' && existingOrder.potentialSiteId) {
      const siteUpdateResult = updatePotentialSiteFromOrder(existingOrder.potentialSiteId, formData, submitterEmail);
      updateResult.potentialSiteUpdate = siteUpdateResult;
    }
    
    // Send notifications
    try {
      sendOrderUpdateNotifications(formData, submitterEmail, updateResult);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the entire update for notification errors
    }
    
    // Log the update
    logOrderUpdate(formData.orderId, formData, submitterEmail, updateResult);
    
    console.log('Order update completed successfully');
    return {
      success: true,
      orderId: formData.orderId,
      updateResult: updateResult,
      message: 'Order updated successfully'
    };
    
  } catch (error) {
    console.error('Error in handleOrderUpdateFormSubmit:', error);
    return {
      success: false,
      error: error.message,
      orderId: formData.orderId || 'Unknown'
    };
  }
}

/**
 * Handles potential site update form submissions
 * @param {Object} formData - The form submission data
 * @param {string} submitterEmail - Email of the person submitting the update
 * @return {Object} Result object with success status and any errors
 */
function handlePotentialSiteUpdateFormSubmit(formData, submitterEmail) {
  try {
    console.log('Processing potential site update form submission...');
    
    // Validate required fields
    const validation = validatePotentialSiteUpdateData(formData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Get the existing potential site data
    const existingSite = getPotentialSiteById(formData.siteId);
    if (!existingSite) {
      throw new Error(`Potential site not found: ${formData.siteId}`);
    }
    
    // Update the potential site
    const updateResult = updatePotentialSiteData(formData.siteId, formData, submitterEmail);
    
    // Update related orders if specified
    if (formData.updateRelatedOrders === 'Yes') {
      const relatedOrders = getOrdersBySiteId(formData.siteId);
      updateResult.relatedOrdersUpdated = [];
      
      for (const order of relatedOrders) {
        try {
          const orderUpdateResult = updateRelatedOrderFromSite(order.orderId, formData, submitterEmail);
          updateResult.relatedOrdersUpdated.push({
            orderId: order.orderId,
            success: true,
            result: orderUpdateResult
          });
        } catch (orderError) {
          updateResult.relatedOrdersUpdated.push({
            orderId: order.orderId,
            success: false,
            error: orderError.message
          });
        }
      }
    }
    
    // Send notifications
    try {
      sendPotentialSiteUpdateNotifications(formData, submitterEmail, updateResult);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the entire update for notification errors
    }
    
    // Log the update
    logPotentialSiteUpdate(formData.siteId, formData, submitterEmail, updateResult);
    
    console.log('Potential site update completed successfully');
    return {
      success: true,
      siteId: formData.siteId,
      updateResult: updateResult,
      message: 'Potential site updated successfully'
    };
    
  } catch (error) {
    console.error('Error in handlePotentialSiteUpdateFormSubmit:', error);
    return {
      success: false,
      error: error.message,
      siteId: formData.siteId || 'Unknown'
    };
  }
}

/**
 * Gets an existing order by ID
 * @param {string} orderId - The order ID to search for
 * @return {Object|null} The order data or null if not found
 */
function getOrderById(orderId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!sheet) {
      throw new Error('Orders sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the order ID column
    const orderIdColIndex = headers.indexOf('Order ID');
    if (orderIdColIndex === -1) {
      throw new Error('Order ID column not found in Orders sheet');
    }
    
    // Search for the order
    for (let i = 1; i < data.length; i++) {
      if (data[i][orderIdColIndex] === orderId) {
        const orderData = {};
        headers.forEach((header, index) => {
          orderData[header.toLowerCase().replace(/\s+/g, '')] = data[i][index];
        });
        orderData.rowIndex = i + 1; // Store the row index for updates
        return orderData;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
}

/**
 * Gets an existing potential site by ID
 * @param {string} siteId - The site ID to search for
 * @return {Object|null} The site data or null if not found
 */
function getPotentialSiteById(siteId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName('Potential Site Approvals'); // Use the actual sheet name
    
    if (!sheet) {
      throw new Error('Potential Site Approvals sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the site ID column
    const siteIdColIndex = headers.indexOf('Potential Site ID');
    if (siteIdColIndex === -1) {
      throw new Error('Potential Site ID column not found in Potential Site Approvals sheet');
    }
    
    // Search for the site
    for (let i = 1; i < data.length; i++) {
      if (data[i][siteIdColIndex] === siteId) {
        const siteData = {};
        headers.forEach((header, index) => {
          siteData[header.toLowerCase().replace(/\s+/g, '')] = data[i][index];
        });
        siteData.rowIndex = i + 1; // Store the row index for updates
        return siteData;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting potential site by ID:', error);
    return null;
  }
}

/**
 * Updates order data in the spreadsheet
 * @param {string} orderId - The order ID to update
 * @param {Object} formData - The new data from the form
 * @param {string} submitterEmail - Email of the person submitting the update
 * @return {Object} Update result
 */
function updateOrderData(orderId, formData, submitterEmail) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    // Get current order data
    const existingOrder = getOrderById(orderId);
    if (!existingOrder) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const updateData = {};
    const changedFields = [];
    
    // Map form fields to sheet columns and track changes
    const fieldMappings = {
      'orderType': 'Order Type',
      'specialInstructions': 'Special Instructions',
      'engineerRequired': 'Engineer Required',
      'partnerRequired': 'Partner Required',
      'deliveryNoteLink': 'Delivery Note Link',
      'siteImagesLink': 'Site Images Link',
      'additionalDocsLink': 'Additional Docs Link',
      'status': 'Status',
      'assignedEngineerId': 'Assigned Engineer ID',
      'assignedPartnerId': 'Assigned Partner ID',
      'processingNotes': 'Processing Notes'
    };
    
    // Process each field update
    Object.entries(fieldMappings).forEach(([formField, sheetColumn]) => {
      if (formData[formField] !== undefined && formData[formField] !== '') {
        const oldValue = existingOrder[sheetColumn.toLowerCase().replace(/\s+/g, '')];
        const newValue = formData[formField];
        
        if (oldValue !== newValue) {
          updateData[sheetColumn] = newValue;
          changedFields.push({
            field: sheetColumn,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
    });
    
    // Add update metadata
    updateData['Processing Notes'] = `${existingOrder.processingnotes || ''}\n[${new Date().toISOString()}] Updated by ${submitterEmail}: ${formData.updateReason || 'Order update'}`.trim();
    
    // Update the sheet
    if (Object.keys(updateData).length > 0) {
      headers.forEach((header, index) => {
        if (updateData[header] !== undefined) {
          sheet.getRange(existingOrder.rowIndex, index + 1).setValue(updateData[header]);
        }
      });
    }
    
    return {
      success: true,
      changedFields: changedFields,
      updatedAt: new Date().toISOString(),
      updatedBy: submitterEmail
    };
    
  } catch (error) {
    console.error('Error updating order data:', error);
    throw error;
  }
}

/**
 * Updates potential site data in the spreadsheet
 * @param {string} siteId - The site ID to update
 * @param {Object} formData - The new data from the form
 * @param {string} submitterEmail - Email of the person submitting the update
 * @return {Object} Update result
 */
function updatePotentialSiteData(siteId, formData, submitterEmail) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName('Potential Site Approvals');
    
    // Get current site data
    const existingSite = getPotentialSiteById(siteId);
    if (!existingSite) {
      throw new Error(`Potential site ${siteId} not found`);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const updateData = {};
    const changedFields = [];
    
    // Map form fields to sheet columns and track changes
    const fieldMappings = {
      'siteName': 'Site Name',
      'address': 'Address',
      'latitude': 'Lat',
      'longitude': 'Long',
      'ihbId': 'IHB ID',
      'ihbName': 'IHB Name',
      'startBuilding': 'Start Building',
      'endBuilding': 'End Building',
      'projectAddress': 'Project Address',
      'estimatedQuantity': 'Estimated Quantity',
      'deliveryTimeline': 'Delivery Timeline',
      'customTimeline': 'Custom Timeline',
      'status': 'Status',
      'engineerId': 'Engineer ID',
      'engineerName': 'Engineer Name',
      'partnerId': 'Partner ID',
      'partnerName': 'Partner Name'
    };
    
    // Process each field update
    Object.entries(fieldMappings).forEach(([formField, sheetColumn]) => {
      if (formData[formField] !== undefined && formData[formField] !== '') {
        const oldValue = existingSite[sheetColumn.toLowerCase().replace(/\s+/g, '')];
        const newValue = formData[formField];
        
        if (oldValue !== newValue) {
          updateData[sheetColumn] = newValue;
          changedFields.push({
            field: sheetColumn,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
    });
    
    // Add update metadata
    updateData['Notes'] = `${existingSite.notes || ''}\n[${new Date().toISOString()}] Updated by ${submitterEmail}: ${formData.updateReason || 'Site update'}`.trim();
    
    if (formData.assignmentDate) {
      updateData['Assignment Date'] = new Date(formData.assignmentDate);
    }
    
    // Update the sheet
    if (Object.keys(updateData).length > 0) {
      headers.forEach((header, index) => {
        if (updateData[header] !== undefined) {
          sheet.getRange(existingSite.rowIndex, index + 1).setValue(updateData[header]);
        }
      });
    }
    
    return {
      success: true,
      changedFields: changedFields,
      updatedAt: new Date().toISOString(),
      updatedBy: submitterEmail
    };
    
  } catch (error) {
    console.error('Error updating potential site data:', error);
    throw error;
  }
}

/**
 * Gets all orders related to a specific potential site
 * @param {string} siteId - The potential site ID
 * @return {Array} Array of related orders
 */
function getOrdersBySiteId(siteId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORDERS);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const siteIdColIndex = headers.indexOf('Potential Site ID');
    const orderIdColIndex = headers.indexOf('Order ID');
    
    if (siteIdColIndex === -1 || orderIdColIndex === -1) {
      return [];
    }
    
    const relatedOrders = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][siteIdColIndex] === siteId) {
        relatedOrders.push({
          orderId: data[i][orderIdColIndex],
          rowIndex: i + 1
        });
      }
    }
    
    return relatedOrders;
    
  } catch (error) {
    console.error('Error getting orders by site ID:', error);
    return [];
  }
}

/**
 * Validates order update form data
 * @param {Object} formData - The form data to validate
 * @return {Object} Validation result with isValid flag and errors array
 */
function validateOrderUpdateData(formData) {
  const errors = [];
  
  // Required fields
  if (!formData.orderId) {
    errors.push('Order ID is required');
  }
  
  if (!formData.updateReason) {
    errors.push('Update reason is required');
  }
  
  // Validate order type if provided
  if (formData.orderType) {
    const validOrderTypes = ['Cement Order', 'Rod Order', 'Brick Order', 'Sand Order', 'Stone Chips Order', 'Full Construction Package', 'Other'];
    if (!validOrderTypes.includes(formData.orderType)) {
      errors.push('Invalid order type');
    }
  }
  
  // Validate status if provided
  if (formData.status) {
    const validStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
    if (!validStatuses.includes(formData.status)) {
      errors.push('Invalid status');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates potential site update form data
 * @param {Object} formData - The form data to validate
 * @return {Object} Validation result with isValid flag and errors array
 */
function validatePotentialSiteUpdateData(formData) {
  const errors = [];
  
  // Required fields
  if (!formData.siteId) {
    errors.push('Site ID is required');
  }
  
  if (!formData.updateReason) {
    errors.push('Update reason is required');
  }
  
  // Validate status if provided
  if (formData.status) {
    const validStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
    if (!validStatuses.includes(formData.status)) {
      errors.push('Invalid status');
    }
  }
  
  // Validate coordinates if provided
  if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
    errors.push('Invalid latitude format');
  }
  
  if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
    errors.push('Invalid longitude format');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sends notifications for order updates
 * @param {Object} formData - The form data
 * @param {string} submitterEmail - Email of the submitter
 * @param {Object} updateResult - The update result
 */
function sendOrderUpdateNotifications(formData, submitterEmail, updateResult) {
  try {
    // Use the centralized notification system
    if (typeof sendFormNotification === 'function') {
      const notificationData = {
        formType: 'ORDER_UPDATE',
        submitterEmail: submitterEmail,
        orderId: formData.orderId,
        updateReason: formData.updateReason,
        changedFields: updateResult.changedFields?.map(field => field.field).join(', ') || 'None',
        timestamp: new Date().toISOString()
      };
      
      // Get submitter role from employee data
      const employeeData = getEmployeeByEmail(submitterEmail);
      const submitterRole = employeeData?.role || 'EXTERNAL';
      
      sendFormNotification('ORDER_UPDATE', submitterRole, notificationData);
    }
    
  } catch (error) {
    console.error('Error sending order update notifications:', error);
    throw error;
  }
}

/**
 * Sends notifications for potential site updates
 * @param {Object} formData - The form data
 * @param {string} submitterEmail - Email of the submitter
 * @param {Object} updateResult - The update result
 */
function sendPotentialSiteUpdateNotifications(formData, submitterEmail, updateResult) {
  try {
    // Use the centralized notification system
    if (typeof sendFormNotification === 'function') {
      const notificationData = {
        formType: 'POTENTIAL_SITE_UPDATE',
        submitterEmail: submitterEmail,
        siteId: formData.siteId,
        updateReason: formData.updateReason,
        changedFields: updateResult.changedFields?.map(field => field.field).join(', ') || 'None',
        timestamp: new Date().toISOString()
      };
      
      // Get submitter role from employee data
      const employeeData = getEmployeeByEmail(submitterEmail);
      const submitterRole = employeeData?.role || 'EXTERNAL';
      
      sendFormNotification('POTENTIAL_SITE_UPDATE', submitterRole, notificationData);
    }
    
  } catch (error) {
    console.error('Error sending potential site update notifications:', error);
    throw error;
  }
}

/**
 * Logs order update activities
 * @param {string} orderId - The order ID
 * @param {Object} formData - The form data
 * @param {string} submitterEmail - Email of the submitter
 * @param {Object} updateResult - The update result
 */
function logOrderUpdate(orderId, formData, submitterEmail, updateResult) {
  try {
    console.log(`Order Update Log:
    Order ID: ${orderId}
    Updated by: ${submitterEmail}
    Update reason: ${formData.updateReason}
    Changed fields: ${updateResult.changedFields?.length || 0}
    Timestamp: ${new Date().toISOString()}`);
    
    // You could also log to a separate audit sheet if needed
    
  } catch (error) {
    console.error('Error logging order update:', error);
  }
}

/**
 * Logs potential site update activities
 * @param {string} siteId - The site ID
 * @param {Object} formData - The form data
 * @param {string} submitterEmail - Email of the submitter
 * @param {Object} updateResult - The update result
 */
function logPotentialSiteUpdate(siteId, formData, submitterEmail, updateResult) {
  try {
    console.log(`Potential Site Update Log:
    Site ID: ${siteId}
    Updated by: ${submitterEmail}
    Update reason: ${formData.updateReason}
    Changed fields: ${updateResult.changedFields?.length || 0}
    Timestamp: ${new Date().toISOString()}`);
    
    // You could also log to a separate audit sheet if needed
    
  } catch (error) {
    console.error('Error logging potential site update:', error);
  }
}

/**
 * Updates a potential site based on order update data
 * @param {string} siteId - The potential site ID
 * @param {Object} orderFormData - The order form data
 * @param {string} submitterEmail - Email of the submitter
 * @return {Object} Update result
 */
function updatePotentialSiteFromOrder(siteId, orderFormData, submitterEmail) {
  try {
    // Map order fields to site fields
    const siteUpdateData = {
      siteId: siteId,
      updateReason: `Updated from related order: ${orderFormData.orderId}`,
      engineerId: orderFormData.assignedEngineerId,
      partnerId: orderFormData.assignedPartnerId,
      status: orderFormData.status
    };
    
    return updatePotentialSiteData(siteId, siteUpdateData, submitterEmail);
    
  } catch (error) {
    console.error('Error updating potential site from order:', error);
    throw error;
  }
}

/**
 * Updates related orders based on potential site update data
 * @param {string} orderId - The order ID
 * @param {Object} siteFormData - The site form data
 * @param {string} submitterEmail - Email of the submitter
 * @return {Object} Update result
 */
function updateRelatedOrderFromSite(orderId, siteFormData, submitterEmail) {
  try {
    // Map site fields to order fields
    const orderUpdateData = {
      orderId: orderId,
      updateReason: `Updated from related potential site: ${siteFormData.siteId}`,
      assignedEngineerId: siteFormData.engineerId,
      assignedPartnerId: siteFormData.partnerId,
      status: siteFormData.status
    };
    
    return updateOrderData(orderId, orderUpdateData, submitterEmail);
    
  } catch (error) {
    console.error('Error updating related order from site:', error);
    throw error;
  }
}

/**
 * Helper function to get employee data by email
 * @param {string} email - Employee email
 * @return {Object|null} Employee data or null if not found
 */
function getEmployeeByEmail(email) {
  try {
    if (typeof findEmployeeByEmail === 'function') {
      return findEmployeeByEmail(email);
    }
    
    // Fallback implementation
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.EMPLOYEES);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email');
    
    if (emailColIndex === -1) {
      return null;
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === email) {
        const employee = {};
        headers.forEach((header, index) => {
          employee[header.toLowerCase().replace(/\s+/g, '')] = data[i][index];
        });
        return employee;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting employee by email:', error);
    return null;
  }
}
