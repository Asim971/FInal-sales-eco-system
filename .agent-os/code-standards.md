# Code Standards for Anwar Sales Ecosystem

## Overview

These standards ensure consistent, secure, and efficient Google Apps Script development for the Anwar Sales Ecosystem CRM platform. All code must adhere to these guidelines to maintain system reliability and facilitate team collaboration.

## Google Apps Script Development Standards

### Language-Specific Features

- **Variable Declarations**: Use `const` for immutable values, `let` for mutable variables, avoid `var`
- **Functions**: Use function declarations for main functions, arrow functions for callbacks and utilities
- **Data Handling**: Use destructuring for cleaner object manipulation
- **String Handling**: Use template literals for dynamic strings
- **Async Operations**: Use proper error handling with try-catch blocks

```javascript
// Good: Modern JavaScript patterns for Google Apps Script
const processCustomerRegistration = (formData) => {
  try {
    const { customerName, phoneNumber, territory, ...additionalData } = formData;
    const validatedData = validateCustomerData({ customerName, phoneNumber, territory });
    const customerId = saveCustomerToSheet(validatedData);
    sendWelcomeNotification(phoneNumber, customerName);
    return { success: true, customerId };
  } catch (error) {
    Logger.log(`Customer registration failed: ${error.message}`);
    sendErrorNotification(error, { customerName, phoneNumber });
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Good: Service-oriented architecture
const CustomerService = {
  create: function(customerData) {
    return this.validateAndSave(customerData);
  },
  
  validateAndSave: function(data) {
    this.validate(data);
    return this.save(data);
  },
  
  validate: function(data) {
    if (!data.customerName || !data.phoneNumber) {
      throw new Error('Missing required customer information');
    }
  }
};
```

### Error Handling Standards

#### Custom Error Classes

```javascript
// Custom error handling for CRM operations
class CRMError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = 'CRMError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends CRMError {
  constructor(field, value, message) {
    super('VALIDATION_ERROR', message, { field, value });
    this.name = 'ValidationError';
  }
}

class NotificationError extends CRMError {
  constructor(recipient, message, originalError) {
    super('NOTIFICATION_ERROR', message, { recipient, originalError: originalError.message });
    this.name = 'NotificationError';
  }
}
```

#### Error Handling Patterns

```javascript
// Comprehensive error handling for business operations
function processOrder(orderData) {
  try {
    // Validate input
    if (!orderData.siteId || !orderData.orderType) {
      throw new ValidationError('siteId/orderType', orderData, 'Missing required order information');
    }
    
    // Business logic
    const site = validateSiteExists(orderData.siteId);
    const order = createOrder(orderData, site);
    const assignment = assignEngineer(order);
    
    // Notifications
    sendOrderConfirmation(order);
    notifyAssignedEngineer(assignment);
    
    return { success: true, orderId: order.id };
    
  } catch (error) {
    if (error instanceof ValidationError) {
      Logger.log(`Validation error: ${error.message}`, error.context);
      return { success: false, error: 'Invalid order data' };
    } else if (error instanceof NotificationError) {
      Logger.log(`Notification failed: ${error.message}`, error.context);
      // Order created but notification failed - log for follow-up
      return { success: true, warning: 'Order created but notification failed' };
    } else {
      Logger.log(`Unexpected error: ${error.message}`);
      throw error; // Re-throw unexpected errors
    }
  }
}
```

## Data Handling Standards

### Google Sheets Operations

```javascript
// Efficient sheet operations with error handling
const SheetService = {
  // Batch operations for better performance
  batchUpdate: function(sheetId, updates) {
    try {
      const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
      const range = sheet.getRange(2, 1, updates.length, updates[0].length);
      range.setValues(updates);
      return { success: true, rowsUpdated: updates.length };
    } catch (error) {
      throw new CRMError('SHEET_UPDATE_ERROR', `Failed to update sheet: ${error.message}`, { sheetId, updateCount: updates.length });
    }
  },
  
  // Safe data retrieval with validation
  getRecordById: function(sheetId, recordId, keyColumn = 'ID') {
    try {
      const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
      const data = sheet.getDataRange().getValues();
      
      if (data.length === 0) {
        return null;
      }
      
      const headers = data[0];
      const keyIndex = headers.indexOf(keyColumn);
      
      if (keyIndex === -1) {
        throw new Error(`Key column '${keyColumn}' not found`);
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][keyIndex] === recordId) {
          return this.createRecordObject(headers, data[i]);
        }
      }
      
      return null;
    } catch (error) {
      throw new CRMError('SHEET_READ_ERROR', `Failed to read record: ${error.message}`, { sheetId, recordId, keyColumn });
    }
  },
  
  createRecordObject: function(headers, values) {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    return record;
  }
};
```

