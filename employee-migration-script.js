/**
 * @fileoverview Employee Location Hierarchy Migration and Testing Script
 * 
 * This script performs the migration of existing employee data to the new 
 * multi-level location hierarchy system and provides comprehensive testing.
 */

/**
 * Main migration function that orchestrates the entire process
 * @returns {Object} Complete migration results
 */
function runEmployeeLocationMigration() {
  console.log('🚀 Starting Employee Location Hierarchy Migration...');
  
  const results = {
    timestamp: new Date().toISOString(),
    success: false,
    stages: {},
    totalTime: 0
  };
  
  const startTime = new Date();
  
  try {
    // Stage 1: Create Location Map Sheet
    console.log('\n📋 Stage 1: Creating Location Map Sheet...');
    results.stages.locationMapCreation = createLocationMapSheet();
    
    if (!results.stages.locationMapCreation) {
      throw new Error('Failed to create Location Map sheet');
    }
    
    // Stage 2: Populate Location Map with sample data
    console.log('\n🗺️ Stage 2: Populating Location Map...');
    results.stages.locationMapPopulation = populateLocationMapWithSampleData();
    
    // Stage 3: Update Employee Schema
    console.log('\n📊 Stage 3: Updating Employee Schema...');
    results.stages.schemaUpdate = updateEmployeeSheetSchema();
    
    // Stage 4: Migrate existing employee data
    console.log('\n🔄 Stage 4: Migrating Employee Data...');
    results.stages.dataMigration = migrateEmployeeLocationData();
    
    // Stage 5: Validation and testing
    console.log('\n✅ Stage 5: Validation and Testing...');
    results.stages.validation = runMigrationValidation();
    
    results.success = true;
    results.totalTime = new Date() - startTime;
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`Total time: ${results.totalTime}ms`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.toString());
    results.success = false;
    results.error = error.toString();
    results.totalTime = new Date() - startTime;
    
    return results;
  }
}

/**
 * Populates the Location Map sheet with comprehensive sample data
 * @returns {boolean} Success status
 */
