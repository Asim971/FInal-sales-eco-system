/**
 * @fileoverview This file contains the order-related functionality.
 */

/**
 * Handles the onFormSubmit event for the Order Creation form.
 * @param {Object} e The event object.
 */
function handleOrderFormSubmit(e) {
  try {
    console.log('📦 Processing User Order Submission...');
    
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
    
    // Map form responses
    const orderData = {
      timestamp: timestamp,
      orderId: generateOrderId(),
      potentialSiteId: response[2] || '', // Potential Site ID (P.S-XXX)
      orderType: response[3] || '',
      submitterEmail: submitterEmail,
      startBuilding: response[4] || '',
      endBuilding: response[5] || '',
      projectAddress: response[6] || '',
      estimatedQuantity: response[7] || '',
      deliveryTimeline: response[8] || '',
      customTimeline: response[9] || '',
      specialInstructions: response[10] || '',
      engineerRequired: response[11] || 'No',
      partnerRequired: response[12] || 'No',
      deliveryNoteLink: response[13] || '',
      siteImagesLink: response[14] || '',
      additionalDocsLink: response[15] || '',
      status: 'Submitted',
      territory: '',
      assignedEngineerId: '',
      assignedPartnerId: '',
      processingNotes: ''
    };
    
    // Validate required fields
    if (!orderData.potentialSiteId || !orderData.orderType || !orderData.submitterEmail) {
      console.error('❌ Missing required fields in order submission');
      return;
    }
    
    // Look up the potential site to get territory and validation
    const potentialSiteInfo = lookupPotentialSiteInfo(orderData.potentialSiteId);
    if (!potentialSiteInfo) {
      console.error(`❌ Potential site not found: ${orderData.potentialSiteId}`);
      return;
    }
    
    if (potentialSiteInfo.status !== 'Approved') {
      console.error(`❌ Potential site ${orderData.potentialSiteId} is not approved. Current status: ${potentialSiteInfo.status}`);
      return;
    }
    
    // Set territory from potential site info
    orderData.territory = potentialSiteInfo.territory || '';
    
    // Generate sequential Order ID
    const orderId = generateOrderId();
    orderData.orderId = orderId;
    
    // Add order to CRM sheet
    const ordersSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ORDERS);
    const rowData = [
      orderData.timestamp,
      orderData.orderId,
      orderData.potentialSiteId,
      orderData.orderType,
      orderData.submitterEmail,
      orderData.startBuilding,
      orderData.endBuilding,
      orderData.projectAddress,
      orderData.estimatedQuantity,
      orderData.deliveryTimeline,
      orderData.customTimeline,
      orderData.specialInstructions,
      orderData.engineerRequired,
      orderData.partnerRequired,
      orderData.deliveryNoteLink,
      orderData.siteImagesLink,
      orderData.additionalDocsLink,
      orderData.status,
      orderData.territory,
      orderData.assignedEngineerId,
      orderData.assignedPartnerId,
      orderData.processingNotes
    ];
    
    ordersSheet.appendRow(rowData);
    
    // Send territory-wise notifications
    sendOrderNotifications(orderData, potentialSiteInfo);
    
    console.log(`✅ Order submitted successfully: ${orderData.orderId} for site ${orderData.potentialSiteId}`);
    
  } catch (error) {
    console.error('❌ Error in handleOrderFormSubmit:', error);
    Logger.log(`Error in handleOrderFormSubmit: ${error.toString()}`);
  }
}

/**
 * Generates a sequential Order ID in the format ORD-001, ORD-002, etc.
 * @returns {string} The generated Order ID.
 */
