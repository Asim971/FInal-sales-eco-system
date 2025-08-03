/**
 * @fileoverview Employee Thakurgoan Territory Update Script
 * 
 * This script manages the assignment of Thakurgoan territory employees with
 * geographical hierarchy and team-based role assignments.
 * 
 * Features:
 * - Thakurgoan geographical data management
 * - Employee team creation (BDO, CRO, SR, ASM)
 * - Territory assignment and validation
 * - Integration with existing employee location hierarchy
 * 
 * LATEST UPDATE: August 3, 2025 - Thakurgoan Territory Implementation
 */

/**
 * Thakurgoan geographical data structure
 */
const THAKURGOAN_GEOGRAPHICAL_DATA = {
  district: 'Thakurgoan',
  territory: 'Thakurgoan',
  upazillas: {
    'Baliadangi': [
      'Boder hat', 'Bottole', 'Jawnia', 'Holdibari', 'Kachkhali', 'Dogachi', 'Velajan',
      'Dehon', 'Molani', 'Horinmari', 'Milteg', 'Madrasa Bazar', 'Choto Lahiri',
      'Balia Bazar', 'Dhonir hat', 'Camper hat', 'Gandhigiri', 'Ansar Hat', 'Lohagora',
      'Idiyal', 'Morol hat', 'Dangi Bazar', 'Khalipur', 'Kalomegh', 'Moharaja',
      'Paria', 'Bhawlar hat', 'Baliadangi', 'Churangi', 'Badambari', 'Raymahal',
      'Adhardighi', 'Daluya', 'Lahiri', 'Mohajon hat', 'School Hat', 'Surmar Hat',
      'Vaccant_Thakurgaon'
    ],
    'Horipur': [
      'Masangao Bazar', 'Jadurani', 'Takituki', 'Horipur Bazar', 'Kataldangi bazar',
      'Ratnagor bazar', 'Chowrongi', 'Kalitola Bazar', 'Hazimor', 'Dirgonj'
    ],
    'Pirgonj': [
      'Ronsia', 'Lohagara', 'Jongao', 'Fatarhat', 'Khotsinga', 'Sibgonj', 'Bordhat',
      'Jaborhat', 'Godagari', 'Pirgonj', 'Futkibari', 'Chondoriya', 'Chourongi',
      'Borchuna', 'Kalopir', 'Kornai'
    ],
    'Ranishonkoil': [
      'Bonga', 'Khotiatoli', 'Gazirhat', 'Bolidara', 'Ranisankail', 'Kotsinga',
      'Birashi Bazar', 'Katihar bazaar', 'Gogor bazar', 'Nekmorod', 'Futani bazar',
      'Rampur', 'Banglagor', 'Omradangi Bazar', 'Mirdangi'
    ],
    'Ruhia': [
      'Boiragi', 'Uttara bazar', 'Gobindopur', 'Doluyapara', 'Chuyamuni', 'khoribari',
      'Polasbangla', 'Ramnat', 'Gun Jura', 'kanikasalgha', 'Hobidoni', 'kartiktola',
      'Monglumarket', 'khochabari', 'Malibagh Rampur', 'Ruhia Bazar', 'Mohespur',
      'Velarhat', 'Modupur', 'Gunimohespur', 'Baristar', 'Rajagha', 'khujisohor',
      'Dolarhat', 'Akhanagor', 'Rajarampur', 'Senihari', 'kakoli', 'Bodessori',
      'Madebpur', 'kornofuli', 'Badiyamarket', 'Patiyadangi', 'Molankhori',
      'kalitola', 'kalibari'
    ],
    'Thakurgoan Sadar': [
      'Borunagw', 'Bagarhat', 'Mohasali', 'Turukpatha', 'Amtoli', 'Nargun',
      'Munsirhat', 'Sibgonj', 'Goreya', 'Kalitola', 'Madargonj', 'Salondor',
      'Vulli', 'Razapukur', 'Farabari', 'Lokkirhat', 'Bordoffice', 'Roadbazar',
      'Chyradangi', 'Khochabari', 'Besic', 'Gopalpur', 'Puraton', 'Dhanarhat',
      'Thakurgaon', 'Bashati'
    ]
  }
};

/**
 * Employee data for Thakurgoan territory
 */
