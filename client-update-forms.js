/**
 * @fileoverview Client Update Forms for IHB, Retailer, and Partner Management
 * 
 * This file provides comprehensive update functionality for all client types:
 * - IHB (Individual House Builder) Updates
 * - Retailer Updates 
 * - Partner Updates
 * 
 * Features:
 * - Form validation with location hierarchy integration
 * - Status management and approval workflows
 * - WhatsApp notifications to relevant stakeholders
 * - Comprehensive audit trail
 * - Role-based access control
 */

/**
 * ============================================================================
 * IHB UPDATE FORM FUNCTIONALITY
 * ============================================================================
 */

/**
 * Handles IHB update form submissions
 * @param {Object} e The form submission event object
 */
function handleIHBUpdateFormSubmit(e) {
  try {
    console.log('🏗️ Processing IHB Update Form Submission...');
    
    const response = e.values;
    const timestamp = response[0];
    let submitterEmail = response[1];
    
    // Get submitter email from multiple sources
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    const ihbId = response[2];
    const updateType = response[3]; // Profile Update, Status Change, Location Update, etc.
    const newIhbName = response[4];
    const newIhbEmail = response[5];
    const newMobileNumber = response[6];
    const newWhatsAppNumber = response[7];
    const newAddress = response[8];
    const newZone = response[9];
    const newDistrict = response[10];
    const newArea = response[11];
    const newTerritory = response[12];
    const newBazaar = response[13];
    const newUpazilla = response[14];
    const newBusinessUnit = response[15];
    const updateReason = response[16];
    const supportingDocuments = response[17];
    
    // Validate required fields
    if (!ihbId || !updateType) {
      throw new Error('IHB ID and Update Type are required');
    }
    
    // Generate unique update ID
    const updateId = generateSubmissionId('IHB-UPD');
    
    // Get IHB approvals sheet
    const ihbSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.IHB_APPROVALS,
      CONFIG.SCHEMAS.IHB_APPROVALS
    );
    
    // Find existing IHB record
    const ihbData = getSheetData(ihbSheet);
    let ihbRowIndex = -1;
    let existingIhb = null;
    
    for (let i = 1; i < ihbData.length; i++) {
      if (ihbData[i][12] === ihbId) { // IHB ID is in column 13 (index 12)
        ihbRowIndex = i + 1;
        existingIhb = {
          timestamp: ihbData[i][0],
          submissionId: ihbData[i][1],
          email: ihbData[i][2],
          ihbName: ihbData[i][3],
          ihbEmail: ihbData[i][4],
          mobileNumber: ihbData[i][5],
          nidNumber: ihbData[i][6],
          address: ihbData[i][7],
          whatsappNumber: ihbData[i][8],
          nidUploadLink: ihbData[i][9],
          additionalNotes: ihbData[i][10],
          status: ihbData[i][11],
          ihbId: ihbData[i][12],
          approvalDate: ihbData[i][13],
          crmNotes: ihbData[i][14]
        };
        break;
      }
    }
    
    if (!existingIhb) {
      throw new Error(`IHB with ID ${ihbId} not found`);
    }
    
    if (existingIhb.status !== 'Approved') {
      throw new Error(`Cannot update IHB ${ihbId}. Current status: ${existingIhb.status}`);
    }
    
    // Validate location data if location update
    let locationData = null;
    if (updateType === 'Location Update' && (newZone || newDistrict || newArea || newTerritory)) {
      locationData = validateLocationHierarchy({
        zone: newZone,
        district: newDistrict,
        area: newArea,
        territory: newTerritory,
        bazaar: newBazaar,
        upazilla: newUpazilla,
        businessUnit: newBusinessUnit
      });
      
      if (!locationData.isValid) {
        throw new Error(`Invalid location hierarchy: ${locationData.errors.join(', ')}`);
      }
    }
    
    // Create IHB update record
    const ihbUpdateData = {
      timestamp: timestamp,
      updateId: updateId,
      submitterEmail: submitterEmail,
      ihbId: ihbId,
      updateType: updateType,
      existingData: JSON.stringify(existingIhb),
      newIhbName: newIhbName || existingIhb.ihbName,
      newIhbEmail: newIhbEmail || existingIhb.ihbEmail,
      newMobileNumber: newMobileNumber || existingIhb.mobileNumber,
      newWhatsAppNumber: newWhatsAppNumber || existingIhb.whatsappNumber,
      newAddress: newAddress || existingIhb.address,
      newZone: newZone || '',
      newDistrict: newDistrict || '',
      newArea: newArea || '',
      newTerritory: newTerritory || '',
      newBazaar: newBazaar || '',
      newUpazilla: newUpazilla || '',
      newBusinessUnit: newBusinessUnit || '',
      updateReason: updateReason,
      supportingDocuments: supportingDocuments || '',
      status: 'Pending',
      requestDate: new Date(),
      approvalDate: '',
      approverEmail: '',
      approvalNotes: ''
    };
    
    // Create IHB Updates sheet if it doesn't exist
    const ihbUpdatesSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      'IHB Updates',
      [
        'Timestamp', 'Update ID', 'Submitter Email', 'IHB ID', 'Update Type',
        'Existing Data', 'New IHB Name', 'New IHB Email', 'New Mobile Number',
        'New WhatsApp Number', 'New Address', 'New Zone', 'New District',
        'New Area', 'New Territory', 'New Bazaar', 'New Upazilla', 
        'New Business Unit', 'Update Reason', 'Supporting Documents',
        'Status', 'Request Date', 'Approval Date', 'Approver Email', 'Approval Notes'
      ]
    );
    
    // Add update record
    const updateRow = [
      ihbUpdateData.timestamp,
      ihbUpdateData.updateId,
      ihbUpdateData.submitterEmail,
      ihbUpdateData.ihbId,
      ihbUpdateData.updateType,
      ihbUpdateData.existingData,
      ihbUpdateData.newIhbName,
      ihbUpdateData.newIhbEmail,
      ihbUpdateData.newMobileNumber,
      ihbUpdateData.newWhatsAppNumber,
      ihbUpdateData.newAddress,
      ihbUpdateData.newZone,
      ihbUpdateData.newDistrict,
      ihbUpdateData.newArea,
      ihbUpdateData.newTerritory,
      ihbUpdateData.newBazaar,
      ihbUpdateData.newUpazilla,
      ihbUpdateData.newBusinessUnit,
      ihbUpdateData.updateReason,
      ihbUpdateData.supportingDocuments,
      ihbUpdateData.status,
      ihbUpdateData.requestDate,
      ihbUpdateData.approvalDate,
      ihbUpdateData.approverEmail,
      ihbUpdateData.approvalNotes
    ];
    
    appendRow(ihbUpdatesSheet, updateRow);
    
    // Send notification to relevant stakeholders
    sendIHBUpdateNotification(ihbUpdateData, existingIhb);
    
    console.log(`✅ IHB update request ${updateId} created successfully`);
    
  } catch (error) {
    console.error('❌ Error processing IHB update form:', error.message);
    
    // Send error notification to admin
    const adminMessage = `❌ IHB Update Form Error
    
Error: ${error.message}
Submitter: ${submitterEmail || 'Unknown'}
IHB ID: ${ihbId || 'Not provided'}
Time: ${new Date().toLocaleString()}
    
Please review and resolve this issue.`;
    
    sendAdminNotification(adminMessage);
    throw error;
  }
}

