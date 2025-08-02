/**
 * Test file for order dispute notifications functionality
 */

/**
 * Test the dispute notification system for orders
 */
function testOrderDisputeNotifications() {
  console.log('🧪 Testing Order Dispute Notifications...');
  
  try {
    // Test data simulating an order with engineer required = "No"
    const testOrderData = {
      timestamp: new Date(),
      orderId: 'ORD-TEST-001',
      potentialSiteId: 'P.S-001',
      orderType: 'Cement Order',
      submitterEmail: 'test@anwar.com',
      startBuilding: 'Ground Floor',
      endBuilding: '3rd Floor',
      projectAddress: 'Test Address, Dhaka',
      estimatedQuantity: '100 bags cement',
      deliveryTimeline: 'Within 3 days',
      customTimeline: '',
      specialInstructions: 'Test order for dispute notifications',
      engineerRequired: 'No',  // This should trigger BDO notification
      partnerRequired: 'Yes',
      deliveryNoteLink: '',
      siteImagesLink: '',
      additionalDocsLink: '',
      status: 'Submitted',
      territory: 'Dhaka North',
      assignedEngineerId: '',
      assignedPartnerId: '',
      processingNotes: ''
    };
    
    const testPotentialSiteInfo = {
      siteName: 'Test Construction Site',
      address: 'Test Address, Dhaka',
      submitterEmail: 'test@anwar.com',
      status: 'Approved',
      territory: 'Dhaka North'
    };
    
    const testSubmitterEmployee = {
      name: 'Test Employee',
      role: 'SR',
      email: 'test@anwar.com',
      whatsappNumber: '+8801234567890',
      territory: 'Dhaka North'
    };
    
    console.log('Test Case 1: Engineer Required = "No" (should notify BDO)');
    sendDisputeNotifications(testOrderData, testPotentialSiteInfo, testSubmitterEmployee);
    
    // Test case 2: Partner required = "No"
    console.log('\nTest Case 2: Partner Required = "No" (should notify CRO)');
    testOrderData.engineerRequired = 'Yes';
    testOrderData.partnerRequired = 'No';
    sendDisputeNotifications(testOrderData, testPotentialSiteInfo, testSubmitterEmployee);
    
    // Test case 3: Both = "No"
    console.log('\nTest Case 3: Both Engineer and Partner Required = "No" (should notify both BDO and CRO)');
    testOrderData.engineerRequired = 'No';
    testOrderData.partnerRequired = 'No';
    sendDisputeNotifications(testOrderData, testPotentialSiteInfo, testSubmitterEmployee);
    
    // Test case 4: Both = "Yes"
    console.log('\nTest Case 4: Both Engineer and Partner Required = "Yes" (should not send any dispute notifications)');
    testOrderData.engineerRequired = 'Yes';
    testOrderData.partnerRequired = 'Yes';
    sendDisputeNotifications(testOrderData, testPotentialSiteInfo, testSubmitterEmployee);
    
    console.log('✅ Order dispute notification tests completed');
    
  } catch (error) {
    console.error('❌ Error in testOrderDisputeNotifications:', error);
  }
}

/**
 * Test the dispute message creation
 */
function testDisputeMessageCreation() {
  console.log('🧪 Testing Dispute Message Creation...');
  
  const testOrderData = {
    orderId: 'ORD-TEST-001',
    orderType: 'Cement Order',
    potentialSiteId: 'P.S-001',
    projectAddress: 'Test Address, Dhaka',
    startBuilding: 'Ground Floor',
    endBuilding: '3rd Floor',
    estimatedQuantity: '100 bags cement',
    engineerRequired: 'No',
    partnerRequired: 'Yes'
  };
  
  const testPotentialSiteInfo = {
    siteName: 'Test Construction Site'
  };
  
  const testSubmitterEmployee = {
    name: 'Test Employee',
    email: 'test@anwar.com'
  };
  
  // Test engineer dispute message
  console.log('Engineer Dispute Message:');
  const engineerMessage = createDisputeNotificationMessage(
    testOrderData, 
    testPotentialSiteInfo, 
    testSubmitterEmployee, 
    'engineer_dispute', 
    'No Engineer Required'
  );
  console.log(engineerMessage);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test partner dispute message
  console.log('Partner Dispute Message:');
  const partnerMessage = createDisputeNotificationMessage(
    testOrderData, 
    testPotentialSiteInfo, 
    testSubmitterEmployee, 
    'partner_dispute', 
    'No Partner/Contractor Required'
  );
  console.log(partnerMessage);
  
  console.log('✅ Dispute message creation tests completed');
}

/**
 * Run all tests
 */
function runOrderDisputeTests() {
  console.log('🚀 Starting Order Dispute Notification Tests...\n');
  
  testDisputeMessageCreation();
  console.log('\n' + '='.repeat(70) + '\n');
  testOrderDisputeNotifications();
  
  console.log('\n🎉 All Order Dispute Tests Completed!');
}