const THAKURGOAN_EMPLOYEES = [
  // Primary employee list
  { name: 'Sohel Rana (Test)', email: 'hiphensohel@gmail.com', whatsapp: '8801722400889' },
  { name: 'Md.Wahiduzzaman', email: 'wahiduzzaman2@anwargroup.net', whatsapp: '8801711302462' },
  { name: 'MD.AKKACH KHAN', email: 'md.khana8@gmail.com', whatsapp: '8801736725658' },
  { name: 'Md. Nasir Uddin', email: 'nasiruddindc1990@gmail.com', whatsapp: '8801990408719' },
  { name: 'Md. Asaduzzaman', email: 'asaduzzaman1971@gmail.com', whatsapp: '8801818072575' },
  { name: 'Zobayer Al Amin', email: 'zobayeraminec@gmail.com', whatsapp: '8801911231844' },
  { name: 'MD. Al - Amin', email: 'alamiraraza@gmail.com', whatsapp: '8801731353652' },
  { name: 'MD SHA JAMIL SHIKDER', email: 'ShaJamil57@gmail.com', whatsapp: '8801401133391' },
  { name: 'Mohammad Jahedul islam', email: 'jahedulislam2001@gmail.com', whatsapp: '8801990408702' },
  { name: 'Md. Mohsin', email: 'mohsinmridha72@gmail.com', whatsapp: '8801990408004' },
  { name: 'Md.Akhteruzzaman Kamal', email: 'akteruzzamankamal76@gmail.com', whatsapp: '8801973091228' },
  { name: 'Sk. Riad- Al Mahmud', email: 'riadshemin@gmail.com', whatsapp: '8801711010777' },
  { name: 'Md.Masud Karim', email: 'msaudkarim@gmail.com', whatsapp: '8801722944919' },
  { name: 'Md. Ratan Mian', email: 'rtnmian@gmail.com', whatsapp: '8801711934101' },
  { name: 'Md.Nazmul Haque', email: 'nazmulhaque0282@gmail.com', whatsapp: '8801760743366' },
  { name: 'Ripon Kumar Saha', email: 'ripon.saha1974@gmail.com', whatsapp: '8801990408065' },
  { name: 'Md.Samaun haque', email: 'samaun1761@gmail.com', whatsapp: '8801973091233' },
  { name: 'Md. Mahbubur Rahman', email: 'mahbubjp85@gmail.com', whatsapp: '8801990408042' },
  { name: 'Md. Masud Parvez', email: 'masuddinajpur1977@gmail.com', whatsapp: '8801730940961' },
  { name: 'Md.Al-Amin', email: 'alamin2606@gmail.com', whatsapp: '8801712719232' },
  { name: 'Tohidul Islam Tawheed', email: 'iiuctawheed@gmail.com', whatsapp: '8801710452594' },
  { name: 'Md.Tarikul Islam', email: 'Islamtarikul7168@gmail.com', whatsapp: '8801727817168' },
  { name: 'Md. Aminul Islam', email: 'aaminul3301@gmail.com', whatsapp: '8801737129613' },
  { name: 'Rajib Hossain', email: 'razib.itcbd@gmail.com', whatsapp: '8801740482223' },
  { name: 'Sudip Dutta', email: 'sudipduttadip@gmail.com', whatsapp: '8801728669919' },
  { name: 'Md Robiul Hasan', email: 'md.robiulhasan@yahoo.com', whatsapp: '8801718988788' },
  { name: 'Shek Md Selim', email: 'sk11selim@gmail.com', whatsapp: '8801711307294' },
  { name: 'Md.Moniruzzaman', email: 'monirdp.ail@gmail.com', whatsapp: '8801727448599' },
  { name: 'Mostafizur Rahman', email: 'rmostafizur181@gmail.com', whatsapp: '8801716625363' },
  { name: 'Md. Faruk Hossain', email: 'farukispat81@gmail.com', whatsapp: '8801719098570' },
  { name: 'Mohammad Billal Hossain', email: 'billal.hossain6058@gmail.com', whatsapp: '8801990408141' },
  { name: 'MD Abir Sarwar', email: 'abirsarwarjsr@gmail.com', whatsapp: '8801303558941' },
  { name: 'Md. Sahidul Islam', email: 'greenlota2014@gmail.com', whatsapp: '8801911513111' },
  { name: 'Atiqul Islam', email: 'iatiqul7@gmail.com', whatsapp: '8801745485383' },
  { name: 'Md. Asaduzzaman', email: 'asaduzzamanmd865@gmail.com', whatsapp: '8801722648737' },
  { name: 'Jobair Rahman', email: 'jobairail374@gmail.com', whatsapp: '8801728898089' },
  { name: 'Md. Ashraf', email: 'ashrafispat@gmail.com', whatsapp: '8801990408145' },
  { name: 'Md.Rowshan Alam', email: 'mdrowshanalam66136@gmail.com', whatsapp: '8801712005260' },
  { name: 'Md.Mehidi Hasan', email: 'mehidisohel@gmail.com', whatsapp: '8801718074034' },
  { name: 'Md. Monowar Hossain', email: 'monowaraktd@yahoo.com', whatsapp: '8801813129791' },
  { name: 'Ariful Islam', email: 'arifulrana4@gmail.com', whatsapp: '8801329673704' },
  { name: 'Saiful Islam', email: 'saiful2671992@gmail.com', whatsapp: '8801321218247' },
  { name: 'Md. Abdullah Ibna Jobayer Tamim', email: 'abdullah.ibnajobayer@gmail.com', whatsapp: '8801554252650' },
  { name: 'Muhammad Faruk Hussain', email: 'faruk0701@gmail.com', whatsapp: '8801742095036' },
  { name: 'SM Talim Siddik', email: 'talimsiddik@gmail.com', whatsapp: '8801990408169' },
  { name: 'MD.Mamunur Rashid', email: '39mamun@gmail.com', whatsapp: '8801755688633' },
  { name: 'Mahfuzar Rahman', email: 'mahfuz0622@gmail.com', whatsapp: '8801912871537' },
  { name: 'Razib Ahmed', email: 'ahmedrazib05@gmail.com', whatsapp: '8801611444400' },
  { name: 'Md. Naim Rahman', email: 'naim2sky@gmail.com', whatsapp: '8801321218314' },
  { name: 'Md. Sujon Islam', email: 'sujonislam6556@gmail.com', whatsapp: '8801755688584' },
  { name: 'Md. Nurul Islam', email: 'nislammiraz@gmail.com', whatsapp: '8801711972134' },
  { name: 'Md Akbar Hossain', email: 'akbarhossain8199@gmail.com', whatsapp: '8801813168199' },
  { name: 'Md Jenarul Islam', email: 'jenarul007@gmail.com', whatsapp: '8801767131934' },
  { name: 'Mithun Kumer', email: 'mithun.sales1@gmail.com', whatsapp: '8801717680360' },
  { name: 'Md.Mainul Islam', email: 'mdmithu990@gmail.com', whatsapp: '8801324245264' },
  { name: 'MD Rayhan Hossain', email: 'raihanhossain689@gmail.com', whatsapp: '8801745668717' },
  
  // Additional executive team
  { name: 'Kazi Ahmed', email: 'faiz.ahmed@anwargroup.com', whatsapp: '8801971825788' },
  { name: 'Bushra Tabassum', email: 'bushra.tabassum@anwargroup.com', whatsapp: '8801963556677' },
  { name: 'Lailafin Nahar Tithy', email: 'lailafin.tithy@anwargroup.com', whatsapp: '8801324434510' },
  { name: 'Mohammad Abid Miah', email: 'abid.miah@anwargroup.com', whatsapp: '8801324434613' },
  { name: 'Roknuzzaman Fahim', email: 'roknuzzaman.fahim@anwargroup.com', whatsapp: '8801332554342' },
  { name: 'Farhan Rahat', email: 'farhanshaiket99@gmail.com', whatsapp: '8801332814719' },
  { name: 'Habib Ullah Khan', email: 'munemagi24@gmail.com', whatsapp: '8801329734524' }
];

