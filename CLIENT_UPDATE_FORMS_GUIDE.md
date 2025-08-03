# Client Update Forms Implementation Guide

**Version:** 1.0  
**Date:** August 3, 2025  
**System:** Anwar Sales Ecosystem - Client Update Management

---

## 📋 Overview

The Client Update Forms system provides comprehensive update management for all client types in the Anwar Sales Ecosystem:

- **IHB (Individual House Builder) Updates**
- **Retailer Updates** 
- **Partner/Engineer Updates**

This system integrates with the employee location hierarchy, provides automated approval workflows, and maintains comprehensive audit trails.

---

## 🏗️ IHB Update Forms

### Form Configuration
- **Form ID:** `IHB_UPDATE`
- **Handler Function:** `handleIHBUpdateFormSubmit()`
- **Update Sheet:** `IHB Updates`

### Update Types Supported
1. **Profile Update** - Name, email, contact information changes
2. **Contact Information Update** - Phone numbers, WhatsApp updates
3. **Location Update** - Address, geographic location changes
4. **Status Change** - Status modifications
5. **Document Update** - Supporting document updates

### Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| IHB ID | Text | Yes | Existing IHB ID to update |
| Update Type | Choice | Yes | Type of update being requested |
| New IHB Name | Text | No | Updated name if changing |
| New IHB Email | Text | No | Updated email if changing |
| New Mobile Number | Text | No | Updated mobile number |
| New WhatsApp Number | Text | No | Updated WhatsApp number |
| New Address | Paragraph | No | Updated address |
| New Zone | Dropdown | No | Zone selection |
| New District | Text | No | District name |
| New Area | Text | No | Area name |
| New Territory | Text | No | Territory name |
| New Bazaar | Text | No | Bazaar name |
| New Upazilla | Text | No | Upazilla name |
| New Business Unit | Choice | No | ACL or AIL |
| Reason for Update | Paragraph | Yes | Explanation for update |
| Supporting Documents | Text | No | Google Drive links |

### Workflow
1. **Submission** → Form submitted by user
2. **Validation** → System validates IHB ID exists and is approved
3. **Location Validation** → If location update, validates hierarchy
4. **Storage** → Update request stored in "IHB Updates" sheet
5. **Notification** → ASM+ receive WhatsApp notifications
6. **Approval** → Manager approves/rejects in sheet
7. **Application** → If approved, changes applied to main IHB record
8. **Notification** → Status update sent to requester

---

## 🏪 Retailer Update Forms

### Form Configuration
- **Form ID:** `RETAILER_UPDATE`
- **Handler Function:** `handleRetailerUpdateFormSubmit()`
- **Update Sheet:** `Retailer Updates`

### Update Types Supported
1. **Shop Information Update** - Shop name, proprietor changes
2. **Contact Information Update** - Phone numbers, contact updates
3. **Location Update** - Shop address, geographic location changes
4. **Status Change** - Status modifications
5. **Document Update** - Supporting document updates

### Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Retailer ID | Text | Yes | Existing retailer submission ID |
| Update Type | Choice | Yes | Type of update being requested |
| New Shop Name | Text | No | Updated shop name |
| New Proprietor Name | Text | No | Updated proprietor name |
| New Shop Address | Paragraph | No | Updated shop address |
| New Phone Number | Text | No | Updated phone number |
| New Bkash Number | Text | No | Updated bKash number |
| New Zone | Dropdown | No | Zone selection |
| New District | Text | No | District name |
| New Area | Text | No | Area name |
| New Territory | Text | No | Territory name |
| New Bazaar | Text | No | Bazaar name |
| New Upazilla | Text | No | Upazilla name |
| New Business Unit | Choice | No | ACL or AIL |
| Reason for Update | Paragraph | Yes | Explanation for update |
| Supporting Documents | Text | No | Google Drive links |

### Workflow
1. **Submission** → Form submitted by user
2. **Validation** → System validates retailer ID exists and is approved
3. **Location Validation** → If location update, validates hierarchy
4. **Storage** → Update request stored in "Retailer Updates" sheet
5. **Notification** → SR+ receive WhatsApp notifications
6. **Approval** → Manager approves/rejects in sheet
7. **Application** → If approved, changes applied to main retailer record
8. **Notification** → Status update sent to requester