### Input Validation

```javascript
// Comprehensive input validation
const ValidationService = {
  validateCustomerData: function(data) {
    const errors = [];
    
    // Required fields
    if (!data.customerName || data.customerName.trim().length === 0) {
      errors.push('Customer name is required');
    }
    
    // Phone number validation
    if (!data.phoneNumber) {
      errors.push('Phone number is required');
    } else if (!/^\+?[1-9]\d{1,14}$/.test(data.phoneNumber)) {
      errors.push('Invalid phone number format');
    }
    
    // Territory validation
    if (!data.territory) {
      errors.push('Territory is required');
    }
    
    if (errors.length > 0) {
      throw new ValidationError('customer_data', data, errors.join(', '));
    }
    
    return true;
  },
  
  validateOrderData: function(data) {
    const errors = [];
    const validOrderTypes = ['Cement Order', 'Rod Order', 'Brick Order', 'Sand Order', 'Stone Chips Order'];
    
    if (!data.siteId || !/^P\.S-\d{3}$/.test(data.siteId)) {
      errors.push('Valid site ID is required (format: P.S-XXX)');
    }
    
    if (!validOrderTypes.includes(data.orderType)) {
      errors.push('Invalid order type');
    }
    
    if (!data.quantity || data.quantity.trim().length === 0) {
      errors.push('Quantity is required');
    }
    
    if (errors.length > 0) {
      throw new ValidationError('order_data', data, errors.join(', '));
    }
    
    return true;
  }
};
```

## Security Standards

### Data Protection

```javascript
// Secure configuration management
const SecurityService = {
  getSecureProperty: function(key) {
    try {
      const properties = PropertiesService.getScriptProperties();
      const value = properties.getProperty(key);
      if (!value) {
        throw new Error(`Required property '${key}' not found`);
      }
      return value;
    } catch (error) {
      throw new CRMError('SECURITY_ERROR', `Failed to retrieve secure property: ${error.message}`, { key });
    }
  },
  
  sanitizeInput: function(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/['"]/g, '') // Remove quotes
      .trim()
      .substring(0, 1000); // Limit length
  },
  
  validateAccess: function(userEmail, requiredRole, territory = null) {
    const userSheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.USERS).getActiveSheet();
    const userData = this.getUserByEmail(userEmail);
    
    if (!userData) {
      throw new CRMError('ACCESS_DENIED', 'User not found', { userEmail });
    }
    
    if (userData.role !== requiredRole) {
      throw new CRMError('ACCESS_DENIED', 'Insufficient permissions', { userEmail, requiredRole, userRole: userData.role });
    }
    
    if (territory && userData.territory !== territory) {
      throw new CRMError('ACCESS_DENIED', 'Territory access denied', { userEmail, requiredTerritory: territory, userTerritory: userData.territory });
    }
    
    return true;
  }
};
```

## Performance Standards

### Optimization Guidelines

```javascript
// Performance optimization patterns
const PerformanceService = {
  // Use caching for frequently accessed data
  getCachedData: function(key, fetcher, ttl = 3600) {
    const cache = CacheService.getScriptCache();
    let data = cache.get(key);
    
    if (!data) {
      data = fetcher();
      cache.put(key, JSON.stringify(data), ttl);
    } else {
      data = JSON.parse(data);
    }
    
    return data;
  },
  
  // Batch operations for better performance
  batchProcess: function(items, processor, batchSize = 50) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  },
  
  // Rate limiting for external API calls
  rateLimitedCall: function(apiCall, delay = 1000) {
    Utilities.sleep(delay);
    return apiCall();
  }
};
```

## Testing Standards

### Unit Testing