/**
 * Creates employee teams for Thakurgoan territory
 * Each team consists of 4 employees: 1 BDO, 1 CRO, 1 SR, 1 ASM
 */
function createThakurgaonEmployeeTeams() {
  console.log('🏗️ Creating Thakurgoan Employee Teams...\n');
  
  const totalEmployees = THAKURGOAN_EMPLOYEES.length;
  const employeesPerTeam = 4;
  const totalCompleteTeams = Math.floor(totalEmployees / employeesPerTeam);
  const remainingEmployees = totalEmployees % employeesPerTeam;
  
  console.log(`📊 Team Creation Summary:`);
  console.log(`   Total Employees: ${totalEmployees}`);
  console.log(`   Complete Teams: ${totalCompleteTeams}`);
  console.log(`   Remaining Employees: ${remainingEmployees}`);
  console.log('');
  
  const teams = [];
  const roles = ['BDO', 'CRO', 'SR', 'ASM'];
  
  // Create complete teams
  for (let teamIndex = 0; teamIndex < totalCompleteTeams; teamIndex++) {
    const team = {
      teamId: `THKG-TEAM-${String(teamIndex + 1).padStart(2, '0')}`,
      teamName: `Thakurgoan Team ${teamIndex + 1}`,
      members: []
    };
    
    // Assign roles to team members
    for (let roleIndex = 0; roleIndex < employeesPerTeam; roleIndex++) {
      const employeeIndex = (teamIndex * employeesPerTeam) + roleIndex;
      const employee = THAKURGOAN_EMPLOYEES[employeeIndex];
      const role = roles[roleIndex];
      
      team.members.push({
        ...employee,
        role: role,
        employeeId: generateThakurgaonEmployeeId(role, teamIndex + 1, roleIndex + 1),
        teamId: team.teamId,
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0],
        company: 'Anwar Group',
        territory: 'Thakurgoan',
        district: 'Thakurgoan',
        zone: 'Rangpur',
        businessUnit: 'ACL'
      });
    }
    
    teams.push(team);
  }
  
  // Handle remaining employees (create partial team or individual assignments)
  if (remainingEmployees > 0) {
    console.log(`⚠️ Handling ${remainingEmployees} remaining employees as individual assignments`);
    
    const partialTeam = {
      teamId: `THKG-TEAM-${String(totalCompleteTeams + 1).padStart(2, '0')}`,
      teamName: `Thakurgoan Team ${totalCompleteTeams + 1} (Partial)`,
      members: []
    };
    
    for (let i = 0; i < remainingEmployees; i++) {
      const employeeIndex = (totalCompleteTeams * employeesPerTeam) + i;
      const employee = THAKURGOAN_EMPLOYEES[employeeIndex];
      const role = roles[i]; // Assign available roles
      
      partialTeam.members.push({
        ...employee,
        role: role,
        employeeId: generateThakurgaonEmployeeId(role, totalCompleteTeams + 1, i + 1),
        teamId: partialTeam.teamId,
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0],
        company: 'Anwar Group',
        territory: 'Thakurgoan',
        district: 'Thakurgoan',
        zone: 'Rangpur',
        businessUnit: 'ACL'
      });
    }
    
    teams.push(partialTeam);
  }
  
  // Display team summary
  teams.forEach((team, index) => {
    console.log(`👥 ${team.teamName}:`);
    team.members.forEach(member => {
      console.log(`   ${member.role}: ${member.name} (${member.employeeId})`);
    });
    console.log('');
  });
  
  return teams;
}