---

## 🤝 Partner Update Forms

### Form Configuration
- **Form ID:** `PARTNER_UPDATE_ENHANCED`
- **Handler Function:** `handlePartnerUpdateFormSubmit()`
- **Update Sheet:** `Partner Updates`

### Update Types Supported
1. **Profile Update** - Name, email, contact information changes
2. **Contact Information Update** - Phone numbers, contact updates
3. **Location Update** - Geographic location changes
4. **Project Assignment** - Assign partner to new projects
5. **Status Change** - Status modifications
6. **Partner Type Change** - Change between Site Engineer/Partner

### Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Partner ID | Text | Yes | Existing partner ID |
| Update Type | Choice | Yes | Type of update being requested |
| New Partner Name | Text | No | Updated partner name |
| New Partner Email | Text | No | Updated email |
| New Contact Number | Text | No | Updated contact number |
| New WhatsApp Number | Text | No | Updated WhatsApp number |
| New Bkash Number | Text | No | Updated bKash number |
| New Partner Type | Choice | No | Site Engineer or Partner |
| New Zone | Dropdown | No | Zone selection |
| New District | Text | No | District name |
| New Area | Text | No | Area name |
| New Territory | Text | No | Territory name |
| New Bazaar | Text | No | Bazaar name |
| New Upazilla | Text | No | Upazilla name |
| New Business Unit | Choice | No | ACL or AIL |
| Project Assignment | Text | No | Potential Site ID for assignment |
| Reason for Update | Paragraph | Yes | Explanation for update |
| Supporting Documents | Text | No | Google Drive links |

### Workflow
1. **Submission** → Form submitted by user
2. **Validation** → System validates partner ID exists and is approved
3. **Project Validation** → If project assignment, validates project exists and is approved
4. **Location Validation** → If location update, validates hierarchy
5. **Storage** → Update request stored in "Partner Updates" sheet
6. **Notification** → ASM+ receive WhatsApp notifications
7. **Approval** → Manager approves/rejects in sheet
8. **Application** → If approved, changes applied to main partner record
9. **Notification** → Status update sent to requester

---

## 🔧 Technical Implementation

### Core Functions

#### Form Handlers
```javascript
// IHB Update Handler
handleIHBUpdateFormSubmit(e)

// Retailer Update Handler  
handleRetailerUpdateFormSubmit(e)

// Partner Update Handler
handlePartnerUpdateFormSubmit(e)
```

#### Approval Handlers
```javascript
// IHB Approval Handler
handleIHBUpdateApproval(e)

// Retailer Approval Handler
handleRetailerUpdateApproval(e)

// Partner Approval Handler
handlePartnerUpdateApproval(e)
```

#### Notification Functions
```javascript
// Update Request Notifications
sendIHBUpdateNotification(updateData, existingIhb)
sendRetailerUpdateNotification(updateData, existingRetailer)
sendPartnerUpdateNotification(updateData, existingPartner)

// Status Update Notifications
sendIHBUpdateStatusNotification(updateId, status, updateData)
sendRetailerUpdateStatusNotification(updateId, status, updateData)
sendPartnerUpdateStatusNotification(updateId, status, updateData)
```

#### Validation Functions
```javascript
// Location Hierarchy Validation
validateLocationHierarchy(location)

// Project Assignment Validation
validateProjectAssignment(projectId, partnerId, partnerType)

// Stakeholder Lookup
getLocationStakeholders(territory, businessUnit)
```

#### Update Application Functions
```javascript
// Apply approved updates to main records
applyIHBUpdates(ihbId, updateData)
applyRetailerUpdates(retailerId, updateData)
applyPartnerUpdates(partnerId, updateData)
```

### Database Schema

#### IHB Updates Sheet
```
Columns: Timestamp, Update ID, Submitter Email, IHB ID, Update Type,
         Existing Data, New IHB Name, New IHB Email, New Mobile Number,
         New WhatsApp Number, New Address, New Zone, New District,
         New Area, New Territory, New Bazaar, New Upazilla, 
         New Business Unit, Update Reason, Supporting Documents,
         Status, Request Date, Approval Date, Approver Email, Approval Notes
```

