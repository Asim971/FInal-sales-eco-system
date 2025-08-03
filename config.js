/**
 * @fileoverview Configuration file for the Anwar Sales Ecosystem.
 * This file contains all the configuration settings for the application.
 */

const CONFIG = {
  SPREADSHEET_IDS: {
    CRM: '1nCsgeVs7pHJytrLmzsafdATMJM_o16uJYvrRtyEfquE',
    ENGINEER_REGISTRATION: '1OzNiIk_H-nPw3mWEKYOqOL7C2WIpZrCAGhfYwXkp_kU',
    ENGINEER_UPDATE: '1KMM-S2X1xC1exMPWOSMjVJq521V-AIivhlNdldsZtmo',
    POTENTIAL_SITE: '1-zyLJ7twwdMHQCQZx_xvUtT33k-O9KI9ksJW3Px_igw',
    POTENTIAL_SITE_UPDATE: '1_-DFdCa59gejheix2GwF_aASDR6Uk6a8K6fkiLvcQoo',
    RETAILER_REGISTRATION: '1JUODXinohhoh8CQds0sXhwYocW05eFqBDy-4oV8-ASg',
    PARTNER_UPDATE: '1l4U0tlonYLk4ziE0JEsXELUw4raRyPiGiVj-ruiRLOY',
    PARTNER_REGISTRATION: '1q3ui5896BKbDzeeA8vv2-T9cAhvOyHkfrSq60PI6dGE',
    ORDER_CREATION: '1aOrwfkpHWga4PxIk5ciz1pKhzgYCCjZRc-aJQIAz9_Q',
    ORDER_UPDATE: '1aOrwfkpHWga4PxIk5ciz1pKhzgYCCjZRc-aJQIAz9_Q', // Use same spreadsheet as order creation
    DISPUTE_CREATION: '19BWmI465dzuYR8Ps2qTF_gVr5Kb-zoVZ6WOJ92wnrKI',
    SITE_PRESCRIPTION: '10IfTkTrN_VkAlMitXP2pGKBVAqEuYXbsYtdnDmXvwc0',
    PROJECT_UPDATE: '1-Pk3Z5C9K4mOYQy7h5CMYNlJBDAZ8jICeg-UK_CjiBY',
    VISIT: '1BMTOTOqHHUYsRaWNDZYg9Xa4bPg37FZzPJR-Lx2IvhY',
    VISIT_UPDATE: '1GHUe08FT8WvxllETd2jDNcFvtliI6cqdA-2rREFKvYU',
    IHB_REGISTRATION: '1OSl_3LEdXv9k69KqNERj8sc0DEqoe6g7Jziz8AETFtI',
    IHB_UPDATES: '17_LakAtBbJxOFpFg8U5wtvGlm5pz0znbyaylUGuYM4k',
    RETAILER_UPDATES: '1AGP8jwJ3-yXUbsMAh9qyhgcHCYGZevHSLDmmy2IY35Q',
    PARTNER_UPDATES: '1uIHFYv92hqTc0nW8OQvApqHEzCJrwr5pXvisJ0sDgow',
    RETAILER_POINT_REQUEST: '12wE1H4izKHGnuKt9s7pujaOo4VqEkTX3-chDYcW4WEI',
    DEMAND_GENERATION_REQUEST: '12RkDM1gRXcO4uHE9kABiwyADMqXqYhyODn2W67VXsXs'
    },
  
  // User Sheets Configuration - Added for Per-Submitter Sheets Feature
  USER_SHEETS_CONFIG: {
    FOLDER_ID: '1iiviQqjow1e8ZjzARFszvx408N8bsJAC', // Replace with actual folder ID during setup
    ENABLED: true, // Toggle to enable/disable user sheet creation
    CACHE_TIMEOUT: 600 // Cache timeout for conversation state (10 minutes)
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
        { title: 'IHB Name (if applicable)', type: 'TEXT', required: false },
        { title: 'Start Storied Building', type: 'TEXT', required: true, helpText: 'Building floor where construction starts (e.g., Ground Floor, 1st Floor)' },
        { title: 'End Storied Building', type: 'TEXT', required: true, helpText: 'Building floor where construction ends (e.g., 3rd Floor, Roof)' },
        { title: 'Project Address', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Complete address of the construction site' },
        { title: 'Estimated Quantity', type: 'TEXT', required: true, helpText: 'Estimated quantity of materials needed (e.g., 100 bags cement, 500 cft sand)' },
        { title: 'Delivery Timeline', type: 'MULTIPLE_CHOICE', choices: ['Within 24 hours', 'Within 3 days', 'Within 1 week', 'Within 2 weeks', 'Custom timeline'], required: true },
        { title: 'Custom Timeline (if selected)', type: 'TEXT', required: false, helpText: 'Specify custom delivery timeline if selected above' }
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
    
    // ============================================================================
    // CLIENT UPDATE FORMS - New Addition for Update Management
    // ============================================================================
    
    IHB_UPDATE: {
      title: 'IHB (Individual House Builder) Update Form',
      collectEmail: true,
      items: [
        { title: 'IHB ID', type: 'TEXT', required: true, helpText: 'Enter the IHB ID you want to update (e.g., IHB-001)' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Profile Update', 'Contact Information Update', 'Location Update', 'Status Change', 'Document Update'], required: true },
        { title: 'New IHB Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New IHB Email', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Mobile Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New WhatsApp Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Address', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Zone', type: 'DROPDOWN', choices: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'], required: false },
        { title: 'New District', type: 'TEXT', required: false, helpText: 'Enter district name if updating location' },
        { title: 'New Area', type: 'TEXT', required: false, helpText: 'Enter area name if updating location' },
        { title: 'New Territory', type: 'TEXT', required: false, helpText: 'Enter territory name if updating location' },
        { title: 'New Bazaar', type: 'TEXT', required: false, helpText: 'Enter bazaar name if applicable' },
        { title: 'New Upazilla', type: 'TEXT', required: false, helpText: 'Enter upazilla name if applicable' },
        { title: 'New Business Unit', type: 'MULTIPLE_CHOICE', choices: ['ACL', 'AIL'], required: false },
        { title: 'Reason for Update', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is needed' },
        { title: 'Supporting Documents', type: 'TEXT', required: false, helpText: 'Upload documents to Google Drive and paste shareable links here' }
      ]
    },
    
    RETAILER_UPDATE: {
      title: 'Retailer Update Form',
      collectEmail: true,
      items: [
        { title: 'Retailer ID', type: 'TEXT', required: true, helpText: 'Enter the Retailer Submission ID you want to update' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Shop Information Update', 'Contact Information Update', 'Location Update', 'Status Change', 'Document Update'], required: true },
        { title: 'New Shop Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Proprietor Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Shop Address', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Phone Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Bkash Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Zone', type: 'DROPDOWN', choices: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'], required: false },
        { title: 'New District', type: 'TEXT', required: false, helpText: 'Enter district name if updating location' },
        { title: 'New Area', type: 'TEXT', required: false, helpText: 'Enter area name if updating location' },
        { title: 'New Territory', type: 'TEXT', required: false, helpText: 'Enter territory name if updating location' },
        { title: 'New Bazaar', type: 'TEXT', required: false, helpText: 'Enter bazaar name if applicable' },
        { title: 'New Upazilla', type: 'TEXT', required: false, helpText: 'Enter upazilla name if applicable' },
        { title: 'New Business Unit', type: 'MULTIPLE_CHOICE', choices: ['ACL', 'AIL'], required: false },
        { title: 'Reason for Update', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is needed' },
        { title: 'Supporting Documents', type: 'TEXT', required: false, helpText: 'Upload documents to Google Drive and paste shareable links here' }
      ]
    },
    
    PARTNER_UPDATE_ENHANCED: {
      title: 'Partner/Engineer Update Form',
      collectEmail: true,
      items: [
        { title: 'Partner ID', type: 'TEXT', required: true, helpText: 'Enter the Partner/Engineer ID you want to update' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Profile Update', 'Contact Information Update', 'Location Update', 'Project Assignment', 'Status Change', 'Partner Type Change'], required: true },
        { title: 'New Partner Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Partner Email', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Contact Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New WhatsApp Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Bkash Number', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Partner Type', type: 'MULTIPLE_CHOICE', choices: ['Site Engineer', 'Partner'], required: false },
        { title: 'New Zone', type: 'DROPDOWN', choices: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'], required: false },
        { title: 'New District', type: 'TEXT', required: false, helpText: 'Enter district name if updating location' },
        { title: 'New Area', type: 'TEXT', required: false, helpText: 'Enter area name if updating location' },
        { title: 'New Territory', type: 'TEXT', required: false, helpText: 'Enter territory name if updating location' },
        { title: 'New Bazaar', type: 'TEXT', required: false, helpText: 'Enter bazaar name if applicable' },
        { title: 'New Upazilla', type: 'TEXT', required: false, helpText: 'Enter upazilla name if applicable' },
        { title: 'New Business Unit', type: 'MULTIPLE_CHOICE', choices: ['ACL', 'AIL'], required: false },
        { title: 'Project Assignment', type: 'TEXT', required: false, helpText: 'Enter Potential Site ID if updating project assignment (e.g., P.S-001)' },
        { title: 'Reason for Update', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is needed' },
        { title: 'Supporting Documents', type: 'TEXT', required: false, helpText: 'Upload documents to Google Drive and paste shareable links here' }
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
    },
    VISIT_UPDATE: {
      title: 'Visit Update Form',
      collectEmail: true,
      items: [
        { title: 'Type of Visit', type: 'MULTIPLE_CHOICE', choices: ['General Visit', 'Order Confirmation'], required: true },
        { title: 'Type of Client', type: 'MULTIPLE_CHOICE', choices: ['Dealer', 'Retailer', 'Partner'], required: false, helpText: 'Required only for General Visit' },
        { title: 'Client ID', type: 'TEXT', required: false, helpText: 'Required only for General Visit' },
        { title: 'User Order ID', type: 'DROPDOWN', required: false, helpText: 'Required only for Order Confirmation - populated from approved orders' },
        { title: 'Territory', type: 'MULTIPLE_CHOICE', choices: ['Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'], required: true },
        { title: 'Upload Image', type: 'TEXT', required: false, helpText: 'Upload images to Google Drive and paste the shareable link here' },
        { title: 'Client Name', type: 'TEXT', required: true },
        { title: 'Client Phone Number', type: 'TEXT', required: true }
      ]
    },
    
    // ============================================================================
    // ORDER AND SITE UPDATE FORMS - New Addition for Update Management
    // ============================================================================
    
    ORDER_UPDATE: {
      title: 'Order Update Form',
      collectEmail: true,
      items: [
        { title: 'Order ID', type: 'TEXT', required: true, helpText: 'Enter the Order ID you want to update (e.g., ORD-001)' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Status Update', 'Assignment Update', 'Content Update', 'Document Update', 'General Update'], required: true },
        { title: 'New Order Type', type: 'MULTIPLE_CHOICE', choices: ['Cement Order', 'Rod Order', 'Brick Order', 'Sand Order', 'Stone Chips Order', 'Full Construction Package', 'Other'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Special Instructions', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Engineer Required', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'Partner Required', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Delivery Note Link', type: 'TEXT', required: false, helpText: 'Upload new delivery note to Google Drive and paste link here' },
        { title: 'New Site Images Link', type: 'TEXT', required: false, helpText: 'Upload new site images to Google Drive and paste link here' },
        { title: 'New Additional Documents Link', type: 'TEXT', required: false, helpText: 'Upload additional documents to Google Drive and paste link here' },
        { title: 'New Status', type: 'MULTIPLE_CHOICE', choices: ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], required: false },
        { title: 'Assigned Engineer ID', type: 'TEXT', required: false, helpText: 'Enter Engineer ID if assigning/updating engineer' },
        { title: 'Assigned Partner ID', type: 'TEXT', required: false, helpText: 'Enter Partner ID if assigning/updating partner' },
        { title: 'Update Reason', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is needed' },
        { title: 'Update Related Potential Site', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: true, helpText: 'Should the related potential site also be updated?' },
        { title: 'Processing Notes', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Additional processing notes or comments' }
      ]
    },
    
    POTENTIAL_SITE_UPDATE_ENHANCED: {
      title: 'Enhanced Potential Site Update Form',
      collectEmail: true,
      items: [
        { title: 'Site ID', type: 'TEXT', required: true, helpText: 'Enter the Potential Site ID (e.g., P.S-001) that you want to update' },
        { title: 'Update Type', type: 'MULTIPLE_CHOICE', choices: ['Site Information Update', 'Location Update', 'Status Update', 'Assignment Update', 'Construction Details Update'], required: true },
        { title: 'New Site Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Address', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Latitude', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Longitude', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New IHB ID', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New IHB Name', type: 'TEXT', required: false, helpText: 'Leave blank if no change needed' },
        { title: 'New Start Building', type: 'TEXT', required: false, helpText: 'Building floor where construction starts (e.g., Ground Floor, 1st Floor)' },
        { title: 'New End Building', type: 'TEXT', required: false, helpText: 'Building floor where construction ends (e.g., 3rd Floor, Roof)' },
        { title: 'New Project Address', type: 'PARAGRAPH_TEXT', required: false, helpText: 'Complete address of the construction site' },
        { title: 'New Estimated Quantity', type: 'TEXT', required: false, helpText: 'Estimated quantity of materials needed (e.g., 100 bags cement, 500 cft sand)' },
        { title: 'New Delivery Timeline', type: 'MULTIPLE_CHOICE', choices: ['Within 24 hours', 'Within 3 days', 'Within 1 week', 'Within 2 weeks', 'Custom timeline'], required: false },
        { title: 'New Custom Timeline', type: 'TEXT', required: false, helpText: 'Specify custom delivery timeline if selected above' },
        { title: 'New Status', type: 'MULTIPLE_CHOICE', choices: ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], required: false },
        { title: 'New Engineer ID', type: 'TEXT', required: false, helpText: 'Enter Engineer ID if assigning/updating engineer' },
        { title: 'New Engineer Name', type: 'TEXT', required: false, helpText: 'Enter Engineer Name if assigning/updating engineer' },
        { title: 'New Partner ID', type: 'TEXT', required: false, helpText: 'Enter Partner ID if assigning/updating partner' },
        { title: 'New Partner Name', type: 'TEXT', required: false, helpText: 'Enter Partner Name if assigning/updating partner' },
        { title: 'Assignment Date', type: 'DATE', required: false, helpText: 'Date when engineer/partner was assigned' },
        { title: 'Update Reason', type: 'PARAGRAPH_TEXT', required: true, helpText: 'Explain why this update is needed' },
        { title: 'Update Related Orders', type: 'MULTIPLE_CHOICE', choices: ['Yes', 'No'], required: true, helpText: 'Should related orders also be updated?' },
        { title: 'Supporting Documents', type: 'TEXT', required: false, helpText: 'Upload supporting documents to Google Drive and paste links here' }
      ]
    }
    // Add other form definitions here
  },
  SCHEMAS: {
    // This defines the required columns for each sheet.
    // The order of columns matters for new sheets.
    ORDERS: [
      'Timestamp', 'Order ID', 'Potential Site ID', 'Order Type', 'Submitter Email', 'Special Instructions', 'Engineer Required', 'Partner Required', 'Delivery Note Link', 'Site Images Link', 'Additional Docs Link', 'Status', 'Territory', 'Assigned Engineer ID', 'Assigned Partner ID', 'Processing Notes'
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
      'Timestamp', 'Email Address', 'Site Name', 'Address', 'Lat', 'Long', 'IHB ID', 'IHB Name', 'Start Building', 'End Building', 'Project Address', 'Estimated Quantity', 'Delivery Timeline', 'Custom Timeline', 'Potential Site ID', 'Status', 'Engineer ID', 'Engineer Name', 'Partner ID', 'Partner Name', 'Assignment Date', 'Notes'
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
      'Employee ID', 'Employee Name', 'Role', 'Email', 'Contact Number', 'WhatsApp Number', 'bKash Number', 'NID No', 'Status', 'Hire Date', 'Company', 'Territory', 'Area', 'Zone', 'District', 'New Area', 'New Territory', 'Bazaar', 'Upazilla', 'BD Territory', 'CRO Territory', 'Business Unit', 'Legacy ID', 'Notes'
    ],
    VISITS: [
      'Timestamp', 'Visit ID', 'Email Address', 'Type of Visit', 'Territory', 'Type of Client', 'Client Name', 'Client Phone Number', 'Client Address', 'Visit Purpose/Notes', 'Upload Image Link', 'Status', 'Follow-up Required', 'Notes'
    ],
    VISIT_UPDATES: [
      'Timestamp', 'Visit Update ID', 'Email Address', 'Type of Visit', 'Type of Client', 'Client ID', 'User Order ID', 'Territory', 'Upload Image Link', 'Client Name', 'Client Phone Number', 'Status', 'Notification Sent To', 'Remarks'
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
    ],
    
    // Update Forms Schemas - Added for Order and Site Update Management
    ORDER_UPDATES: [
      'Timestamp', 'Update ID', 'Order ID', 'Email Address', 'Update Type', 'New Order Type', 'New Special Instructions', 'Engineer Required', 'Partner Required', 'New Delivery Note Link', 'New Site Images Link', 'New Additional Documents Link', 'New Status', 'Assigned Engineer ID', 'Assigned Partner ID', 'Update Reason', 'Update Related Potential Site', 'Processing Notes', 'Previous Values', 'Changed Fields', 'Update Status', 'Processed By', 'Processing Date'
    ],
    
    POTENTIAL_SITE_UPDATES: [
      'Timestamp', 'Update ID', 'Site ID', 'Email Address', 'Update Type', 'New Site Name', 'New Address', 'New Latitude', 'New Longitude', 'New IHB ID', 'New IHB Name', 'New Start Building', 'New End Building', 'New Project Address', 'New Estimated Quantity', 'New Delivery Timeline', 'New Custom Timeline', 'New Status', 'New Engineer ID', 'New Engineer Name', 'New Partner ID', 'New Partner Name', 'Assignment Date', 'Update Reason', 'Update Related Orders', 'Supporting Documents', 'Previous Values', 'Changed Fields', 'Update Status', 'Processed By', 'Processing Date'
    ],
    
    // User Sheet Metadata Schema - Added for Per-Submitter Sheets Feature
    USER_SHEET_MAP: [
      'Email', 'Sheet Type', 'Sheet Name', 'Sheet ID', 'Created Date', 'Last Updated', 'Status'
    ],
    // Location Hierarchy Mapping Schema - Added for Employee Setup Update
    LOCATION_MAP: [
      'Zone', 'District', 'Area', 'Territory', 'Bazaar', 'Upazilla', 'BD Territory', 'CRO Territory', 'Business Unit', 'Status'
    ]
  },
  SHEET_NAMES: {
    RETAILER_APPROVALS: 'Retailer Approvals',
    DEALER_APPROVALS: 'Dealer Approvals',
    SITE_PRESCRIPTION_APPROVALS: 'Site Prescription Approvals',
    CRO_REG: 'cro_reg',
    BD_REG: 'BD_reg',
    SR_REG: 'Form Responses 1',
    PROJECT_UPDATE: 'Project Update',
    ORDERS: 'Orders',
    DISPUTES: 'Disputes',
    EMPLOYEES: 'Employees',
    VISITS: 'Visits',
    VISIT_UPDATES: 'Visit Updates',
    IHB_APPROVALS: 'IHB Approvals',
    RETAILER_POINT_REQUESTS: 'Retailer Point Requests',
    DEMAND_GENERATION_REQUESTS: 'Demand Generation Requests',
    
    // Update Management Sheets - Added for Order and Site Update Management
    ORDER_UPDATES: 'Order Updates',
    POTENTIAL_SITE_UPDATES: 'Potential Site Updates',
    
    // User Sheet Registry - Added for Per-Submitter Sheets Feature
    USER_SHEET_MAP: 'User Sheet Map',
    
    // Location Hierarchy Mapping - Added for Employee Setup Update
    LOCATION_MAP: 'Location Map'
  },
  API_KEYS: {
    MAYTAPI: '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b' // Replace with actual key
  },
  MAYTAPI_CONFIG: {
    PRODUCT_ID: '55968f1b-01dc-4f02-baca-af83b92ca455',
    PHONE_ID: '90126',
    API_KEY: '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b',
    API_URL: 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage',
    WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw/exec', // Update after deployment
    DEPLOYMENT_ID: 'AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw', // Update after deployment
    MAX_MESSAGE_LENGTH: 4096,
    RATE_LIMIT: {
      MAX_MESSAGES: 10,
      TIME_WINDOW: 300 // 5 minutes in seconds
    },
    RETRY_CONFIG: {
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000 // 1 second
    }
  },
  TRIGGERS: {
    ON_EDIT: 'onEditTrigger',
    ON_FORM_SUBMIT: 'onFormSubmitTrigger'
  },
  EMPLOYEE_ROLES: {
    BDO: { prefix: 'BDO', startNumber: 1 },
    CRO: { prefix: 'CRO', startNumber: 1 },
    SR: { prefix: 'SR', startNumber: 1 },
    ASM: { prefix: 'ASM', startNumber: 1 },
    ZSM: { prefix: 'ZSM', startNumber: 1 }
  },
  
  // Visit Update Process Enhancement Configuration
  VISIT_UPDATE: {
    FORM_ID: '1ClK6mceoLJSAQ_Kk-t1w55UO8KuLGKhiNufyJs1JME4',
    FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSf71O7XKUvE_0ZfnMFAHpR__yRgAHTwuGDUx1nFWBaxZ-SzUQ/viewform',
    TRIGGER_ID: '7774348107585509233',
    VALIDATION: {
      REQUIRED_FIELDS: ['visitType', 'territory', 'clientName', 'clientPhone'],
      CLIENT_ID_VALIDATION: true,
      ORDER_ID_VALIDATION: true,
      TERRITORY_VALIDATION: true
    },
    NOTIFICATIONS: {
      ENABLED: true,
      ROLE_HIERARCHY: ['SR', 'CRO', 'BDO', 'BD Team Incharge', 'BD Incharge'],
      WHATSAPP_TEMPLATE: {
        TITLE: '🔄 VISIT UPDATE ALERT 🔄',
        INCLUDE_FIELDS: ['visitType', 'clientId', 'orderId', 'visitDate', 'purpose', 'outcomes', 'challenges', 'nextSteps', 'priority', 'territory'],
        FOOTER: true
      }
    }
  },

  // Comprehensive Notification System Configuration
  // Based on FORM_SUBMISSION_NOTIFICATION_GUIDE.md requirements
  NOTIFICATION_CONFIG: {
    ENABLED: true,
    
    // Notification timing levels (in minutes)
    TIMING: {
      IMMEDIATE: 5,      // L1: 5 minutes, 98% success rate
      PRIMARY: 30,       // L2: 30 minutes, 95% success rate  
      SECONDARY: 60,     // L3: 1 hour, 90% success rate
      SUMMARY: 1440      // L4: 24 hours, 85% success rate
    },

    // Role-based notification hierarchy for each form type and submitter role
    FORM_NOTIFICATIONS: {
      PARTNER_REGISTRATION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'], 
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },
      
      PARTNER_UPDATE: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone CRO']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        }
      },

      ENGINEER_REGISTRATION: {
        PARTNER: {
          L1: ['Territory CRO'],
          L2: ['Area ASM'],
          L3: ['Technical Head']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Area ASM'],
          L3: ['Technical Head']
        }
      },

      POTENTIAL_SITE_REGISTRATION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },

      POTENTIAL_SITE_APPROVAL: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },

      POTENTIAL_SITE_REJECTION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },

      POTENTIAL_SITE: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },

      RETAILER_REGISTRATION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        PARTNER: {
          L1: ['Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Zone BDO']
        }
      },

      RETAILER_UPDATE: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory CRO'],
          L3: ['Zone BDO']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        PARTNER: {
          L1: ['Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Zone BDO']
        }
      },

      ORDER_CREATION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        PARTNER: {
          L1: ['Territory CRO'],
          L2: ['Territory BDO'],
          L3: ['Zone ASM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Supply Chain']
        }
      },

      DISPUTE_CREATION: {
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Business Head']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Business Head']
        },
        ANY: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Business Head']
        }
      },

      SITE_PRESCRIPTION: {
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Technical Head']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Technical Head']
        },
        ENGINEER: {
          L1: ['Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Technical Head']
        }
      },

      VISIT_FORM: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        }
      },

      VISIT_UPDATE: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        ASM: {
          L1: ['Zone BDO'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        }
      },

      IHB_REGISTRATION: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory CRO'],
          L3: ['Zone BDO']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Zone BDO']
        }
      },

      RETAILER_POINT_REQUEST: {
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Regional Manager']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        }
      },

      DEMAND_GENERATION_REQUEST: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Business Head']
        },
        ASM: {
          L1: ['Zone BDO'],
          L2: ['Zone ZSM'],
          L3: ['Business Head']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Business Head']
        }
      },

      // Approval and status update notifications
      RETAILER_APPROVAL: {
        SYSTEM: {
          L1: ['Submitter', 'Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        }
      },

      RETAILER_REJECTION: {
        SYSTEM: {
          L1: ['Submitter', 'Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        }
      },

      RETAILER_STATUS_UPDATE: {
        SYSTEM: {
          L1: ['Submitter'],
          L2: [],
          L3: []
        }
      },

      PARTNER_APPROVAL: {
        SYSTEM: {
          L1: ['Submitter', 'Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        }
      },

      PARTNER_REJECTION: {
        SYSTEM: {
          L1: ['Submitter', 'Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        }
      },

      ENGINEER_APPROVAL: {
        SYSTEM: {
          L1: ['Submitter', 'Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Technical Head']
        }
      },

      ENGINEER_REJECTION: {
        SYSTEM: {
          L1: ['Submitter', 'Territory CRO'],
          L2: ['Territory ASM'],
          L3: ['Technical Head']
        }
      },

      // Update Form Notifications - Added for Order and Site Update Management
      ORDER_UPDATE: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        ASM: {
          L1: ['Zone BDO'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      },

      POTENTIAL_SITE_UPDATE_ENHANCED: {
        SR: {
          L1: ['Territory ASM'],
          L2: ['Territory BDO'],
          L3: ['Zone ZSM']
        },
        CRO: {
          L1: ['Territory ASM'],
          L2: ['Zone BDO'],
          L3: ['Zone ZSM']
        },
        BDO: {
          L1: ['Territory ASM'],
          L2: ['Zone ZSM'],
          L3: ['Regional Manager']
        },
        EXTERNAL: {
          L1: ['Territory CRO', 'Territory BDO'],
          L2: ['Territory ASM'],
          L3: ['Zone ZSM']
        }
      }
    },

    // WhatsApp notification templates
    WHATSAPP_TEMPLATES: {
      FORM_SUBMISSION: {
        TITLE: '📋 NEW FORM SUBMISSION',
        INCLUDE_SUBMITTER: true,
        INCLUDE_TERRITORY: true,
        INCLUDE_TIMESTAMP: true,
        FOOTER: 'Anwar Sales Ecosystem - Automated Notification'
      },
      
      FORM_APPROVAL: {
        TITLE: '✅ FORM APPROVED',
        INCLUDE_APPROVER: true,
        INCLUDE_TERRITORY: true,
        INCLUDE_TIMESTAMP: true,
        FOOTER: 'Anwar Sales Ecosystem - Automated Notification'
      },
      
      FORM_REJECTION: {
        TITLE: '❌ FORM REJECTED',
        INCLUDE_REASON: true,
        INCLUDE_TERRITORY: true,
        INCLUDE_TIMESTAMP: true,
        FOOTER: 'Anwar Sales Ecosystem - Automated Notification'
      },

      ESCALATION: {
        TITLE: '⚠️ ESCALATION ALERT',
        INCLUDE_ESCALATION_LEVEL: true,
        INCLUDE_ORIGINAL_SUBMITTER: true,
        INCLUDE_TERRITORY: true,
        FOOTER: 'Anwar Sales Ecosystem - Automated Notification'
      }
    },

    // Email notification settings
    EMAIL_NOTIFICATIONS: {
      ENABLED: true,
      SUBJECT_PREFIX: '[Anwar Sales] ',
      INCLUDE_HTML: true,
      INCLUDE_ATTACHMENTS: false,
      CC_MANAGEMENT: true
    },

    // Emergency contact settings
    EMERGENCY_CONTACTS: {
      SYSTEM_ADMIN: {
        NAME: 'Asim Ilyus',
        EMAIL: 'asim.ilyus@anwargroup.com',
        WHATSAPP: null
      },
      BUSINESS_HEAD: {
        NAME: 'Business Head',
        EMAIL: 'business.head@anwargroup.com',
        WHATSAPP: null
      }
    },

    // Territory-specific notification rules for Thakurgaon teams
    THAKURGAON_TEAMS: {
      'THKG-01': { UPAZILLA: 'Baliadangi', BAZAARS: 38 },
      'THKG-02': { UPAZILLA: 'Horipur', BAZAARS: 10 },
      'THKG-03': { UPAZILLA: 'Pirgonj', BAZAARS: 16 },
      'THKG-04': { UPAZILLA: 'Ranishonkoil', BAZAARS: 15 },
      'THKG-05': { UPAZILLA: 'Ruhia', BAZAARS: 36 },
      'THKG-06': { UPAZILLA: 'Thakurgoan Sadar', BAZAARS: 26 },
      'THKG-07': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-08': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-09': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-10': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-11': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-12': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-13': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-14': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-15': { UPAZILLA: 'Support Team', BAZAARS: 0 },
      'THKG-16': { UPAZILLA: 'Support Team', BAZAARS: 0 }
    },

    // Performance metrics targets
    PERFORMANCE_TARGETS: {
      IMMEDIATE_DELIVERY: { TARGET_TIME: 5, SUCCESS_RATE: 98 },
      PRIMARY_DELIVERY: { TARGET_TIME: 30, SUCCESS_RATE: 95 },
      SECONDARY_DELIVERY: { TARGET_TIME: 60, SUCCESS_RATE: 90 },
      SUMMARY_DELIVERY: { TARGET_TIME: 1440, SUCCESS_RATE: 85 }
    }
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