/**
 * Generates employee ID for Thakurgoan territory
 */
function generateThakurgaonEmployeeId(role, teamNumber, memberNumber) {
  return `${role}-THKG-${String(teamNumber).padStart(2, '0')}-${String(memberNumber).padStart(2, '0')}`;
}

/**
 * Assigns geographical areas to employee teams
 */
function assignTeamTerritories(teams) {
  console.log('🗺️ Assigning Geographical Territories to Teams...\n');
  
  const upazillas = Object.keys(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas);
  const upazillasPerTeam = Math.ceil(upazillas.length / teams.length);
  
  teams.forEach((team, teamIndex) => {
    const startIndex = teamIndex * upazillasPerTeam;
    const endIndex = Math.min(startIndex + upazillasPerTeam, upazillas.length);
    const assignedUpazillas = upazillas.slice(startIndex, endIndex);
    
    team.assignedUpazillas = assignedUpazillas;
    team.assignedBazaars = [];
    
    // Collect all bazaars for assigned upazillas
    assignedUpazillas.forEach(upazilla => {
      const bazaars = THAKURGOAN_GEOGRAPHICAL_DATA.upazillas[upazilla];
      team.assignedBazaars.push(...bazaars.map(bazaar => ({
        bazaar: bazaar,
        upazilla: upazilla,
        district: THAKURGOAN_GEOGRAPHICAL_DATA.district,
        territory: THAKURGOAN_GEOGRAPHICAL_DATA.territory
      })));
    });
    
    console.log(`📍 ${team.teamName}:`);
    console.log(`   Upazillas: ${assignedUpazillas.join(', ')}`);
    console.log(`   Total Bazaars: ${team.assignedBazaars.length}`);
    console.log('');
  });
  
  return teams;
}

