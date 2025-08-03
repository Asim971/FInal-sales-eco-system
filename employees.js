/**
 * @fileoverview Employee Management for Internal Staff Only
 * 
 * IMPORTANT: This module handles ONLY internal company employees (BDO, CRO, SR, ASM).
 * 
 * Business partners, contractors, and clients are managed separately:
 * - Partners/Contractors → partner.js
 * - Site Engineers → engineer.js  
 * - Retailers → retailer.js
 * - Potential Sites → potential-site.js
 * 
 * Employee roles handled here:
 * - BDO: Business Development Officer
 * - CRO: Customer Relationship Officer
 * - SR: Sales Representative 
 * - ASM: Area Sales Manager
 */

/**
 * Generates the next available employee ID for a given role.
 * @param {string} role The employee role (BDO, CRO, SR, ASM).
 * @returns {string} The new employee ID.
 */
function generateNextEmployeeId(role) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);
  
  const roleConfig = CONFIG.EMPLOYEE_ROLES[role];
  if (!roleConfig) {
    Logger.log(`Invalid role: ${role}`);
    return null;
  }

  const prefix = roleConfig.prefix;
  const idRegex = new RegExp(`^${prefix}(\\d{3})$`);
  
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const employeeId = data[i][0]; // Employee ID is in column A
    if (employeeId && idRegex.test(employeeId)) {
      const idNumber = parseInt(idRegex.exec(employeeId)[1], 10);
      if (idNumber > maxId) {
        maxId = idNumber;
      }
    }
  }

  const nextIdNumber = maxId > 0 ? maxId + 1 : roleConfig.startNumber;
  return prefix + String(nextIdNumber).padStart(3, '0');
}

/**
 * Adds a new employee to the central employee directory.
 * @param {Object} employee The employee data object.
 * @returns {string} The assigned employee ID.
 */
function addEmployee(employee) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  
  const employeeId = generateNextEmployeeId(employee.role);
  if (!employeeId) {
    Logger.log(`Could not generate employee ID for role: ${employee.role}`);
    return null;
  }

  // Validate and process location data
  let locationData = {};
  if (employee.location) {
    // Validate location requirements for the role
    const locationValidation = validateLocationForRole(employee.role, employee.location);
    if (!locationValidation.success) {
      Logger.log(`Location validation failed: ${locationValidation.messages.join(', ')}`);
      return null;
    }
    
    // Get complete location hierarchy
    const completeLocation = getLocationHierarchy(employee.location);
    if (completeLocation) {
      locationData = completeLocation;
    } else {
      Logger.log(`Could not resolve location hierarchy for: ${JSON.stringify(employee.location)}`);
      return null;
    }
  }

  const row = [
    employeeId,
    employee.name,
    employee.role,
    employee.email,
    employee.contactNumber,
    employee.whatsappNumber || '',
    employee.bkashNumber || '',
    employee.nidNo || '',
    employee.status || 'Active',
    employee.hireDate || new Date().toLocaleDateString(),
    employee.company || locationData.businessUnit || '',
    employee.territory || '', // Legacy territory field
    employee.area || '', // Legacy area field
    locationData.zone || '', // New zone field
    locationData.district || '', // New district field
    locationData.area || '', // New area field
    locationData.territory || '', // New territory field
    locationData.bazaar || '', // Bazaar field
    locationData.upazilla || '', // Upazilla field
    locationData.bdTerritory || '', // BD Territory field
    locationData.croTerritory || '', // CRO Territory field
    locationData.businessUnit || employee.company || '', // Business Unit field
    employee.legacyId || '',
    employee.notes || ''
  ];

  appendRow(employeesSheet, row);
  Logger.log(`Added employee: ${employee.name} with ID: ${employeeId}`);
  return employeeId;
}

/**
 * Finds an employee by their ID.
 * @param {string} employeeId The employee ID to search for.
 * @returns {Object|null} The employee data or null if not found.
 */
function findEmployeeById(employeeId) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === employeeId) {
      return {
        id: data[i][0],
        name: data[i][1],
        role: data[i][2],
        email: data[i][3],
        contactNumber: data[i][4],
        whatsappNumber: data[i][5],
        bkashNumber: data[i][6],
        nidNo: data[i][7],
        status: data[i][8],
        hireDate: data[i][9],
        company: data[i][10],
        territory: data[i][11], // Legacy territory field
        area: data[i][12], // Legacy area field
        zone: data[i][13], // New zone field
        district: data[i][14], // New district field
        newArea: data[i][15], // New area field
        newTerritory: data[i][16], // New territory field
        bazaar: data[i][17], // Bazaar field
        upazilla: data[i][18], // Upazilla field
        bdTerritory: data[i][19], // BD Territory field
        croTerritory: data[i][20], // CRO Territory field
        businessUnit: data[i][21], // Business Unit field
        legacyId: data[i][22], // Legacy ID field
        notes: data[i][23] // Notes field
      };
    }
  }
  return null;
}