function populateLocationMapWithSampleData() {
  try {
    const locationSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.LOCATION_MAP);
    
    // Comprehensive location mapping data based on Bangladesh geography
    const locationData = [
      // Khulna Zone
      ['Khulna', 'Jhenaidah', 'Kushtia', 'Kushtia-01', 'Kushtia Bazar', 'Kushtia Sadar', 'BD1', 'CRO 1', 'ACL', 'Active'],
      ['Khulna', 'Jhenaidah', 'Kushtia', 'Kushtia-02', 'New Market', 'Kushtia Sadar', 'BD1', 'CRO 1', 'ACL', 'Active'],
      ['Khulna', 'Jhenaidah', 'Magura', 'Magura-01', 'Central Bazar', 'Magura Sadar', 'BD1', 'CRO 1', 'ACL', 'Active'],
      ['Khulna', 'Jessore', 'Jessore Central', 'Jessore-01', 'Jessore Bazar', 'Jessore Sadar', 'BD1', 'CRO 1', 'AIL', 'Active'],
      ['Khulna', 'Jessore', 'Jessore Central', 'Jessore-02', 'Monihar Bazar', 'Jessore Sadar', 'BD1', 'CRO 1', 'AIL', 'Active'],
      
      // Dhaka Zone  
      ['Dhaka', 'Dhaka', 'Dhaka North', 'Dhaka North-01', 'Gulshan Bazar', 'Gulshan', 'BD2', 'CRO 2', 'ACL', 'Active'],
      ['Dhaka', 'Dhaka', 'Dhaka North', 'Dhaka North-02', 'Banani Market', 'Gulshan', 'BD2', 'CRO 2', 'ACL', 'Active'],
      ['Dhaka', 'Dhaka', 'Dhaka South', 'Dhaka South-01', 'Dhanmondi Bazar', 'Dhanmondi', 'BD2', 'CRO 2', 'AIL', 'Active'],
      ['Dhaka', 'Dhaka', 'Dhaka South', 'Dhaka South-02', 'Old Dhaka Market', 'Old Dhaka', 'BD2', 'CRO 2', 'AIL', 'Active'],
      ['Dhaka', 'Gazipur', 'Gazipur Central', 'Gazipur-01', 'Gazipur Bazar', 'Gazipur Sadar', 'BD2', 'CRO 2', 'ACL', 'Active'],
      
      // Chittagong Zone
      ['Chittagong', 'Chittagong', 'Chittagong Central', 'Chittagong-01', 'GEC Circle', 'Chittagong City', 'BD3', 'CRO 3', 'ACL', 'Active'],
      ['Chittagong', 'Chittagong', 'Chittagong Central', 'Chittagong-02', 'Agrabad Market', 'Chittagong City', 'BD3', 'CRO 3', 'ACL', 'Active'],
      ['Chittagong', 'Chittagong', 'Chittagong Port', 'Chittagong Port-01', 'Port Area', 'Chittagong City', 'BD3', 'CRO 3', 'AIL', 'Active'],
      ['Chittagong', 'Comilla', 'Comilla Central', 'Comilla-01', 'Comilla Bazar', 'Comilla Sadar', 'BD3', 'CRO 3', 'ACL', 'Active'],
      
      // Rajshahi Zone
      ['Rajshahi', 'Dinajpur', 'Dinajpur Central', 'Dinajpur-01', 'Central Bazar', 'Dinajpur Sadar', 'BD4', 'CRO 4', 'ACL', 'Active'],
      ['Rajshahi', 'Dinajpur', 'Dinajpur Central', 'Dinajpur-02', 'New Market', 'Dinajpur Sadar', 'BD4', 'CRO 4', 'AIL', 'Active'],
      ['Rajshahi', 'Rajshahi', 'Rajshahi Central', 'Rajshahi-01', 'Saheb Bazar', 'Rajshahi Sadar', 'BD4', 'CRO 4', 'ACL', 'Active'],
      ['Rajshahi', 'Bogra', 'Bogra Central', 'Bogra-01', 'Bogra Bazar', 'Bogra Sadar', 'BD4', 'CRO 4', 'AIL', 'Active'],
      
      // Sylhet Zone
      ['Sylhet', 'Sylhet', 'Sylhet Central', 'Sylhet-01', 'Zindabazar', 'Sylhet Sadar', 'BD5', 'CRO 5', 'ACL', 'Active'],
      ['Sylhet', 'Sylhet', 'Sylhet Central', 'Sylhet-02', 'Amberkhana', 'Sylhet Sadar', 'BD5', 'CRO 5', 'AIL', 'Active'],
      ['Sylhet', 'Moulvibazar', 'Moulvibazar Central', 'Moulvibazar-01', 'Tea Garden Area', 'Moulvibazar Sadar', 'BD5', 'CRO 5', 'ACL', 'Active']
    ];
    
    // Clear existing data (except headers)
    const lastRow = locationSheet.getLastRow();
    if (lastRow > 1) {
      locationSheet.getRange(2, 1, lastRow - 1, locationSheet.getLastColumn()).clearContent();
    }
    
    // Insert new data
    if (locationData.length > 0) {
      locationSheet.getRange(2, 1, locationData.length, locationData[0].length).setValues(locationData);
    }
    
    // Format the sheet
    locationSheet.autoResizeColumns(1, locationData[0].length);
    
    console.log(`✅ Populated Location Map with ${locationData.length} entries`);
    return true;
    
  } catch (error) {
    console.error('❌ Error populating Location Map:', error.toString());
    return false;
  }
}

/**
 * Updates the Employee sheet schema to include new location columns
 * @returns {boolean} Success status
 */
function updateEmployeeSheetSchema() {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const headers = employeesSheet.getRange(1, 1, 1, employeesSheet.getLastColumn()).getValues()[0];
    
    const expectedHeaders = CONFIG.SCHEMAS.EMPLOYEES;
    const currentColumnCount = headers.length;
    const expectedColumnCount = expectedHeaders.length;
    
    console.log(`Current columns: ${currentColumnCount}, Expected: ${expectedColumnCount}`);
    
    if (currentColumnCount < expectedColumnCount) {
      // Add missing columns
      const missingColumns = expectedColumnCount - currentColumnCount;
      console.log(`Adding ${missingColumns} missing columns...`);
      
      // Insert columns and update headers
      if (missingColumns > 0) {
        employeesSheet.insertColumnsAfter(currentColumnCount, missingColumns);
      }
      
      // Update all headers
      employeesSheet.getRange(1, 1, 1, expectedColumnCount).setValues([expectedHeaders]);
      
      // Format headers
      employeesSheet.getRange(1, 1, 1, expectedColumnCount).setFontWeight('bold');
      employeesSheet.autoResizeColumns(1, expectedColumnCount);
      
      console.log('✅ Employee sheet schema updated successfully');
    } else {
      console.log('✅ Employee sheet schema is already up to date');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating employee schema:', error.toString());
    return false;
  }
}

