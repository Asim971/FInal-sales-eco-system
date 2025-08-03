# AI Guidelines for Anwar Sales Ecosystem

## 🤖 Project Context

**Technology Stack**: Google Apps Script (JavaScript ES6+)  
**Project Type**: CRM Platform for Construction Supply Chain Management  
**Architecture**: Serverless Google Apps Script with Google Sheets Database  
**Integration**: WhatsApp API, Google Workspace APIs  

## Development Standards

### Google Apps Script Development Guidelines

**Code Organization:**
```javascript
// Use modular structure with clear separation of concerns
const CRMService = {
  createCustomer: function(customerData) {
    // Implementation
  },
  updateCustomer: function(customerId, updateData) {
    // Implementation
  }
};

// Use configuration-driven approach
const CONFIG = {
  SPREADSHEET_IDS: {
    CRM: 'spreadsheet_id_here',
    ORDERS: 'spreadsheet_id_here'
  }
};
```

**Error Handling:**
```javascript
// Implement comprehensive error handling
function processOrder(orderData) {
  try {
    validateOrderData(orderData);
    const result = createOrder(orderData);
    sendNotification(result);
    return result;
  } catch (error) {
    Logger.log(`Order processing error: ${error.toString()}`);
    sendErrorNotification(error);
    throw error;
  }
}
```

**Data Validation:**
```javascript
// Validate all input data before processing
function validateCustomerData(data) {
  const required = ['name', 'phone', 'territory'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate phone number format
  if (!/^\+?[1-9]\d{1,14}$/.test(data.phone)) {
    throw new Error('Invalid phone number format');
  }
}
```

### Business Logic Implementation

**Territory-Based Routing:**
```javascript
// Implement territory-based assignment logic
function assignBDOByTerritory(location) {
  const territorySheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.TERRITORIES);
  const territories = territorySheet.getDataRange().getValues();
  
  for (let i = 1; i < territories.length; i++) {
    const [territory, bdoEmail, coverage] = territories[i];
    if (isLocationInTerritory(location, coverage)) {
      return bdoEmail;
    }
  }
  
  // Fallback to default BDO
  return CONFIG.DEFAULT_BDO_EMAIL;
}
```

**Workflow Automation:**
```javascript
// Implement approval workflows
function processApprovalWorkflow(requestData, approverRole) {
  const workflow = {
    'ENGINEER_REGISTRATION': ['BDO'],
    'RETAILER_POINT': ['ASM'],
    'DEMAND_GENERATION': ['BD_INCHARGE']
  };
  
  const approvers = workflow[requestData.type];
  if (approvers.includes(approverRole)) {
    updateRequestStatus(requestData.id, 'APPROVED');
    sendApprovalNotification(requestData);
  }
}
```

### WhatsApp Integration Best Practices

**Message Templates:**
```javascript
// Use structured message templates
const MessageTemplates = {
  ORDER_CONFIRMATION: (orderData) => `
🏗️ *Order Confirmation*

Order ID: ${orderData.id}
Site: ${orderData.siteName}
Type: ${orderData.orderType}
Quantity: ${orderData.quantity}

Engineer: ${orderData.engineerName}
Contact: ${orderData.engineerPhone}

Thank you for your order!
  `,
  
  DISPUTE_ALERT: (disputeData) => `
⚠️ *Order Dispute Alert*

Order ID: ${disputeData.orderId}
Issue: ${disputeData.issueType}
Priority: ${disputeData.priority}

Please resolve within 24 hours.
  `
};
```

**Notification Routing:**
```javascript
// Implement role-based notification routing
function sendNotificationByRole(message, role, territory = null) {
  const recipients = getUsersByRole(role, territory);
  
  recipients.forEach(recipient => {
    sendWhatsAppMessage(recipient.phone, message);
  });
}
```

### Database Design Patterns

**Google Sheets as Database:**
```javascript
// Use consistent sheet structure and naming
const SheetStructure = {
  CRM: {
    headers: ['ID', 'Name', 'Phone', 'Email', 'Territory', 'Status', 'Created'],
    keyColumn: 'ID'
  },
  ORDERS: {
    headers: ['OrderID', 'SiteID', 'CustomerID', 'Type', 'Status', 'Created'],
    keyColumn: 'OrderID'
  }
};

// Implement data access layer
function getRecordById(sheetId, recordId, keyColumn = 'ID') {
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyColumn);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === recordId) {
      return createRecordObject(headers, data[i]);
    }
  }
  return null;
}
```

## 🔒 Security & Compliance Guidelines

### Data Protection
- **PII Handling**: Encrypt sensitive customer data before storage
- **Access Control**: Implement role-based access to spreadsheets
- **Data Retention**: Follow data retention policies for customer information
- **Audit Logging**: Log all data access and modifications

