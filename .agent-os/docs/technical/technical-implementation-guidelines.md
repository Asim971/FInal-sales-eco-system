# Anwar Sales Ecosystem - Technical Implementation Guidelines

**Version:** 1.0  
**Date:** August 3, 2025  
**Document Owner:** Architecture Design Agent  
**Status:** Active Documentation

---

## 📋 Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [Google Apps Script Development Patterns](#google-apps-script-development-patterns)
3. [Service-Oriented Architecture Implementation](#service-oriented-architecture-implementation)
4. [API Integration Patterns](#api-integration-patterns)
5. [Error Handling and Resilience](#error-handling-and-resilience)
6. [Testing and Quality Assurance](#testing-and-quality-assurance)
7. [Deployment and Operations](#deployment-and-operations)

---

## 🎯 Implementation Overview

The **Anwar Sales Ecosystem** follows **enterprise-grade development patterns** adapted for the Google Apps Script environment, ensuring scalability, maintainability, and robust performance for construction supply chain management operations.

### Development Methodology

#### 1. **Modular Service-Oriented Architecture**

- **Service Layer Separation**: Clear separation between business logic, data access, and presentation layers
- **Dependency Injection**: Loose coupling between services for better testability and maintainability
- **Interface-Based Design**: Consistent interfaces across all service modules
- **Configuration-Driven Behavior**: Externalized configuration for easy environment management

#### 2. **Event-Driven Programming Model**

- **Trigger-Based Architecture**: Responsive system design based on Google Apps Script triggers
- **Asynchronous Processing**: Non-blocking operations for improved user experience
- **Event Sourcing**: Complete audit trail through event-driven state management
- **Reactive Workflows**: Automatic workflow progression based on business events

#### 3. **Territory-Aware Implementation**

- **Geographic Partitioning**: Territory-specific processing logic and data isolation
- **Role-Based Processing**: Stakeholder-specific business logic and access patterns
- **Scalable Assignment Algorithms**: Dynamic resource allocation across territories
- **Cross-Territory Analytics**: Aggregated reporting while maintaining data separation

---

## ⚙️ Google Apps Script Development Patterns

### Core Service Architecture Implementation

```javascript
// Modular service design aligned with enterprise architecture principles
const ServiceArchitecture = {
  
  // Core service interface pattern
  createService: function(serviceName, dependencies) {
    return {
      name: serviceName,
      dependencies: dependencies,
      
      // Service initialization with dependency injection
      initialize: function() {
        this.dependencies.forEach(dep => {
          if (typeof dep.initialize === 'function') {
            dep.initialize();
          }
        });
        
        this.isInitialized = true;
        Logger.log(`Service ${this.name} initialized successfully`);
      },
      
      // Health check for service monitoring
      healthCheck: function() {
        return {
          service: this.name,
          status: this.isInitialized ? 'HEALTHY' : 'UNHEALTHY',
          dependencies: this.dependencies.map(dep => ({
            name: dep.name,
            status: dep.healthCheck ? dep.healthCheck().status : 'UNKNOWN'
          }))
        };
      },
      
      // Service metrics for performance monitoring
      getMetrics: function() {
        return {
          service: this.name,
          uptime: Date.now() - this.startTime,
          requestCount: this.requestCount || 0,
          errorCount: this.errorCount || 0,
          averageResponseTime: this.averageResponseTime || 0
        };
      }
    };
  },
  
  // Service registry for dependency management
  serviceRegistry: new Map(),
  
  // Register service in global registry
  registerService: function(service) {
    this.serviceRegistry.set(service.name, service);
    Logger.log(`Service ${service.name} registered`);
  },
  
  // Retrieve service from registry
  getService: function(serviceName) {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in registry`);
    }
    return service;
  }
};
```

### Google Workspace API Integration Patterns

```javascript
// Optimized Google Workspace API integration with error handling and retry logic
const GoogleWorkspaceIntegration = {
  
  // Sheets API operations with performance optimization
  sheetsAPI: {
    // Batch read operations for improved performance
    batchRead: function(spreadsheetId, ranges) {
      try {
        const response = Sheets.Spreadsheets.Values.batchGet(spreadsheetId, {
          ranges: ranges,
          valueRenderOption: 'UNFORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING'
        });
        
        return response.valueRanges.map((range, index) => ({
          range: ranges[index],
          values: range.values || [],
          metadata: {
            rowCount: range.values ? range.values.length : 0,
            columnCount: range.values && range.values[0] ? range.values[0].length : 0
          }
        }));
      } catch (error) {
        Logger.log(`Batch read error: ${error.message}`);
        throw new Error(`Failed to read ranges: ${error.message}`);
      }
    },
    
    // Batch write operations with conflict resolution
    batchWrite: function(spreadsheetId, updates) {
      try {
        const response = Sheets.Spreadsheets.Values.batchUpdate(spreadsheetId, {
          valueInputOption: 'USER_ENTERED',
          data: updates.map(update => ({
            range: update.range,
            values: update.values,
            majorDimension: 'ROWS'
          }))
        });
        
        return {
          updatedCells: response.totalUpdatedCells,
          updatedColumns: response.totalUpdatedColumns,
          updatedRows: response.totalUpdatedRows,
          responses: response.responses
        };
      } catch (error) {
        Logger.log(`Batch write error: ${error.message}`);
        throw new Error(`Failed to write updates: ${error.message}`);
      }
    }
  },
  
  // Forms API integration for dynamic form management
  formsAPI: {
    // Create dynamic forms based on business requirements
    createDynamicForm: function(formConfig) {
      try {
        const form = FormApp.create(formConfig.title);
        form.setDescription(formConfig.description);
        
        formConfig.questions.forEach(question => {
          switch (question.type) {
            case 'TEXT':
              const textItem = form.addTextItem();
              textItem.setTitle(question.title);
              textItem.setRequired(question.required || false);
              break;
              
            case 'MULTIPLE_CHOICE':
              const mcItem = form.addMultipleChoiceItem();
              mcItem.setTitle(question.title);
              mcItem.setChoiceValues(question.choices);
              mcItem.setRequired(question.required || false);
              break;
              
            case 'DROPDOWN':
              const dropdownItem = form.addListItem();
              dropdownItem.setTitle(question.title);
              dropdownItem.setChoiceValues(question.choices);
              dropdownItem.setRequired(question.required || false);
              break;
          }
        });
        
        return {
          formId: form.getId(),
          editUrl: form.getEditUrl(),
          publishedUrl: form.getPublishedUrl()
        };
      } catch (error) {
        Logger.log(`Form creation error: ${error.message}`);
        throw new Error(`Failed to create form: ${error.message}`);
      }
    },
    
    // Setup form triggers for automated processing
    setupFormTriggers: function(formId, triggerFunction) {
      try {
        const form = FormApp.openById(formId);
        ScriptApp.newTrigger(triggerFunction)
          .create();
        
        Logger.log(`Trigger setup successfully for form: ${formId}`);
        return true;
      } catch (error) {
        Logger.log(`Trigger setup error: ${error.message}`);
        throw new Error(`Failed to setup form trigger: ${error.message}`);
      }
    }
  }
};
```

---

## 🏗️ Service-Oriented Architecture Implementation

### Business Logic Services

```javascript
// Customer Relationship Management Service Implementation
const CRMServiceImplementation = {
  
  // Service dependencies
  dependencies: ['SheetsService', 'ValidationService', 'NotificationService', 'ConfigService'],
  
  // Service initialization
  initialize: function() {
    this.sheetsService = ServiceArchitecture.getService('SheetsService');
    this.validationService = ServiceArchitecture.getService('ValidationService');
    this.notificationService = ServiceArchitecture.getService('NotificationService');
    this.configService = ServiceArchitecture.getService('ConfigService');
    
    this.isInitialized = true;
    Logger.log('CRM Service initialized successfully');
  },
  
  // Customer registration workflow
  processCustomerRegistration: function(formSubmissionData) {
    try {
      // 1. Validate input data
      const validatedData = this.validationService.validateCustomerData(formSubmissionData);
      
      // 2. Determine territory assignment
      const territoryAssignment = this.assignTerritory(validatedData.location);
      
      // 3. Save customer data
      const customerId = this.saveCustomerData(validatedData, territoryAssignment);
      
      // 4. Notify stakeholders
      this.notificationService.notifyCustomerRegistration(customerId, territoryAssignment);
      
      // 5. Return success response
      return {
        success: true,
        customerId: customerId,
        territory: territoryAssignment,
        message: 'Customer registration processed successfully'
      };
      
    } catch (error) {
      Logger.log(`Customer registration error: ${error.message}`);
      
      // Error notification
      this.notificationService.notifyRegistrationError(formSubmissionData, error.message);
      
      throw new Error(`Customer registration failed: ${error.message}`);
    }
  },
  
  // Territory assignment algorithm
  assignTerritory: function(location) {
    const territoryConfig = this.configService.getTerritoryConfiguration();
    
    // Geocoding for precise territory assignment
    try {
      const geocodeResult = Maps.newGeocoder().geocode(location);
      if (geocodeResult.status === 'OK') {
        const coordinates = geocodeResult.results[0].geometry.location;
        
        // Check against territory boundaries
        for (const territory of territoryConfig.territories) {
          if (this.isWithinBounds(coordinates, territory.bounds)) {
            return territory.code;
          }
        }
      }
    } catch (geocodeError) {
      Logger.log(`Geocoding error: ${geocodeError.message}`);
    }
    
    // Fallback to default territory
    return territoryConfig.defaultTerritory;
  },
  
  // Geographic boundary checking
  isWithinBounds: function(coordinates, bounds) {
    return coordinates.lat >= bounds.south &&
           coordinates.lat <= bounds.north &&
           coordinates.lng >= bounds.west &&
           coordinates.lng <= bounds.east;
  },
  
  // Approval workflow processing
  processApprovalWorkflow: function(approvalData) {
    const { submissionId, approvalStatus, approverRole, comments } = approvalData;
    
    try {
      // Update approval status
      this.sheetsService.updateRecord('CRM_MASTER', submissionId, {
        'Approval Status': approvalStatus,
        'Approved By': approverRole,
        'Approval Comments': comments,
        'Approval Date': new Date()
      });
      
      // Trigger next workflow step
      if (approvalStatus === 'APPROVED') {
        this.triggerPostApprovalWorkflow(submissionId);
      } else if (approvalStatus === 'REJECTED') {
        this.triggerRejectionWorkflow(submissionId, comments);
      }
      
      // Notify stakeholders
      this.notificationService.notifyApprovalUpdate(submissionId, approvalStatus, approverRole);
      
      return { success: true, message: 'Approval processed successfully' };
      
    } catch (error) {
      Logger.log(`Approval processing error: ${error.message}`);
      throw new Error(`Approval processing failed: ${error.message}`);
    }
  }
};
```

### Data Access Layer Implementation

```javascript
// Sheets Service with advanced data management capabilities
const SheetsServiceImplementation = {
  
  // Service initialization
  initialize: function() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.cache = CacheService.getScriptCache();
    this.isInitialized = true;
    Logger.log('Sheets Service initialized successfully');
  },
  
  // Generic CRUD operations
  crud: {
    // Create new record with auto-generated ID
    create: function(sheetName, recordData) {
      try {
        const sheet = this.getSheet(sheetName);
        const headers = this.getHeaders(sheetName);
        const rowData = this.mapDataToRow(recordData, headers);
        
        // Add timestamp and ID if not provided
        if (!recordData.id) {
          rowData[headers.indexOf('ID')] = this.generateId();
        }
        if (!recordData.timestamp) {
          rowData[headers.indexOf('Timestamp')] = new Date();
        }
        
        sheet.appendRow(rowData);
        const newRowIndex = sheet.getLastRow();
        
        // Clear cache for this sheet
        this.clearSheetCache(sheetName);
        
        return {
          id: rowData[headers.indexOf('ID')] || newRowIndex,
          row: newRowIndex,
          success: true
        };
        
      } catch (error) {
        Logger.log(`Create operation error: ${error.message}`);
        throw new Error(`Failed to create record: ${error.message}`);
      }
    },
    
    // Read records with filtering and sorting
    read: function(sheetName, filters = {}, sortBy = null, limit = null) {
      try {
        const cacheKey = `read_${sheetName}_${JSON.stringify(filters)}_${sortBy}_${limit}`;
        let data = this.cache.get(cacheKey);
        
        if (!data) {
          const sheet = this.getSheet(sheetName);
          const allData = sheet.getDataRange().getValues();
          const headers = allData[0];
          const records = allData.slice(1);
          
          // Apply filters
          let filteredRecords = records;
          Object.keys(filters).forEach(filterKey => {
            const columnIndex = headers.indexOf(filterKey);
            if (columnIndex !== -1) {
              filteredRecords = filteredRecords.filter(record => 
                record[columnIndex] === filters[filterKey]
              );
            }
          });
          
          // Apply sorting
          if (sortBy) {
            const sortColumnIndex = headers.indexOf(sortBy);
            if (sortColumnIndex !== -1) {
              filteredRecords.sort((a, b) => 
                a[sortColumnIndex] > b[sortColumnIndex] ? 1 : -1
              );
            }
          }
          
          // Apply limit
          if (limit) {
            filteredRecords = filteredRecords.slice(0, limit);
          }
          
          // Convert to objects
          data = filteredRecords.map(record => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = record[index];
            });
            return obj;
          });
          
          // Cache for 30 minutes
          this.cache.put(cacheKey, JSON.stringify(data), 1800);
        } else {
          data = JSON.parse(data);
        }
        
        return data;
        
      } catch (error) {
        Logger.log(`Read operation error: ${error.message}`);
        throw new Error(`Failed to read records: ${error.message}`);
      }
    },
    
    // Update existing record
    update: function(sheetName, recordId, updateData) {
      try {
        const sheet = this.getSheet(sheetName);
        const headers = this.getHeaders(sheetName);
        const idColumnIndex = headers.indexOf('ID') !== -1 ? headers.indexOf('ID') : 0;
        
        // Find the record row
        const data = sheet.getDataRange().getValues();
        const recordRowIndex = data.findIndex((row, index) => 
          index > 0 && row[idColumnIndex] === recordId
        );
        
        if (recordRowIndex === -1) {
          throw new Error(`Record with ID ${recordId} not found`);
        }
        
        // Update specific columns
        Object.keys(updateData).forEach(key => {
          const columnIndex = headers.indexOf(key);
          if (columnIndex !== -1) {
            sheet.getRange(recordRowIndex + 1, columnIndex + 1).setValue(updateData[key]);
          }
        });
        
        // Add update timestamp
        const timestampColumnIndex = headers.indexOf('Last Updated');
        if (timestampColumnIndex !== -1) {
          sheet.getRange(recordRowIndex + 1, timestampColumnIndex + 1).setValue(new Date());
        }
        
        // Clear cache
        this.clearSheetCache(sheetName);
        
        return { success: true, updatedRow: recordRowIndex + 1 };
        
      } catch (error) {
        Logger.log(`Update operation error: ${error.message}`);
        throw new Error(`Failed to update record: ${error.message}`);
      }
    },
    
    // Delete record (soft delete with status change)
    delete: function(sheetName, recordId) {
      try {
        const statusUpdate = { 'Status': 'DELETED', 'Deleted Date': new Date() };
        return this.update(sheetName, recordId, statusUpdate);
      } catch (error) {
        Logger.log(`Delete operation error: ${error.message}`);
        throw new Error(`Failed to delete record: ${error.message}`);
      }
    }
  },
  
  // Helper methods
  getSheet: function(sheetName) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    return sheet;
  },
  
  getHeaders: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },
  
  generateId: function() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  clearSheetCache: function(sheetName) {
    // Clear all cached data for this sheet
    const keys = [`read_${sheetName}*`];
    keys.forEach(pattern => {
      // Implementation would clear cache entries matching pattern
    });
  }
};
```

---

## 🔌 API Integration Patterns

### WhatsApp Business API Integration

```javascript
// WhatsApp API integration with rate limiting and retry logic
const WhatsAppIntegration = {
  
  // API configuration
  config: {
    baseUrl: 'https://graph.facebook.com/v17.0',
    phoneNumberId: PropertiesService.getScriptProperties().getProperty('WHATSAPP_PHONE_NUMBER_ID'),
    accessToken: PropertiesService.getScriptProperties().getProperty('WHATSAPP_ACCESS_TOKEN'),
    rateLimitDelay: 1000, // 1 second between messages
    maxRetries: 3
  },
  
  // Send message with retry logic
  sendMessage: function(recipient, message, messageType = 'text') {
    let attempts = 0;
    
    while (attempts < this.config.maxRetries) {
      try {
        const response = this.makeAPICall(recipient, message, messageType);
        
        if (response.getResponseCode() === 200) {
          const responseData = JSON.parse(response.getContentText());
          
          // Log successful delivery
          this.logMessageDelivery(recipient, messageType, 'SUCCESS', responseData);
          
          return {
            success: true,
            messageId: responseData.messages[0].id,
            recipient: recipient
          };
        } else {
          throw new Error(`API returned status: ${response.getResponseCode()}`);
        }
        
      } catch (error) {
        attempts++;
        Logger.log(`WhatsApp API attempt ${attempts} failed: ${error.message}`);
        
        if (attempts < this.config.maxRetries) {
          Utilities.sleep(this.config.rateLimitDelay * attempts); // Exponential backoff
        } else {
          // Log final failure
          this.logMessageDelivery(recipient, messageType, 'FAILED', error.message);
          throw new Error(`WhatsApp message delivery failed after ${this.config.maxRetries} attempts: ${error.message}`);
        }
      }
    }
  },
  
  // Make API call to WhatsApp
  makeAPICall: function(recipient, message, messageType) {
    const url = `${this.config.baseUrl}/${this.config.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: messageType
    };
    
    if (messageType === 'text') {
      payload.text = { body: message };
    } else if (messageType === 'template') {
      payload.template = message;
    }
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    return UrlFetchApp.fetch(url, options);
  },
  
  // Rate limiting implementation
  respectRateLimit: function() {
    Utilities.sleep(this.config.rateLimitDelay);
  },
  
  // Message delivery logging
  logMessageDelivery: function(recipient, messageType, status, details) {
    const logEntry = {
      timestamp: new Date(),
      recipient: recipient,
      messageType: messageType,
      status: status,
      details: details
    };
    
    // Log to delivery tracking sheet
    const deliverySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Message Delivery Log');
    if (deliverySheet) {
      deliverySheet.appendRow([
        logEntry.timestamp,
        logEntry.recipient,
        logEntry.messageType,
        logEntry.status,
        JSON.stringify(logEntry.details)
      ]);
    }
  },
  
  // Batch message processing
  processBatchMessages: function(messages) {
    const results = [];
    
    messages.forEach((message, index) => {
      try {
        const result = this.sendMessage(message.recipient, message.content, message.type);
        results.push(result);
        
        // Respect rate limiting between messages
        if (index < messages.length - 1) {
          this.respectRateLimit();
        }
        
      } catch (error) {
        results.push({
          success: false,
          recipient: message.recipient,
          error: error.message
        });
      }
    });
    
    return results;
  }
};
```

---

## 🛡️ Error Handling and Resilience

### Comprehensive Error Management

```javascript
// Enterprise-grade error handling system
const ErrorManagementSystem = {
  
  // Custom error classes for different error types
  errors: {
    ValidationError: class extends Error {
      constructor(field, value, message) {
        super(`Validation failed for ${field}: ${message}`);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.code = 'VALIDATION_ERROR';
      }
    },
    
    APIError: class extends Error {
      constructor(service, statusCode, message) {
        super(`API Error from ${service}: ${message}`);
        this.name = 'APIError';
        this.service = service;
        this.statusCode = statusCode;
        this.code = 'API_ERROR';
      }
    },
    
    BusinessLogicError: class extends Error {
      constructor(operation, context, message) {
        super(`Business logic error in ${operation}: ${message}`);
        this.name = 'BusinessLogicError';
        this.operation = operation;
        this.context = context;
        this.code = 'BUSINESS_LOGIC_ERROR';
      }
    }
  },
  
  // Global error handler
  handleError: function(error, context = {}) {
    const errorInfo = {
      timestamp: new Date(),
      errorType: error.name || 'UnknownError',
      errorCode: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      stack: error.stack,
      context: context,
      severity: this.determineSeverity(error)
    };
    
    // Log error
    this.logError(errorInfo);
    
    // Send notifications for critical errors
    if (errorInfo.severity === 'CRITICAL') {
      this.notifyCriticalError(errorInfo);
    }
    
    // Attempt recovery if possible
    const recoveryResult = this.attemptRecovery(error, context);
    
    return {
      handled: true,
      errorInfo: errorInfo,
      recovery: recoveryResult
    };
  },
  
  // Determine error severity
  determineSeverity: function(error) {
    if (error.code === 'QUOTA_EXCEEDED' || error.code === 'API_ERROR') {
      return 'CRITICAL';
    } else if (error.code === 'VALIDATION_ERROR') {
      return 'WARNING';
    } else if (error.code === 'BUSINESS_LOGIC_ERROR') {
      return 'ERROR';
    }
    return 'INFO';
  },
  
  // Error recovery mechanisms
  attemptRecovery: function(error, context) {
    switch (error.code) {
      case 'QUOTA_EXCEEDED':
        return this.handleQuotaExceeded(context);
      case 'API_ERROR':
        return this.handleAPIError(error, context);
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context);
      default:
        return { recovered: false, message: 'No recovery mechanism available' };
    }
  },
  
  // Specific recovery handlers
  handleQuotaExceeded: function(context) {
    // Implement quota exceeded recovery (e.g., schedule retry)
    return {
      recovered: true,
      action: 'SCHEDULED_RETRY',
      retryAt: new Date(Date.now() + 3600000) // Retry in 1 hour
    };
  },
  
  handleAPIError: function(error, context) {
    // Implement API error recovery (e.g., retry with exponential backoff)
    return {
      recovered: true,
      action: 'EXPONENTIAL_BACKOFF_RETRY',
      maxRetries: 3
    };
  },
  
  // Error logging
  logError: function(errorInfo) {
    // Log to error tracking sheet
    const errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Error Log');
    if (errorSheet) {
      errorSheet.appendRow([
        errorInfo.timestamp,
        errorInfo.errorType,
        errorInfo.errorCode,
        errorInfo.message,
        errorInfo.severity,
        JSON.stringify(errorInfo.context),
        errorInfo.stack
      ]);
    }
    
    // Also log to Google Cloud Logging if available
    console.error('Application Error:', errorInfo);
  }
};
```

---

## 🧪 Testing and Quality Assurance

### Comprehensive Testing Framework

```javascript
// Testing framework for Google Apps Script
const TestingFramework = {
  
  // Test suite runner
  runTestSuite: function(suiteName, tests) {
    const results = {
      suiteName: suiteName,
      totalTests: tests.length,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: Date.now()
    };
    
    Logger.log(`Running test suite: ${suiteName}`);
    
    tests.forEach(test => {
      try {
        const testResult = this.runSingleTest(test);
        if (testResult.passed) {
          results.passed++;
          Logger.log(`✓ ${test.name}`);
        } else {
          results.failed++;
          results.errors.push(testResult.error);
          Logger.log(`✗ ${test.name}: ${testResult.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${test.name}: ${error.message}`);
        Logger.log(`✗ ${test.name}: ${error.message}`);
      }
    });
    
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    this.logTestResults(results);
    return results;
  },
  
  // Individual test runner
  runSingleTest: function(test) {
    try {
      // Setup
      if (test.setup) test.setup();
      
      // Execute test
      const result = test.test();
      
      // Teardown
      if (test.teardown) test.teardown();
      
      return { passed: result === true || result === undefined, error: null };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  },
  
  // Assertion helpers
  assert: {
    assertEquals: function(expected, actual, message = '') {
      if (expected !== actual) {
        throw new Error(`Assertion failed ${message}: expected ${expected}, got ${actual}`);
      }
    },
    
    assertTrue: function(condition, message = '') {
      if (!condition) {
        throw new Error(`Assertion failed ${message}: expected true, got ${condition}`);
      }
    },
    
    assertNotNull: function(value, message = '') {
      if (value === null || value === undefined) {
        throw new Error(`Assertion failed ${message}: expected non-null value, got ${value}`);
      }
    },
    
    assertThrows: function(fn, expectedError, message = '') {
      try {
        fn();
        throw new Error(`Assertion failed ${message}: expected function to throw`);
      } catch (error) {
        if (expectedError && error.message !== expectedError) {
          throw new Error(`Assertion failed ${message}: expected error "${expectedError}", got "${error.message}"`);
        }
      }
    }
  }
};

// Example test suite for CRM functionality
const CRMTestSuite = [
  {
    name: 'Customer Registration Validation',
    setup: function() {
      this.testData = {
        customerName: 'Test Customer',
        phoneNumber: '01712345678',
        nidNumber: '1234567890123',
        territory: 'DHAKA_NORTH'
      };
    },
    test: function() {
      const validationResult = ValidationService.validateCustomerData(this.testData);
      TestingFramework.assert.assertTrue(validationResult.isValid);
      TestingFramework.assert.assertEquals('DHAKA_NORTH', validationResult.territory);
    },
    teardown: function() {
      delete this.testData;
    }
  },
  
  {
    name: 'Territory Assignment Logic',
    test: function() {
      const territory = CRMService.assignTerritory('Dhanmondi, Dhaka');
      TestingFramework.assert.assertNotNull(territory);
      TestingFramework.assert.assertTrue(['DHAKA_NORTH', 'DHAKA_SOUTH'].includes(territory));
    }
  },
  
  {
    name: 'Order Processing Workflow',
    setup: function() {
      this.orderData = {
        customerId: 'test_customer_123',
        orderType: 'CEMENT',
        orderValue: 50000,
        territory: 'DHAKA_NORTH'
      };
    },
    test: function() {
      const orderResult = OrderService.createOrder(this.orderData);
      TestingFramework.assert.assertTrue(orderResult.success);
      TestingFramework.assert.assertNotNull(orderResult.orderId);
      TestingFramework.assert.assertNotNull(orderResult.assignedEngineer);
    }
  }
];
```

This comprehensive technical implementation guide provides the foundation for building robust, scalable, and maintainable Google Apps Script applications following enterprise-grade development patterns specifically adapted for the Anwar Sales Ecosystem's construction supply chain management requirements.