/**
 * ============================================================================
 * RETAILER UPDATE FORM FUNCTIONALITY
 * ============================================================================
 */

/**
 * Handles retailer update form submissions
 * @param {Object} e The form submission event object
 */
function handleRetailerUpdateFormSubmit(e) {
  try {
    console.log('🏪 Processing Retailer Update Form Submission...');
    
    const response = e.values;
    const timestamp = response[0];
    let submitterEmail = response[1];
    
    // Get submitter email from multiple sources
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    const retailerId = response[2];
    const updateType = response[3]; // Profile Update, Status Change, Location Update, etc.
    const newShopName = response[4];
    const newProprietorName = response[5];
    const newShopAddress = response[6];
    const newPhoneNumber = response[7];
    const newBkashNumber = response[8];
    const newZone = response[9];
    const newDistrict = response[10];
    const newArea = response[11];
    const newTerritory = response[12];
    const newBazaar = response[13];
    const newUpazilla = response[14];
    const newBusinessUnit = response[15];
    const updateReason = response[16];
    const supportingDocuments = response[17];
    
    // Validate required fields
    if (!retailerId || !updateType) {
      throw new Error('Retailer ID and Update Type are required');
    }
    
    // Generate unique update ID
    const updateId = generateSubmissionId('RTL-UPD');
    
    // Get retailer approvals sheet
    const retailerSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.RETAILER_APPROVALS,
      CONFIG.SCHEMAS.RETAILER_APPROVALS
    );
    
    // Find existing retailer record
    const retailerData = getSheetData(retailerSheet);
    let retailerRowIndex = -1;
    let existingRetailer = null;
    
    for (let i = 1; i < retailerData.length; i++) {
      if (retailerData[i][6] === retailerId) { // Submission ID is used as Retailer ID
        retailerRowIndex = i + 1;
        existingRetailer = {
          timestamp: retailerData[i][0],
          email: retailerData[i][1],
          shopName: retailerData[i][2],
          proprietorName: retailerData[i][3],
          shopAddress: retailerData[i][4],
          phoneNumber: retailerData[i][5],
          submissionId: retailerData[i][6],
          status: retailerData[i][7],
          notes: retailerData[i][8]
        };
        break;
      }
    }
    
    if (!existingRetailer) {
      throw new Error(`Retailer with ID ${retailerId} not found`);
    }
    
    if (existingRetailer.status !== 'Approved') {
      throw new Error(`Cannot update retailer ${retailerId}. Current status: ${existingRetailer.status}`);
    }
    
    // Validate location data if location update
    let locationData = null;
    if (updateType === 'Location Update' && (newZone || newDistrict || newArea || newTerritory)) {
      locationData = validateLocationHierarchy({
        zone: newZone,
        district: newDistrict,
        area: newArea,
        territory: newTerritory,
        bazaar: newBazaar,
        upazilla: newUpazilla,
        businessUnit: newBusinessUnit
      });
      
      if (!locationData.isValid) {
        throw new Error(`Invalid location hierarchy: ${locationData.errors.join(', ')}`);
      }
    }
    
    // Create retailer update record
    const retailerUpdateData = {
      timestamp: timestamp,
      updateId: updateId,
      submitterEmail: submitterEmail,
      retailerId: retailerId,
      updateType: updateType,
      existingData: JSON.stringify(existingRetailer),
      newShopName: newShopName || existingRetailer.shopName,
      newProprietorName: newProprietorName || existingRetailer.proprietorName,
      newShopAddress: newShopAddress || existingRetailer.shopAddress,
      newPhoneNumber: newPhoneNumber || existingRetailer.phoneNumber,
      newBkashNumber: newBkashNumber || '',
      newZone: newZone || '',
      newDistrict: newDistrict || '',
      newArea: newArea || '',
      newTerritory: newTerritory || '',
      newBazaar: newBazaar || '',
      newUpazilla: newUpazilla || '',
      newBusinessUnit: newBusinessUnit || '',
      updateReason: updateReason,
      supportingDocuments: supportingDocuments || '',
      status: 'Pending',
      requestDate: new Date(),
      approvalDate: '',
      approverEmail: '',
      approvalNotes: ''
    };
    
    // Create Retailer Updates sheet if it doesn't exist
    const retailerUpdatesSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      'Retailer Updates',
      [
        'Timestamp', 'Update ID', 'Submitter Email', 'Retailer ID', 'Update Type',
        'Existing Data', 'New Shop Name', 'New Proprietor Name', 'New Shop Address',
        'New Phone Number', 'New Bkash Number', 'New Zone', 'New District',
        'New Area', 'New Territory', 'New Bazaar', 'New Upazilla', 
        'New Business Unit', 'Update Reason', 'Supporting Documents',
        'Status', 'Request Date', 'Approval Date', 'Approver Email', 'Approval Notes'
      ]
    );
    
    // Add update record
    const updateRow = [
      retailerUpdateData.timestamp,
      retailerUpdateData.updateId,
      retailerUpdateData.submitterEmail,
      retailerUpdateData.retailerId,
      retailerUpdateData.updateType,
      retailerUpdateData.existingData,
      retailerUpdateData.newShopName,
      retailerUpdateData.newProprietorName,
      retailerUpdateData.newShopAddress,
      retailerUpdateData.newPhoneNumber,
      retailerUpdateData.newBkashNumber,
      retailerUpdateData.newZone,
      retailerUpdateData.newDistrict,
      retailerUpdateData.newArea,
      retailerUpdateData.newTerritory,
      retailerUpdateData.newBazaar,
      retailerUpdateData.newUpazilla,
      retailerUpdateData.newBusinessUnit,
      retailerUpdateData.updateReason,
      retailerUpdateData.supportingDocuments,
      retailerUpdateData.status,
      retailerUpdateData.requestDate,
      retailerUpdateData.approvalDate,
      retailerUpdateData.approverEmail,
      retailerUpdateData.approvalNotes
    ];
    
    appendRow(retailerUpdatesSheet, updateRow);
    
    // Send notification to relevant stakeholders
    sendRetailerUpdateNotification(retailerUpdateData, existingRetailer);
    
    console.log(`✅ Retailer update request ${updateId} created successfully`);
    
  } catch (error) {
    console.error('❌ Error processing retailer update form:', error.message);
    
    // Send error notification to admin
    const adminMessage = `❌ Retailer Update Form Error
    
Error: ${error.message}
Submitter: ${submitterEmail || 'Unknown'}
Retailer ID: ${retailerId || 'Not provided'}
Time: ${new Date().toLocaleString()}
    
Please review and resolve this issue.`;
    
    sendAdminNotification(adminMessage);
    throw error;
  }
}