function generateOrderId() {
  try {
    const ordersSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ORDERS);
    const data = ordersSheet.getDataRange().getValues();
    
    let maxNumber = 0;
    
    // Find the highest existing order number
    for (let i = 1; i < data.length; i++) { // Skip header row
      const orderId = data[i][1]; // Order ID is in column B (index 1)
      if (orderId && typeof orderId === 'string' && orderId.startsWith('ORD-')) {
        const numberPart = parseInt(orderId.substring(4));
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    }
    
    // Generate next number
    const nextNumber = maxNumber + 1;
    const orderId = `ORD-${nextNumber.toString().padStart(3, '0')}`;
    
    console.log(`Generated Order ID: ${orderId}`);
    return orderId;
    
  } catch (error) {
    console.error('Error generating Order ID:', error);
    // Fallback to UUID-based ID if sequential generation fails
    return `ORD-${Utilities.getUuid().substring(0, 8).toUpperCase()}`;
  }
}

/**
 * Looks up potential site information including territory.
 * @param {string} potentialSiteId The potential site ID to look up.
 * @returns {Object|null} Site information or null if not found.
 */
function lookupPotentialSiteInfo(potentialSiteId) {
  try {
    const potentialSiteSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.POTENTIAL_SITE_APPROVALS);
    const data = potentialSiteSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === potentialSiteId) { // Potential Site ID is in column I (index 8)
        return {
          siteName: data[i][2],
          address: data[i][3],
          submitterEmail: data[i][1],
          status: data[i][9],
          ihbId: data[i][6],
          ihbName: data[i][7],
          engineerId: data[i][10],
          engineerName: data[i][11],
          partnerId: data[i][12],
          partnerName: data[i][13],
          territory: null // Will be determined from submitter's employee record
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error looking up potential site:', error);
    return null;
  }
}

/**
 * Sends order notifications to relevant parties based on territory.
 * @param {Object} orderData The order data.
 * @param {Object} potentialSiteInfo The potential site information.
 */