/**
 * Finds an employee by their email address.
 * @param {string} email The email address to search for.
 * @returns {Object|null} The employee data or null if not found.
 */
function findEmployeeByEmail(email) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === email) {
      return {
        id: data[i][0],
        name: data[i][1],
        role: data[i][2],
        email: data[i][3],
        contactNumber: data[i][4],
        whatsappNumber: data[i][5],
        bkashNumber: data[i][6],
        nidNo: data[i][7],
        status: data[i][8],
        hireDate: data[i][9],
        company: data[i][10],
        territory: data[i][11], // Legacy territory field
        area: data[i][12], // Legacy area field
        zone: data[i][13], // New zone field
        district: data[i][14], // New district field
        newArea: data[i][15], // New area field
        newTerritory: data[i][16], // New territory field
        bazaar: data[i][17], // Bazaar field
        upazilla: data[i][18], // Upazilla field
        bdTerritory: data[i][19], // BD Territory field
        croTerritory: data[i][20], // CRO Territory field
        businessUnit: data[i][21], // Business Unit field
        legacyId: data[i][22], // Legacy ID field
        notes: data[i][23] // Notes field
      };
    }
  }
  return null;
}

/**
 * Gets the contact information for an employee (WhatsApp or Contact Number).
 * @param {string} employeeId The employee ID.
 * @returns {string|null} The contact number or null if not found.
 */
function getEmployeeContactNumber(employeeId) {
  const employee = findEmployeeById(employeeId);
  if (!employee) return null;
  
  // Prefer WhatsApp number, fallback to contact number
  return employee.whatsappNumber || employee.contactNumber;
}

/**
 * Migrates data from legacy sheets to the new centralized employee system.
 * This function should be run once after setting up the new employee system.
 * NOTE: This only migrates actual employees (internal staff), not business partners/clients.
 */
function migrateToNewEmployeeSystem() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Migration Confirmation', 'This will migrate existing employee data to the new centralized system. Note: This only migrates internal staff, not business partners/clients. Continue?', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }

  let migratedCount = 0;

  // Note: CRM Approvals, Engineer Approvals, and Retailer Approvals contain
  // business partners/clients, not employees. These should be handled by their
  // respective partner.js, engineer.js, and retailer.js modules.
  
  // If you have actual employee data in other sheets, add migration logic here
  // For example:
  // - Internal staff roster
  // - HR employee records
  // - Sales team directories
  
  console.log('Employee migration completed. Business partners, contractors, and retailers should be managed through their respective modules.');
  
  ui.alert('Migration Complete', `Successfully migrated ${migratedCount} employees to the new system. Note: Business partners, contractors, and retailers are managed separately through their respective modules.`, ui.ButtonSet.OK);
  Logger.log(`Employee migration completed. ${migratedCount} employees migrated.`);
}

/**
 * Finds employees by their role(s).
 * @param {string|Array} roles The role(s) to search for. Can be a string or array of strings.
 * @returns {Array} Array of employee objects matching the role(s).
 */
function findEmployeesByRole(roles) {
  const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
  const data = getSheetData(employeesSheet);
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const matchingEmployees = [];

  for (let i = 1; i < data.length; i++) {
    const employeeRole = data[i][2]; // Role is in column C (index 2)
    if (roleArray.includes(employeeRole)) {
      matchingEmployees.push({
        id: data[i][0],
        name: data[i][1],
        role: data[i][2],
        email: data[i][3],
        contactNumber: data[i][4],
        whatsappNumber: data[i][5],
        bkashNumber: data[i][6],
        nidNo: data[i][7],
        status: data[i][8],
        hireDate: data[i][9],
        company: data[i][10],
        territory: data[i][11],
        area: data[i][12],
        legacyId: data[i][13],
        notes: data[i][14]
      });
    }
  }
  return matchingEmployees;
}

/**
 * Finds an employee by their WhatsApp number.
 * This function is essential for the Per-Submitter Sheets WhatsApp integration.
 * @param {string} whatsappNumber The WhatsApp number to search for.
 * @returns {Object|null} The employee data or null if not found.
 */
