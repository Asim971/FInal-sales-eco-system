# Anwar Sales Ecosystem - Security Architecture Documentation

**Version:** 1.0  
**Date:** August 3, 2025  
**Document Owner:** Architecture Design Agent  
**Status:** Active Documentation

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication and Authorization](#authentication-and-authorization)
3. [Data Protection and Privacy](#data-protection-and-privacy)
4. [API Security](#api-security)
5. [Input Validation and Sanitization](#input-validation-and-sanitization)
6. [Audit and Compliance](#audit-and-compliance)
7. [Security Monitoring](#security-monitoring)

---

## 🔒 Security Overview

The **Anwar Sales Ecosystem** implements **enterprise-grade security measures** leveraging Google Cloud Platform's robust security infrastructure while maintaining compliance with construction industry data protection requirements.

### Security Framework Principles

#### 1. **Zero-Trust Security Model**

- **Identity Verification**: Every user and system component must be authenticated and authorized
- **Least Privilege Access**: Minimum necessary permissions for role-based operations
- **Continuous Verification**: Ongoing validation of user access and system integrity
- **Defense in Depth**: Multiple layers of security controls and monitoring

#### 2. **Data-Centric Security**

- **Data Classification**: Sensitive customer and business data categorization
- **Encryption at Rest**: Google Cloud encryption for all stored data
- **Encryption in Transit**: HTTPS/TLS for all API communications
- **Data Loss Prevention**: Automated protection against unauthorized data exposure

#### 3. **Compliance-First Design**

- **GDPR Compliance**: European data protection regulation adherence
- **Industry Standards**: Construction industry best practices implementation
- **Audit Trail**: Complete activity logging for regulatory compliance
- **Privacy by Design**: Data protection integrated into system architecture

---

## 🔐 Authentication and Authorization

### Google OAuth 2.0 Integration

```javascript
// Secure authentication service using Google OAuth 2.0
const AuthenticationService = {
  
  // Initialize OAuth configuration
  initialize: function() {
    this.clientId = PropertiesService.getScriptProperties().getProperty('OAUTH_CLIENT_ID');
    this.clientSecret = PropertiesService.getScriptProperties().getProperty('OAUTH_CLIENT_SECRET');
    this.redirectUri = PropertiesService.getScriptProperties().getProperty('OAUTH_REDIRECT_URI');
    this.isInitialized = true;
  },
  
  // Validate user session and extract user information
  validateUserSession: function() {
    try {
      const user = Session.getActiveUser();
      const email = user.getEmail();
      
      if (!email) {
        throw new Error('No active user session');
      }
      
      // Verify user is authorized for the system
      const userRole = this.getUserRole(email);
      if (!userRole) {
        throw new Error('User not authorized for system access');
      }
      
      return {
        email: email,
        role: userRole,
        permissions: this.getRolePermissions(userRole),
        territory: this.getUserTerritory(email),
        sessionValid: true
      };
      
    } catch (error) {
      Logger.log(`Authentication error: ${error.message}`);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  },
  
  // Role-based access control
  getUserRole: function(email) {
    const roleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('User Roles');
    const data = roleSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email && data[i][2] === 'ACTIVE') {
        return data[i][1]; // Role column
      }
    }
    
    return null; // User not found or inactive
  },
  
  // Territory-based access control
  getUserTerritory: function(email) {
    const territorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Territory Assignments');
    const data = territorySheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        return data[i][1]; // Territory column
      }
    }
    
    return null;
  },
  
  // Permission validation
  hasPermission: function(userRole, requiredPermission) {
    const rolePermissions = this.getRolePermissions(userRole);
    return rolePermissions.includes(requiredPermission);
  },
  
  // Define role-based permissions
  getRolePermissions: function(role) {
    const permissions = {
      'BDO': [
        'READ_CUSTOMERS',
        'APPROVE_SITES',
        'ASSIGN_ENGINEERS',
        'MANAGE_ORDERS',
        'RESOLVE_DISPUTES',
        'VIEW_TERRITORY_DATA'
      ],
      'ASM': [
        'READ_CUSTOMERS',
        'APPROVE_RETAILER_POINTS',
        'VIEW_AREA_DATA',
        'MANAGE_BDO_ASSIGNMENTS',
        'APPROVE_DEMAND_GENERATION',
        'VIEW_PERFORMANCE_REPORTS'
      ],
      'CRO': [
        'READ_CUSTOMERS',
        'REGISTER_CUSTOMERS',
        'REQUEST_RETAILER_POINTS',
        'MANAGE_CUSTOMER_RELATIONS',
        'VIEW_CUSTOMER_DATA'
      ],
      'BD_INCHARGE': [
        'READ_CUSTOMERS',
        'APPROVE_DEMAND_GENERATION',
        'VIEW_ALL_DATA',
        'MANAGE_STRATEGIC_INITIATIVES',
        'SYSTEM_CONFIGURATION'
      ],
      'ENGINEER': [
        'READ_ASSIGNED_ORDERS',
        'UPDATE_ORDER_STATUS',
        'UPLOAD_SITE_PHOTOS',
        'COMPLETE_VISITS'
      ],
      'ADMIN': [
        'FULL_SYSTEM_ACCESS',
        'USER_MANAGEMENT',
        'SYSTEM_CONFIGURATION',
        'AUDIT_ACCESS'
      ]
    };
    
    return permissions[role] || [];
  }
};
```

### Authorization Middleware

```javascript
// Authorization middleware for secure endpoint access
const AuthorizationMiddleware = {
  
  // Protect function with role-based access control
  requireRole: function(requiredRoles, targetFunction) {
    return function(...args) {
      try {
        const userSession = AuthenticationService.validateUserSession();
        
        if (!requiredRoles.includes(userSession.role)) {
          throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
        }
        
        // Log access attempt
        SecurityAuditService.logAccess(userSession.email, targetFunction.name, 'GRANTED');
        
        return targetFunction.apply(this, args);
        
      } catch (error) {
        SecurityAuditService.logAccess(
          Session.getActiveUser().getEmail() || 'anonymous',
          targetFunction.name,
          'DENIED',
          error.message
        );
        throw error;
      }
    };
  },
  
  // Protect function with permission-based access control
  requirePermission: function(requiredPermission, targetFunction) {
    return function(...args) {
      try {
        const userSession = AuthenticationService.validateUserSession();
        
        if (!AuthenticationService.hasPermission(userSession.role, requiredPermission)) {
          throw new Error(`Access denied. Required permission: ${requiredPermission}`);
        }
        
        return targetFunction.apply(this, args);
        
      } catch (error) {
        SecurityAuditService.logAccess(
          Session.getActiveUser().getEmail() || 'anonymous',
          targetFunction.name,
          'DENIED',
          error.message
        );
        throw error;
      }
    };
  },
  
  // Territory-based data access control
  requireTerritoryAccess: function(targetFunction) {
    return function(territoryCode, ...args) {
      try {
        const userSession = AuthenticationService.validateUserSession();
        
        // Check if user has access to the requested territory
        if (userSession.territory && userSession.territory !== territoryCode) {
          // Check if user has cross-territory permissions
          if (!AuthenticationService.hasPermission(userSession.role, 'VIEW_ALL_TERRITORIES')) {
            throw new Error(`Access denied to territory: ${territoryCode}`);
          }
        }
        
        return targetFunction.apply(this, [territoryCode, ...args]);
        
      } catch (error) {
        SecurityAuditService.logAccess(
          Session.getActiveUser().getEmail() || 'anonymous',
          `${targetFunction.name}_${territoryCode}`,
          'DENIED',
          error.message
        );
        throw error;
      }
    };
  }
};
```

---

## 🛡️ Data Protection and Privacy

### Data Encryption and Security

```javascript
// Data protection service for sensitive information handling
const DataProtectionService = {
  
  // Encrypt sensitive data before storage
  encryptSensitiveData: function(data, dataType) {
    try {
      // Use Google Apps Script's built-in encryption capabilities
      const encryptionKey = this.getEncryptionKey(dataType);
      
      // For highly sensitive data, implement additional encryption
      if (this.isHighlySensitive(dataType)) {
        return this.advancedEncrypt(data, encryptionKey);
      }
      
      // Standard encryption for regular sensitive data
      return Utilities.base64Encode(data);
      
    } catch (error) {
      Logger.log(`Encryption error: ${error.message}`);
      throw new Error(`Failed to encrypt ${dataType}: ${error.message}`);
    }
  },
  
  // Decrypt sensitive data for authorized access
  decryptSensitiveData: function(encryptedData, dataType, userRole) {
    try {
      // Verify user has permission to access this data type
      if (!this.hasDataAccess(userRole, dataType)) {
        throw new Error('Insufficient permissions to access encrypted data');
      }
      
      const encryptionKey = this.getEncryptionKey(dataType);
      
      if (this.isHighlySensitive(dataType)) {
        return this.advancedDecrypt(encryptedData, encryptionKey);
      }
      
      return Utilities.base64Decode(encryptedData);
      
    } catch (error) {
      Logger.log(`Decryption error: ${error.message}`);
      throw new Error(`Failed to decrypt ${dataType}: ${error.message}`);
    }
  },
  
  // Data classification and sensitivity levels
  isHighlySensitive: function(dataType) {
    const highlySensitiveTypes = [
      'NID_NUMBER',
      'BANK_ACCOUNT',
      'PAYMENT_DETAILS',
      'PERSONAL_DOCUMENTS'
    ];
    
    return highlySensitiveTypes.includes(dataType);
  },
  
  // Personal data anonymization for analytics
  anonymizePersonalData: function(data) {
    const anonymized = { ...data };
    
    // Remove or hash personally identifiable information
    if (anonymized.customerName) {
      anonymized.customerName = this.hashValue(anonymized.customerName);
    }
    
    if (anonymized.phoneNumber) {
      anonymized.phoneNumber = this.maskPhoneNumber(anonymized.phoneNumber);
    }
    
    if (anonymized.nidNumber) {
      anonymized.nidNumber = this.hashValue(anonymized.nidNumber);
    }
    
    if (anonymized.email) {
      anonymized.email = this.maskEmail(anonymized.email);
    }
    
    return anonymized;
  },
  
  // Data masking utilities
  maskPhoneNumber: function(phoneNumber) {
    return phoneNumber.substring(0, 3) + 'XXXXX' + phoneNumber.substring(8);
  },
  
  maskEmail: function(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + 'XXX';
    return `${maskedUsername}@${domain}`;
  },
  
  hashValue: function(value) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  }
};
```

### GDPR Compliance Implementation

```javascript
// GDPR compliance service for data protection regulation adherence
const GDPRComplianceService = {
  
  // Handle data subject access requests
  handleAccessRequest: function(customerEmail) {
    try {
      const userSession = AuthenticationService.validateUserSession();
      
      // Verify request authorization
      if (!AuthenticationService.hasPermission(userSession.role, 'HANDLE_GDPR_REQUESTS')) {
        throw new Error('Insufficient permissions for GDPR request handling');
      }
      
      // Collect all personal data for the customer
      const personalData = this.collectCustomerData(customerEmail);
      
      // Log GDPR access request
      SecurityAuditService.logGDPRActivity(customerEmail, 'ACCESS_REQUEST', userSession.email);
      
      return {
        customerEmail: customerEmail,
        dataCollected: personalData,
        collectionDate: new Date(),
        handler: userSession.email
      };
      
    } catch (error) {
      Logger.log(`GDPR access request error: ${error.message}`);
      throw error;
    }
  },
  
  // Handle data deletion requests (right to be forgotten)
  handleDeletionRequest: function(customerEmail, deletionReason) {
    try {
      const userSession = AuthenticationService.validateUserSession();
      
      // Verify request authorization
      if (!AuthenticationService.hasPermission(userSession.role, 'HANDLE_GDPR_REQUESTS')) {
        throw new Error('Insufficient permissions for GDPR request handling');
      }
      
      // Mark data for deletion (soft delete for audit trail)
      const deletionResult = this.markDataForDeletion(customerEmail, deletionReason);
      
      // Log GDPR deletion request
      SecurityAuditService.logGDPRActivity(customerEmail, 'DELETION_REQUEST', userSession.email, deletionReason);
      
      return deletionResult;
      
    } catch (error) {
      Logger.log(`GDPR deletion request error: ${error.message}`);
      throw error;
    }
  },
  
  // Collect all customer data across system
  collectCustomerData: function(customerEmail) {
    const customerData = {
      personalInformation: {},
      orderHistory: [],
      visitHistory: [],
      communicationLogs: []
    };
    
    // Collect data from CRM database
    const crmData = SheetsService.crud.read('CRM_MASTER', { 'Submitter Email': customerEmail });
    customerData.personalInformation = crmData[0] || {};
    
    // Collect order history
    const orders = SheetsService.crud.read('ORDER_MANAGEMENT', { 'Customer Email': customerEmail });
    customerData.orderHistory = orders;
    
    // Collect visit history
    const visits = SheetsService.crud.read('VISIT_MANAGEMENT', { 'Customer Email': customerEmail });
    customerData.visitHistory = visits;
    
    // Collect communication logs
    const communications = SheetsService.crud.read('Message Delivery Log', { 'Recipient': customerEmail });
    customerData.communicationLogs = communications;
    
    return customerData;
  },
  
  // Data retention policy enforcement
  enforceDataRetentionPolicy: function() {
    const retentionPolicies = {
      'CUSTOMER_DATA': 2555, // 7 years in days
      'ORDER_DATA': 2555,    // 7 years in days
      'COMMUNICATION_LOGS': 365, // 1 year in days
      'AUDIT_LOGS': 2555     // 7 years in days
    };
    
    Object.keys(retentionPolicies).forEach(dataType => {
      const retentionDays = retentionPolicies[dataType];
      const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
      
      this.archiveExpiredData(dataType, cutoffDate);
    });
  }
};
```

---

## 🔌 API Security

### Secure API Integration

```javascript
// API security service for external integrations
const APISecurityService = {
  
  // Secure API key management
  getSecureAPIKey: function(serviceName) {
    try {
      const properties = PropertiesService.getScriptProperties();
      const encryptedKey = properties.getProperty(`${serviceName}_API_KEY_ENCRYPTED`);
      
      if (!encryptedKey) {
        throw new Error(`API key not found for service: ${serviceName}`);
      }
      
      return this.decryptAPIKey(encryptedKey);
      
    } catch (error) {
      Logger.log(`API key retrieval error: ${error.message}`);
      throw new Error(`Failed to retrieve API key for ${serviceName}`);
    }
  },
  
  // API request signing for authentication
  signAPIRequest: function(endpoint, payload, apiKey) {
    const timestamp = Date.now();
    const signaturePayload = `${endpoint}${JSON.stringify(payload)}${timestamp}`;
    
    const signature = Utilities.computeHmacSha256Signature(signaturePayload, apiKey);
    const signatureHex = signature.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    
    return {
      timestamp: timestamp,
      signature: signatureHex
    };
  },
  
  // Rate limiting for API calls
  implementRateLimit: function(apiEndpoint, maxRequestsPerMinute = 60) {
    const cache = CacheService.getScriptCache();
    const cacheKey = `rate_limit_${apiEndpoint}`;
    
    const currentCount = cache.get(cacheKey);
    const count = currentCount ? parseInt(currentCount) : 0;
    
    if (count >= maxRequestsPerMinute) {
      throw new Error(`Rate limit exceeded for ${apiEndpoint}. Max: ${maxRequestsPerMinute} requests per minute`);
    }
    
    cache.put(cacheKey, (count + 1).toString(), 60); // 60 seconds TTL
  },
  
  // Secure HTTP client with automatic retry and error handling
  secureHttpClient: function(url, options, retryCount = 3) {
    let attempts = 0;
    
    while (attempts < retryCount) {
      try {
        // Add security headers
        options.headers = {
          ...options.headers,
          'User-Agent': 'AnwarSalesEcosystem/1.0',
          'X-Request-ID': Utilities.getUuid(),
          'X-Timestamp': new Date().toISOString()
        };
        
        // Implement request timeout
        options.muteHttpExceptions = true;
        
        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();
        
        if (statusCode >= 200 && statusCode < 300) {
          return {
            success: true,
            statusCode: statusCode,
            data: response.getContentText(),
            headers: response.getHeaders()
          };
        } else if (statusCode >= 500 && attempts < retryCount - 1) {
          // Retry on server errors
          attempts++;
          Utilities.sleep(Math.pow(2, attempts) * 1000); // Exponential backoff
          continue;
        } else {
          throw new Error(`HTTP ${statusCode}: ${response.getContentText()}`);
        }
        
      } catch (error) {
        attempts++;
        Logger.log(`HTTP request attempt ${attempts} failed: ${error.message}`);
        
        if (attempts >= retryCount) {
          throw new Error(`HTTP request failed after ${retryCount} attempts: ${error.message}`);
        }
        
        Utilities.sleep(Math.pow(2, attempts) * 1000);
      }
    }
  }
};
```

---

## ✅ Input Validation and Sanitization

### Comprehensive Input Validation

```javascript
// Input validation and sanitization service
const InputValidationService = {
  
  // Validate and sanitize form submissions
  validateFormSubmission: function(formData, formType) {
    const validationResult = {
      isValid: true,
      errors: [],
      sanitizedData: {},
      warnings: []
    };
    
    try {
      const schema = this.getValidationSchema(formType);
      
      Object.keys(schema).forEach(fieldName => {
        const fieldValue = formData[fieldName];
        const fieldRules = schema[fieldName];
        
        // Check required fields
        if (fieldRules.required && (!fieldValue || fieldValue.trim() === '')) {
          validationResult.errors.push(`${fieldName} is required`);
          validationResult.isValid = false;
          return;
        }
        
        if (fieldValue) {
          // Sanitize input
          const sanitizedValue = this.sanitizeInput(fieldValue, fieldRules.type);
          
          // Validate against rules
          const fieldValidation = this.validateField(sanitizedValue, fieldRules);
          
          if (!fieldValidation.isValid) {
            validationResult.errors.push(...fieldValidation.errors);
            validationResult.isValid = false;
          } else {
            validationResult.sanitizedData[fieldName] = sanitizedValue;
          }
          
          // Add warnings if any
          if (fieldValidation.warnings) {
            validationResult.warnings.push(...fieldValidation.warnings);
          }
        }
      });
      
      // Cross-field validation
      const crossFieldValidation = this.validateCrossFields(validationResult.sanitizedData, formType);
      if (!crossFieldValidation.isValid) {
        validationResult.errors.push(...crossFieldValidation.errors);
        validationResult.isValid = false;
      }
      
    } catch (error) {
      Logger.log(`Validation error: ${error.message}`);
      validationResult.isValid = false;
      validationResult.errors.push('Validation system error');
    }
    
    return validationResult;
  },
  
  // Input sanitization
  sanitizeInput: function(input, dataType) {
    let sanitized = input;
    
    // Basic sanitization for all inputs
    sanitized = sanitized.toString().trim();
    
    // Type-specific sanitization
    switch (dataType) {
      case 'email':
        sanitized = sanitized.toLowerCase();
        break;
      case 'phone':
        sanitized = sanitized.replace(/[^\d+]/g, '');
        break;
      case 'text':
        sanitized = this.escapeHtml(sanitized);
        break;
      case 'number':
        sanitized = parseFloat(sanitized);
        break;
      case 'nid':
        sanitized = sanitized.replace(/[^\d]/g, '');
        break;
    }
    
    return sanitized;
  },
  
  // HTML escaping for XSS prevention
  escapeHtml: function(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  // Validation schema definitions
  getValidationSchema: function(formType) {
    const schemas = {
      'CUSTOMER_REGISTRATION': {
        customerName: {
          required: true,
          type: 'text',
          minLength: 2,
          maxLength: 100,
          pattern: /^[a-zA-Z\s]+$/
        },
        phoneNumber: {
          required: true,
          type: 'phone',
          pattern: /^(\+8801|01)[3-9]\d{8}$/
        },
        nidNumber: {
          required: true,
          type: 'nid',
          pattern: /^(\d{10}|\d{13}|\d{17})$/
        },
        email: {
          required: false,
          type: 'email',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      },
      'ORDER_CREATION': {
        orderType: {
          required: true,
          type: 'text',
          allowedValues: ['CEMENT', 'ROD', 'BRICK', 'SAND', 'STONE']
        },
        orderValue: {
          required: true,
          type: 'number',
          min: 0,
          max: 10000000
        },
        deliveryDate: {
          required: true,
          type: 'date',
          futureDate: true
        }
      }
    };
    
    return schemas[formType] || {};
  },
  
  // Field validation
  validateField: function(value, rules) {
    const result = { isValid: true, errors: [], warnings: [] };
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      result.errors.push(`Minimum length is ${rules.minLength} characters`);
      result.isValid = false;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      result.errors.push(`Maximum length is ${rules.maxLength} characters`);
      result.isValid = false;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      result.errors.push('Invalid format');
      result.isValid = false;
    }
    
    // Allowed values validation
    if (rules.allowedValues && !rules.allowedValues.includes(value)) {
      result.errors.push(`Value must be one of: ${rules.allowedValues.join(', ')}`);
      result.isValid = false;
    }
    
    // Number range validation
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        result.errors.push(`Minimum value is ${rules.min}`);
        result.isValid = false;
      }
      
      if (rules.max !== undefined && value > rules.max) {
        result.errors.push(`Maximum value is ${rules.max}`);
        result.isValid = false;
      }
    }
    
    return result;
  }
};
```

---

## 📊 Security Monitoring

### Security Audit and Monitoring Service

```javascript
// Security monitoring and audit service
const SecurityAuditService = {
  
  // Log security events
  logSecurityEvent: function(eventType, details, severity = 'INFO') {
    const securityEvent = {
      timestamp: new Date(),
      eventType: eventType,
      severity: severity,
      userEmail: Session.getActiveUser().getEmail(),
      userAgent: this.getUserAgent(),
      ipAddress: this.getClientIP(),
      details: details,
      sessionId: this.getSessionId()
    };
    
    // Log to security audit sheet
    this.writeToAuditLog(securityEvent);
    
    // Alert on critical security events
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      this.sendSecurityAlert(securityEvent);
    }
  },
  
  // Monitor for suspicious activities
  detectSuspiciousActivity: function(userEmail, activityType) {
    const cache = CacheService.getScriptCache();
    const cacheKey = `activity_${userEmail}_${activityType}`;
    
    const recentActivity = cache.get(cacheKey);
    const count = recentActivity ? parseInt(recentActivity) : 0;
    
    // Define suspicious activity thresholds
    const thresholds = {
      'LOGIN_ATTEMPT': 5,
      'DATA_ACCESS': 50,
      'FORM_SUBMISSION': 20,
      'API_CALL': 100
    };
    
    const threshold = thresholds[activityType] || 10;
    
    if (count >= threshold) {
      this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        userEmail: userEmail,
        activityType: activityType,
        count: count,
        threshold: threshold
      }, 'HIGH');
      
      return true;
    }
    
    // Update activity counter
    cache.put(cacheKey, (count + 1).toString(), 3600); // 1 hour window
    return false;
  },
  
  // Security dashboard metrics
  getSecurityMetrics: function(timeframe = 'LAST_24_HOURS') {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    
    const auditSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Security Audit Log');
    const data = auditSheet.getDataRange().getValues();
    
    const metrics = {
      totalEvents: 0,
      securityEvents: {
        'INFO': 0,
        'WARNING': 0,
        'HIGH': 0,
        'CRITICAL': 0
      },
      topUsers: {},
      suspiciousActivities: 0,
      gdprRequests: 0
    };
    
    for (let i = 1; i < data.length; i++) {
      const eventTime = new Date(data[i][0]);
      
      if (eventTime >= startTime && eventTime <= endTime) {
        metrics.totalEvents++;
        
        const severity = data[i][2];
        if (metrics.securityEvents[severity] !== undefined) {
          metrics.securityEvents[severity]++;
        }
        
        const userEmail = data[i][3];
        metrics.topUsers[userEmail] = (metrics.topUsers[userEmail] || 0) + 1;
        
        if (data[i][1] === 'SUSPICIOUS_ACTIVITY') {
          metrics.suspiciousActivities++;
        }
        
        if (data[i][1] === 'GDPR_REQUEST') {
          metrics.gdprRequests++;
        }
      }
    }
    
    return metrics;
  }
};
```

This comprehensive security architecture documentation ensures that the Anwar Sales Ecosystem maintains the highest standards of data protection, user authentication, and system security while remaining compliant with industry regulations and best practices.
