/**
 * @fileoverview Employee Location Hierarchy Management System
 * 
 * This module handles the multi-level geographic hierarchy for employee management:
 * Zone → District → Area → Territory → Bazaar/Upazilla → BD Territory/CRO Territory
 * 
 * Key Features:
 * - Location validation and auto-fill
 * - Hierarchical employee lookups
 * - Role-to-location mapping enforcement
 * - Migration support for existing data
 */

/**
 * Gets the complete location hierarchy for validation and auto-fill
 * @param {Object} locationInput - Partial location data
 * @returns {Object} Complete location hierarchy or null if invalid
 */
function getLocationHierarchy(locationInput) {
  try {
    const locationSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.LOCATION_MAP);
    const data = getSheetData(locationSheet);
    
    // Find matching location entry based on provided input
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const locationEntry = {
        zone: row[0],
        district: row[1], 
        area: row[2],
        territory: row[3],
        bazaar: row[4],
        upazilla: row[5],
        bdTerritory: row[6],
        croTerritory: row[7],
        businessUnit: row[8],
        status: row[9]
      };
      
      // Check if this entry matches the input criteria
      if (matchesLocationCriteria(locationEntry, locationInput)) {
        return locationEntry;
      }
    }
    
    Logger.log(`No location hierarchy found for input: ${JSON.stringify(locationInput)}`);
    return null;
    
  } catch (error) {
    Logger.log(`Error getting location hierarchy: ${error.toString()}`);
    return null;
  }
}

/**
 * Checks if a location entry matches the input criteria
 * @param {Object} locationEntry - Complete location entry from LOCATION_MAP
 * @param {Object} locationInput - Partial input to match against
 * @returns {boolean} True if matches
 */
function matchesLocationCriteria(locationEntry, locationInput) {
  const criteria = [
    'zone', 'district', 'area', 'territory', 'bazaar', 'upazilla', 
    'bdTerritory', 'croTerritory', 'businessUnit'
  ];
  
  for (let criterion of criteria) {
    if (locationInput[criterion] && 
        locationEntry[criterion] && 
        locationEntry[criterion].toLowerCase() !== locationInput[criterion].toLowerCase()) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates location requirements for a specific employee role
 * @param {string} role - Employee role (SR, ASM, ZSM, BDO, CRO)
 * @param {Object} location - Location data to validate
 * @returns {Object} Validation result with success flag and messages
 */
function validateLocationForRole(role, location) {
  const validation = { success: true, messages: [] };
  
  // Define role-specific location requirements
  const roleRequirements = {
    'SR': ['territory'],
    'ASM': ['area'],
    'ZSM': ['district'], 
    'BDO': ['bdTerritory'],
    'CRO': ['croTerritory']
  };
  
  const requirements = roleRequirements[role];
  if (!requirements) {
    validation.success = false;
    validation.messages.push(`Unknown role: ${role}`);
    return validation;
  }
  
  // Check required fields for the role
  for (let requirement of requirements) {
    if (!location[requirement]) {
      validation.success = false;
      validation.messages.push(`${role} requires ${requirement} to be specified`);
    }
  }
  
  // Additional validation: All roles require zone and business unit
  if (!location.zone) {
    validation.success = false;
    validation.messages.push(`All employees require zone to be specified`);
  }
  
  if (!location.businessUnit) {
    validation.success = false;
    validation.messages.push(`All employees require business unit (ACL/AIL) to be specified`);
  }
  
  return validation;
}

/**
 * Enhanced employee lookup by area
 * @param {string} area - Area name to search for
 * @param {Array} roles - Optional array of roles to filter by
 * @returns {Array} Array of employee objects in the area
 */
function findEmployeesByArea(area, roles = []) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Check both old area field (index 12) and new area field (index 15)
      const oldArea = row[12];
      const newArea = row[15];
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && 
          (oldArea === area || newArea === area) &&
          (roles.length === 0 || roles.includes(employeeRole))) {
        
        employees.push(createEmployeeObject(row));
      }
    }
    
    Logger.log(`Found ${employees.length} employees in area: ${area}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by area: ${error.toString()}`);
    return [];
  }
}

/**
 * Enhanced employee lookup by district
 * @param {string} district - District name to search for
 * @param {Array} roles - Optional array of roles to filter by
 * @returns {Array} Array of employee objects in the district
 */
function findEmployeesByDistrict(district, roles = []) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeDistrict = row[14]; // New district field
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && 
          employeeDistrict === district &&
          (roles.length === 0 || roles.includes(employeeRole))) {
        
        employees.push(createEmployeeObject(row));
      }
    }
    
    Logger.log(`Found ${employees.length} employees in district: ${district}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by district: ${error.toString()}`);
    return [];
  }
}

/**
 * Enhanced employee lookup by zone
 * @param {string} zone - Zone name to search for
 * @param {Array} roles - Optional array of roles to filter by
 * @returns {Array} Array of employee objects in the zone
 */