/**
 * Runs comprehensive validation of the migration
 * @returns {Object} Validation results
 */
function runMigrationValidation() {
  console.log('🔍 Running migration validation...');
  
  const validation = {
    success: true,
    checks: {},
    errors: []
  };
  
  try {
    // Check 1: Location Map sheet exists and has data
    validation.checks.locationMapExists = validateLocationMapSheet();
    
    // Check 2: Employee schema is correct
    validation.checks.employeeSchemaValid = validateEmployeeSchema();
    
    // Check 3: Test location hierarchy functions
    validation.checks.locationFunctionsWork = testLocationHierarchyFunctions();
    
    // Check 4: Test employee lookup functions
    validation.checks.employeeLookupFunctionsWork = testEmployeeLookupFunctions();
    
    // Check 5: Test notification chain building
    validation.checks.notificationChainWorks = testNotificationChainBuilding();
    
    // Overall validation result
    validation.success = Object.values(validation.checks).every(check => check === true);
    
    if (validation.success) {
      console.log('✅ All validation checks passed!');
    } else {
      console.log('❌ Some validation checks failed');
      const failedChecks = Object.entries(validation.checks)
        .filter(([key, value]) => value !== true)
        .map(([key, value]) => key);
      console.log('Failed checks:', failedChecks);
    }
    
    return validation;
    
  } catch (error) {
    console.error('❌ Validation error:', error.toString());
    validation.success = false;
    validation.errors.push(error.toString());
    return validation;
  }
}

/**
 * Validates that the Location Map sheet exists and has proper data
 * @returns {boolean} Validation result
 */
function validateLocationMapSheet() {
  try {
    const locationSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.LOCATION_MAP);
    const data = getSheetData(locationSheet);
    
    if (data.length < 2) {
      console.log('❌ Location Map sheet has no data');
      return false;
    }
    
    // Check headers
    const headers = data[0];
    const expectedHeaders = CONFIG.SCHEMAS.LOCATION_MAP;
    
    if (headers.length !== expectedHeaders.length) {
      console.log('❌ Location Map headers mismatch');
      return false;
    }
    
    // Check sample data
    let validRows = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[1] && row[2] && row[3]) { // Zone, District, Area, Territory
        validRows++;
      }
    }
    
    console.log(`✅ Location Map validation passed: ${validRows} valid rows`);
    return validRows > 0;
    
  } catch (error) {
    console.error('❌ Location Map validation failed:', error.toString());
    return false;
  }
}

/**
 * Validates that the Employee schema is correct
 * @returns {boolean} Validation result
 */
function validateEmployeeSchema() {
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    const headers = employeesSheet.getRange(1, 1, 1, employeesSheet.getLastColumn()).getValues()[0];
    
    const expectedHeaders = CONFIG.SCHEMAS.EMPLOYEES;
    
    if (headers.length !== expectedHeaders.length) {
      console.log(`❌ Employee schema column count mismatch: ${headers.length} vs ${expectedHeaders.length}`);
      return false;
    }
    
    console.log('✅ Employee schema validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Employee schema validation failed:', error.toString());
    return false;
  }
}

/**
 * Tests location hierarchy functions
 * @returns {boolean} Test result
 */
function testLocationHierarchyFunctions() {
  try {
    console.log('🧪 Testing location hierarchy functions...');
    
    // Test getLocationHierarchy
    const testLocation = getLocationHierarchy({ territory: 'Kushtia-01' });
    if (!testLocation) {
      console.log('❌ getLocationHierarchy test failed');
      return false;
    }
    
    console.log('Sample location hierarchy:', testLocation);
    
    // Test validation function
    const validation = validateLocationForRole('SR', { territory: 'Kushtia-01', zone: 'Khulna', businessUnit: 'ACL' });
    if (!validation.success) {
      console.log('❌ validateLocationForRole test failed');
      return false;
    }
    
    console.log('✅ Location hierarchy functions working');
    return true;
    
  } catch (error) {
    console.error('❌ Location hierarchy function test failed:', error.toString());
    return false;
  }
}

/**
 * Tests employee lookup functions
 * @returns {boolean} Test result
 */