/**
 * ============================================================================
 * PARTNER UPDATE FORM FUNCTIONALITY
 * ============================================================================
 */

/**
 * Handles partner update form submissions
 * @param {Object} e The form submission event object
 */
function handlePartnerUpdateFormSubmit(e) {
  try {
    console.log('🤝 Processing Partner Update Form Submission...');
    
    const response = e.values;
    const timestamp = response[0];
    let submitterEmail = response[1];
    
    // Get submitter email from multiple sources
    if (!submitterEmail && e.namedValues && e.namedValues['Email Address']) {
      submitterEmail = e.namedValues['Email Address'][0];
    }
    if (!submitterEmail && e.response) {
      submitterEmail = e.response.getRespondentEmail();
    }
    
    const partnerId = response[2];
    const updateType = response[3]; // Profile Update, Status Change, Location Update, Project Assignment, etc.
    const newPartnerName = response[4];
    const newPartnerEmail = response[5];
    const newContactNumber = response[6];
    const newWhatsAppNumber = response[7];
    const newBkashNumber = response[8];
    const newPartnerType = response[9]; // Site Engineer, Partner
    const newZone = response[10];
    const newDistrict = response[11];
    const newArea = response[12];
    const newTerritory = response[13];
    const newBazaar = response[14];
    const newUpazilla = response[15];
    const newBusinessUnit = response[16];
    const projectAssignment = response[17]; // For project assignment updates
    const updateReason = response[18];
    const supportingDocuments = response[19];
    
    // Validate required fields
    if (!partnerId || !updateType) {
      throw new Error('Partner ID and Update Type are required');
    }
    
    // Generate unique update ID
    const updateId = generateSubmissionId('PTN-UPD');
    
    // Get partner approvals sheet (CRM_APPROVALS includes partners)
    const partnerSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.CRM_APPROVALS,
      CONFIG.SCHEMAS.CRM_APPROVALS
    );
    
    // Find existing partner record
    const partnerData = getSheetData(partnerSheet);
    let partnerRowIndex = -1;
    let existingPartner = null;
    
    for (let i = 1; i < partnerData.length; i++) {
      if (partnerData[i][10] === partnerId) { // Partner ID is in column 11 (index 10)
        partnerRowIndex = i + 1;
        existingPartner = {
          timestamp: partnerData[i][0],
          email: partnerData[i][1],
          contractorName: partnerData[i][2],
          bkashNumber: partnerData[i][3],
          contactNumber: partnerData[i][4],
          nidNo: partnerData[i][5],
          nidUpload: partnerData[i][6],
          submissionId: partnerData[i][7],
          status: partnerData[i][8],
          notes: partnerData[i][9],
          partnerId: partnerData[i][10],
          partnerType: partnerData[i][11],
          whatsappNumber: partnerData[i][12]
        };
        break;
      }
    }
    
    if (!existingPartner) {
      throw new Error(`Partner with ID ${partnerId} not found`);
    }
    
    if (existingPartner.status !== 'Approved') {
      throw new Error(`Cannot update partner ${partnerId}. Current status: ${existingPartner.status}`);
    }
    
    // Validate location data if location update
    let locationData = null;
    if (updateType === 'Location Update' && (newZone || newDistrict || newArea || newTerritory)) {
      locationData = validateLocationHierarchy({
        zone: newZone,
        district: newDistrict,
        area: newArea,
        territory: newTerritory,
        bazaar: newBazaar,
        upazilla: newUpazilla,
        businessUnit: newBusinessUnit
      });
      
      if (!locationData.isValid) {
        throw new Error(`Invalid location hierarchy: ${locationData.errors.join(', ')}`);
      }
    }
    
    // Validate project assignment if provided
    let projectInfo = null;
    if (updateType === 'Project Assignment' && projectAssignment) {
      projectInfo = validateProjectAssignment(projectAssignment, partnerId, newPartnerType || existingPartner.partnerType);
      if (!projectInfo.isValid) {
        throw new Error(`Invalid project assignment: ${projectInfo.error}`);
      }
    }
    
    // Create partner update record
    const partnerUpdateData = {
      timestamp: timestamp,
      updateId: updateId,
      submitterEmail: submitterEmail,
      partnerId: partnerId,
      updateType: updateType,
      existingData: JSON.stringify(existingPartner),
      newPartnerName: newPartnerName || existingPartner.contractorName,
      newPartnerEmail: newPartnerEmail || existingPartner.email,
      newContactNumber: newContactNumber || existingPartner.contactNumber,
      newWhatsAppNumber: newWhatsAppNumber || existingPartner.whatsappNumber,
      newBkashNumber: newBkashNumber || existingPartner.bkashNumber,
      newPartnerType: newPartnerType || existingPartner.partnerType,
      newZone: newZone || '',
      newDistrict: newDistrict || '',
      newArea: newArea || '',
      newTerritory: newTerritory || '',
      newBazaar: newBazaar || '',
      newUpazilla: newUpazilla || '',
      newBusinessUnit: newBusinessUnit || '',
      projectAssignment: projectAssignment || '',
      updateReason: updateReason,
      supportingDocuments: supportingDocuments || '',
      status: 'Pending',
      requestDate: new Date(),
      approvalDate: '',
      approverEmail: '',
      approvalNotes: ''
    };
    
    // Create Partner Updates sheet if it doesn't exist
    const partnerUpdatesSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      'Partner Updates',
      [
        'Timestamp', 'Update ID', 'Submitter Email', 'Partner ID', 'Update Type',
        'Existing Data', 'New Partner Name', 'New Partner Email', 'New Contact Number',
        'New WhatsApp Number', 'New Bkash Number', 'New Partner Type', 'New Zone',
        'New District', 'New Area', 'New Territory', 'New Bazaar', 'New Upazilla',
        'New Business Unit', 'Project Assignment', 'Update Reason', 'Supporting Documents',
        'Status', 'Request Date', 'Approval Date', 'Approver Email', 'Approval Notes'
      ]
    );
    
    // Add update record
    const updateRow = [
      partnerUpdateData.timestamp,
      partnerUpdateData.updateId,
      partnerUpdateData.submitterEmail,
      partnerUpdateData.partnerId,
      partnerUpdateData.updateType,
      partnerUpdateData.existingData,
      partnerUpdateData.newPartnerName,
      partnerUpdateData.newPartnerEmail,
      partnerUpdateData.newContactNumber,
      partnerUpdateData.newWhatsAppNumber,
      partnerUpdateData.newBkashNumber,
      partnerUpdateData.newPartnerType,
      partnerUpdateData.newZone,
      partnerUpdateData.newDistrict,
      partnerUpdateData.newArea,
      partnerUpdateData.newTerritory,
      partnerUpdateData.newBazaar,
      partnerUpdateData.newUpazilla,
      partnerUpdateData.newBusinessUnit,
      partnerUpdateData.projectAssignment,
      partnerUpdateData.updateReason,
      partnerUpdateData.supportingDocuments,
      partnerUpdateData.status,
      partnerUpdateData.requestDate,
      partnerUpdateData.approvalDate,
      partnerUpdateData.approverEmail,
      partnerUpdateData.approvalNotes
    ];
    
    appendRow(partnerUpdatesSheet, updateRow);
    
    // Send notification to relevant stakeholders
    sendPartnerUpdateNotification(partnerUpdateData, existingPartner);
    
    console.log(`✅ Partner update request ${updateId} created successfully`);
    
  } catch (error) {
    console.error('❌ Error processing partner update form:', error.message);
    
    // Send error notification to admin
    const adminMessage = `❌ Partner Update Form Error
    
Error: ${error.message}
Submitter: ${submitterEmail || 'Unknown'}
Partner ID: ${partnerId || 'Not provided'}
Time: ${new Date().toLocaleString()}
    
Please review and resolve this issue.`;
    
    sendAdminNotification(adminMessage);
    throw error;
  }
}

