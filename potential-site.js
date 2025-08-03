/**
 * @fileoverview This file contains the potential site-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Potential Site Registration form.
 * @param {Object} e The event object.
 */
function handlePotentialSiteFormSubmit(e) {
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE, 'Approvals');

  const response = e.values;
  const timestamp = response[0];
  
  // Get submitter email from multiple sources (auto-collected via form)
  let submitterEmail = response[1]; // From form field if manually entered
  if (!submitterEmail) {
    submitterEmail = e.namedValues['Email Address'] ? e.namedValues['Email Address'][0] : null;
  }
  if (!submitterEmail && e.response) {
    submitterEmail = e.response.getRespondentEmail();
  }
  
  console.log('Potential Site Form Submission - Email extraction debug:');
  console.log('Form values email:', response[1]);
  console.log('Named values email:', e.namedValues['Email Address'] ? e.namedValues['Email Address'][0] : 'Not found');
  console.log('Response email:', e.response ? e.response.getRespondentEmail() : 'Response object not available');
  console.log('Final submitter email:', submitterEmail);
  
  const siteName = response[2];
  const address = response[3];
  const latitude = response[4];
  const longitude = response[5];
  const ihbId = response[6];
  const ihbName = response[7];

  // Generate sequential Potential Site ID
  const potentialSiteId = generatePotentialSiteId();
  const status = 'Pending';
  const engineerId = '';      // Will be filled when partner is assigned
  const engineerName = '';    // Will be filled when partner is assigned
  const partnerId = '';       // Will be filled when partner is assigned
  const partnerName = '';     // Will be filled when partner is assigned
  const assignmentDate = '';  // Will be filled when partner is assigned
  const notes = '';

  // Create row for POTENTIAL_SITE_APPROVALS sheet
  // Schema: Timestamp, Email Address, Site Name, Address, Lat, Long, IHB ID, IHB Name, 
  // Potential Site ID, Status, Engineer ID, Engineer Name, Partner ID, Partner Name, Assignment Date, Notes
  const row = [timestamp, submitterEmail, siteName, address, latitude, longitude, ihbId, ihbName, 
               potentialSiteId, status, engineerId, engineerName, partnerId, partnerName, assignmentDate, notes];
  appendRow(crmSheet, row);

  // Send form submission notification using centralized system
  sendFormNotification('POTENTIAL_SITE_REGISTRATION', {
    timestamp: timestamp,
    submitterEmail: submitterEmail,
    formData: {
      siteName: siteName,
      address: address,
      latitude: latitude,
      longitude: longitude,
      ihbId: ihbId,
      ihbName: ihbName,
      potentialSiteId: potentialSiteId
    }
  });

  // Send submitter confirmation
  sendSubmitterConfirmation(submitterEmail, 'POTENTIAL_SITE_REGISTRATION', {
    siteName: siteName,
    potentialSiteId: potentialSiteId,
    submissionTime: new Date().toLocaleString()
  });

  console.log(`Potential Site submission processed. ID: ${potentialSiteId}`);
}

/**
 * Generates a sequential Potential Site ID in the format P.S-001, P.S-002, etc.
 * @returns {string} The generated Potential Site ID.
 */