/**
 * Creates location mapping entries for the teams
 */
function createLocationMappings(teams) {
  console.log('🗺️ Creating Location Mappings...\n');
  
  const locationMappings = [];
  
  teams.forEach(team => {
    team.assignedBazaars.forEach(bazaarInfo => {
      const locationMapping = {
        zone: 'Rangpur',
        district: bazaarInfo.district,
        area: team.teamName,
        territory: bazaarInfo.territory,
        bazaar: bazaarInfo.bazaar,
        upazilla: bazaarInfo.upazilla,
        bdTerritory: `BD-${team.teamId}`,
        croTerritory: `CRO-${team.teamId}`,
        businessUnit: 'ACL',
        status: 'Active'
      };
      
      locationMappings.push(locationMapping);
    });
  });
  
  console.log(`📊 Created ${locationMappings.length} location mapping entries`);
  return locationMappings;
}

/**
 * Updates the CRM spreadsheet with new employee data
 */
function updateEmployeeSpreadsheet(teams) {
  console.log('📊 Updating Employee Spreadsheet...\n');
  
  try {
    const employeesSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.EMPLOYEES);
    
    // Prepare employee data for insertion
    const employeeRows = [];
    
    teams.forEach(team => {
      team.members.forEach(member => {
        const rowData = [
          member.employeeId,
          member.name,
          member.role,
          member.email,
          '', // Contact Number (to be updated)
          member.whatsapp,
          '', // bKash Number (to be updated)
          '', // NID No (to be updated)
          member.status,
          member.hireDate,
          member.company,
          member.territory,
          team.teamName, // Area
          member.zone,
          member.district,
          '', // New Area
          '', // New Territory
          '', // Bazaar (will be populated from location mappings)
          '', // Upazilla (will be populated from location mappings)
          `BD-${team.teamId}`, // BD Territory
          `CRO-${team.teamId}`, // CRO Territory
          member.businessUnit,
          '', // Legacy ID
          `Auto-created for Thakurgoan territory - Team: ${team.teamName}`
        ];
        
        employeeRows.push(rowData);
      });
    });
    
    // Insert data into spreadsheet
    if (employeeRows.length > 0) {
      const startRow = employeesSheet.getLastRow() + 1;
      const range = employeesSheet.getRange(startRow, 1, employeeRows.length, employeeRows[0].length);
      range.setValues(employeeRows);
      
      console.log(`✅ Successfully added ${employeeRows.length} employees to spreadsheet`);
    }
    
    return {
      success: true,
      employeesAdded: employeeRows.length,
      message: 'Employee data updated successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating employee spreadsheet:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to update employee spreadsheet'
    };
  }
}

/**
 * Updates the location mapping spreadsheet
 */
function updateLocationMappingSpreadsheet(locationMappings) {
  console.log('🗺️ Updating Location Mapping Spreadsheet...\n');
  
  try {
    const locationSheet = getSheet(CONFIG.SPREADSHEET_IDS.CRM, CONFIG.SHEET_NAMES.LOCATION_MAP);
    
    // Prepare location mapping data for insertion
    const locationRows = locationMappings.map(mapping => [
      mapping.zone,
      mapping.district,
      mapping.area,
      mapping.territory,
      mapping.bazaar,
      mapping.upazilla,
      mapping.bdTerritory,
      mapping.croTerritory,
      mapping.businessUnit,
      mapping.status
    ]);
    
    // Insert data into spreadsheet
    if (locationRows.length > 0) {
      const startRow = locationSheet.getLastRow() + 1;
      const range = locationSheet.getRange(startRow, 1, locationRows.length, locationRows[0].length);
      range.setValues(locationRows);
      
      console.log(`✅ Successfully added ${locationRows.length} location mappings to spreadsheet`);
    }
    
    return {
      success: true,
      mappingsAdded: locationRows.length,
      message: 'Location mappings updated successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating location mapping spreadsheet:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to update location mapping spreadsheet'
    };
  }
}

