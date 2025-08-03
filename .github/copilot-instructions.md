# Anwar Sales Ecosystem - AI Coding Instructions

## Architecture Overview

This is a Google Apps Script-based CRM system for construction material sales. The system orchestrates form submissions, approvals workflows, WhatsApp notifications, and data management across multiple Google Sheets. It serves construction industry stakeholders: BDO, ASM, CRO, Engineers, Partners, Retailers, and Individual House Builders (IHB).

## Core Patterns & Structure

### Configuration-Driven Architecture

- **`config.js`** is the single source of truth - contains all spreadsheet IDs, form schemas, sheet names, API keys
- **Pattern**: All modules reference `CONFIG.SPREADSHEET_IDS.{MODULE}` and `CONFIG.SHEET_NAMES.{SHEET}`
- **Forms**: Declaratively defined in `CONFIG.FORMS` with validation rules and field types
- **Schemas**: Column definitions in `CONFIG.SCHEMAS` ensure consistent sheet structures

### Event-Driven Form Processing

- **`triggers.js`** routes form submissions via `onFormSubmitTrigger(e)` using spreadsheet ID matching
- **Pattern**: Each module has `handle{Module}FormSubmit(e)` function that processes form data
- **Example**: Order submission → `handleOrderFormSubmit()` → validation → CRM sheet update → WhatsApp notification

### Central CRM Data Model

- **Main CRM Spreadsheet** (`CONFIG.SPREADSHEET_IDS.CRM`) contains approval sheets for all entities
- **ID Generation**: Sequential IDs like `P.S-001` (Potential Sites), `ORD-001` (Orders), `ENG-001` (Engineers)
- **Status Workflow**: `Pending` → `Approved`/`Rejected` with automated notifications at state changes

### WhatsApp Integration

- **`notifications.js`** handles all external communication via Maytapi API
- **Pattern**: Form submission → data processing → `sendWhatsAppMessage(phone, message)`
- **Configuration**: API credentials in `CONFIG.MAYTAPI_CONFIG`

## Critical Development Workflows

### Local Development Setup

```bash
# No local runtime - all code runs in Google Apps Script cloud environment
# Edit files locally, then copy to Apps Script Editor for deployment
```

### Testing Approach

- **Test files**: `test-{module}.js` contain mock form events for each workflow
- **Pattern**: Create mock `e.values` array matching form field order, call handler function
- **Run tests**: Execute individual test functions from Apps Script Editor
- **Example**: `testDemandGenerationRequest()` simulates form submission with realistic data

### Deployment Process

1. **Setup**: Run `setupProject()` to create all spreadsheets and forms in target folder
2. **Configuration**: Update spreadsheet IDs in `config.js` after setup
3. **Triggers**: Execute `createAllFormTriggers()` to link forms to processing functions
4. **Validation**: Use `verifyAndHealSheet()` functions to ensure schema compliance

## Integration Points & Dependencies

### Google Workspace APIs

- **Sheets API**: Core data persistence via `getSheet(spreadsheetId, sheetName)` pattern
- **Forms API**: Dynamic form creation from config with `createFormFromConfig()`
- **Drive API**: File organization and folder-based project setup

### External Services

- **Maytapi WhatsApp API**: Real-time notifications to stakeholders
- **Pattern**: All phone numbers stored in employee/customer sheets, messages triggered by status changes

### Cross-Module Communication

- **Employee Lookup**: `findEmployeeByEmail()` links form submitters to internal records
- **Site Validation**: Orders must reference approved Potential Sites via `lookupPotentialSiteInfo()`
- **Territory Assignment**: Geographic routing based on employee territory assignments

## Key Business Logic Patterns

### Approval Workflows

```javascript
// Standard pattern across all modules
if (approvalStatus === 'Approved') {
  // Move to main operational sheet
  // Send confirmation WhatsApp
  // Update related records
} else if (approvalStatus === 'Rejected') {
  // Send rejection notification with reason
}
```

### ID Generation Strategy

```javascript
// Sequential IDs with module prefixes
function generateOrderId() {
  const sheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ORDERS);
  const data = getSheetData(sheet);
  const maxId = findMaxSequentialId(data, 'ORD');
  return `ORD-${String(maxId + 1).padStart(3, '0')}`;
}
```

### Error Handling Convention

- **Console logging**: `console.log()` for debugging, `Logger.log()` for Apps Script logs
- **Graceful degradation**: Missing data doesn't crash workflows, logs warnings instead
- **Schema healing**: `verifyAndHealSheet()` auto-fixes missing columns

## Construction Industry Domain Context

### Key Entities

- **Potential Sites**: Construction locations requiring material supply
- **IHB (Individual House Builders)**: Small-scale residential builders
- **Territory Management**: Geographic sales regions with assigned ASM/CRO
- **Material Orders**: Cement, Rod, Brick, Sand, Stone Chips, Full Construction Packages

### Workflow Examples

1. **Site Registration**: IHB submits potential site → approval → becomes orderable location
2. **Material Ordering**: Reference approved site → specify materials → engineer/partner assignment
3. **Visit Tracking**: ASM/CRO visit clients → record outcomes → follow-up actions

### Per-Submitter Sheets Feature (In Development)

- **Purpose**: Individual access to personal submission data via WhatsApp queries
- **Architecture**: User-specific sheet creation with master CRM data synchronization
- **WhatsApp Commands**: "need to see data" → numbered sheet list → direct sheet access
- **Implementation Agent**: See `.agent-os/agents/per-submitter-sheets-implementation-agent.md` for detailed methodology

## Common Gotchas

- **Spreadsheet ID Updates**: After setup, manually update `config.js` with actual IDs
- **Email Extraction**: Form submissions may have email in `e.values[1]` or `e.namedValues['Email Address'][0]`
- **Sheet Creation Order**: CRM master sheet must exist before module-specific sheets
- **Trigger Conflicts**: Delete existing triggers before creating new ones to avoid duplicates
- **WhatsApp Phone Format**: Store with country code, validate before sending messages