### API Security
```javascript
// Secure API key management
function getSecureConfig() {
  const properties = PropertiesService.getScriptProperties();
  return {
    whatsappApiKey: properties.getProperty('WHATSAPP_API_KEY'),
    encryptionKey: properties.getProperty('ENCRYPTION_KEY')
  };
}

// Input sanitization
function sanitizeInput(input) {
  return input.toString()
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Limit input length
}
```

## 🧪 Testing Guidelines

### Unit Testing for Google Apps Script
```javascript
// Test business logic functions
function testOrderValidation() {
  const validOrder = {
    siteId: 'P.S-001',
    orderType: 'Cement Order',
    quantity: '100 bags'
  };
  
  const invalidOrder = {
    siteId: '',
    orderType: 'Invalid Type',
    quantity: 'unknown'
  };
  
  console.assert(validateOrder(validOrder) === true, 'Valid order should pass');
  console.assert(validateOrder(invalidOrder) === false, 'Invalid order should fail');
}

// Test form submission handlers
function testFormSubmissionHandler() {
  const mockFormData = {
    'Customer Name': 'Test Customer',
    'Phone Number': '+1234567890',
    'Territory': 'Dhaka North'
  };
  
  const result = handleCustomerRegistration(mockFormData);
  console.assert(result.success === true, 'Form submission should succeed');
}
```

### Integration Testing
```javascript
// Test WhatsApp integration
function testWhatsAppNotification() {
  const testMessage = 'Test notification from Anwar Sales Ecosystem';
  const testPhone = '+1234567890'; // Use test number
  
  try {
    const result = sendWhatsAppMessage(testPhone, testMessage);
    Logger.log('WhatsApp test successful:', result);
  } catch (error) {
    Logger.log('WhatsApp test failed:', error);
  }
}
```

## 🚀 Performance Optimization

### Google Apps Script Best Practices
```javascript
// Batch operations for better performance
function updateMultipleRecords(updates) {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM).getActiveSheet();
  const range = sheet.getRange(2, 1, updates.length, updates[0].length);
  range.setValues(updates); // Single batch operation
}

// Use caching for frequently accessed data
function getCachedTerritoryData() {
  const cache = CacheService.getScriptCache();
  let territories = cache.get('territories');
  
  if (!territories) {
    territories = fetchTerritoryData();
    cache.put('territories', JSON.stringify(territories), 3600); // Cache for 1 hour
  }
  
  return JSON.parse(territories);
}
```

## 📋 Code Review Checklist

### Before Submitting Code
- [ ] Business logic aligns with CRM workflow requirements
- [ ] Error handling implemented for all external API calls
- [ ] Input validation covers all user-submitted data
- [ ] Territory-based routing logic is correctly implemented
- [ ] WhatsApp notification templates are user-friendly
- [ ] Google Sheets operations are optimized for performance
- [ ] Security best practices are followed
- [ ] Code is properly documented with JSDoc comments
- [ ] Test functions are included for new features
- [ ] Configuration values are externalized

### Architecture Compliance
- [ ] Modular design with clear separation of concerns
- [ ] Consistent naming conventions for functions and variables
- [ ] Proper use of Google Apps Script services
- [ ] Efficient data access patterns for Google Sheets
- [ ] Scalable approach for territory and role management

This document ensures consistent, high-quality development practices for the Anwar Sales Ecosystem platform.

**Template for Language-Specific Updates:**
```
IF language === "javascript" OR "typescript":
  - Use const/let, arrow functions, async/await
  - Implement ES6+ features
  - Use proper TypeScript types if .ts files found

IF language === "python":
  - Use type hints (Python 3.6+)
  - Follow PEP 8 style guide
  - Use dataclasses or Pydantic for data models
  - Implement async/await for I/O operations

IF language === "java":
  - Use modern Java features (8+)
  - Implement proper exception handling
  - Use Spring Boot patterns if detected
  - Follow clean code principles

IF language === "go":
  - Follow Go conventions
  - Use proper error handling
  - Implement interfaces appropriately
  - Use context for cancellation

[ADD MORE LANGUAGES AS DETECTED]
```

### Example Code Template (AI: Replace with project language)
```[DETECTED_LANGUAGE]
// AI INSTRUCTION: Replace this entire block with language-appropriate example
// Example for [DETECTED_LANGUAGE] - Update based on project analysis

const processData = async ({ id, data, ...options }) => {
  try {
    const validated = await validateInput({ id, data, ...options });
    const result = await ProjectService.process(validated);
    return { success: true, result };
  } catch (error) {
    Logger.error(`Processing failed: ${error.message}`);
    throw new ProjectError('PROCESS_FAILED', error.message, { id });
  }
};
```