/**
 * Validates the Thakurgoan employee assignment
 */
function validateThakurgaonAssignment(teams) {
  console.log('🔍 Validating Thakurgoan Employee Assignment...\n');
  
  const validation = {
    success: true,
    warnings: [],
    errors: [],
    summary: {}
  };
  
  // Count employees by role
  const roleCounts = {};
  let totalEmployees = 0;
  
  teams.forEach(team => {
    team.members.forEach(member => {
      roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
      totalEmployees++;
    });
  });
  
  validation.summary = {
    totalTeams: teams.length,
    totalEmployees: totalEmployees,
    roleCounts: roleCounts,
    totalUpazillas: Object.keys(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).length,
    totalBazaars: Object.values(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).reduce((sum, bazaars) => sum + bazaars.length, 0)
  };
  
  // Validation checks
  if (totalEmployees !== THAKURGOAN_EMPLOYEES.length) {
    validation.errors.push(`Employee count mismatch: Expected ${THAKURGOAN_EMPLOYEES.length}, got ${totalEmployees}`);
    validation.success = false;
  }
  
  // Check role distribution
  Object.keys(CONFIG.EMPLOYEE_ROLES).forEach(role => {
    if (!roleCounts[role]) {
      validation.warnings.push(`No employees assigned to role: ${role}`);
    }
  });
  
  // Check email uniqueness
  const emails = new Set();
  const duplicateEmails = [];
  
  teams.forEach(team => {
    team.members.forEach(member => {
      if (emails.has(member.email)) {
        duplicateEmails.push(member.email);
        validation.errors.push(`Duplicate email found: ${member.email}`);
        validation.success = false;
      } else {
        emails.add(member.email);
      }
    });
  });
  
  // Display validation results
  console.log('📊 Validation Summary:');
  console.log(`   Total Teams: ${validation.summary.totalTeams}`);
  console.log(`   Total Employees: ${validation.summary.totalEmployees}`);
  console.log(`   Role Distribution:`);
  Object.entries(validation.summary.roleCounts).forEach(([role, count]) => {
    console.log(`     ${role}: ${count} employees`);
  });
  console.log(`   Coverage: ${validation.summary.totalUpazillas} upazillas, ${validation.summary.totalBazaars} bazaars`);
  console.log('');
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }
  
  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
  }
  
  if (validation.success) {
    console.log('✅ Validation passed successfully!');
  } else {
    console.log('❌ Validation failed - please fix errors before proceeding');
  }
  
  return validation;
}

/**
 * Sends notification about the employee update
 */