function findEmployeesByZone(zone, roles = []) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeZone = row[13]; // New zone field
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && 
          employeeZone === zone &&
          (roles.length === 0 || roles.includes(employeeRole))) {
        
        employees.push(createEmployeeObject(row));
      }
    }
    
    Logger.log(`Found ${employees.length} employees in zone: ${zone}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by zone: ${error.toString()}`);
    return [];
  }
}

/**
 * Enhanced employee lookup by BD Territory
 * @param {string} bdTerritory - BD Territory to search for
 * @param {Array} roles - Optional array of roles to filter by
 * @returns {Array} Array of employee objects in the BD Territory
 */
function findEmployeesByBDTerritory(bdTerritory, roles = []) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeBDTerritory = row[19]; // BD Territory field
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && 
          employeeBDTerritory === bdTerritory &&
          (roles.length === 0 || roles.includes(employeeRole))) {
        
        employees.push(createEmployeeObject(row));
      }
    }
    
    Logger.log(`Found ${employees.length} employees in BD Territory: ${bdTerritory}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by BD Territory: ${error.toString()}`);
    return [];
  }
}

/**
 * Enhanced employee lookup by CRO Territory
 * @param {string} croTerritory - CRO Territory to search for
 * @param {Array} roles - Optional array of roles to filter by
 * @returns {Array} Array of employee objects in the CRO Territory
 */
function findEmployeesByCROTerritory(croTerritory, roles = []) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeCROTerritory = row[20]; // CRO Territory field
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && 
          employeeCROTerritory === croTerritory &&
          (roles.length === 0 || roles.includes(employeeRole))) {
        
        employees.push(createEmployeeObject(row));
      }
    }
    
    Logger.log(`Found ${employees.length} employees in CRO Territory: ${croTerritory}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by CRO Territory: ${error.toString()}`);
    return [];
  }
}

/**
 * Enhanced findEmployeesByRole with location scope filtering
 * @param {Array} roles - Array of roles to search for
 * @param {Object} scope - Optional location scope filter
 * @returns {Array} Array of employee objects matching criteria
 */
function findEmployeesByRole(roles, scope = {}) {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    const employees = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeRole = row[2];
      const status = row[8];
      
      if (status === 'Active' && roles.includes(employeeRole)) {
        const employee = createEmployeeObject(row);
        
        // Apply scope filtering if provided
        if (isEmployeeInScope(employee, scope)) {
          employees.push(employee);
        }
      }
    }
    
    Logger.log(`Found ${employees.length} employees with roles: ${roles.join(', ')} and scope: ${JSON.stringify(scope)}`);
    return employees;
    
  } catch (error) {
    Logger.log(`Error finding employees by role: ${error.toString()}`);
    return [];
  }
}

/**
 * Checks if an employee matches the provided location scope
 * @param {Object} employee - Employee object
 * @param {Object} scope - Location scope criteria
 * @returns {boolean} True if employee matches scope
 */
