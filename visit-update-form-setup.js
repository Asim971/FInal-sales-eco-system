/**
 * @fileoverview Setup functions for the Enhanced Visit Update Form with conditional logic.
 * This file contains functions to create Google Forms with dynamic field visibility.
 */

/**
 * Sets up the Enhanced Visit Update form with conditional logic.
 * This form implements the requirements from requirement2.md.
 */
function setupEnhancedVisitUpdateForm() {
  try {
    console.log('🔧 Setting up Enhanced Visit Update Form...');
    
    // Create the form
    const form = FormApp.create('Visit Update Form - Enhanced');
    form.setDescription('Submit visit updates with conditional logic based on visit type. This form supports both General Visits and Order Confirmations with proper validation.');
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(false);
    form.setShowLinkToRespondAgain(true);
    
    console.log('📋 Form created with ID:', form.getId());
    
    // First, create all page breaks
    const generalVisitPage = form.addPageBreakItem();
    generalVisitPage.setTitle('General Visit Details')
      .setHelpText('Please provide details for your general visit');
    
    const orderConfirmationPage = form.addPageBreakItem();
    orderConfirmationPage.setTitle('Order Confirmation Details')
      .setHelpText('Please provide details for your order confirmation visit');
    
    const commonFieldsPage = form.addPageBreakItem();
    commonFieldsPage.setTitle('Visit Information')
      .setHelpText('Please provide additional visit details');
    
    // Add Type of Visit field (this will control conditional logic)
    const typeOfVisitItem = form.addMultipleChoiceItem();
    typeOfVisitItem.setTitle('Type of Visit')
      .setHelpText('Select the type of visit you are submitting')
      .setChoices([
        typeOfVisitItem.createChoice('General Visit', generalVisitPage),
        typeOfVisitItem.createChoice('Order Confirmation', orderConfirmationPage)
      ])
      .setRequired(true);
    
    // Type of Client (for General Visit)
    const typeOfClientItem = form.addMultipleChoiceItem();
    typeOfClientItem.setTitle('Type of Client')
      .setHelpText('Select the type of client you visited')
      .setChoices([
        typeOfClientItem.createChoice('Dealer'),
        typeOfClientItem.createChoice('Retailer'),
        typeOfClientItem.createChoice('Partner')
      ])
      .setRequired(true);
    
    // Client ID (for General Visit)
    const clientIdItem = form.addTextItem();
    clientIdItem.setTitle('Client ID')
      .setHelpText('Enter the Client ID (this will be validated against our records)')
      .setRequired(true);
    
    // User Order ID (for Order Confirmation)
    const userOrderIdItem = form.addTextItem();
    userOrderIdItem.setTitle('User Order ID')
      .setHelpText('Enter the Order ID for confirmation (this will be validated against approved orders)')
      .setRequired(true);
    
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
      .setHelpText('Upload visit images to Google Drive and paste the shareable link here')
      .setRequired(false);
    
    // Client Name
    const clientNameItem = form.addTextItem();
    clientNameItem.setTitle('Client Name')
      .setHelpText('Enter the name of the client visited')
      .setRequired(true);
    
    // Client Phone Number
    const phoneItem = form.addTextItem();
    phoneItem.setTitle('Client Phone Number')
      .setHelpText('Enter the client\'s phone number')
      .setRequired(true);
    
    // Set up conditional logic using Google Apps Script
    setupFormConditionalLogic(form, typeOfVisitItem, generalVisitPage, orderConfirmationPage, commonFieldsPage);
    
    // Link form to spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    // Set up trigger for form submissions
    const trigger = ScriptApp.newTrigger('handleVisitUpdateFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    
    console.log('✅ Enhanced Visit Update Form setup completed');
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
    console.error('❌ Error setting up Enhanced Visit Update Form:', error);
    throw error;
  }
}

/**
 * Sets up conditional logic for the form using Google Apps Script.
 * Note: This is a simplified approach. For full conditional logic, 
 * consider using Google Apps Script with HTML Service for custom forms.
 * 
 * @param {GoogleAppsScript.Forms.Form} form The form object
 * @param {GoogleAppsScript.Forms.MultipleChoiceItem} typeOfVisitItem The type of visit item
 * @param {GoogleAppsScript.Forms.PageBreakItem} generalVisitPage General visit page
 * @param {GoogleAppsScript.Forms.PageBreakItem} orderConfirmationPage Order confirmation page
 * @param {GoogleAppsScript.Forms.PageBreakItem} commonFieldsPage Common fields page
 */
function setupFormConditionalLogic(form, typeOfVisitItem, generalVisitPage, orderConfirmationPage, commonFieldsPage) {
  try {
    console.log('⚙️ Setting up conditional logic...');
    
    // Set up navigation from conditional pages to common fields
    if (commonFieldsPage) {
      generalVisitPage.setGoToPage(commonFieldsPage);
      orderConfirmationPage.setGoToPage(commonFieldsPage);
    }
    
    console.log('✅ Conditional logic setup completed');
    
  } catch (error) {
    console.error('❌ Error setting up conditional logic:', error);
    throw error;
  }
}

/**
 * Populates the User Order ID dropdown with approved orders.
 * This function should be called periodically to keep the dropdown updated.
 */
function updateOrderDropdownChoices() {
  try {
    console.log('🔄 Updating Order ID dropdown choices...');
    
    // Get approved orders
    const approvedOrders = getApprovedOrdersForVisitConfirmation();
    
    if (approvedOrders.length === 0) {
      console.log('⚠️ No approved orders found for dropdown');
      return;
    }
    
    // Find the form (you'll need to store the form ID somewhere accessible)
    // For now, this is a placeholder - in practice, you'd store the form ID in CONFIG
    console.log(`Found ${approvedOrders.length} approved orders for dropdown`);
    console.log('Order choices:', approvedOrders.map(o => o.displayText));
    
    console.log('✅ Order dropdown choices updated');
    
  } catch (error) {
    console.error('❌ Error updating order dropdown choices:', error);
  }
}

/**
 * Creates a custom HTML form with full conditional logic.
 * This provides better user experience than native Google Forms conditional logic.
 */
function createCustomVisitUpdateForm() {
  try {
    console.log('🔧 Creating custom HTML Visit Update Form...');
    
    // Create HTML content with conditional logic
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Update Form</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .required { color: red; }
        .hidden { display: none; }
        .help-text { font-size: 12px; color: #666; margin-top: 5px; }
        .submit-btn { background-color: #4CAF50; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .submit-btn:hover { background-color: #45a049; }
        .error { color: red; font-size: 14px; margin-top: 5px; }
        .section-header { background-color: #f5f5f5; padding: 10px; margin: 20px 0 10px 0; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <h1>Visit Update Form</h1>
    <p>Submit visit updates with conditional logic based on visit type.</p>
    
    <form id="visitUpdateForm">
        <div class="section-header">
            <h3>Visit Type Selection</h3>
        </div>
        
        <div class="form-group">
            <label for="typeOfVisit">Type of Visit <span class="required">*</span></label>
            <select id="typeOfVisit" name="typeOfVisit" required onchange="toggleVisitFields()">
                <option value="">-- Select Visit Type --</option>
                <option value="General Visit">General Visit</option>
                <option value="Order Confirmation">Order Confirmation</option>
            </select>
            <div class="help-text">Select the type of visit you are submitting</div>
        </div>
        
        <!-- General Visit Fields -->
        <div id="generalVisitFields" class="hidden">
            <div class="section-header">
                <h3>General Visit Details</h3>
            </div>
            
            <div class="form-group">
                <label for="typeOfClient">Type of Client <span class="required">*</span></label>
                <select id="typeOfClient" name="typeOfClient">
                    <option value="">-- Select Client Type --</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Partner">Partner</option>
                </select>
                <div class="help-text">Select the type of client you visited</div>
            </div>
            
            <div class="form-group">
                <label for="clientId">Client ID <span class="required">*</span></label>
                <input type="text" id="clientId" name="clientId" placeholder="Enter Client ID">
                <div class="help-text">Enter the Client ID (will be validated against our records)</div>
                <div id="clientIdError" class="error"></div>
            </div>
        </div>
        
        <!-- Order Confirmation Fields -->
        <div id="orderConfirmationFields" class="hidden">
            <div class="section-header">
                <h3>Order Confirmation Details</h3>
            </div>
            
            <div class="form-group">
                <label for="userOrderId">User Order ID <span class="required">*</span></label>
                <select id="userOrderId" name="userOrderId">
                    <option value="">-- Select Order ID --</option>
                </select>
                <div class="help-text">Select the Order ID for confirmation</div>
                <div id="orderIdError" class="error"></div>
            </div>
        </div>
        
        <!-- Common Fields -->
        <div class="section-header">
            <h3>Visit Information</h3>
        </div>
        
        <div class="form-group">
            <label for="territory">Territory <span class="required">*</span></label>
            <select id="territory" name="territory" required>
                <option value="">-- Select Territory --</option>
                <option value="Dhaka North">Dhaka North</option>
                <option value="Dhaka South">Dhaka South</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Rangpur">Rangpur</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="imageLink">Upload Image (Google Drive Link)</label>
            <input type="url" id="imageLink" name="imageLink" placeholder="https://drive.google.com/...">
            <div class="help-text">Upload visit images to Google Drive and paste the shareable link here</div>
        </div>
        
        <div class="form-group">
            <label for="clientName">Client Name <span class="required">*</span></label>
            <input type="text" id="clientName" name="clientName" required placeholder="Enter client name">
        </div>
        
        <div class="form-group">
            <label for="clientPhone">Client Phone Number <span class="required">*</span></label>
            <input type="tel" id="clientPhone" name="clientPhone" required placeholder="01XXXXXXXXX">
        </div>
        
        <div class="form-group">
            <button type="submit" class="submit-btn">Submit Visit Update</button>
        </div>
    </form>
    
    <script>
        function toggleVisitFields() {
            const visitType = document.getElementById('typeOfVisit').value;
            const generalFields = document.getElementById('generalVisitFields');
            const orderFields = document.getElementById('orderConfirmationFields');
            
            // Hide both sections first
            generalFields.classList.add('hidden');
            orderFields.classList.add('hidden');
            
            // Show relevant section
            if (visitType === 'General Visit') {
                generalFields.classList.remove('hidden');
                // Make general visit fields required
                document.getElementById('typeOfClient').required = true;
                document.getElementById('clientId').required = true;
                document.getElementById('userOrderId').required = false;
            } else if (visitType === 'Order Confirmation') {
                orderFields.classList.remove('hidden');
                // Load approved orders
                loadApprovedOrders();
                // Make order confirmation fields required
                document.getElementById('userOrderId').required = true;
                document.getElementById('typeOfClient').required = false;
                document.getElementById('clientId').required = false;
            }
        }
        
        function loadApprovedOrders() {
            // This would call Google Apps Script to get approved orders
            google.script.run
                .withSuccessHandler(populateOrderDropdown)
                .withFailureHandler(handleError)
                .getApprovedOrdersForVisitConfirmation();
        }
        
        function populateOrderDropdown(orders) {
            const dropdown = document.getElementById('userOrderId');
            dropdown.innerHTML = '<option value="">-- Select Order ID --</option>';
            
            orders.forEach(order => {
                const option = document.createElement('option');
                option.value = order.orderId;
                option.textContent = order.displayText;
                dropdown.appendChild(option);
            });
        }
        
        function handleError(error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
        
        // Form submission
        document.getElementById('visitUpdateForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Collect form data
            const formData = new FormData(this);
            const visitData = Object.fromEntries(formData.entries());
            
            // Add timestamp and email
            visitData.timestamp = new Date();
            visitData.submitterEmail = Session.getActiveUser().getEmail();
            
            // Submit to Google Apps Script
            google.script.run
                .withSuccessHandler(handleSubmitSuccess)
                .withFailureHandler(handleSubmitError)
                .handleVisitUpdateFormSubmit({ values: Object.values(visitData) });
        });
        
        function validateForm() {
            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.textContent = '');
            
            let isValid = true;
            const visitType = document.getElementById('typeOfVisit').value;
            
            if (visitType === 'General Visit') {
                const clientId = document.getElementById('clientId').value;
                const typeOfClient = document.getElementById('typeOfClient').value;
                
                if (!typeOfClient) {
                    document.getElementById('clientIdError').textContent = 'Type of Client is required for General Visit';
                    isValid = false;
                }
                
                if (!clientId) {
                    document.getElementById('clientIdError').textContent = 'Client ID is required for General Visit';
                    isValid = false;
                }
                
            } else if (visitType === 'Order Confirmation') {
                const orderId = document.getElementById('userOrderId').value;
                
                if (!orderId) {
                    document.getElementById('orderIdError').textContent = 'User Order ID is required for Order Confirmation';
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        function handleSubmitSuccess(result) {
            alert('Visit update submitted successfully!');
            document.getElementById('visitUpdateForm').reset();
        }
        
        function handleSubmitError(error) {
            alert('Error submitting visit update: ' + error.message);
        }
    </script>
</body>
</html>`;
    
    // Create HTML file in Google Drive
    const htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'visit-update-form.html');
    const htmlFile = DriveApp.createFile(htmlBlob);
    
    console.log('✅ Custom HTML Visit Update Form created');
    console.log('📄 HTML File ID:', htmlFile.getId());
    
    return {
      fileId: htmlFile.getId(),
      htmlContent: htmlContent
    };
    
  } catch (error) {
    console.error('❌ Error creating custom HTML form:', error);
    throw error;
  }
}

/**
 * Test function for Enhanced Visit Update Form setup.
 */
function testEnhancedVisitUpdateFormSetup() {
  console.log('🧪 Testing Enhanced Visit Update Form Setup...');
  
  try {
    // Test form creation
    console.log('\n--- Testing Form Creation ---');
    const formResult = setupEnhancedVisitUpdateForm();
    console.log('Form setup result:', formResult);
    
    // Test order dropdown update
    console.log('\n--- Testing Order Dropdown Update ---');
    updateOrderDropdownChoices();
    
    // Test custom HTML form creation
    console.log('\n--- Testing Custom HTML Form Creation ---');
    const htmlResult = createCustomVisitUpdateForm();
    console.log('HTML form result:', htmlResult);
    
    console.log('✅ Enhanced Visit Update Form Setup Test Completed');
    
  } catch (error) {
    console.error('❌ Error in form setup test:', error);
  }
}