function sendThakurgaonUpdateNotification(teams, validation) {
  console.log('📧 Sending Thakurgoan Update Notification...\n');
  
  try {
    const recipient = 'asim.ilyus@anwargroup.com';
    const subject = '🏗️ Thakurgoan Territory Employee Assignment Complete';
    
    let emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; }
        .team-table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        .team-table th, .team-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .team-table th { background-color: #f2f2f2; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏗️ Thakurgoan Territory Employee Assignment</h1>
        <p>Complete deployment summary and team assignments</p>
    </div>
    
    <div class="content">
        <div class="section">
            <h2>📊 Assignment Summary</h2>
            <ul>
                <li><strong>Total Teams Created:</strong> ${teams.length}</li>
                <li><strong>Total Employees Assigned:</strong> ${validation.summary.totalEmployees}</li>
                <li><strong>Territory Coverage:</strong> ${validation.summary.totalUpazillas} upazillas, ${validation.summary.totalBazaars} bazaars</li>
                <li><strong>Validation Status:</strong> <span class="${validation.success ? 'success' : 'error'}">${validation.success ? 'PASSED' : 'FAILED'}</span></li>
            </ul>
        </div>
        
        <div class="section">
            <h2>👥 Team Assignments</h2>
    `;
    
    teams.forEach(team => {
      emailBody += `
            <h3>${team.teamName}</h3>
            <table class="team-table">
                <tr><th>Role</th><th>Name</th><th>Employee ID</th><th>Email</th><th>WhatsApp</th></tr>
      `;
      
      team.members.forEach(member => {
        emailBody += `
                <tr>
                    <td>${member.role}</td>
                    <td>${member.name}</td>
                    <td>${member.employeeId}</td>
                    <td>${member.email}</td>
                    <td>${member.whatsapp}</td>
                </tr>
        `;
      });
      
      emailBody += `
            </table>
            <p><strong>Assigned Upazillas:</strong> ${team.assignedUpazillas ? team.assignedUpazillas.join(', ') : 'Not assigned'}</p>
      `;
    });
    
    emailBody += `
        </div>
        
        <div class="section">
            <h2>🎯 Role Distribution</h2>
            <ul>
    `;
    
    Object.entries(validation.summary.roleCounts).forEach(([role, count]) => {
      emailBody += `<li><strong>${role}:</strong> ${count} employees</li>`;
    });
    
    emailBody += `
            </ul>
        </div>
    `;
    
    if (validation.warnings.length > 0) {
      emailBody += `
        <div class="section">
            <h2 class="warning">⚠️ Warnings</h2>
            <ul>
      `;
      validation.warnings.forEach(warning => {
        emailBody += `<li class="warning">${warning}</li>`;
      });
      emailBody += `
            </ul>
        </div>
      `;
    }
    
    if (validation.errors.length > 0) {
      emailBody += `
        <div class="section">
            <h2 class="error">❌ Errors</h2>
            <ul>
      `;
      validation.errors.forEach(error => {
        emailBody += `<li class="error">${error}</li>`;
      });
      emailBody += `
            </ul>
        </div>
      `;
    }
    
    emailBody += `
        <div class="section">
            <h2>📅 Deployment Information</h2>
            <ul>
                <li><strong>Deployment Date:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Territory:</strong> Thakurgoan</li>
                <li><strong>Business Unit:</strong> ACL</li>
                <li><strong>Zone:</strong> Rangpur</li>
            </ul>
        </div>
        
        <div class="section">
            <p><em>This is an automated report generated by the Anwar Sales Ecosystem.</em></p>
        </div>
    </div>
</body>
</html>
    `;
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: emailBody
    });
    
    console.log(`✅ Notification sent to ${recipient}`);
    
    return {
      success: true,
      recipient: recipient,
      message: 'Notification sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to send notification'
    };
  }
}

/**
 * Main function to execute the complete Thakurgoan employee update
 */
function executeThakurgaonEmployeeUpdate() {
  console.log('🚀 Starting Thakurgaon Employee Territory Update...\n');
  console.log('=====================================');
  console.log(`📅 Update Date: ${new Date().toLocaleString()}`);
  console.log(`🎯 Territory: Thakurgaon`);
  console.log(`👥 Total Employees: ${THAKURGOAN_EMPLOYEES.length}`);
  console.log(`🗺️ Upazillas: ${Object.keys(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).length}`);
  console.log('=====================================\n');
  
  try {
    // Step 1: Create employee teams
    const teams = createThakurgaonEmployeeTeams();
    
    // Step 2: Assign territories to teams
    const teamsWithTerritories = assignTeamTerritories(teams);
    
    // Step 3: Create location mappings
    const locationMappings = createLocationMappings(teamsWithTerritories);
    
    // Step 4: Validate assignment
    const validation = validateThakurgaonAssignment(teamsWithTerritories);
    
    if (!validation.success) {
      console.log('❌ Validation failed. Please fix errors before proceeding.');
      return {
        success: false,
        message: 'Validation failed',
        validation: validation
      };
    }
    
    // Step 5: Update spreadsheets
    const employeeUpdateResult = updateEmployeeSpreadsheet(teamsWithTerritories);
    const locationUpdateResult = updateLocationMappingSpreadsheet(locationMappings);
    
    // Step 6: Send notification
    const notificationResult = sendThakurgaonUpdateNotification(teamsWithTerritories, validation);
    
    // Final summary
    console.log('\n🎉 THAKURGAON EMPLOYEE UPDATE COMPLETE!');
    console.log('=====================================');
    console.log(`✅ Teams Created: ${teams.length}`);
    console.log(`✅ Employees Assigned: ${validation.summary.totalEmployees}`);
    console.log(`✅ Location Mappings: ${locationMappings.length}`);
    console.log(`✅ Spreadsheet Updates: ${employeeUpdateResult.success && locationUpdateResult.success ? 'Success' : 'Failed'}`);
    console.log(`✅ Notification: ${notificationResult.success ? 'Sent' : 'Failed'}`);
    console.log('=====================================\n');
    
    return {
      success: true,
      message: 'Thakurgaon employee update completed successfully',
      summary: {
        teams: teams.length,
        employees: validation.summary.totalEmployees,
        locationMappings: locationMappings.length,
        spreadsheetUpdate: employeeUpdateResult.success && locationUpdateResult.success,
        notification: notificationResult.success
      },
      details: {
        teams: teamsWithTerritories,
        validation: validation,
        employeeUpdate: employeeUpdateResult,
        locationUpdate: locationUpdateResult,
        notification: notificationResult
      }
    };
    
  } catch (error) {
    console.error('❌ Fatal error during Thakurgaon employee update:', error);
    return {
      success: false,
      message: 'Fatal error during update',
      error: error.toString()
    };
  }
}

/**
 * Test function for validating Thakurgaon data
 */
function testThakurgaonEmployeeData() {
  console.log('🧪 Testing Thakurgaon Employee Data...\n');
  
  // Test employee data integrity
  console.log('📊 Employee Data Analysis:');
  console.log(`   Total Employees: ${THAKURGOAN_EMPLOYEES.length}`);
  
  // Check for duplicate emails
  const emails = THAKURGOAN_EMPLOYEES.map(emp => emp.email);
  const uniqueEmails = new Set(emails);
  console.log(`   Unique Emails: ${uniqueEmails.size}`);
  
  if (emails.length !== uniqueEmails.size) {
    console.log('⚠️ Warning: Duplicate emails found');
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    duplicates.forEach(dup => console.log(`   - ${dup}`));
  }
  
  // Test geographical data
  console.log('\n🗺️ Geographical Data Analysis:');
  console.log(`   District: ${THAKURGOAN_GEOGRAPHICAL_DATA.district}`);
  console.log(`   Territory: ${THAKURGOAN_GEOGRAPHICAL_DATA.territory}`);
  console.log(`   Upazillas: ${Object.keys(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).length}`);
  
  let totalBazaars = 0;
  Object.entries(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).forEach(([upazilla, bazaars]) => {
    console.log(`   ${upazilla}: ${bazaars.length} bazaars`);
    totalBazaars += bazaars.length;
  });
  
  console.log(`   Total Bazaars: ${totalBazaars}`);
  
  // Test team creation potential
  console.log('\n👥 Team Creation Analysis:');
  const employeesPerTeam = 4;
  const completeTeams = Math.floor(THAKURGOAN_EMPLOYEES.length / employeesPerTeam);
  const remainingEmployees = THAKURGOAN_EMPLOYEES.length % employeesPerTeam;
  
  console.log(`   Possible Complete Teams: ${completeTeams}`);
  console.log(`   Remaining Employees: ${remainingEmployees}`);
  console.log(`   Upazillas per Team: ${Math.ceil(Object.keys(THAKURGOAN_GEOGRAPHICAL_DATA.upazillas).length / completeTeams)}`);
  
  console.log('\n✅ Data validation complete!');
}

/**
 * Quick deployment function
 */
function quickDeployThakurgaonEmployees() {
  console.log('⚡ Quick Deploy: Thakurgaon Employees\n');
  
  // Run test first
  testThakurgaonEmployeeData();
  
  console.log('\n🚀 Proceeding with deployment...\n');
  
  // Execute main deployment
  return executeThakurgaonEmployeeUpdate();
}

// Auto-run test when this file is loaded
console.log('📋 Thakurgaon Employee Update script loaded successfully!');
console.log('💡 Available functions:');
console.log('   - testThakurgaonEmployeeData() - Test data integrity');
console.log('   - executeThakurgaonEmployeeUpdate() - Full deployment');
console.log('   - quickDeployThakurgaonEmployees() - Test + Deploy');
console.log('');
