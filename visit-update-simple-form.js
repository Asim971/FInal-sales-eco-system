/**
 * @fileoverview Simple Visit Update Form Setup - Alternative approach
 * This version creates a simpler form without complex conditional logic
 */

/**
 * Creates a simple Visit Update form with all fields visible.
 * This approach avoids the complex conditional navigation issues.
 */
function setupSimpleVisitUpdateForm() {
  try {
    console.log('🔧 Setting up Simple Visit Update Form...');
    
    // Create the form
    const form = FormApp.create('Visit Update Form - Simple');
    form.setDescription('Submit visit updates. Please fill only the relevant fields based on your visit type.');
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(false);
    form.setShowLinkToRespondAgain(true);
    
    console.log('📋 Form created with ID:', form.getId());
    
    // Section 1: Visit Type
    const section1 = form.addSectionHeaderItem();
    section1.setTitle('Visit Type Selection')
      .setHelpText('Please select the type of visit you are submitting');
    
    // Type of Visit field
    const typeOfVisitItem = form.addMultipleChoiceItem();
    typeOfVisitItem.setTitle('Type of Visit')
      .setHelpText('Select the type of visit you are submitting')
      .setChoices([
        typeOfVisitItem.createChoice('General Visit'),
        typeOfVisitItem.createChoice('Order Confirmation')
      ])
      .setRequired(true);
    
    // Section 2: General Visit Fields
    const section2 = form.addSectionHeaderItem();
    section2.setTitle('General Visit Details')
      .setHelpText('Fill this section ONLY if you selected "General Visit" above');
    
    // Type of Client (for General Visit)
    const typeOfClientItem = form.addMultipleChoiceItem();
    typeOfClientItem.setTitle('Type of Client (For General Visit Only)')
      .setHelpText('Select the type of client you visited - REQUIRED for General Visit')
      .setChoices([
        typeOfClientItem.createChoice('Dealer'),
        typeOfClientItem.createChoice('Retailer'),
        typeOfClientItem.createChoice('Partner'),
        typeOfClientItem.createChoice('N/A - Not a General Visit')
      ])
      .setRequired(false);
    
    // Client ID (for General Visit)
    const clientIdItem = form.addTextItem();
    clientIdItem.setTitle('Client ID (For General Visit Only)')
      .setHelpText('Enter the Client ID - REQUIRED for General Visit (will be validated against records)')
      .setRequired(false);
    
    // Section 3: Order Confirmation Fields
    const section3 = form.addSectionHeaderItem();
    section3.setTitle('Order Confirmation Details')
      .setHelpText('Fill this section ONLY if you selected "Order Confirmation" above');
    
    // User Order ID (for Order Confirmation)
    const userOrderIdItem = form.addTextItem();
    userOrderIdItem.setTitle('User Order ID (For Order Confirmation Only)')
      .setHelpText('Enter the Order ID for confirmation - REQUIRED for Order Confirmation (will be validated against approved orders)')
      .setRequired(false);
    
    // Section 4: Common Fields
    const section4 = form.addSectionHeaderItem();
    section4.setTitle('Visit Information')
      .setHelpText('Please provide these details for all visits');
    
    // Territory
    const territoryItem = form.addMultipleChoiceItem();
    territoryItem.setTitle('Territory')
      .setHelpText('Select the territory where the visit took place')
      .setChoices([
        territoryItem.createChoice('Dhaka North'),
        territoryItem.createChoice('Dhaka South'),
        territoryItem.createChoice('Chittagong'),
        territoryItem.createChoice('Sylhet'),
        territoryItem.createChoice('Rajshahi'),
        territoryItem.createChoice('Khulna'),
        territoryItem.createChoice('Barisal'),
        territoryItem.createChoice('Rangpur')
      ])
      .setRequired(true);
    
    // Upload Image
    const imageItem = form.addTextItem();
    imageItem.setTitle('Upload Image (Google Drive Link)')
      .setHelpText('Upload visit images to Google Drive and paste the shareable link here (Optional)')
      .setRequired(false);
    
    // Client Name
    const clientNameItem = form.addTextItem();
    clientNameItem.setTitle('Client Name')
      .setHelpText('Enter the name of the client visited')
      .setRequired(true);
    
    // Client Phone Number
    const phoneItem = form.addTextItem();
    phoneItem.setTitle('Client Phone Number')
      .setHelpText('Enter the client\'s phone number (format: 01XXXXXXXXX)')
      .setRequired(true);
    
    // Remarks
    const remarksItem = form.addParagraphTextItem();
    remarksItem.setTitle('Remarks')
      .setHelpText('Any additional notes about the visit (Optional)')
      .setRequired(false);
    
    // Link form to spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    // Set up trigger for form submissions
    const trigger = ScriptApp.newTrigger('handleVisitUpdateFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    
    console.log('✅ Simple Visit Update Form setup completed');
    console.log('📋 Form URL:', form.getPublishedUrl());
    console.log('🔗 Form Edit URL:', form.getEditUrl());
    console.log('⚡ Trigger ID:', trigger.getUniqueId());
    
    return {
      formId: form.getId(),
      formUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
      triggerId: trigger.getUniqueId()
    };
    
  } catch (error) {
    console.error('❌ Error setting up Simple Visit Update Form:', error);
    throw error;
  }
}

/**
 * Test the simple form setup
 */
function testSimpleVisitUpdateFormSetup() {
  console.log('🧪 Testing Simple Visit Update Form Setup...');
  
  try {
    const result = setupSimpleVisitUpdateForm();
    console.log('✅ Simple form setup successful:', result);
    
  } catch (error) {
    console.error('❌ Simple form setup failed:', error);
  }
}