function generatePotentialSiteId() {
  const sheet = getSheet(CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE, 'Approvals');
  const data = getSheetData(sheet);
  
  // Find the highest existing P.S ID number
  let maxNumber = 0;
  for (let i = 1; i < data.length; i++) {
    const existingId = data[i][8]; // Potential Site ID column
    if (existingId && typeof existingId === 'string' && existingId.startsWith('P.S-')) {
      const numberPart = existingId.substring(4); // Remove "P.S-" prefix
      const num = parseInt(numberPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  
  // Generate next sequential number
  const nextNumber = maxNumber + 1;
  return `P.S-${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Handles the onEdit event for the Potential Site Approvals sheet.
 * @param {Object} e The event object.
 */
function handlePotentialSiteApprovalsEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();

  if (range.getColumn() !== 10) return; // Status column (10th column)

  const status = range.getValue();
  if (status !== 'Approved' && status !== 'Rejected') return;

  const row = range.getRow();
  const rowData = sheet.getRange(row, 1, 1, 16).getValues()[0]; // Updated to get all 16 columns
  
  const timestamp = rowData[0];
  const submitterEmail = rowData[1];
  const siteName = rowData[2];
  const address = rowData[3];
  const latitude = rowData[4];
  const longitude = rowData[5];
  const ihbId = rowData[6];
  const ihbName = rowData[7];
  const potentialSiteId = rowData[8];
  // const status = rowData[9]; - already extracted from range
  const engineerId = rowData[10];
  const engineerName = rowData[11];
  const partnerId = rowData[12];
  const partnerName = rowData[13];
  const assignmentDate = rowData[14];
  const notes = rowData[15];

  // Send form notification using centralized system
  const notificationType = status === 'Approved' ? 'POTENTIAL_SITE_APPROVAL' : 'POTENTIAL_SITE_REJECTION';
  
  sendFormNotification(notificationType, {
    timestamp: new Date(),
    submitterEmail: submitterEmail,
    formData: {
      siteName: siteName,
      address: address,
      latitude: latitude,
      longitude: longitude,
      ihbId: ihbId,
      ihbName: ihbName,
      potentialSiteId: potentialSiteId,
      status: status,
      engineerId: engineerId,
      engineerName: engineerName,
      partnerId: partnerId,
      partnerName: partnerName,
      assignmentDate: assignmentDate,
      notes: notes
    }
  });

  // If status is Approved, create a project record
  if (status === 'Approved') {
    createProjectFromApprovedSite(potentialSiteId, siteName, address, latitude, longitude, submitterEmail);
  }

  console.log(`Potential Site status update processed: ${status}`);
}

/**
 * Creates a project record when a potential site is approved.
 * @param {string} potentialSiteId The potential site ID to use as project ID.
 * @param {string} siteName The site name.
 * @param {string} address The site address.
 * @param {string} latitude The latitude.
 * @param {string} longitude The longitude.
 * @param {string} submitterEmail The submitter's email.
 */
function createProjectFromApprovedSite(potentialSiteId, siteName, address, latitude, longitude, submitterEmail) {
  try {
    const projectSheet = getSheet(CONFIG.SPREADSHEET_IDS.PROJECT_UPDATE, CONFIG.SHEET_NAMES.PROJECT_UPDATE);
    
    // Check if project already exists
    const projectData = getSheetData(projectSheet);
    for (let i = 1; i < projectData.length; i++) {
      if (projectData[i][2] === potentialSiteId) { // Project ID column
        console.log(`Project already exists for Potential Site ID: ${potentialSiteId}`);
        return;
      }
    }
    
    const timestamp = new Date();
    const projectRow = [
      timestamp, // Timestamp
      submitterEmail, // Email Address
      potentialSiteId, // Project ID (same as Potential Site ID)
      '', // Site Engineer ID
      '', // Partner ID
      '', // Delivery Method
      '', // Reward Eligible
      'Active', // Status
      'Created from approved potential site', // Notes
      potentialSiteId, // Submission ID (same as Project ID)
      siteName, // Project Name
      address, // Project Address
      latitude || '', // Project Lat
      longitude || '', // Project Long
      'Planning', // Project Status
      '', // Engineer Name
      '', // Engineer ID
      '', // Partner Name
      '' // Partner ID
    ];
    
    appendRow(projectSheet, projectRow);
      console.log(`Project created successfully for Potential Site ID: ${potentialSiteId}`);
    } catch (error) {
      console.error(`Failed to create project for Potential Site ID ${potentialSiteId}:`, error);
    }
  }

/**
 * Finds an IHB record by IHB ID.
 * @param {string} ihbId The IHB ID to search for.
 * @returns {Object|null} The IHB data or null if not found.
 */
function findIHBById(ihbId) {
  const ihbSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.IHB_APPROVALS);
  const data = getSheetData(ihbSheet);

  for (let i = 1; i < data.length; i++) {
    if (data[i][12] === ihbId && data[i][11] === 'Approved') { // IHB ID column and Status column
      return {
        submissionId: data[i][1],
        email: data[i][2],
        ihbName: data[i][3],
        ihbEmail: data[i][4],
        mobileNumber: data[i][5],
        nidNumber: data[i][6],
        address: data[i][7],
        whatsappNumber: data[i][8],
        ihbId: data[i][12]
      };
    }
  }
  return null;
}

/**
 * Finds an IHB record by submitter email.
 * @param {string} email The submitter email to search for.
 * @returns {Object|null} The IHB data or null if not found.
 */
function findIHBByEmail(email) {
  const ihbSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.IHB_APPROVALS);
  const data = getSheetData(ihbSheet);

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === email && data[i][11] === 'Approved') { // Email Address column and Status column
      return {
        submissionId: data[i][1],
        email: data[i][2],
        ihbName: data[i][3],
        ihbEmail: data[i][4],
        mobileNumber: data[i][5],
        nidNumber: data[i][6],
        address: data[i][7],
        whatsappNumber: data[i][8],
        ihbId: data[i][12]
      };
    }
  }
  return null;
}

/**
 * Finds all employees in a specific territory.
 * Enhanced to work with both legacy and new territory fields.
 * @param {string} territory The territory to search for.
 * @returns {Array} Array of employee objects in the territory.
 */
function findEmployeesByTerritory(territory) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);
  const employees = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[8]; // Status column
    const legacyTerritory = row[11]; // Legacy territory column
    const newTerritory = row[16]; // New territory column (if exists)
    
    // Check both legacy and new territory fields for backward compatibility
    if (status === 'Active' && (legacyTerritory === territory || newTerritory === territory)) {
      employees.push({
        id: row[0],
        name: row[1],
        role: row[2],
        email: row[3],
        contactNumber: row[4],
        whatsappNumber: row[5],
        bkashNumber: row[6],
        nidNo: row[7],
        status: row[8],
        hireDate: row[9],
        company: row[10],
        territory: row[11], // Legacy territory field
        area: row[12], // Legacy area field
        zone: row[13] || '', // New zone field (optional)
        district: row[14] || '', // New district field (optional)
        newArea: row[15] || '', // New area field (optional)
        newTerritory: row[16] || '', // New territory field (optional)
        bazaar: row[17] || '', // Bazaar field (optional)
        upazilla: row[18] || '', // Upazilla field (optional)
        bdTerritory: row[19] || '', // BD Territory field (optional)
        croTerritory: row[20] || '', // CRO Territory field (optional)
        businessUnit: row[21] || '', // Business Unit field (optional)
        legacyId: row[22] || row[13] || '', // Legacy ID field (maintain backward compatibility)
        notes: row[23] || row[14] || '' // Notes field (maintain backward compatibility)
      });
    }
  }

  return employees;
}

/**
 * Handles the onFormSubmit event for the Potential Site Update form.
 * @param {Object} e The event object.
 */
function handlePotentialSiteUpdateFormSubmit(e) {
  try {
    console.log('🏗️ Processing Potential Site Update submission...');
    
    const response = e.values;
    const timestamp = response[0];
    
    // Get submitter email
    let submitterEmail = response[1];
    if (!submitterEmail) {
      submitterEmail = e.namedValues['Email Address'] ? e.namedValues['Email Address'][0] : null;
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    const siteId = response[2];          // Site ID (e.g., P.S-001)
    const updateType = response[3];      // Update Type
    const newStatus = response[4];       // New Status (if applicable)
    const updatedInfo = response[5];     // Updated Information
    const updateReason = response[6];    // Reason for Update
    const supportingDocs = response[7];  // Supporting Documents/Images
    const priority = response[8];        // Priority Level
    
    // Validate required fields
    if (!siteId || !updateType || !updatedInfo || !updateReason) {
      console.error('❌ Missing required fields in potential site update');
      return;
    }
    
    // Find the potential site record to update
    const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.POTENTIAL_SITE, 'Approvals');
    const data = crmSheet.getDataRange().getValues();
    let siteRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === siteId) { // Column I is Potential Site ID
        siteRowIndex = i;
        break;
      }
    }
    
    if (siteRowIndex === -1) {
      console.error(`❌ Potential site not found: ${siteId}`);
      sendPotentialSiteUpdateNotification({
        siteId,
        updateType,
        updatedInfo,
        updateReason,
        submitterEmail,
        status: 'Error - Site Not Found'
      });
      return;
    }
    
    // Update the potential site record
    const currentRow = data[siteRowIndex];
    const updates = [];
    
    // Update status if provided
    if (newStatus && newStatus !== '') {
      crmSheet.getRange(siteRowIndex + 1, 10).setValue(newStatus); // Column J is Status
      updates.push(`Status: ${currentRow[9]} → ${newStatus}`);
    }
    
    // Add update information to notes column
    const currentNotes = currentRow[15] || ''; // Column P is Notes
    const updateEntry = `[${new Date().toLocaleString()}] ${updateType} by ${submitterEmail}:\n${updatedInfo}\nReason: ${updateReason}${priority ? `\nPriority: ${priority}` : ''}${supportingDocs ? `\nDocs: ${supportingDocs}` : ''}\n---\n`;
    const newNotes = updateEntry + currentNotes;
    crmSheet.getRange(siteRowIndex + 1, 16).setValue(newNotes); // Column P is Notes
    
    updates.push(`Added update: ${updateType}`);
    
    console.log(`✅ Updated potential site ${siteId}:`, updates);
    
    // Send notifications
    sendPotentialSiteUpdateNotification({
      siteId,
      siteName: currentRow[2], // Column C is Site Name
      updateType,
      newStatus,
      updatedInfo,
      updateReason,
      submitterEmail,
      priority,
      supportingDocs,
      updates
    });
    
  } catch (error) {
    console.error('❌ Error in handlePotentialSiteUpdateFormSubmit:', error);
    Logger.log(`Error in handlePotentialSiteUpdateFormSubmit: ${error.toString()}`);
  }
}

/**
 * Sends notifications for potential site updates.
 * @param {Object} updateData The update data containing site information and changes.
 */
function sendPotentialSiteUpdateNotification(updateData) {
  try {
    const {
      siteId,
      siteName,
      updateType,
      newStatus,
      updatedInfo,
      updateReason,
      submitterEmail,
      priority,
      supportingDocs,
      updates
    } = updateData;
    
    // Create notification message
    let message = `🏗️ *Potential Site Update*\n\n`;
    message += `📍 *Site:* ${siteName || 'N/A'} (${siteId})\n`;
    message += `🔄 *Update Type:* ${updateType}\n`;
    if (newStatus) message += `📊 *New Status:* ${newStatus}\n`;
    if (priority) message += `⚡ *Priority:* ${priority}\n`;
    message += `\n📝 *Updated Information:*\n${updatedInfo}\n`;
    message += `\n💭 *Reason:* ${updateReason}\n`;
    if (supportingDocs) message += `\n📎 *Documents:* ${supportingDocs}\n`;
    message += `\n👤 *Updated by:* ${submitterEmail}\n`;
    message += `🕐 *Time:* ${new Date().toLocaleString()}`;
    
    if (updates && updates.length > 0) {
      message += `\n\n✅ *Changes Applied:*\n• ${updates.join('\n• ')}`;
    }
    
    // Send to relevant territories based on site location
    const territories = ['Admin', 'Management']; // Default notifications
    
    for (const territory of territories) {
      sendWhatsAppNotification(territory, message);
    }
    
    console.log(`✅ Sent potential site update notifications for ${siteId}`);
    
  } catch (error) {
    console.error('❌ Error sending potential site update notification:', error);
    Logger.log(`Error in sendPotentialSiteUpdateNotification: ${error.toString()}`);
  }
}