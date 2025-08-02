/**
 * @fileoverview Configuration file for the Anwar Sales Ecosystem.
 * This file contains all the configuration settings for the application.
 */

const CONFIG = {
  SPREADSHEET_IDS: {
    CRM: '1XKRvgPArOOaIOWGynf5EN-D94Uv8qVosHG_pu1fOapE',
    CONTRACTOR_REGISTRATION: '1PcSe4FHFs2kojm6cLYlYuS73HGFGJ7iMrpdUt8i8Gbw',
    ENGINEER_REGISTRATION: '1divKCgN-rqss3jIlUYFJEch4w3qmgoR2c0A8zsQUGl4',
    ENGINEER_UPDATE: '1S7M6OXi_adCdorUHSDAgMM9RNp7qVRsuKg8eAqnAK9c',
    POTENTIAL_SITE: '1n7bM3PZcE7Cgh5PZuP6q3lSEm0duii9yTvt8WKKFTm0',
    POTENTIAL_SITE_UPDATE: '1PSUPDATE_SPREADSHEET_ID_TO_BE_REPLACED', // Replace with actual ID during setup
    RETAILER_REGISTRATION: '1wvPRmDidYw93t8BlAvS8kHY3Pc_oyTBYxCMFW37A6u8',
    PARTNER_UPDATE: '1mkUsRsIRaxPcUbxU7io0vDuZ4X4vk2ifmz1aKEH3yn8', // Replace with actual ID
    PARTNER_REGISTRATION: '1Lqdjfo8dUGKJLaA6K3jLXdJjkbeZyGHX5h3eh70B06k', // Replace with actual ID
    ORDER_CREATION: '1-KGvQ00DxPnKInYN8Y1N2UZ3zy1FSI43qJ3YFGvnc8k', // Replace with actual ID
    DISPUTE_CREATION: '1KyvE-WyVlcWT9NsYpWJvMGJcleh3RnMKzQgWj6ME2i4', // Replace with actual ID
    SITE_PRESCRIPTION: '1_5VDPHRX6YJgXiAxzjn1atzViZeNtDx039ja5EH7VmE', // Replace with actual ID
    PROJECT_UPDATE: '1XKRvgPArOOaIOWGynf5EN-D94Uv8qVosHG_pu1fOapE',
    VISIT: '1Z4sYtgV_suMerbVZ6s_VI1gfjkgpksIV7ND5jgpjpEs', // Replace with actual ID during setup
    VISIT_UPDATE: '17pRoiZvFq1YtZhR5hmK0qeXAD16AsAu_-vo_XuoiGCU', // Replace with actual ID during setup
    IHB_REGISTRATION: '1Mb1-_Brijl0WQW1LZI_WZFc3ftbYLJt948oMlfLGKv8', // Replace with actual ID during setup
    RETAILER_POINT_REQUEST: '1lRhAwpFWF4dVx9dAvSsBo4SLa-HQVU-GSmY968Wl_5E', // Replace with actual ID during setup
    DEMAND_GENERATION_REQUEST: '1DGR_SPREADSHEET_ID_TO_BE_REPLACED' // Replace with actual ID during setup
  },
  FORMS: {
    PARTNER_REGISTRATION: {
      title: 'Partner Registration',
      collectEmail: true,
      items: [
        { title: 'Partner Type', type: 'MULTIPLE_CHOICE', choices: ['Site Engineer', 'Partner'], required: true },
        { title: 'Partner Name', type: 'TEXT', required: true },
        { title: 'Contact Number', type: 'TEXT', required: true },
        { title: 'bKash Number', type: 'TEXT', required: true },
        { title: 'NID No', type: 'TEXT', required: true },
        { title: 'Link to NID Upload', type: 'TEXT', required: true, helpText: 'Please upload the NID to a Google Drive folder and paste the shareable link here.' },
        { title: 'WhatsApp Number (Optional)', type: 'TEXT', required: false }
      ]
    },
    ORDER_CREATION: {
      title: 'User Order Submission',
      collectEmail: true,
      items: [
        { title: 'Potential Site ID', type: 'TEXT', required: true, helpText: 'Enter the Potential Site ID (e.g., P.S-001) for this order' },
        { title: 'Order Type', type: 'MULTIPLE_CHOICE', choices: ['Cement Order', 'Rod Order', 'Brick Order', 'Sand Order', 'Stone Chips Order', 'Full Construction Package', 'Other'], required: true },
        { title: 'Start Storied Building', type: 'TEXT', required: true, helpText: 'Building floor where construction starts (e.g., Ground Floor, 1st Floor)' },
        { title: 'End Storied Building', type: 'TEXT', required: true, helpText: 'Building floor where construction ends (e.g., 3rd Floor, Roof)' },
        { title: 'Project Address', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Complete address of the construction site' },
        { title: 'Estimated Quantity', type: 'TEXT', required: true, helpText: 'Estimated quantity of materials needed (e.g., 100 bags cement, 500 cft sand)' },
        { title: 'Delivery Timeline', type: 'MULTIPLE_CHOICE', choices: ['Within 24 hours', 'Within 3 days', 'Within 1 week', 'Within 2 weeks', 'Custom timeline'], required: true },
        { title: 'Custom Timeline (if selected)', type: 'TEXT', required: false, helpText: 'Specify custom delivery timeline if selected above' },
        { title: 'Special Instructions', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Any special delivery or construction instructions' },
        { title: 'Is Engineer Required?', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: true },
        { title: 'Is Partner/Contractor Required?', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: true },
        { title: 'Link to Delivery Note Slip', type: 'TEXT', required: false, helpText: 'Upload any existing delivery note to Google Drive and paste the shareable link here' },
        { title: 'Link to Site Images', type: 'TEXT', required: false, helpText: 'Upload current site images to Google Drive and paste the shareable link here' },
        { title: 'Additional Documents', type: 'TEXT', required: false, helpText: 'Upload any additional documents to Google Drive and paste the shareable link here' }
      ]
    },
    DISPUTE_CREATION: {
        title: 'Dispute Creation',
        collectEmail: true,
        items: [
            { title: 'Order ID', type: 'TEXT', required: true },
            { title: 'Reason for Dispute', type: 'PARAGRAPH_TEXT', required: true }
        ]
    },
    ENGINEER_REGISTRATION: {
      title: 'Engineer Registration',
      collectEmail: true,
      items: [
        { title: 'Engineer Name', type: 'TEXT', required: true },
        { title: 'bKash Number', type: 'TEXT', required: true },
        { title: 'Contact Number', type: 'TEXT', required: true },
        { title: 'NID No', type: 'TEXT', required: true },
        { title: 'Link to NID Upload', type: 'TEXT', required: true, helpText: 'Please upload the NID to a Google Drive folder and paste the shareable link here.' },
        { title: 'WhatsApp Number (Optional)', type: 'TEXT', required: false }
      ]
    },
    POTENTIAL_SITE: {
      title: 'Potential Site Submission',
      collectEmail: true,
      items: [
        { title: 'Site Name', type: 'TEXT', required: true },
        { title: 'Address', type: 'PARAGRAPH_TEXT', required: true },
        { title: 'Latitude', type: 'TEXT', required: false },
        { title: 'Longitude', type: 'TEXT', required: false },
        { title: 'IHB ID (if applicable)', type: 'TEXT', required: false, helpText: 'Enter IHB ID if this site is associated with an Individual House Builder' },
        { title: 'IHB Name (if applicable)', type: 'TEXT', required: false }
      ]
    },
    POTENTIAL_SITE_UPDATE: {
      title: 'Potential Site Update',
      collectEmail: true,
      items: [
        { title: 'Site ID', type: 'TEXT', required: true, helpText: 'Enter the Potential Site ID (e.g., P.S-001) that you want to update' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Status Update', 'Address Change', 'Contact Update', 'Additional Information', 'Other'], required: true },
        { title: 'New Status (if applicable)', type: 'MULTIPLE_CHOICE', choices: ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], required: false },
        { title: 'Updated Information', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Provide the updated information or changes' },
        { title: 'Reason for Update', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is necessary' },
        { title: 'Supporting Documents/Images', type: 'TEXT', required: false, helpText: 'Optional: Upload supporting documents to Google Drive and paste the shareable link here' },
        { title: 'Priority Level', type: 'MULTIPLE_CHOICE', choices: ['Low', 'Medium', 'High', 'Urgent'], required: false }
      ]
    },
    RETAILER_REGISTRATION: {
      title: 'Retailer Registration',
      collectEmail: true,
      items: [
        { title: 'Retailer Name', type: 'TEXT', required: true },
        { title: 'Contact Number', type: 'TEXT', required: true },
        { title: 'NID No', type: 'TEXT', required: true },
        { title: 'Link to NID Upload', type: 'TEXT', required: true, helpText: 'Please upload the NID to a Google Drive folder and paste the shareable link here.' },
        { title: 'WhatsApp Number (Optional)', type: 'TEXT', required: false }
      ]
    },
    PARTNER_UPDATE: {
      title: 'Partner/Engineer Update for Project',
      collectEmail: true,
      items: [
        { title: 'Project ID', type: 'TEXT', required: true, helpText: 'Enter the Potential Site ID (e.g., P.S-001) for the project you want to assign partner/engineer to' },
        { title: 'Partner Type', type: 'MULTIPLE_CHOICE', choices: ['Site Engineer', 'Partner'], required: true },
        { title: 'Partner/Engineer ID', type: 'TEXT', required: true },
        { title: 'Partner/Engineer Name', type: 'TEXT', required: true },
        { title: 'WhatsApp Number', type: 'TEXT', required: false }
      ]
    },
    SITE_PRESCRIPTION: {
      title: 'Site Prescription',
      collectEmail: true,
      items: [
        { title: 'Project ID', type: 'TEXT', required: true, helpText: 'Enter the Potential Site ID (e.g., P.S-001) for the site you want to provide prescription for' },
        { title: 'Prescription Details', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Provide detailed prescription and recommendations for the site' },
        { title: 'Technical Specifications', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Optional: Include technical specifications or requirements' },
        { title: 'Estimated Materials', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Optional: List estimated materials needed' },
        { title: 'Supporting Documents/Images', type: 'TEXT', required: false, helpText: 'Optional: Upload supporting documents to Google Drive and paste the shareable link here' }
      ]
    },
    VISIT: {
      title: 'Visit Form',
      collectEmail: true,
      items: [
        { title: 'Type of Visit', type: 'MULTIPLE_CHOICE', choices: ['Client Visit', 'Site Visit'], required: true },
        { title: 'Territory', type: 'MULTIPLE_CHOICE', choices: ['Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], required: true },
        { title: 'Type of Client', type: 'MULTIPLE_CHOICE', choices: ['Dealer', 'Retailer', 'IHB', 'Partner'], required: true },
        { title: 'Client Name', type: 'TEXT', required: true },
        { title: 'Client Phone Number', type: 'TEXT', required: true },
        { title: 'Client Address', type: 'PARAGRAPH_TEXT', required: true },
        { title: 'Visit Purpose/Notes', type: 'PARAGRAPH_TEXT', required: true },
        { title: 'Upload Image Link', type: 'TEXT', required: false, helpText: 'Please upload images to Google Drive and paste the shareable link here.' }
      ]
    },
    VISIT_UPDATE: {
      title: 'Visit Update Form',
      collectEmail: true,
      items: [
        { title: 'Visit ID', type: 'TEXT', required: true, helpText: 'Enter the Visit ID you want to update (e.g., V-20250802-001)' },
        { title: 'Type of Visit', type: 'MULTIPLE_CHOICE', choices: ['Client Visit', 'Site Visit'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Territory', type: 'MULTIPLE_CHOICE', choices: ['Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Type of Client', type: 'MULTIPLE_CHOICE', choices: ['Dealer', 'Retailer', 'IHB', 'Partner'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Client Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Client Phone Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Client Address', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Visit Purpose/Notes', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Upload Image Link', type: 'TEXT', required: false, helpText: 'Update image link if needed' },
        { title: 'Status', type: 'MULTIPLE_CHOICE', choices: ['Submitted', 'In Progress', 'Completed', 'Cancelled', 'Follow-up Required'], required: false, helpText: 'Update visit status if needed' },
        { title: 'Update Notes', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Add any additional notes about this update' }
      ]
    },
    IHB_REGISTRATION: {
      title: 'IHB (Individual House Builder) Registration',
      collectEmail: true,
      items: [
        { title: 'IHB Name', type: 'TEXT', required: true },
        { title: 'IHB Email', type: 'TEXT', required: true },
        { title: 'Mobile Number', type: 'TEXT', required: true },
        { title: 'NID Number', type: 'TEXT', required: true },
        { title: 'Address', type: 'PARAGRAPH_TEXT', required: true },
        { title: 'WhatsApp Number', type: 'TEXT', required: false },
        { title: 'Link to NID Upload', type: 'TEXT', required: true, helpText: 'Please upload the NID document to Google Drive and paste the shareable link here.' },
        { title: 'Additional Notes', type: 'PARAGRAPH_TEXT', required: false }
      ]
    },
    RETAILER_POINT_REQUEST: {
      title: 'Retailer Point Request',
      collectEmail: true,
      items: [
        { title: 'Territory Name', type: 'MULTIPLE_CHOICE', choices: ['Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], required: true },
        { title: 'Location', type: 'TEXT', required: true },
        { title: 'Select Company', type: 'MULTIPLE_CHOICE', choices: ['ACL', 'AIL'], required: true }
      ]
    },
    DEMAND_GENERATION_REQUEST: {
      title: 'Demand Generation Request',
      collectEmail: true,
      items: [
        { title: 'Territory', type: 'MULTIPLE_CHOICE', choices: ['Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], required: true },
        { title: 'Bazaar', type: 'MULTIPLE_CHOICE', choices: ['Gulshan Bazaar', 'Dhanmondi Bazaar', 'Uttara Bazaar', 'Wari Bazaar', 'Old Dhaka Bazaar', 'Chittagong Port Bazaar', 'Agrabad Bazaar', 'Sylhet Central Bazaar', 'Rajshahi Central Bazaar', 'Khulna Central Bazaar', 'Barisal Central Bazaar', 'Rangpur Central Bazaar'], required: true },
        { title: 'Area', type: 'MULTIPLE_CHOICE', choices: ['Urban Central', 'Urban Periphery', 'Semi-Urban', 'Rural', 'Industrial Zone', 'Commercial Hub', 'Residential Area'], required: true },
        { title: 'Reason', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain the reason for the demand generation request and expected outcomes' },
        { title: 'Business Unit', type: 'MULTIPLE_CHOICE', choices: ['ACL', 'AIL'], required: true }
      ]
    }
    // Add other form definitions here
  },
  SCHEMAS: {
    // This defines the required columns for each sheet.
    // The order of columns matters for new sheets.
    ORDERS: [
      'Timestamp', 'Order ID', 'Potential Site ID', 'Order Type', 'Submitter Email', 'Start Building', 'End Building', 'Project Address', 'Estimated Quantity', 'Delivery Timeline', 'Custom Timeline', 'Special Instructions', 'Engineer Required', 'Partner Required', 'Delivery Note Link', 'Site Images Link', 'Additional Docs Link', 'Status', 'Territory', 'Assigned Engineer ID', 'Assigned Partner ID', 'Processing Notes'
    ],
    DISPUTES: [
      'Timestamp', 'Dispute ID', 'Order ID', 'Submitter Email', 'Reason', 'Status'
    ],
    // Add schemas for other sheets as needed, e.g., CRM_APPROVALS, etc.
    CRM_APPROVALS: [
      'Timestamp', 'Email Address', 'Contractor Name', 'Bkash Number', 'Contact Number', 'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes', 'Partner ID', 'Partner Type', 'WhatsApp Number'
    ],
    ENGINEER_APPROVALS: [
      'Timestamp', 'Email Address', 'Engineer Name', 'Bkash Number', 'Contact Number', 'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes'
    ],
    POTENTIAL_SITE_APPROVALS: [
      'Timestamp', 'Email Address', 'Site Name', 'Address', 'Lat', 'Long', 'IHB ID', 'IHB Name', 'Potential Site ID', 'Status', 'Engineer ID', 'Engineer Name', 'Partner ID', 'Partner Name', 'Assignment Date', 'Notes'
    ],
    RETAILER_APPROVALS: [
      'Timestamp', 'Email Address', 'Retailer Name', 'Contact Number', 'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes'
    ],
    DEALER_APPROVALS: [
      'Timestamp', 'Email Address', 'Dealer Name', 'Contact Number', 'NID No', 'NID Upload', 'Submission ID', 'Status', 'Notes', 'Territory', 'Company'
    ],
    PROJECT_UPDATE: [
      'Timestamp', 'Email Address', 'Project ID', 'Site Engineer ID', 'Partner ID', 'Delivery Method', 'Reward Eligible', 'Status', 'Notes', 'Submission ID', 'Project Name', 'Project Address', 'Project Lat', 'Project Long', 'Project Status', 'Engineer Name', 'Engineer ID', 'Partner Name', 'Partner ID'
    ],
    EMPLOYEES: [
      'Employee ID', 'Employee Name', 'Role', 'Email', 'Contact Number', 'WhatsApp Number', 'bKash Number', 'NID No', 'Status', 'Hire Date', 'Company', 'Territory', 'Area', 'Legacy ID', 'Notes'
    ],
    VISITS: [
      'Timestamp', 'Visit ID', 'Email Address', 'Type of Visit', 'Territory', 'Type of Client', 'Client Name', 'Client Phone Number', 'Client Address', 'Visit Purpose/Notes', 'Upload Image Link', 'Status', 'Follow-up Required', 'Notes'
    ],
    IHB_APPROVALS: [
      'Timestamp', 'Submission ID', 'Email Address', 'IHB Name', 'IHB Email', 'Mobile Number', 'NID Number', 'Address', 'WhatsApp Number', 'NID Upload Link', 'Additional Notes', 'Status', 'IHB ID', 'Approval Date', 'CRM Notes'
    ],
    SITE_PRESCRIPTION_APPROVALS: [
      'Timestamp', 'Email Address', 'Project ID', 'Prescription Details', 'Technical Specifications', 'Estimated Materials', 'Supporting Documents', 'Submission ID', 'Status', 'Engineer ID', 'Approval Date', 'Notes'
    ],
    CRO_REG: [
      'Timestamp', 'Employee ID', 'Name', 'Email', 'Contact Number', 'WhatsApp Number', 'bKash Number', 'NID No', 'Status', 'Hire Date', 'Notes'
    ],
    BD_REG: [
      'Timestamp', 'Employee ID', 'Name', 'Email', 'Contact Number', 'WhatsApp Number', 'bKash Number', 'NID No', 'Status', 'Hire Date', 'Territory', 'Notes'
    ],
    SR_REG: [
      'Timestamp', 'Employee ID', 'Name', 'Email', 'Contact Number', 'WhatsApp Number', 'bKash Number', 'NID No', 'Status', 'Hire Date', 'Territory', 'CRO ID', 'Notes'
    ],
    RETAILER_POINT_REQUESTS: [
      'Timestamp', 'Request ID', 'Email Address', 'Territory Name', 'Location', 'Select Company', 'Status', 'ASM Notes', 'Approval Date', 'Notes'
    ],
    DEMAND_GENERATION_REQUESTS: [
      'Timestamp', 'Request ID', 'Email Address', 'Territory', 'Bazaar', 'Area', 'Reason', 'Business Unit', 'Status', 'BD Incharge Notes', 'Approval Date', 'Notes'
    ]
  },
  SHEET_NAMES: {
    CRM_APPROVALS: 'CRM Approvals',
    ENGINEER_APPROVALS: 'Engineer Approvals',
    POTENTIAL_SITE_APPROVALS: 'Potential Site Approvals',
    RETAILER_APPROVALS: 'Retailer Approvals',
    DEALER_APPROVALS: 'Dealer Approvals',
    SITE_PRESCRIPTION_APPROVALS: 'Site Prescription Approvals',
    CRO_REG: 'cro_reg',
    BD_REG: 'BD_reg',
    SR_REG: 'SR_Reg',
    PROJECT_UPDATE: 'Project Update',
    ORDERS: 'Orders',
    DISPUTES: 'Disputes',
    EMPLOYEES: 'Employees',
    VISITS: 'Visits',
    IHB_APPROVALS: 'IHB Approvals',
    RETAILER_POINT_REQUESTS: 'Retailer Point Requests',
    DEMAND_GENERATION_REQUESTS: 'Demand Generation Requests'
  },
  API_KEYS: {
    MAYTAPI: '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b' // Replace with actual key
  },
  MAYTAPI_CONFIG: {
    API_URL: 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage',
    API_KEY: '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b'
  },
  TRIGGERS: {
    ON_EDIT: 'onEditTrigger',
    ON_FORM_SUBMIT: 'onFormSubmitTrigger'
  },
  EMPLOYEE_ROLES: {
    BDO: { prefix: 'BDO', startNumber: 1 },
    CRO: { prefix: 'CRO', startNumber: 1 },
    SR: { prefix: 'SR', startNumber: 1 },
    ASM: { prefix: 'ASM', startNumber: 1 }
  }
};

/**
 * Creates all required sheets with proper headers in the CRM spreadsheet
 * @param {string} spreadsheetId - The ID of the spreadsheet to create sheets in
 * @return {Object} Result object with success status and any errors
 */
function createAllRequiredSheets(spreadsheetId) {
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const results = {
      success: true,
      sheetsCreated: [],
      sheetsSkipped: [],
      errors: []
    };
    
    // Get existing sheet names
    const existingSheets = ss.getSheets().map(sheet => sheet.getName());
    
    // Iterate through all required sheets and create them
    Object.entries(CONFIG.SHEET_NAMES).forEach(([key, sheetName]) => {
      try {
        if (existingSheets.includes(sheetName)) {
          results.sheetsSkipped.push(sheetName);
          console.log(`Sheet '${sheetName}' already exists, skipping...`);
          return;
        }
        
        // Get the corresponding schema for this sheet
        const schema = CONFIG.SCHEMAS[key];
        if (!schema) {
          results.errors.push(`No schema found for sheet: ${sheetName}`);
          return;
        }
        
        // Create the sheet
        const newSheet = ss.insertSheet(sheetName);
        
        // Add headers from schema
        newSheet.getRange(1, 1, 1, schema.length).setValues([schema]);
        
        // Format header row
        const headerRange = newSheet.getRange(1, 1, 1, schema.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('white');
        
        // Auto-resize columns
        newSheet.autoResizeColumns(1, schema.length);
        
        results.sheetsCreated.push(sheetName);
        console.log(`Created sheet: ${sheetName} with ${schema.length} columns`);
        
      } catch (error) {
        results.errors.push(`Error creating sheet ${sheetName}: ${error.message}`);
        console.error(`Error creating sheet ${sheetName}:`, error);
      }
    });
    
    // Log summary
    console.log(`Sheet Creation Summary:
    - Created: ${results.sheetsCreated.length} sheets
    - Skipped: ${results.sheetsSkipped.length} sheets  
    - Errors: ${results.errors.length} errors`);
    
    if (results.errors.length > 0) {
      results.success = false;
      console.error('Errors occurred during sheet creation:', results.errors);
    }
    
    return results;
    
  } catch (error) {
    console.error('Fatal error in createAllRequiredSheets:', error);
    return {
      success: false,
      sheetsCreated: [],
      sheetsSkipped: [],
      errors: [`Fatal error: ${error.message}`]
    };
  }
}

/**
 * Creates a specific sheet with headers if it doesn't exist
 * @param {Spreadsheet} spreadsheet - The spreadsheet object
 * @param {string} sheetName - Name of the sheet to create
 * @param {Array} schema - Array of column headers
 * @return {Sheet} The created or existing sheet
 */
function getOrCreateSheet(spreadsheet, sheetName, schema) {
  try {
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      // Create new sheet
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Add headers
      if (schema && schema.length > 0) {
        sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
        
        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, schema.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('white');
        
        // Auto-resize columns
        sheet.autoResizeColumns(1, schema.length);
      }
      
      console.log(`Created sheet: ${sheetName}`);
    } else {
      // Verify headers if sheet exists but is empty
      if (sheet.getLastRow() === 0 && schema && schema.length > 0) {
        sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
        
        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, schema.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('white');
        
        // Auto-resize columns
        sheet.autoResizeColumns(1, schema.length);
        
        console.log(`Added headers to existing empty sheet: ${sheetName}`);
      }
    }
    
    return sheet;
    
  } catch (error) {
    console.error(`Error creating/getting sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Initializes the main CRM spreadsheet with all required sheets
 * This should be called during initial setup
 */
function initializeCRMSpreadsheet() {
  try {
    console.log('Initializing CRM Spreadsheet with all required sheets...');
    
    const result = createAllRequiredSheets(CONFIG.SPREADSHEET_IDS.CRM);
    
    if (result.success) {
      console.log('✅ CRM Spreadsheet initialization completed successfully!');
      console.log(`Created ${result.sheetsCreated.length} new sheets.`);
    } else {
      console.error('❌ CRM Spreadsheet initialization completed with errors.');
      console.error('Errors:', result.errors);
    }
    
    return result;
    
  } catch (error) {
    console.error('Fatal error during CRM spreadsheet initialization:', error);
    throw error;
  }
}
