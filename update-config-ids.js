/**
 * @fileoverview Script to update CONFIG with new spreadsheet IDs from deployment
 * 
 * Run this after deployment to update CONFIG.SPREADSHEET_IDS with the new IDs
 */

/**
 * Updates CONFIG with the latest spreadsheet IDs from deployment
 * Copy and paste the IDs from the deployment log
 */
function updateConfigSpreadsheetIds() {
  console.log('📋 Updating CONFIG with new spreadsheet IDs...');
  
  // Latest IDs from deployment (update these with the actual IDs from your deployment log)
  const newSpreadsheetIds = {
    CRM: '1-wZ244nAs5T59xBU9aQgo9n_ZF9VKayf6BhuMxnsT6I',
    ENGINEER_REGISTRATION: '1gCt6FwJSuqkYLJveX9Q2s6IwvgKgmJMUkqadMr36Sg8',
    ENGINEER_UPDATE: '1UjyKF_vJSi7py4uESc5NeN-1u_M8AVH0DunJbe6l7Fo',
    POTENTIAL_SITE: '1IQqj8H0uHTLxuV6UynCzPQoFXWXbVINQrpbcKAasSLA',
    POTENTIAL_SITE_UPDATE: '1u4dmDQmzwaogNBVslbUapZ0nu8pA7gt4u7WSPGeUib4',
    RETAILER_REGISTRATION: '1wt7uFCi1qhhgcoOAPlSY_hkDcqQSucGSs-qLcK9N9aY',
    PARTNER_UPDATE: '1Pwp6MwBk4yOnf8GVN1FC390LCSEHJeDDqN9NEVF7Z9g',
    PARTNER_REGISTRATION: '1PKlxDNcLs8CMSgg2Vo6hFRzfdOjb2zt-5766eXxHVxA',
    ORDER_CREATION: '1675BrSNs2kMyWQRA87hJan_YlGSgIS85UCqO2dtslo8',
    DISPUTE_CREATION: '1sSJ4EJRtNiF5ie9Al7lQsu4bRrdZOgAUjz7Zj-vFWRjSmk',
    SITE_PRESCRIPTION: '1NVpMlyvAI-vxDkK17Jw26oe21Ax7yD_oL3LAqrSXnsY',
    PROJECT_UPDATE: '1c2jXcH8JryAjEjA_rkMZX5PxUc8b9CjcQNCPZxA8B2o',
    VISIT: '1alNYo68e3lHCapJ0klWQeA8LJf30yMchsLh86EWqSFQ',
    VISIT_UPDATE: '1yhtGZHS3KIdB69ZtvMZUeQHFWGBTG8ElxxBy0fBgbQQ',
    IHB_REGISTRATION: '1HLP9sRTB22wg4a_Ju30gaWr-ysrJskFKyj9sA6AurwI',
    IHB_UPDATES: '1CaU-KEJqsvFYuQ83fh0gc4Sc4jYH3jT7Zbu3AdC8TmI',
    RETAILER_UPDATES: '19a1FkgaDkq0lQDREX2Oulry7xG8fblFfwYpI8O4Rv4c',
    PARTNER_UPDATES: '13wRnJX_hvx8KcDM4xUejrzM3vFWfZ-1TVduFPvciC8E',
    RETAILER_POINT_REQUEST: '1bswG_tKQwsnMmt9wbiRX6MpA2CUVkTZL4JjtaNqTm58',
    DEMAND_GENERATION_REQUEST: '19336cG2L6rL_lWLcAjQJYtbDnAo5fNKTOn80K-2ANBs'
  };
  
  console.log('📋 New spreadsheet IDs:');
  console.log(JSON.stringify(newSpreadsheetIds, null, 2));
  
  console.log('⚠️ Manual Update Required:');
  console.log('1. Open config.js file');
  console.log('2. Replace the SPREADSHEET_IDS object with:');
  console.log('');
  console.log('CONFIG.SPREADSHEET_IDS = {');
  Object.keys(newSpreadsheetIds).forEach(key => {
    console.log(`  ${key}: '${newSpreadsheetIds[key]}',`);
  });
  console.log('};');
  console.log('');
  console.log('3. Save the config.js file');
  console.log('4. Run clasp push to update the deployment');
  
  return newSpreadsheetIds;
}

/**
 * Validates that all required spreadsheet IDs are present
 */
function validateSpreadsheetIds() {
  console.log('✅ Validating spreadsheet IDs...');
  
  const requiredIds = [
    'CRM', 'ENGINEER_REGISTRATION', 'ENGINEER_UPDATE', 'POTENTIAL_SITE', 
    'POTENTIAL_SITE_UPDATE', 'RETAILER_REGISTRATION', 'PARTNER_UPDATE', 
    'PARTNER_REGISTRATION', 'ORDER_CREATION', 'DISPUTE_CREATION', 
    'SITE_PRESCRIPTION', 'PROJECT_UPDATE', 'VISIT', 'VISIT_UPDATE', 
    'IHB_REGISTRATION', 'IHB_UPDATES', 'RETAILER_UPDATES', 'PARTNER_UPDATES',
    'RETAILER_POINT_REQUEST', 'DEMAND_GENERATION_REQUEST'
  ];
  
  const missing = [];
  const present = [];
  
  requiredIds.forEach(id => {
    if (CONFIG.SPREADSHEET_IDS[id]) {
      present.push(id);
    } else {
      missing.push(id);
    }
  });
  
  console.log(`✅ Present (${present.length}):`, present);
  
  if (missing.length > 0) {
    console.log(`❌ Missing (${missing.length}):`, missing);
    return false;
  }
  
  console.log('🎉 All required spreadsheet IDs are present!');
  return true;
}