function sendOrderNotifications(orderData, potentialSiteInfo) {
  try {
    console.log('📬 Sending order notifications...');
    
    // Look up submitter employee info to get territory
    const submitterEmployee = findEmployeeByEmail(orderData.submitterEmail);
    let territory = null;
    
    if (submitterEmployee && submitterEmployee.territory) {
      territory = submitterEmployee.territory;
    }
    
    // If no territory from submitter, try to get from site submitter
    if (!territory && potentialSiteInfo.submitterEmail) {
      const siteSubmitterEmployee = findEmployeeByEmail(potentialSiteInfo.submitterEmail);
      if (siteSubmitterEmployee && siteSubmitterEmployee.territory) {
        territory = siteSubmitterEmployee.territory;
      }
    }
    
    console.log('Order territory determined:', territory || 'Not found');
    
    // Collect notification recipients
    let notificationRecipients = [];
    
    // Add submitter confirmation
    if (submitterEmployee && submitterEmployee.whatsappNumber) {
      notificationRecipients.push({
        name: submitterEmployee.name,
        role: submitterEmployee.role,
        whatsappNumber: submitterEmployee.whatsappNumber,
        type: 'submitter'
      });
    }
    
    // Add territory-based team members
    if (territory) {
      const territoryTeamMembers = findEmployeesByTerritory(territory);
      console.log(`Found ${territoryTeamMembers.length} team members in territory: ${territory}`);
      
      territoryTeamMembers.forEach(member => {
        if (member.whatsappNumber && member.email !== orderData.submitterEmail) {
          notificationRecipients.push({
            name: member.name,
            role: member.role,
            whatsappNumber: member.whatsappNumber,
            type: 'territory_team'
          });
        }
      });
    }
    
    // Add admin recipients as fallback
    const adminRecipients = findEmployeesByRole(['ASM', 'CRO']);
    console.log(`Found ${adminRecipients.length} admin recipients`);
    
    adminRecipients.forEach(admin => {
      if (admin.whatsappNumber) {
        notificationRecipients.push({
          name: admin.name,
          role: admin.role,
          whatsappNumber: admin.whatsappNumber,
          type: 'admin'
        });
      }
    });
    
    // Create notification message
    const message = `🏗️ New Order Submission

Order ID: ${orderData.orderId}
Order Type: ${orderData.orderType}
Potential Site: ${orderData.potentialSiteId}
Site Name: ${potentialSiteInfo.siteName}

📍 Project Details:
Address: ${orderData.projectAddress}
Building: ${orderData.startBuilding} to ${orderData.endBuilding}
Quantity: ${orderData.estimatedQuantity}
Delivery: ${orderData.deliveryTimeline}${orderData.customTimeline ? `\nCustom Timeline: ${orderData.customTimeline}` : ''}

👤 Submitter: ${submitterEmployee ? submitterEmployee.name : orderData.submitterEmail}
🌍 Territory: ${territory || 'Not assigned'}

🔧 Requirements:
Engineer: ${orderData.engineerRequired}
Partner/Contractor: ${orderData.partnerRequired}

${orderData.specialInstructions ? `📋 Special Instructions: ${orderData.specialInstructions}` : ''}

⏰ Submitted: ${new Date().toLocaleString()}`;

    console.log(`Sending notifications to ${notificationRecipients.length} recipients`);
    
    // Send notifications
    notificationRecipients.forEach(recipient => {
      try {
        let customMessage = message;
        
        // Customize message based on recipient type
        if (recipient.type === 'submitter') {
          customMessage = `✅ Order Confirmation\n\n${message}\n\nYour order has been submitted successfully and will be processed by our team.`;
        } else if (recipient.type === 'territory_team') {
          customMessage = `🔔 New Order in Your Territory\n\n${message}\n\nPlease review and coordinate as needed.`;
        } else if (recipient.type === 'admin') {
          customMessage = `📋 Order Management Alert\n\n${message}\n\nNew order requires processing and assignment.`;
        }
        
        sendWhatsAppMessage(recipient.whatsappNumber, customMessage);
        console.log(`Notification sent to ${recipient.name} (${recipient.role}) - ${recipient.type}: ${recipient.whatsappNumber}`);
      } catch (error) {
        console.error(`Failed to send notification to ${recipient.name}:`, error);
      }
    });

    // Check for dispute notifications based on engineer/partner requirements
    sendDisputeNotifications(orderData, potentialSiteInfo, submitterEmployee);
    
    // Send fallback notifications to specific territories if no team members found
    if (!territory || notificationRecipients.filter(r => r.type === 'territory_team').length === 0) {
      console.log('No territory team found, sending fallback notifications');
      
      // Find management/admin for fallback
      const managementFallback = findEmployeesByRole(['Admin', 'Management']);
      managementFallback.forEach(manager => {
        if (manager.whatsappNumber) {
          try {
            const fallbackMessage = `⚠️ Order Processing Alert\n\n${message}\n\nNo territory team found for processing. Manual assignment required.`;
            sendWhatsAppMessage(manager.whatsappNumber, fallbackMessage);
            console.log(`Fallback notification sent to ${manager.name} (${manager.role}): ${manager.whatsappNumber}`);
          } catch (error) {
            console.error(`Failed to send fallback notification to ${manager.name}:`, error);
          }
        }
      });
    }
    
    console.log(`✅ Order notifications sent successfully. Total recipients: ${notificationRecipients.length}`);
    
  } catch (error) {
    console.error('❌ Error sending order notifications:', error);
    Logger.log(`Error in sendOrderNotifications: ${error.toString()}`);
  }
}

/**
 * Sends dispute notifications when engineer or partner requirements are set to "No"
 * @param {Object} orderData The order data
 * @param {Object} potentialSiteInfo The potential site information
 * @param {Object} submitterEmployee The submitter employee information
 */