### Prompt Engineering Best Practices

#### Context-Aware Prompting
**📋 AI INSTRUCTION: Customize based on project domain analysis**

```
DOMAIN DETECTION RULES:
- IF healthcare files/terms → Add HIPAA compliance requirements
- IF financial files/terms → Add PCI DSS, SOX compliance requirements  
- IF government files/terms → Add FedRAMP, FISMA requirements
- IF educational files/terms → Add FERPA compliance requirements
- IF SaaS application → Add scalability and multi-tenancy considerations
- IF API service → Add rate limiting and security considerations
- IF mobile app → Add offline capabilities and battery optimization
- IF data pipeline → Add data quality and pipeline monitoring
```

**Customization Template:**
- Reference your project's architecture documents: [AI: LIST FOUND DOCS]
- Include stakeholder requirements for [AI: DETECTED DOMAIN] industry
- Emphasize [AI: DETECTED COMPLIANCE] requirements
- Consider scalability for [AI: ESTIMATED USER BASE] users

#### Task-Oriented Development
- Break complex requests into manageable subtasks
- Maintain clear progress tracking using [AI: DETECTED PROJECT MANAGEMENT TOOL]
- Implement validation checkpoints for quality assurance
- Document lessons learned in [AI: DETECTED DOCUMENTATION FORMAT]

## Integration Guidelines

### Project Architecture
**🏗️ AI INSTRUCTION: Update based on detected architecture patterns**

```
ARCHITECTURE DETECTION:
- Scan for docker-compose.yml → Microservices architecture
- Look for monorepo structure → Monolithic architecture  
- Check for serverless configs → Serverless architecture
- Find Kubernetes configs → Container orchestration
- Detect API directories → API-first architecture
```

**Detected Patterns (AI: Fill based on analysis):**
- Architecture style: [AI: DETECTED ARCHITECTURE]
- Communication patterns: [AI: REST/GraphQL/gRPC/etc.]
- Data persistence: [AI: DETECTED DATABASE PATTERN]
- Deployment strategy: [AI: DETECTED DEPLOYMENT]

### Quality Assurance
**✅ AI INSTRUCTION: Adapt based on detected testing and CI/CD tools**

```
TOOL DETECTION:
- .github/workflows → GitHub Actions
- .gitlab-ci.yml → GitLab CI
- jenkins/ → Jenkins
- test/ directory → Testing framework detection
- jest.config.js → Jest testing
- pytest.ini → Pytest
- coverage/ → Coverage tools
```

**Detected Tools (AI: Update based on findings):**
- Testing framework: [AI: DETECTED TESTING TOOL]
- CI/CD platform: [AI: DETECTED CI/CD]
- Code quality tools: [AI: DETECTED LINTING/STATIC ANALYSIS]
- Coverage requirements: [AI: CURRENT COVERAGE THRESHOLD]

## Reference Documents
**📚 AI INSTRUCTION: Update these paths based on actual project structure**

```
DOCUMENT DISCOVERY RULES:
1. Look for README.md files in root and subdirectories
2. Find CONTRIBUTING.md for team processes
3. Locate API documentation (docs/, api/, swagger.yml)
4. Identify architecture docs (architecture/, docs/architecture/)
5. Find security docs (SECURITY.md, security/)
```

**Found Documentation (AI: Update with actual file paths):**
- Project overview: [AI: PATH TO MAIN README]
- Technical specifications: [AI: PATH TO TECH SPECS]
- API documentation: [AI: PATH TO API DOCS]
- Architecture documentation: [AI: PATH TO ARCHITECTURE]
- Security guidelines: [AI: PATH TO SECURITY DOCS]
- Contributing guidelines: [AI: PATH TO CONTRIBUTING]

## 🔍 AI Model Analysis Checklist

### Project Discovery Phase:
- [ ] Scan root directory for project metadata files
- [ ] Identify primary and secondary programming languages
- [ ] Detect framework and library dependencies
- [ ] Analyze project structure and architecture patterns
- [ ] Extract business domain from README and documentation
- [ ] Identify compliance requirements from industry/domain
- [ ] Detect existing development tools and processes

### Customization Phase:
- [ ] Replace all placeholder content with discovered information
- [ ] Update code examples to match project language and style
- [ ] Modify security requirements based on detected domain
- [ ] Adapt tool recommendations to existing project toolchain
- [ ] Ensure consistency with detected architecture patterns
- [ ] Validate cross-references with other AgentOS files

### Validation Phase:
- [ ] Verify all placeholders have been replaced
- [ ] Check language-specific examples are appropriate
- [ ] Confirm compliance requirements match industry
- [ ] Validate tool recommendations align with existing setup
- [ ] Ensure documentation references point to actual files
