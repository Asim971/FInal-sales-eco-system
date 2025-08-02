# Demand Generation Request System

## Overview
The Demand Generation Request system allows Area Sales Managers (ASMs) to submit requests for demand generation activities in specific territories and areas. These requests are reviewed and approved/rejected by BD Incharge personnel.

## Workflow

### 1. Request Submission (ASM)
- ASMs submit demand generation requests through Google Forms
- Required information includes:
  - Territory (dropdown selection)
  - Bazaar (dropdown selection) 
  - Area (dropdown selection)
  - Reason for demand generation
  - Business Unit (AIL/ACL)

### 2. Request Processing
- System generates unique Request ID (format: DGR-YYYYMMDD-XXX)
- Request data is stored in CRM spreadsheet
- Automatic notifications are sent to:
  - Submitter (ASM) - confirmation of submission
  - Appropriate BD Incharge - review notification

### 3. Review Process (BD Incharge)
- BD Incharge receives detailed notification with request information
- Review guidelines include:
  - Assess market potential and viability
  - Evaluate resource requirements
  - Check alignment with business strategy
  - Verify territory and area feasibility
  - Ensure compliance with business unit policies

### 4. Approval/Rejection
- BD Incharge can approve or reject requests
- Status updates trigger automatic notifications to ASM
- Approval includes implementation guidance
- Rejection includes reason and resubmission guidance

## Form Configuration

### Territory Options
- East Karachi
- West Karachi
- North Karachi
- Central Karachi
- Malir
- Korangi
- Hyderabad
- Sukkur

### Bazaar Options
- Saddar
- Clifton
- Defence
- Gulshan
- North Nazimabad
- Federal B Area
- Malir
- Landhi
- Bin Qasim
- Korangi
- Shah Faisal
- Hyderabad City

### Area Options
- Main Road
- Commercial Area
- Residential Area
- Industrial Area
- Market Area
- Hospital Area
- Educational Area

### Business Unit Options
- AIL (Anwar Iqbal Limited)
- ACL (Anwar Chemical Limited)

## Data Schema

### Demand Generation Requests Sheet
| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | Form submission time |
| B | Request ID | Unique identifier (DGR-YYYYMMDD-XXX) |
| C | Submitter Email | ASM email address |
| D | Territory | Selected territory |
| E | Bazaar | Selected bazaar |
| F | Area | Selected area |
| G | Reason | Detailed reason for request |
| H | Business Unit | AIL or ACL |
| I | Status | Pending Review/Approved/Rejected |
| J | BD Incharge Notes | Review comments |
| K | Approval Date | Date of approval/rejection |
| L | Notes | Additional notes |

## Notification System

### ASM Notifications
- **Submission Confirmation**: Sent immediately after form submission
- **Approval Notification**: Includes implementation guidance
- **Rejection Notification**: Includes reason and resubmission guidance

### BD Incharge Notifications
- **New Request Alert**: Detailed request information and review guidelines
- **Fallback Notifications**: Sent to all BD Incharge if specific assignee not found

## BD Incharge Assignment Logic

### Primary Assignment
1. Find BD Incharge with exact territory and business unit match
2. If not found, find BD Incharge with business unit match only
3. If still not found, use BDO as fallback role

### Fallback System
- If no specific BD Incharge found, notify all BD Incharge of the business unit
- Fallback message includes coordination instructions
- Ensures no request goes unnoticed

## Functions Reference

### Core Functions
- `handleDemandGenerationFormSubmit(e)` - Processes form submissions
- `generateDemandGenerationRequestId()` - Creates unique request IDs
- `sendDemandGenerationNotifications(requestData)` - Sends notifications
- `findBDInchargeByTerritoryAndBusinessUnit(territory, businessUnit)` - Finds appropriate reviewers

### Approval/Rejection Functions
- `approveDemandGenerationRequest(requestId, notes)` - Approves requests
- `rejectDemandGenerationRequest(requestId, reason)` - Rejects requests
- `handleDemandGenerationRequestsEdit(e)` - Handles sheet edits

### Notification Functions
- `sendDemandGenerationApprovalNotification(requestData)` - Approval messages
- `sendDemandGenerationRejectionNotification(requestData, reason)` - Rejection messages
- `sendFallbackBDInchargeNotification(requestData, message)` - Fallback notifications

## Testing

### Test Functions Available
- `testDemandGenerationRequest()` - Tests form submission
- `testDemandGenerationRequestIdGeneration()` - Tests ID generation
- `testBDInchargeLookup()` - Tests BD Incharge assignment
- `testDemandGenerationNotifications()` - Tests notification system
- `testDemandGenerationApprovalWorkflow()` - Tests approval/rejection
- `runAllDemandGenerationTests()` - Comprehensive test suite

## Setup Instructions

### 1. Form Setup
1. Create Google Form with required fields
2. Set up dropdown options as specified above
3. Link form responses to CRM spreadsheet
4. Set up form trigger for `handleDemandGenerationFormSubmit`

### 2. Spreadsheet Setup
1. Ensure CRM spreadsheet has DEMAND_GENERATION_REQUESTS sheet
2. Set up headers according to schema above
3. Configure edit trigger for status change handling

### 3. Employee Data Requirements
- BD Incharge records must include:
  - Role: "BD Incharge" or "BDO"
  - Company: "AIL" or "ACL"
  - Territory: Matching form territory options
  - WhatsApp Number: For notifications

### 4. Configuration Updates
- Update `CONFIG.SPREADSHEET_IDS.DEMAND_GENERATION_REQUEST` with form responses spreadsheet ID
- Ensure proper sheet names are configured in CONFIG

## Error Handling

### Common Issues
- **Missing BD Incharge**: Fallback notification system activates
- **Invalid Submitter**: Warning logged, request still processed
- **Missing WhatsApp Numbers**: Error logged, continues with available contacts
- **Sheet Access Issues**: Comprehensive error logging and graceful degradation

### Monitoring
- All operations logged to console and Apps Script logger
- Error tracking for notification failures
- Status tracking for request processing

## Business Impact

### Benefits
- Streamlined demand generation request process
- Automated notification system reduces manual coordination
- Clear approval workflow with proper documentation
- Territory-based routing ensures appropriate review
- Fallback mechanisms prevent missed requests

### Metrics Tracked
- Request volume by territory and business unit
- Approval/rejection rates
- Processing time from submission to decision
- BD Incharge response patterns

## Future Enhancements

### Potential Improvements
- Dashboard for request analytics
- Automated follow-up for pending requests
- Integration with territory performance metrics
- Mobile app integration for faster approvals
- Bulk approval capabilities for similar requests

### Scalability Considerations
- Territory expansion support
- Multi-level approval workflows
- Integration with other business systems
- Enhanced reporting capabilities