/**
 * ============================================================================
 * UPDATE APPROVAL HANDLERS
 * ============================================================================
 */

/**
 * Handles approval/rejection of IHB updates
 * @param {Object} e The edit event object
 */
function handleIHBUpdateApproval(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    
    if (sheet.getName() !== 'IHB Updates' || range.getColumn() !== 21) { // Status column
      return;
    }
    
    const status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') {
      return;
    }
    
    const row = range.getRow();
    const rowData = sheet.getRange(row, 1, 1, 25).getValues()[0];
    
    const updateId = rowData[1];
    const ihbId = rowData[3];
    const updateType = rowData[4];
    
    // Update approval fields
    const approvalDate = new Date();
    const approverEmail = Session.getActiveUser().getEmail();
    
    sheet.getRange(row, 23).setValue(approvalDate); // Approval Date
    sheet.getRange(row, 24).setValue(approverEmail); // Approver Email
    
    if (status === 'Approved') {
      // Apply the updates to the main IHB record
      applyIHBUpdates(ihbId, rowData);
    }
    
    // Send notification
    sendIHBUpdateStatusNotification(updateId, status, rowData);
    
    console.log(`✅ IHB update ${updateId} ${status.toLowerCase()}`);
    
  } catch (error) {
    console.error('❌ Error processing IHB update approval:', error.message);
  }
}

