/**
 * @fileoverview This file contains employee management functionality.
 */

/**
 * Generates the next available employee ID for a given role.
 * @param {string} role The employee role (BDO, CRO, SR, SITE_ENGINEER, PARTNER, RETAILER).
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
    employee.company || '',
    employee.territory || '',
    employee.area || '',
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
        territory: data[i][11],
        area: data[i][12],
        legacyId: data[i][13],
        notes: data[i][14]
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
        territory: data[i][11],
        area: data[i][12],
        legacyId: data[i][13],
        notes: data[i][14]
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
 */
function migrateToNewEmployeeSystem() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Migration Confirmation', 'This will migrate all existing employee data to the new centralized system. Continue?', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }

  let migratedCount = 0;

  // Migrate CRM Approvals (Partners/Contractors)
  const crmSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.CRM_APPROVALS);
  const crmData = getSheetData(crmSheet);
  
  for (let i = 1; i < crmData.length; i++) {
    const row = crmData[i];
    if (row[8] === 'Approved') { // Only migrate approved entries
      const partnerType = row[11] || 'PARTNER'; // Partner Type column
      const role = partnerType === 'Site Engineer' ? 'SITE_ENGINEER' : 'PARTNER';
      
      const employee = {
        name: row[2], // Contractor Name
        role: role,
        email: row[1], // Submitter Email
        contactNumber: row[4], // Contact Number
        whatsappNumber: row[12], // WhatsApp Number
        bkashNumber: row[3], // Bkash Number
        nidNo: row[5], // NID No
        status: 'Active',
        legacyId: row[10], // Partner ID
        notes: 'Migrated from CRM Approvals'
      };
      
      addEmployee(employee);
      migratedCount++;
    }
  }

  // Migrate Engineer Approvals
  const engineerSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.ENGINEER_APPROVALS);
  const engineerData = getSheetData(engineerSheet);
  
  for (let i = 1; i < engineerData.length; i++) {
    const row = engineerData[i];
    if (row[8] === 'Approved') { // Only migrate approved entries
      const employee = {
        name: row[2], // Engineer Name
        role: 'SITE_ENGINEER',
        email: row[1], // Submitter Email
        contactNumber: row[4], // Contact Number
        whatsappNumber: '', // Not available in engineer approvals
        bkashNumber: row[3], // Bkash Number
        nidNo: row[5], // NID No
        status: 'Active',
        legacyId: '', // No legacy ID for engineers
        notes: 'Migrated from Engineer Approvals'
      };
      
      addEmployee(employee);
      migratedCount++;
    }
  }

  // Migrate Retailer Approvals
  const retailerSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.RETAILER_APPROVALS);
  const retailerData = getSheetData(retailerSheet);
  
  for (let i = 1; i < retailerData.length; i++) {
    const row = retailerData[i];
    if (row[7] === 'Approved') { // Only migrate approved entries
      const employee = {
        name: row[2], // Retailer Name
        role: 'RETAILER',
        email: row[1], // Submitter Email
        contactNumber: row[3], // Contact Number
        whatsappNumber: '', // Not available in retailer approvals
        bkashNumber: '', // Not available in retailer approvals
        nidNo: row[4], // NID No
        status: 'Active',
        legacyId: '', // No legacy ID for retailers
        notes: 'Migrated from Retailer Approvals'
      };
      
      addEmployee(employee);
      migratedCount++;
    }
  }

  ui.alert('Migration Complete', `Successfully migrated ${migratedCount} employees to the new system.`, ui.ButtonSet.OK);
  Logger.log(`Migration completed. ${migratedCount} employees migrated.`);
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