function findEmployeeByWhatsApp(whatsappNumber) {
  try {
    console.log(`🔍 Looking up employee by WhatsApp number: ${whatsappNumber}`);
    
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    
    // Clean and normalize the phone number for comparison
    const cleanNumber = normalizePhoneNumber(whatsappNumber);
    
    for (let i = 1; i < data.length; i++) {
      const employeeWhatsApp = data[i][5]; // WhatsApp number is in column F (index 5)
      const employeeContact = data[i][4];  // Contact number is in column E (index 4)
      
      // Check both WhatsApp and contact number fields
      if (employeeWhatsApp && normalizePhoneNumber(employeeWhatsApp) === cleanNumber) {
        console.log(`✅ Found employee by WhatsApp: ${data[i][1]} (${data[i][3]})`);
        return {
          id: data[i][0],
          name: data[i][1],
          role: data[i][2],
          email: data[i][3],
          contactNumber: data[i][4],
          whatsappNumber: data[i][5],
          bkashNumber: data[i][6],
          nidNo: data[i][7],
          status: data[i][8],
          hireDate: data[i][9],
          company: data[i][10],
          territory: data[i][11],
          area: data[i][12],
          legacyId: data[i][13],
          notes: data[i][14]
        };
      }
      
      // Also check contact number as fallback
      if (employeeContact && normalizePhoneNumber(employeeContact) === cleanNumber) {
        console.log(`✅ Found employee by contact number: ${data[i][1]} (${data[i][3]})`);
        return {
          id: data[i][0],
          name: data[i][1],
          role: data[i][2],
          email: data[i][3],
          contactNumber: data[i][4],
          whatsappNumber: data[i][5],
          bkashNumber: data[i][6],
          nidNo: data[i][7],
          status: data[i][8],
          hireDate: data[i][9],
          company: data[i][10],
          territory: data[i][11],
          area: data[i][12],
          legacyId: data[i][13],
          notes: data[i][14]
        };
      }
    }
    
    console.log(`❌ No employee found for WhatsApp number: ${whatsappNumber}`);
    return null;
    
  } catch (error) {
    console.error('Error finding employee by WhatsApp:', error);
    return null;
  }
}

/**
 * Normalizes phone numbers for consistent comparison.
 * Removes spaces, dashes, and standardizes country codes.
 * 
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Normalized phone number
 */
function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  let normalized = phoneNumber.toString()
    .replace(/[\s\-\(\)]/g, '') // Remove spaces, dashes, parentheses
    .replace(/^\+/, ''); // Remove leading +
  
  // Handle Bangladesh country code variations
  if (normalized.startsWith('88') && normalized.length >= 13) {
    // Already has country code (88 + 11 digits)
    return normalized.substring(0, 13); // Ensure exactly 13 digits
  } else if (normalized.startsWith('01') && normalized.length === 11) {
    // Local Bangladesh number, add country code
    return '88' + normalized;
  } else if (normalized.length === 11 && normalized.startsWith('1')) {
    // Handle missing leading 0 in local number
    return '8801' + normalized;
  } else if (normalized.startsWith('8801') && normalized.length === 13) {
    // Correctly formatted number
    return normalized;
  }
  
  // Return as-is if doesn't match expected patterns, but log warning
  if (normalized.length < 11 || normalized.length > 15) {
    console.warn(`⚠️ Unusual phone number format: ${phoneNumber} -> ${normalized}`);
  }
  
  return normalized;
}

/**
 * Validates phone number format for Bangladesh numbers.
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid Bangladesh number
 */
function isValidBangladeshNumber(phoneNumber) {
  if (!phoneNumber) return false;
  
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Valid patterns for Bangladesh
  const patterns = [
    /^88\d{11}$/, // Country code + 11 digits (88 + 01xxxxxxxxx)
    /^01\d{9}$/, // Local format (01xxxxxxxxx)
    /^8801\d{9}$/ // Full international format
  ];
  
  return patterns.some(pattern => pattern.test(normalized));
}

/**
 * Enhanced phone number formatter for display purposes.
 * 
 * @param {string} phoneNumber - Phone number to format
 * @param {string} format - Format type ('local', 'international', 'display')
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber, format = 'display') {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  if (!isValidBangladeshNumber(phoneNumber)) {
    return phoneNumber; // Return original if invalid
  }
  
  // Extract the 11-digit local number
  let localNumber;
  if (normalized.startsWith('88')) {
    localNumber = normalized.substring(2);
  } else {
    localNumber = normalized;
  }
  
  switch (format) {
    case 'local':
      return localNumber;
    case 'international':
      return `+88${localNumber}`;
    case 'display':
      // Format as +88 01XXX-XXXXXX
      return `+88 ${localNumber.substring(0, 3)}-${localNumber.substring(3)}`;
    default:
      return normalized;
  }
}