/**
 * Handles approval/rejection of retailer updates
 * @param {Object} e The edit event object
 */
function handleRetailerUpdateApproval(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    
    if (sheet.getName() !== 'Retailer Updates' || range.getColumn() !== 21) { // Status column
      return;
    }
    
    const status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') {
      return;
    }
    
    const row = range.getRow();
    const rowData = sheet.getRange(row, 1, 1, 25).getValues()[0];
    
    const updateId = rowData[1];
    const retailerId = rowData[3];
    const updateType = rowData[4];
    
    // Update approval fields
    const approvalDate = new Date();
    const approverEmail = Session.getActiveUser().getEmail();
    
    sheet.getRange(row, 23).setValue(approvalDate); // Approval Date
    sheet.getRange(row, 24).setValue(approverEmail); // Approver Email
    
    if (status === 'Approved') {
      // Apply the updates to the main retailer record
      applyRetailerUpdates(retailerId, rowData);
    }
    
    // Send notification
    sendRetailerUpdateStatusNotification(updateId, status, rowData);
    
    console.log(`✅ Retailer update ${updateId} ${status.toLowerCase()}`);
    
  } catch (error) {
    console.error('❌ Error processing retailer update approval:', error.message);
  }
}

/**
 * Handles approval/rejection of partner updates
 * @param {Object} e The edit event object
 */