function isEmployeeInScope(employee, scope) {
  if (!scope || Object.keys(scope).length === 0) {
    return true; // No scope specified, include all
  }
  
  const scopeCriteria = {
    zone: scope.zone,
    district: scope.district,
    area: scope.area || scope.newArea,
    territory: scope.territory || scope.newTerritory,
    bdTerritory: scope.bdTerritory,
    croTerritory: scope.croTerritory,
    businessUnit: scope.businessUnit
  };
  
  for (let [key, value] of Object.entries(scopeCriteria)) {
    if (value && employee[key] && employee[key] !== value) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates an employee object from a data row with enhanced location fields
 * @param {Array} row - Employee data row
 * @returns {Object} Employee object
 */
function createEmployeeObject(row) {
  return {
    id: row[0],
    name: row[1],
    role: row[2],
    email: row[3],
    contactNumber: row[4],
    whatsappNumber: row[5],
    bkashNumber: row[6],
    nidNo: row[7],
    status: row[8],
    hireDate: row[9],
    company: row[10],
    territory: row[11], // Legacy territory field
    area: row[12], // Legacy area field
    zone: row[13], // New zone field
    district: row[14], // New district field
    newArea: row[15], // New area field
    newTerritory: row[16], // New territory field
    bazaar: row[17], // Bazaar field
    upazilla: row[18], // Upazilla field
    bdTerritory: row[19], // BD Territory field
    croTerritory: row[20], // CRO Territory field
    businessUnit: row[21], // Business Unit field
    legacyId: row[22], // Legacy ID field
    notes: row[23] // Notes field
  };
}

/**
 * Gets notification chain for hierarchical routing
 * @param {string} territory - Territory or area identifier
 * @param {string} businessUnit - Business unit (ACL/AIL)
 * @returns {Array} Array of employees in notification hierarchy
 */
function getNotificationChain(territory, businessUnit) {
  try {
    const chain = [];
    
    // Find location hierarchy first
    const locationHierarchy = getLocationHierarchy({ territory: territory });
    if (!locationHierarchy) {
      Logger.log(`No location hierarchy found for territory: ${territory}`);
      return chain;
    }
    
    // SR level (Territory)
    const srs = findEmployeesByRole(['SR'], { 
      newTerritory: territory, 
      businessUnit: businessUnit 
    });
    chain.push(...srs);
    
    // ASM level (Area)
    const asms = findEmployeesByArea(locationHierarchy.area, ['ASM']);
    chain.push(...asms);
    
    // ZSM level (District)
    const zsms = findEmployeesByDistrict(locationHierarchy.district, ['ZSM']);
    chain.push(...zsms);
    
    // BDO level (BD Territory)
    const bdos = findEmployeesByBDTerritory(locationHierarchy.bdTerritory, ['BDO']);
    chain.push(...bdos);
    
    // CRO level (CRO Territory)
    const cros = findEmployeesByCROTerritory(locationHierarchy.croTerritory, ['CRO']);
    chain.push(...cros);
    
    Logger.log(`Built notification chain with ${chain.length} employees for territory: ${territory}`);
    return chain;
    
  } catch (error) {
    Logger.log(`Error building notification chain: ${error.toString()}`);
    return [];
  }
}

/**
 * Creates the LOCATION_MAP sheet with initial data structure
 * @returns {boolean} Success status
 */
function createLocationMapSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
    
    // Check if sheet already exists
    let locationSheet = null;
    try {
      locationSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOCATION_MAP);
      Logger.log('LOCATION_MAP sheet already exists');
      return true;
    } catch (e) {
      // Sheet doesn't exist, create it
      locationSheet = ss.insertSheet(CONFIG.SHEET_NAMES.LOCATION_MAP);
    }
    
    // Set up headers
    const headers = CONFIG.SCHEMAS.LOCATION_MAP;
    locationSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add sample data structure (to be populated by migration script)
    const sampleData = [
      ['Khulna', 'Jhenaidah', 'Kushtia', 'Kushtia-01', 'Kushtia Bazar', 'Kushtia Sadar', 'BD1', 'CRO 1', 'ACL', 'Active'],
      ['Khulna', 'Jhenaidah', 'Kushtia', 'Kushtia-02', 'New Market', 'Kushtia Sadar', 'BD1', 'CRO 1', 'ACL', 'Active'],
      ['Dhaka', 'Dinajpur', 'Dinajpur Central', 'Dinajpur-01', 'Central Bazar', 'Dinajpur Sadar', 'BD2', 'CRO 2', 'AIL', 'Active']
    ];
    
    locationSheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
    
    // Format the sheet
    locationSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    locationSheet.autoResizeColumns(1, headers.length);
    
    Logger.log('LOCATION_MAP sheet created successfully');
    return true;
    
  } catch (error) {
    Logger.log(`Error creating LOCATION_MAP sheet: ${error.toString()}`);
    return false;
  }
}

/**
 * Migration script to populate new location fields for existing employees
 * @returns {Object} Migration results
 */
function migrateEmployeeLocationData() {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const data = getSheetData(employeesSheet);
    
    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 1; i < data.length; i++) {
      try {
        const row = data[i];
        const legacyTerritory = row[11]; // Old territory field
        const legacyArea = row[12]; // Old area field
        
        if (legacyTerritory) {
          // Try to find location hierarchy for this territory
          const locationHierarchy = getLocationHierarchy({ territory: legacyTerritory });
          
          if (locationHierarchy) {
            // Update the row with new location data
            row[13] = locationHierarchy.zone; // Zone
            row[14] = locationHierarchy.district; // District
            row[15] = locationHierarchy.area; // New Area
            row[16] = locationHierarchy.territory; // New Territory
            row[17] = locationHierarchy.bazaar; // Bazaar
            row[18] = locationHierarchy.upazilla; // Upazilla
            row[19] = locationHierarchy.bdTerritory; // BD Territory
            row[20] = locationHierarchy.croTerritory; // CRO Territory
            row[21] = locationHierarchy.businessUnit; // Business Unit
            
            migratedCount++;
          } else {
            // Create default mapping for unknown territories
            row[13] = 'Unknown Zone'; // Zone
            row[14] = 'Unknown District'; // District
            row[15] = legacyArea || 'Unknown Area'; // New Area
            row[16] = legacyTerritory; // New Territory
            row[21] = row[10] || 'ACL'; // Business Unit from company field
            
            migratedCount++;
          }
        }
      } catch (rowError) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${rowError.toString()}`);
      }
    }
    
    // Write back the updated data
    if (migratedCount > 0) {
      employeesSheet.getRange(2, 1, data.length - 1, data[0].length).setValues(data.slice(1));
    }
    
    const result = {
      success: true,
      migratedCount: migratedCount,
      errorCount: errorCount,
      errors: errors,
      totalRows: data.length - 1
    };
    
    Logger.log(`Migration completed: ${migratedCount} rows migrated, ${errorCount} errors`);
    return result;
    
  } catch (error) {
    Logger.log(`Migration failed: ${error.toString()}`);
    return {
      success: false,
      error: error.toString(),
      migratedCount: 0,
      errorCount: 0,
      errors: [],
      totalRows: 0
    };
  }
}