#### Retailer Updates Sheet
```
Columns: Timestamp, Update ID, Submitter Email, Retailer ID, Update Type,
         Existing Data, New Shop Name, New Proprietor Name, New Shop Address,
         New Phone Number, New Bkash Number, New Zone, New District,
         New Area, New Territory, New Bazaar, New Upazilla, 
         New Business Unit, Update Reason, Supporting Documents,
         Status, Request Date, Approval Date, Approver Email, Approval Notes
```

#### Partner Updates Sheet
```
Columns: Timestamp, Update ID, Submitter Email, Partner ID, Update Type,
         Existing Data, New Partner Name, New Partner Email, New Contact Number,
         New WhatsApp Number, New Bkash Number, New Partner Type, New Zone,
         New District, New Area, New Territory, New Bazaar, New Upazilla,
         New Business Unit, Project Assignment, Update Reason, Supporting Documents,
         Status, Request Date, Approval Date, Approver Email, Approval Notes
```

---

## 🔗 Integration Features

### Location Hierarchy Integration
- **Validation:** Uses `employee-location-hierarchy.js` for location validation
- **Auto-fill:** Automatically populates parent levels in hierarchy
- **Consistency:** Ensures all location updates follow established patterns

### Employee System Integration
- **Notifications:** Uses employee hierarchy for notification routing
- **Stakeholders:** Automatically identifies relevant approvers by location
- **Role-based Access:** Respects organizational hierarchy for approvals

### Audit Trail
- **Change Tracking:** All updates logged with timestamps and approvers
- **Historical Data:** Original data stored before applying changes
- **Accountability:** Full trail of who requested and approved changes

---

## 📱 Notification System

### Notification Hierarchy

#### IHB Updates
- **Recipients:** ASM, ZSM, BDO, CRO (based on location)
- **Trigger:** New update request submitted
- **Content:** Update ID, IHB details, requester information

#### Retailer Updates  
- **Recipients:** SR, ASM, ZSM, BDO, CRO (based on location)
- **Trigger:** New update request submitted
- **Content:** Update ID, retailer details, requester information

#### Partner Updates
- **Recipients:** ASM, ZSM, BDO, CRO (based on location)
- **Trigger:** New update request submitted
- **Content:** Update ID, partner details, requester information

### Status Notifications
- **Recipients:** Original requester
- **Trigger:** Approval/rejection decision
- **Content:** Update ID, decision, decision date

---

## 🚀 Deployment Instructions

### 1. File Setup
```bash
# Core implementation file
client-update-forms.js

# Testing file
test-client-update-forms.js

# Configuration updates in
config.js
```

### 2. Google Forms Creation
Create Google Forms with the specified field configurations:
- IHB Update Form
- Retailer Update Form  
- Partner Update Enhanced Form

### 3. Trigger Setup
```javascript
// Set up form submission triggers
function setupClientUpdateTriggers() {
  // IHB Update Form Trigger
  ScriptApp.newTrigger('handleIHBUpdateFormSubmit')
    .onFormSubmit()
    .create();
    
  // Retailer Update Form Trigger
  ScriptApp.newTrigger('handleRetailerUpdateFormSubmit')
    .onFormSubmit()
    .create();
    
  // Partner Update Form Trigger
  ScriptApp.newTrigger('handlePartnerUpdateFormSubmit')
    .onFormSubmit()
    .create();
}

// Set up edit triggers for approvals
function setupApprovalTriggers() {
  // IHB Updates Sheet Edit Trigger
  ScriptApp.newTrigger('handleIHBUpdateApproval')
    .onEdit()
    .create();
    
  // Retailer Updates Sheet Edit Trigger
  ScriptApp.newTrigger('handleRetailerUpdateApproval')
    .onEdit()
    .create();
    
  // Partner Updates Sheet Edit Trigger
  ScriptApp.newTrigger('handlePartnerUpdateApproval')
    .onEdit()
    .create();
}
```