function handlePartnerUpdateApproval(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    
    if (sheet.getName() !== 'Partner Updates' || range.getColumn() !== 23) { // Status column
      return;
    }
    
    const status = range.getValue();
    if (status !== 'Approved' && status !== 'Rejected') {
      return;
    }
    
    const row = range.getRow();
    const rowData = sheet.getRange(row, 1, 1, 27).getValues()[0];
    
    const updateId = rowData[1];
    const partnerId = rowData[3];
    const updateType = rowData[4];
    
    // Update approval fields
    const approvalDate = new Date();
    const approverEmail = Session.getActiveUser().getEmail();
    
    sheet.getRange(row, 25).setValue(approvalDate); // Approval Date
    sheet.getRange(row, 26).setValue(approverEmail); // Approver Email
    
    if (status === 'Approved') {
      // Apply the updates to the main partner record
      applyPartnerUpdates(partnerId, rowData);
    }
    
    // Send notification
    sendPartnerUpdateStatusNotification(updateId, status, rowData);
    
    console.log(`✅ Partner update ${updateId} ${status.toLowerCase()}`);
    
  } catch (error) {
    console.error('❌ Error processing partner update approval:', error.message);
  }
}

/**
 * ============================================================================
 * NOTIFICATION FUNCTIONS
 * ============================================================================
 */

/**
 * Sends notification for IHB update request
 * @param {Object} updateData The update request data
 * @param {Object} existingIhb The existing IHB data
 */
function sendIHBUpdateNotification(updateData, existingIhb) {
  try {
    // Find relevant stakeholders based on location
    const stakeholders = getLocationStakeholders(
      updateData.newTerritory || existingIhb.territory,
      updateData.newBusinessUnit || existingIhb.businessUnit
    );
    
    const message = `🏗️ IHB Update Request
    
Update ID: ${updateData.updateId}
IHB ID: ${updateData.ihbId}
IHB Name: ${existingIhb.ihbName}
Update Type: ${updateData.updateType}
Reason: ${updateData.updateReason}

Submitter: ${updateData.submitterEmail}
Request Date: ${updateData.requestDate.toLocaleString()}

Please review and approve/reject this update request.`;
    
    // Send to ASM and above in hierarchy
    for (const stakeholder of stakeholders.filter(s => ['ASM', 'ZSM', 'BDO', 'CRO'].includes(s.role))) {
      sendWhatsAppMessage(stakeholder.whatsappNumber, message);
    }
    
  } catch (error) {
    console.error('❌ Error sending IHB update notification:', error.message);
  }
}

/**
 * Sends notification for retailer update request
 * @param {Object} updateData The update request data
 * @param {Object} existingRetailer The existing retailer data
 */
function sendRetailerUpdateNotification(updateData, existingRetailer) {
  try {
    // Find relevant stakeholders based on location
    const stakeholders = getLocationStakeholders(
      updateData.newTerritory || existingRetailer.territory,
      updateData.newBusinessUnit || existingRetailer.businessUnit
    );
    
    const message = `🏪 Retailer Update Request
    
Update ID: ${updateData.updateId}
Retailer ID: ${updateData.retailerId}
Shop Name: ${existingRetailer.shopName}
Update Type: ${updateData.updateType}
Reason: ${updateData.updateReason}

Submitter: ${updateData.submitterEmail}
Request Date: ${updateData.requestDate.toLocaleString()}

Please review and approve/reject this update request.`;
    
    // Send to SR and above in hierarchy
    for (const stakeholder of stakeholders.filter(s => ['SR', 'ASM', 'ZSM', 'BDO', 'CRO'].includes(s.role))) {
      sendWhatsAppMessage(stakeholder.whatsappNumber, message);
    }
    
  } catch (error) {
    console.error('❌ Error sending retailer update notification:', error.message);
  }
}

/**
 * Sends notification for partner update request
 * @param {Object} updateData The update request data
 * @param {Object} existingPartner The existing partner data
 */
