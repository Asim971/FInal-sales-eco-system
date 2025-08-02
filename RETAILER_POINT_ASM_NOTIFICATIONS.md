# Retailer Point ASM Notification System

## Overview
This enhanced system ensures that when BDO or CRO employees submit retailer point requests, the appropriate ASM (Area Sales Manager) receives immediate notifications for review and approval. The system includes robust fallback mechanisms and detailed messaging.

## Notification Flow

### 1. Request Submission (BDO/CRO → ASM)
- **Who can submit**: BDO (Business Development Officer) or CRO (Customer Relations Officer)
- **Who gets notified**: 
  - Submitter receives confirmation message
  - Appropriate ASM receives action-required notification
  - Fallback to all company ASMs if specific ASM not found

### 2. Request Processing (ASM Action)
- **Approval**: ASM approves → Submitter receives approval notification
- **Rejection**: ASM rejects → Submitter receives rejection notification with reason

## Technical Implementation

### Enhanced Functions

#### `sendRetailerPointNotifications(requestData)`
- **Purpose**: Sends notifications when new retailer point request is created
- **Recipients**: 
  - Submitter (BDO/CRO) - confirmation message
  - Territory ASM - action required message
- **Features**:
  - Role validation (warns if submitter is not BDO/CRO)
  - Enhanced error handling and logging
  - Fallback notification system

#### `sendFallbackASMNotification(requestData, originalMessage)`
- **Purpose**: Sends notifications to all ASMs of the same company when specific ASM not found
- **Features**:
  - Company-based ASM filtering
  - Special fallback message with coordination instructions
  - Individual error handling per ASM

#### `findASMByTerritoryAndCompany(territory, company)`
- **Purpose**: Finds the specific ASM for given territory and company
- **Parameters**: Territory name and company (ACL/AIL)
- **Returns**: ASM employee object or null

### Enhanced Messaging

#### Submitter Confirmation Message
```
🏪 *Retailer Point Request Submitted*

*Request ID:* RPR-20250802-001
*Territory:* Dhaka North
*Location:* Gulshan 2, Road 15
*Company:* ACL

*Status:* Pending ASM Review

Your retailer point request has been submitted successfully and is now pending review from the Area Sales Manager.

*Submitted by:* John Doe (BDO)
*Submission Time:* Aug 2, 2025, 6:30:00 PM
```

#### ASM Action Required Message
```
🏪 *New Retailer Point Request - ACTION REQUIRED*

*Request ID:* RPR-20250802-001
*Submitted by:* John Doe (BDO)
*Submitter Email:* bdo@anwar.com
*Territory:* Dhaka North
*Location:* Gulshan 2, Road 15
*Company:* ACL

*Status:* Pending Your Review

📝 *Action Required:*
Please review this retailer point request and approve or reject it through the CRM system.

*Review Guidelines:*
- Verify location feasibility
- Check territory coverage
- Assess market potential
- Ensure compliance with company policies

*Submission Time:* Aug 2, 2025, 6:30:00 PM
```

#### Approval Notification
```
✅ *Retailer Point Request Approved*

*Request ID:* RPR-20250802-001
*Territory:* Dhaka North
*Location:* Gulshan 2, Road 15
*Company:* ACL

Your retailer point request has been approved by the ASM.

*Approval Details:*
- Status: Approved
- Submitted by: John Doe (BDO)
- Approval Date: Aug 2, 2025, 7:00:00 PM

📋 *Next Steps:*
Proceed with setting up the retailer point according to company guidelines.
```

#### Rejection Notification
```
❌ *Retailer Point Request Rejected*

*Request ID:* RPR-20250802-001
*Territory:* Dhaka North
*Location:* Gulshan 2, Road 15
*Company:* ACL
*Rejection Reason:* Location not suitable for retailer point setup

*Rejection Details:*
- Status: Rejected by ASM
- Submitted by: John Doe (BDO)
- Rejection Date: Aug 2, 2025, 7:00:00 PM

📋 *Next Steps:*
Please contact your ASM for more information or to resubmit with corrections. Review the rejection reason and address any concerns before resubmission.
```

## Configuration Requirements

### Employee Data Setup
1. **BDO/CRO Employees**:
   - Must have role = "BDO" or "CRO"
   - Must have valid email addresses
   - WhatsApp numbers required for notifications

2. **ASM Employees**:
   - Must have role = "ASM"
   - Must have company field set to "ACL" or "AIL"
   - Must have territory field matching request territories
   - WhatsApp numbers required for notifications

### Form Configuration
The RETAILER_POINT_REQUEST form includes:
- Territory Name - Multiple choice with predefined territories
- Location - Text field for specific location
- Select Company - Multiple choice: ['ACL', 'AIL']

### Spreadsheet Schema
```javascript
RETAILER_POINT_REQUESTS: [
  'Timestamp', 'Request ID', 'Email Address', 'Territory Name', 
  'Location', 'Select Company', 'Status', 'ASM Notes', 
  'Approval Date', 'Notes'
]
```

## Error Handling & Fallbacks

### Fallback Scenarios
1. **ASM Not Found**: Sends notification to all ASMs of the same company
2. **No WhatsApp Number**: Logs error but continues processing
3. **Invalid Submitter Role**: Warns but allows processing
4. **Company Mismatch**: Filters ASMs by company for fallback

### Logging Features
- Detailed console logging for debugging
- Error tracking for failed notifications
- Success confirmation for sent messages
- ASM lookup and fallback tracking

## Testing

### Test File: `test-retailer-point-asm.js`
Contains comprehensive test cases:
1. BDO retailer point request (ASM notification)
2. CRO retailer point request (ASM notification)
3. Unknown territory (fallback ASM notification)
4. Approval notification enhancement
5. Rejection notification enhancement
6. Request ID generation validation
7. Complete workflow simulation

### Running Tests
```javascript
// In Apps Script Editor
runRetailerPointTests();

// Individual test functions
testRetailerPointASMNotifications();
testRetailerPointApprovalRejectionNotifications();
testFallbackASMNotification();
simulateRetailerPointWorkflow();
```

## Integration Points

### Form Submission Handler
- `handleRetailerPointFormSubmit()` automatically triggers notifications
- Uses existing form processing infrastructure
- Maintains compatibility with existing workflows

### Manual Status Updates
- ASM can update status directly in spreadsheet
- `handleRetailerPointRequestsEdit()` triggers appropriate notifications
- Supports both approval and rejection workflows

## Performance Features

### Efficient ASM Lookup
- Caches employee data lookups
- Territory and company-based filtering
- Fallback mechanism prevents notification failures

### Batch Processing Support
- Individual error handling per notification
- Continues processing even if individual notifications fail
- Comprehensive logging for audit trails

## Future Enhancements

1. **Territory-based ASM Assignment**: Auto-assign ASMs based on geographic territories
2. **Escalation Timers**: Auto-escalate if ASM doesn't respond within timeframe
3. **Mobile App Integration**: Direct approval/rejection from mobile devices
4. **Analytics Dashboard**: Track approval rates and response times by ASM
5. **Multi-level Approval**: Route complex requests through multiple approval levels
6. **Template Management**: Customizable message templates for different scenarios