### 4. Testing
```javascript
// Run comprehensive test suite
runClientUpdateFormsTest();

// Test individual components
testClientUpdateForms();
demonstrateClientUpdateWorkflow();
```

---

## 📊 Usage Examples

### Example 1: IHB Profile Update
1. User submits form with IHB ID "IHB-001"
2. Updates name from "John Doe" to "John Smith"
3. Updates mobile number to "+8801234567890"
4. System validates IHB exists and is approved
5. Update request stored with ID "IHB-UPD-001"
6. ASM receives WhatsApp notification
7. ASM approves update in sheet
8. Changes applied to main IHB record
9. User receives approval notification

### Example 2: Retailer Location Update
1. User submits form with Retailer ID "RTL-001"
2. Updates shop address and territory
3. New territory: "Dhanmondi-02"
4. System validates location hierarchy
5. Update request stored with ID "RTL-UPD-001"
6. SR and ASM receive notifications
7. ASM approves after verification
8. Location changes applied to retailer record

### Example 3: Partner Project Assignment
1. User submits form with Partner ID "PTN-001"
2. Update type: "Project Assignment"
3. Project: "P.S-001"
4. System validates project exists and is approved
5. Update request stored with ID "PTN-UPD-001"
6. ASM receives notification
7. ASM approves assignment
8. Partner assigned to project in system

---

## 🔍 Troubleshooting

### Common Issues

#### Form Submission Errors
- **Issue:** "IHB ID not found"
- **Solution:** Verify IHB ID exists in IHB Approvals sheet and status is "Approved"

#### Location Validation Errors
- **Issue:** "Invalid location hierarchy"
- **Solution:** Check location mapping in Location Map sheet, ensure hierarchy is valid

#### Project Assignment Errors
- **Issue:** "Project not found"
- **Solution:** Verify Potential Site ID exists and status is "Approved"

#### Notification Issues
- **Issue:** Notifications not being sent
- **Solution:** Check WhatsApp integration, verify employee hierarchy setup

### Debug Functions
```javascript
// Test form submission
testIHBFormSubmission();
testRetailerFormSubmission();
testPartnerFormSubmission();

// Test validation
testIHBValidation();
testRetailerValidation();
testPartnerValidation();

// Test notifications
testIHBNotifications();
testRetailerNotifications();
testPartnerNotifications();
```

---

## 📈 Benefits

### For Administrators
- **Centralized Management:** All client updates in dedicated sheets
- **Approval Control:** Structured approval workflow
- **Audit Trail:** Complete change history
- **Error Prevention:** Validation prevents invalid updates

### For Field Staff
- **Easy Updates:** Simple form-based update process
- **Status Tracking:** Clear visibility of update status
- **Documentation:** Support for document attachments
- **Notifications:** Automatic status updates

### For System Integrity
- **Data Consistency:** Location hierarchy validation
- **Change Control:** Approved changes only
- **Traceability:** Full audit trail
- **Integration:** Seamless with employee hierarchy

---

## 🚀 Future Enhancements

### Planned Features
1. **Bulk Updates:** Support for multiple client updates
2. **Mobile App:** Native mobile interface
3. **Analytics Dashboard:** Update metrics and reporting
4. **Automated Approvals:** Rule-based auto-approvals
5. **Document Management:** Integrated document storage

### Advanced Features
1. **Workflow Customization:** Configurable approval flows
2. **Integration APIs:** External system integration
3. **Real-time Notifications:** Push notifications
4. **Advanced Validation:** Machine learning validation
5. **Geographic Mapping:** Visual location management

---

## 📞 Support

For technical support or questions about the Client Update Forms system:

- **Documentation:** Refer to this guide and inline code comments
- **Testing:** Use the test suite for troubleshooting
- **Logs:** Check console logs for detailed error information
- **Admin Contact:** Use `sendAdminNotification()` for system issues

---

**System Status:** ✅ Production Ready  
**Last Updated:** August 3, 2025  
**Version:** 1.0  

*This implementation provides comprehensive client update management with full integration to the Anwar Sales Ecosystem.*