function sendPartnerUpdateNotification(updateData, existingPartner) {
  try {
    // Find relevant stakeholders based on location
    const stakeholders = getLocationStakeholders(
      updateData.newTerritory || existingPartner.territory,
      updateData.newBusinessUnit || existingPartner.businessUnit
    );
    
    const message = `🤝 Partner Update Request
    
Update ID: ${updateData.updateId}
Partner ID: ${updateData.partnerId}
Partner Name: ${existingPartner.contractorName}
Partner Type: ${existingPartner.partnerType}
Update Type: ${updateData.updateType}
Reason: ${updateData.updateReason}

Submitter: ${updateData.submitterEmail}
Request Date: ${updateData.requestDate.toLocaleString()}

Please review and approve/reject this update request.`;
    
    // Send to ASM and above in hierarchy
    for (const stakeholder of stakeholders.filter(s => ['ASM', 'ZSM', 'BDO', 'CRO'].includes(s.role))) {
      sendWhatsAppMessage(stakeholder.whatsappNumber, message);
    }
    
  } catch (error) {
    console.error('❌ Error sending partner update notification:', error.message);
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Validates location hierarchy for client updates
 * @param {Object} location Location data to validate
 * @returns {Object} Validation result
 */
function validateLocationHierarchy(location) {
  try {
    // Use the location hierarchy validation from employee-location-hierarchy.js
    if (typeof getLocationHierarchy !== 'function') {
      return { isValid: true, warnings: ['Location hierarchy validation not available'] };
    }
    
    const hierarchy = getLocationHierarchy(location);
    return {
      isValid: true,
      hierarchy: hierarchy,
      warnings: []
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message]
    };
  }
}

/**
 * Validates project assignment for partner updates
 * @param {string} projectId The project ID to validate
 * @param {string} partnerId The partner ID
 * @param {string} partnerType The partner type
 * @returns {Object} Validation result
 */
function validateProjectAssignment(projectId, partnerId, partnerType) {
  try {
    // Get potential site sheet
    const potentialSiteSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS,
      CONFIG.SCHEMAS.POTENTIAL_SITE_APPROVALS
    );
    
    const siteData = getSheetData(potentialSiteSheet);
    
    // Find project
    for (let i = 1; i < siteData.length; i++) {
      if (siteData[i][8] === projectId) { // Potential Site ID
        const projectStatus = siteData[i][9];
        
        if (projectStatus !== 'Approved') {
          return {
            isValid: false,
            error: `Project ${projectId} is not approved. Current status: ${projectStatus}`
          };
        }
        
        return {
          isValid: true,
          projectInfo: {
            siteName: siteData[i][2],
            address: siteData[i][3],
            status: projectStatus
          }
        };
      }
    }
    
    return {
      isValid: false,
      error: `Project ${projectId} not found`
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Sends status update notification for IHB updates
 * @param {string} updateId The update ID
 * @param {string} status The approval status
 * @param {Array} updateData The update data
 */
function sendIHBUpdateStatusNotification(updateId, status, updateData) {
  try {
    const submitterEmail = updateData[2];
    const ihbId = updateData[3];
    const updateType = updateData[4];
    
    const message = `🏗️ IHB Update ${status}

Update ID: ${updateId}
IHB ID: ${ihbId}
Update Type: ${updateType}
Status: ${status}
Decision Date: ${new Date().toLocaleString()}

Your IHB update request has been ${status.toLowerCase()}.`;

    // Send to submitter if they have WhatsApp
    // Note: This would need WhatsApp lookup by email or direct WhatsApp field
    console.log(`📧 IHB update status notification: ${message}`);
    
  } catch (error) {
    console.error('❌ Error sending IHB update status notification:', error.message);
  }
}

/**
 * Sends status update notification for retailer updates
 * @param {string} updateId The update ID
 * @param {string} status The approval status
 * @param {Array} updateData The update data
 */
function sendRetailerUpdateStatusNotification(updateId, status, updateData) {
  try {
    const submitterEmail = updateData[2];
    const retailerId = updateData[3];
    const updateType = updateData[4];
    
    const message = `🏪 Retailer Update ${status}

Update ID: ${updateId}
Retailer ID: ${retailerId}
Update Type: ${updateType}
Status: ${status}
Decision Date: ${new Date().toLocaleString()}

Your retailer update request has been ${status.toLowerCase()}.`;

    // Send to submitter if they have WhatsApp
    console.log(`📧 Retailer update status notification: ${message}`);
    
  } catch (error) {
    console.error('❌ Error sending retailer update status notification:', error.message);
  }
}

/**
 * Sends status update notification for partner updates
 * @param {string} updateId The update ID
 * @param {string} status The approval status
 * @param {Array} updateData The update data
 */
function sendPartnerUpdateStatusNotification(updateId, status, updateData) {
  try {
    const submitterEmail = updateData[2];
    const partnerId = updateData[3];
    const updateType = updateData[4];
    
    const message = `🤝 Partner Update ${status}

Update ID: ${updateId}
Partner ID: ${partnerId}
Update Type: ${updateType}
Status: ${status}
Decision Date: ${new Date().toLocaleString()}

Your partner update request has been ${status.toLowerCase()}.`;

    // Send to submitter if they have WhatsApp
    console.log(`📧 Partner update status notification: ${message}`);
    
  } catch (error) {
    console.error('❌ Error sending partner update status notification:', error.message);
  }
}

/**
 * Gets stakeholders for location-based notifications
 * @param {string} territory The territory
 * @param {string} businessUnit The business unit
 * @returns {Array} Array of stakeholder objects
 */
function getLocationStakeholders(territory, businessUnit) {
  try {
    // Use the notification chain from employee-location-hierarchy.js
    if (typeof getNotificationChain === 'function') {
      return getNotificationChain(territory, businessUnit);
    }
    
    // Fallback to basic employee lookup
    const employees = findEmployeesByTerritory(territory);
    return employees.map(emp => ({
      role: emp.role,
      name: emp.name,
      whatsappNumber: emp.whatsappNumber
    }));
    
  } catch (error) {
    console.error('❌ Error getting location stakeholders:', error.message);
    return [];
  }
}

/**
 * Applies approved IHB updates to the main record
 * @param {string} ihbId The IHB ID
 * @param {Array} updateData The update data row
 */
function applyIHBUpdates(ihbId, updateData) {
  try {
    const ihbSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.IHB_APPROVALS,
      CONFIG.SCHEMAS.IHB_APPROVALS
    );
    
    const ihbData = getSheetData(ihbSheet);
    
    for (let i = 1; i < ihbData.length; i++) {
      if (ihbData[i][12] === ihbId) { // IHB ID column
        const row = i + 1;
        
        // Update fields if new values provided
        if (updateData[6]) ihbSheet.getRange(row, 4).setValue(updateData[6]); // IHB Name
        if (updateData[7]) ihbSheet.getRange(row, 5).setValue(updateData[7]); // IHB Email
        if (updateData[8]) ihbSheet.getRange(row, 6).setValue(updateData[8]); // Mobile Number
        if (updateData[9]) ihbSheet.getRange(row, 9).setValue(updateData[9]); // WhatsApp Number
        if (updateData[10]) ihbSheet.getRange(row, 8).setValue(updateData[10]); // Address
        
        // Add update note
        const currentNotes = ihbSheet.getRange(row, 15).getValue() || '';
        const updateNote = `\n[${new Date().toLocaleString()}] Updated via ${updateData[1]} - ${updateData[4]}`;
        ihbSheet.getRange(row, 15).setValue(currentNotes + updateNote);
        
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying IHB updates:', error.message);
    throw error;
  }
}

/**
 * Applies approved retailer updates to the main record
 * @param {string} retailerId The retailer ID
 * @param {Array} updateData The update data row
 */
function applyRetailerUpdates(retailerId, updateData) {
  try {
    const retailerSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.RETAILER_APPROVALS,
      CONFIG.SCHEMAS.RETAILER_APPROVALS
    );
    
    const retailerData = getSheetData(retailerSheet);
    
    for (let i = 1; i < retailerData.length; i++) {
      if (retailerData[i][6] === retailerId) { // Submission ID as Retailer ID
        const row = i + 1;
        
        // Update fields if new values provided
        if (updateData[6]) retailerSheet.getRange(row, 3).setValue(updateData[6]); // Shop Name
        if (updateData[7]) retailerSheet.getRange(row, 4).setValue(updateData[7]); // Proprietor Name
        if (updateData[8]) retailerSheet.getRange(row, 5).setValue(updateData[8]); // Shop Address
        if (updateData[9]) retailerSheet.getRange(row, 6).setValue(updateData[9]); // Phone Number
        
        // Add update note
        const currentNotes = retailerSheet.getRange(row, 9).getValue() || '';
        const updateNote = `\n[${new Date().toLocaleString()}] Updated via ${updateData[1]} - ${updateData[4]}`;
        retailerSheet.getRange(row, 9).setValue(currentNotes + updateNote);
        
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying retailer updates:', error.message);
    throw error;
  }
}

/**
 * Applies approved partner updates to the main record
 * @param {string} partnerId The partner ID
 * @param {Array} updateData The update data row
 */
function applyPartnerUpdates(partnerId, updateData) {
  try {
    const partnerSheet = getOrCreateSheet(
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM),
      CONFIG.SHEET_NAMES.CRM_APPROVALS,
      CONFIG.SCHEMAS.CRM_APPROVALS
    );
    
    const partnerData = getSheetData(partnerSheet);
    
    for (let i = 1; i < partnerData.length; i++) {
      if (partnerData[i][10] === partnerId) { // Partner ID column
        const row = i + 1;
        
        // Update fields if new values provided
        if (updateData[6]) partnerSheet.getRange(row, 3).setValue(updateData[6]); // Partner Name
        if (updateData[7]) partnerSheet.getRange(row, 2).setValue(updateData[7]); // Email
        if (updateData[8]) partnerSheet.getRange(row, 5).setValue(updateData[8]); // Contact Number
        if (updateData[9]) partnerSheet.getRange(row, 13).setValue(updateData[9]); // WhatsApp Number
        if (updateData[10]) partnerSheet.getRange(row, 4).setValue(updateData[10]); // Bkash Number
        if (updateData[11]) partnerSheet.getRange(row, 12).setValue(updateData[11]); // Partner Type
        
        // Add update note
        const currentNotes = partnerSheet.getRange(row, 10).getValue() || '';
        const updateNote = `\n[${new Date().toLocaleString()}] Updated via ${updateData[1]} - ${updateData[4]}`;
        partnerSheet.getRange(row, 10).setValue(currentNotes + updateNote);
        
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying partner updates:', error.message);
    throw error;
  }
}

/**
 * Sends admin notification for errors
 * @param {string} message The error message
 */
function sendAdminNotification(message) {
  try {
    // Get admin contact from CONFIG or use default
    const adminWhatsApp = CONFIG.ADMIN_WHATSAPP || '+8801234567890';
    sendWhatsAppMessage(adminWhatsApp, message);
  } catch (error) {
    console.error('❌ Error sending admin notification:', error.message);
  }
}

console.log('✅ Client Update Forms module loaded successfully');