```javascript
// Testing utilities for Google Apps Script
const TestUtils = {
  runAllTests: function() {
    const testFunctions = [
      'testCustomerValidation',
      'testOrderProcessing',
      'testNotificationSending',
      'testTerritoryAssignment'
    ];
    
    testFunctions.forEach(testName => {
      try {
        this[testName]();
        Logger.log(`✅ ${testName} passed`);
      } catch (error) {
        Logger.log(`❌ ${testName} failed: ${error.message}`);
      }
    });
  },
  
  testCustomerValidation: function() {
    const validData = {
      customerName: 'Test Customer',
      phoneNumber: '+1234567890',
      territory: 'Dhaka North'
    };
    
    const invalidData = {
      customerName: '',
      phoneNumber: 'invalid',
      territory: ''
    };
    
    // Should pass validation
    ValidationService.validateCustomerData(validData);
    
    // Should fail validation
    try {
      ValidationService.validateCustomerData(invalidData);
      throw new Error('Validation should have failed');
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  }
};
```

## Documentation Standards

### Code Documentation

```javascript
/**
 * Processes customer registration from form submission
 * @param {Object} formData - Form submission data
 * @param {string} formData.customerName - Customer's full name
 * @param {string} formData.phoneNumber - Customer's phone number (international format)
 * @param {string} formData.territory - Geographic territory
 * @returns {Object} Registration result with success status and customer ID
 * @throws {ValidationError} When required data is missing or invalid
 * @throws {CRMError} When database operation fails
 */
function processCustomerRegistration(formData) {
  // Implementation here
}

/**
 * Territory assignment configuration
 * Maps geographic regions to responsible BDOs
 */
const TERRITORY_CONFIG = {
  'DHAKA_NORTH': {
    bdoEmail: 'bdo.north@company.com',
    coverage: ['Uttara', 'Gulshan', 'Banani'],
    backup: 'bdo.central@company.com'
  },
  'DHAKA_SOUTH': {
    bdoEmail: 'bdo.south@company.com',
    coverage: ['Dhanmondi', 'Old Dhaka', 'Wari'],
    backup: 'bdo.central@company.com'
  }
};
```

These standards ensure maintainable, secure, and efficient code development for the Anwar Sales Ecosystem platform.
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}
```

### 🔒 ADAPT: Security Standards
**Modify based on your project's security requirements:**

- **Configuration Management**: Use secure configuration management appropriate for your platform
- **Input Validation**: Implement comprehensive input sanitization for your data types
- **Access Controls**: Enforce role-based access controls based on your user model
- **Audit Logging**: Maintain audit logs for all critical operations
- **Data Protection**: Ensure compliance with relevant regulations (GDPR, HIPAA, etc.)

### 📚 Documentation Standards
**Adjust documentation tools and formats for your stack:**

- **Code Documentation**: Use appropriate documentation tools for your language
- **Inline Comments**: Explain complex business logic and algorithms
- **README Files**: Maintain current documentation for each module
- **API Documentation**: Document all public interfaces using your preferred tools

### 🧪 Testing Standards
**Customize testing approach for your technology and project needs:**

- **Unit Testing**: Define target coverage appropriate for your project (e.g., 80%+)
- **Integration Testing**: Test all external integrations and dependencies
- **Performance Testing**: Validate response times and resource usage for your requirements
- **Security Testing**: Implement security assessments appropriate for your threat model

## 🎯 PROJECT-SPECIFIC CUSTOMIZATION CHECKLIST

### Required Customizations:
- [ ] Replace JavaScript examples with your technology stack
- [ ] Update error handling patterns for your platform
- [ ] Modify security standards for your compliance requirements
- [ ] Adapt testing frameworks to your technology
- [ ] Update documentation tools and formats
- [ ] Include domain-specific coding conventions
- [ ] Add performance requirements specific to your use case
- [ ] Include accessibility requirements if applicable

### Technology Stack Examples to Replace:
1. **Backend Technology**: [Replace with your backend framework]
2. **Frontend Technology**: [Replace with your frontend framework]
3. **Database Technology**: [Replace with your database solution]
4. **Testing Framework**: [Replace with your testing tools]
5. **Documentation Tools**: [Replace with your documentation system]

## 📋 Compliance and Industry Standards
**CUSTOMIZE: Add standards relevant to your industry**

Examples to consider:
- **Financial Services**: PCI DSS, SOX compliance
- **Healthcare**: HIPAA, HITECH compliance
- **Government**: FedRAMP, FISMA compliance
- **General**: ISO 27001, SOC 2 compliance

## 🔄 Continuous Improvement
- Regular review and update of standards
- Team feedback integration
- Industry best practices adoption
- Technology evolution adaptation