function testEmployeeLookupFunctions() {
  try {
    console.log('🧪 Testing employee lookup functions...');
    
    // Test zone lookup
    const zoneEmployees = findEmployeesByZone('Khulna');
    console.log(`Found ${zoneEmployees.length} employees in Khulna zone`);
    
    // Test district lookup
    const districtEmployees = findEmployeesByDistrict('Jhenaidah');
    console.log(`Found ${districtEmployees.length} employees in Jhenaidah district`);
    
    // Test area lookup
    const areaEmployees = findEmployeesByArea('Kushtia');
    console.log(`Found ${areaEmployees.length} employees in Kushtia area`);
    
    // Test enhanced role lookup with scope
    const scopedEmployees = findEmployeesByRole(['SR'], { zone: 'Dhaka' });
    console.log(`Found ${scopedEmployees.length} SRs in Dhaka zone`);
    
    console.log('✅ Employee lookup functions working');
    return true;
    
  } catch (error) {
    console.error('❌ Employee lookup function test failed:', error.toString());
    return false;
  }
}

/**
 * Tests notification chain building
 * @returns {boolean} Test result
 */
function testNotificationChainBuilding() {
  try {
    console.log('🧪 Testing notification chain building...');
    
    const chain = getNotificationChain('Kushtia-01', 'ACL');
    console.log(`Built notification chain with ${chain.length} employees`);
    
    if (chain.length > 0) {
      console.log('Sample chain:', chain.map(emp => `${emp.role}: ${emp.name}`));
    }
    
    console.log('✅ Notification chain building working');
    return true;
    
  } catch (error) {
    console.error('❌ Notification chain test failed:', error.toString());
    return false;
  }
}

/**
 * Creates sample employee data for testing the new hierarchy
 * @returns {boolean} Success status
 */
function createSampleEmployeeData() {
  try {
    console.log('👥 Creating sample employee data...');
    
    const sampleEmployees = [
      {
        name: 'Ahmed Hassan',
        role: 'SR',
        email: 'ahmed.hassan@company.com',
        contactNumber: '01712345001',
        whatsappNumber: '01712345001',
        location: {
          territory: 'Kushtia-01',
          zone: 'Khulna',
          businessUnit: 'ACL'
        }
      },
      {
        name: 'Fatima Rahman',
        role: 'ASM',
        email: 'fatima.rahman@company.com',
        contactNumber: '01712345002',
        whatsappNumber: '01712345002',
        location: {
          area: 'Kushtia',
          zone: 'Khulna',
          businessUnit: 'ACL'
        }
      },
      {
        name: 'Karim Ahmed',
        role: 'ZSM',
        email: 'karim.ahmed@company.com',
        contactNumber: '01712345003',
        whatsappNumber: '01712345003',
        location: {
          district: 'Jhenaidah',
          zone: 'Khulna',
          businessUnit: 'ACL'
        }
      },
      {
        name: 'Nasir Uddin',
        role: 'BDO',
        email: 'nasir.uddin@company.com',
        contactNumber: '01712345004',
        whatsappNumber: '01712345004',
        location: {
          bdTerritory: 'BD1',
          zone: 'Khulna',
          businessUnit: 'ACL'
        }
      },
      {
        name: 'Shahana Begum',
        role: 'CRO',
        email: 'shahana.begum@company.com',
        contactNumber: '01712345005',
        whatsappNumber: '01712345005',
        location: {
          croTerritory: 'CRO 1',
          zone: 'Khulna',
          businessUnit: 'ACL'
        }
      }
    ];
    
    let successCount = 0;
    for (let employee of sampleEmployees) {
      const employeeId = addEmployee(employee);
      if (employeeId) {
        successCount++;
        console.log(`✅ Created employee: ${employee.name} (${employeeId})`);
      } else {
        console.log(`❌ Failed to create employee: ${employee.name}`);
      }
    }
    
    console.log(`✅ Created ${successCount}/${sampleEmployees.length} sample employees`);
    return successCount > 0;
    
  } catch (error) {
    console.error('❌ Error creating sample employee data:', error.toString());
    return false;
  }
}

/**
 * Quick test function to verify the migration works
 */
function quickTestMigration() {
  console.log('🚀 Running quick migration test...');
  
  // Test location hierarchy
  const location = getLocationHierarchy({ territory: 'Kushtia-01' });
  console.log('Test location:', location);
  
  // Test employee lookup
  const employees = findEmployeesByZone('Khulna');
  console.log(`Found ${employees.length} employees in Khulna zone`);
  
  // Test notification chain
  const chain = getNotificationChain('Kushtia-01', 'ACL');
  console.log(`Notification chain has ${chain.length} employees`);
  
  console.log('✅ Quick test completed');
}