function sendDisputeNotifications(orderData, potentialSiteInfo, submitterEmployee) {
  try {
    console.log('🚨 Checking for dispute notifications...');
    
    const disputeNotifications = [];
    
    // Check if Engineer is required = "No" - notify BDO
    if (orderData.engineerRequired === 'No') {
      const bdoEmployees = findEmployeesByRole(['BDO']);
      console.log(`Engineer requirement set to 'No' - Found ${bdoEmployees.length} BDO employees`);
      
      bdoEmployees.forEach(bdo => {
        if (bdo.whatsappNumber) {
          disputeNotifications.push({
            type: 'engineer_dispute',
            employee: bdo,
            reason: 'No Engineer Required'
          });
        }
      });
    }
    
    // Check if Partner/Contractor is required = "No" - notify CRO
    if (orderData.partnerRequired === 'No') {
      const croEmployees = findEmployeesByRole(['CRO']);
      console.log(`Partner/Contractor requirement set to 'No' - Found ${croEmployees.length} CRO employees`);
      
      croEmployees.forEach(cro => {
        if (cro.whatsappNumber) {
          disputeNotifications.push({
            type: 'partner_dispute',
            employee: cro,
            reason: 'No Partner/Contractor Required'
          });
        }
      });
    }
    
    // Send dispute notifications
    if (disputeNotifications.length > 0) {
      console.log(`Sending ${disputeNotifications.length} dispute notifications`);
      
      disputeNotifications.forEach(notification => {
        try {
          const disputeMessage = createDisputeNotificationMessage(
            orderData, 
            potentialSiteInfo, 
            submitterEmployee, 
            notification.type, 
            notification.reason
          );
          
          sendWhatsAppMessage(notification.employee.whatsappNumber, disputeMessage);
          console.log(`Dispute notification sent to ${notification.employee.name} (${notification.employee.role}) for ${notification.reason}: ${notification.employee.whatsappNumber}`);
          
        } catch (error) {
          console.error(`Failed to send dispute notification to ${notification.employee.name}:`, error);
        }
      });
    } else {
      console.log('No dispute notifications required - both Engineer and Partner requirements are set to "Yes"');
    }
    
  } catch (error) {
    console.error('❌ Error in sendDisputeNotifications:', error);
    Logger.log(`Error in sendDisputeNotifications: ${error.toString()}`);
  }
}

/**
 * Creates a dispute notification message
 * @param {Object} orderData The order data
 * @param {Object} potentialSiteInfo The potential site information  
 * @param {Object} submitterEmployee The submitter employee information
 * @param {string} disputeType The type of dispute (engineer_dispute or partner_dispute)
 * @param {string} reason The reason for the dispute
 * @returns {string} The formatted dispute message
 */
function createDisputeNotificationMessage(orderData, potentialSiteInfo, submitterEmployee, disputeType, reason) {
  const disputeType_emoji = disputeType === 'engineer_dispute' ? '👷‍♂️' : '🤝';
  const role = disputeType === 'engineer_dispute' ? 'Engineer' : 'Partner/Contractor';
  
  return `🚨 DISPUTE NOTIFICATION REQUIRED

${disputeType_emoji} ${role} Requirement Alert

📋 Order Details:
Order ID: ${orderData.orderId}
Order Type: ${orderData.orderType}
Potential Site: ${orderData.potentialSiteId}
Site Name: ${potentialSiteInfo.siteName}

📍 Project Information:
Address: ${orderData.projectAddress}
Building: ${orderData.startBuilding} to ${orderData.endBuilding}
Quantity: ${orderData.estimatedQuantity}

⚠️ Dispute Reason: ${reason}
The customer has indicated that ${role.toLowerCase()} services are NOT required for this order.

🔧 Requirements Status:
Engineer Required: ${orderData.engineerRequired}
Partner/Contractor Required: ${orderData.partnerRequired}

👤 Order Submitted by: ${submitterEmployee ? submitterEmployee.name : orderData.submitterEmail}
📧 Contact: ${orderData.submitterEmail}
⏰ Order Time: ${new Date().toLocaleString()}

📝 ACTION REQUIRED:
Please review this order and submit a dispute if ${role.toLowerCase()} services are actually needed for this type of project.

Use the Dispute Creation form to escalate this issue if necessary.`;
}
