/**
 * @fileoverview System Health Check and Status Report
 * Comprehensive analysis of current system state before deployment
 */

/**
 * Comprehensive system health check
 */
function performSystemHealthCheck() {
  console.log('🔍 Starting Comprehensive System Health Check...');
  
  const healthReport = {
    timestamp: new Date(),
    overallStatus: 'Unknown',
    components: {},
    recommendations: [],
    criticalIssues: [],
    warnings: []
  };
  
  try {
    // Check 1: Configuration Validation
    console.log('🔧 Checking configuration...');
    healthReport.components.configuration = checkConfigurationHealth();
    
    // Check 2: Spreadsheet Connections
    console.log('📊 Checking spreadsheet connections...');
    healthReport.components.spreadsheets = checkSpreadsheetHealth();
    
    // Check 3: Form Status
    console.log('📝 Checking forms...');
    healthReport.components.forms = checkFormHealth();
    
    // Check 4: Function Integrity
    console.log('⚙️ Checking function integrity...');
    healthReport.components.functions = checkFunctionIntegrity();
    
    // Check 5: API Integrations
    console.log('🔗 Checking API integrations...');
    healthReport.components.apis = checkAPIIntegrations();
    
    // Check 6: Trigger Status
    console.log('🔧 Checking triggers...');
    healthReport.components.triggers = checkTriggerHealth();
    
    // Generate overall assessment
    healthReport.overallStatus = calculateOverallHealth(healthReport.components);
    healthReport.recommendations = generateRecommendations(healthReport.components);
    
    console.log('✅ System health check completed');
    
    // Send health report email
    sendHealthReportEmail(healthReport);
    
    return healthReport;
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    healthReport.overallStatus = 'Critical Error';
    healthReport.criticalIssues.push(error.message);
    return healthReport;
  }
}

/**
 * Checks configuration health
 */
function checkConfigurationHealth() {
  const configHealth = {
    status: 'Unknown',
    issues: [],
    details: {}
  };
  
  try {
    // Check if CONFIG exists
    if (typeof CONFIG === 'undefined') {
      configHealth.issues.push('CONFIG object not found');
      configHealth.status = 'Critical';
      return configHealth;
    }
    
    // Check required sections
    const requiredSections = ['SPREADSHEET_IDS', 'FORMS', 'SCHEMAS', 'SHEET_NAMES', 'MAYTAPI_CONFIG'];
    const missingSections = requiredSections.filter(section => !CONFIG[section]);
    
    if (missingSections.length > 0) {
      configHealth.issues.push(`Missing CONFIG sections: ${missingSections.join(', ')}`);
    }
    
    // Check spreadsheet IDs
    const spreadsheetIds = CONFIG.SPREADSHEET_IDS || {};
    const emptyIds = Object.keys(spreadsheetIds).filter(key => 
      !spreadsheetIds[key] || spreadsheetIds[key].includes('Replace with actual')
    );
    
    if (emptyIds.length > 0) {
      configHealth.issues.push(`Incomplete spreadsheet IDs: ${emptyIds.join(', ')}`);
    }
    
    // Check API configuration
    if (!CONFIG.MAYTAPI_CONFIG || !CONFIG.MAYTAPI_CONFIG.API_KEY || 
        CONFIG.MAYTAPI_CONFIG.API_KEY.includes('Replace')) {
      configHealth.issues.push('WhatsApp API not configured');
    }
    
    // Check form definitions
    const formKeys = Object.keys(CONFIG.FORMS || {});
    if (formKeys.length === 0) {
      configHealth.issues.push('No form definitions found');
    }
    
    configHealth.details = {
      spreadsheetIds: Object.keys(spreadsheetIds).length,
      formDefinitions: formKeys.length,
      schemas: Object.keys(CONFIG.SCHEMAS || {}).length,
      sheetNames: Object.keys(CONFIG.SHEET_NAMES || {}).length
    };
    
    configHealth.status = configHealth.issues.length === 0 ? 'Healthy' : 
                         configHealth.issues.length <= 2 ? 'Warning' : 'Critical';
    
  } catch (error) {
    configHealth.status = 'Critical';
    configHealth.issues.push(`Configuration check error: ${error.message}`);
  }
  
  return configHealth;
}

/**
 * Checks spreadsheet health
 */
function checkSpreadsheetHealth() {
  const spreadsheetHealth = {
    status: 'Unknown',
    accessible: [],
    inaccessible: [],
    details: {}
  };
  
  try {
    const spreadsheetIds = CONFIG.SPREADSHEET_IDS || {};
    
    Object.keys(spreadsheetIds).forEach(key => {
      const id = spreadsheetIds[key];
      
      if (!id || id.includes('Replace')) {
        spreadsheetHealth.inaccessible.push({ key, issue: 'No ID configured' });
        return;
      }
      
      try {
        const spreadsheet = SpreadsheetApp.openById(id);
        const name = spreadsheet.getName();
        const sheets = spreadsheet.getSheets().map(s => s.getName());
        
        spreadsheetHealth.accessible.push({ 
          key, 
          id, 
          name, 
          sheetCount: sheets.length,
          sheets: sheets.slice(0, 5) // First 5 sheets
        });
        
      } catch (error) {
        spreadsheetHealth.inaccessible.push({ 
          key, 
          id, 
          issue: error.message 
        });
      }
    });
    
    const totalSpreadsheets = Object.keys(spreadsheetIds).length;
    const accessibleCount = spreadsheetHealth.accessible.length;
    const accessibilityRate = totalSpreadsheets > 0 ? (accessibleCount / totalSpreadsheets) * 100 : 0;
    
    spreadsheetHealth.status = accessibilityRate === 100 ? 'Healthy' :
                              accessibilityRate >= 80 ? 'Warning' : 'Critical';
    
    spreadsheetHealth.details = {
      total: totalSpreadsheets,
      accessible: accessibleCount,
      inaccessible: spreadsheetHealth.inaccessible.length,
      accessibilityRate: Math.round(accessibilityRate)
    };
    
  } catch (error) {
    spreadsheetHealth.status = 'Critical';
    spreadsheetHealth.details = { error: error.message };
  }
  
  return spreadsheetHealth;
}

/**
 * Checks form health (if form IDs exist in config)
 */
function checkFormHealth() {
  const formHealth = {
    status: 'Unknown',
    accessible: [],
    inaccessible: [],
    details: {}
  };
  
  try {
    // Check if VISIT_UPDATE form exists (our main implemented form)
    if (CONFIG.VISIT_UPDATE && CONFIG.VISIT_UPDATE.FORM_ID) {
      try {
        const form = FormApp.openById(CONFIG.VISIT_UPDATE.FORM_ID);
        formHealth.accessible.push({
          key: 'VISIT_UPDATE',
          id: CONFIG.VISIT_UPDATE.FORM_ID,
          title: form.getTitle(),
          publishedUrl: form.getPublishedUrl(),
          itemCount: form.getItems().length
        });
      } catch (error) {
        formHealth.inaccessible.push({
          key: 'VISIT_UPDATE',
          id: CONFIG.VISIT_UPDATE.FORM_ID,
          issue: error.message
        });
      }
    }
    
    // Check for other forms by searching for form IDs in config
    const formIds = findFormIdsInConfig();
    formIds.forEach(({ key, id }) => {
      if (key !== 'VISIT_UPDATE') { // Already checked above
        try {
          const form = FormApp.openById(id);
          formHealth.accessible.push({
            key,
            id,
            title: form.getTitle(),
            publishedUrl: form.getPublishedUrl(),
            itemCount: form.getItems().length
          });
        } catch (error) {
          formHealth.inaccessible.push({ key, id, issue: error.message });
        }
      }
    });
    
    const totalForms = formHealth.accessible.length + formHealth.inaccessible.length;
    const accessibleCount = formHealth.accessible.length;
    
    formHealth.status = totalForms === 0 ? 'Warning' :
                       accessibleCount === totalForms ? 'Healthy' :
                       accessibleCount > 0 ? 'Warning' : 'Critical';
    
    formHealth.details = {
      total: totalForms,
      accessible: accessibleCount,
      inaccessible: formHealth.inaccessible.length
    };
    
  } catch (error) {
    formHealth.status = 'Critical';
    formHealth.details = { error: error.message };
  }
  
  return formHealth;
}

/**
 * Finds form IDs in configuration
 */
function findFormIdsInConfig() {
  const formIds = [];
  
  // Check VISIT_UPDATE configuration
  if (CONFIG.VISIT_UPDATE && CONFIG.VISIT_UPDATE.FORM_ID) {
    formIds.push({ key: 'VISIT_UPDATE', id: CONFIG.VISIT_UPDATE.FORM_ID });
  }
  
  // Could add other form ID checks here if they exist in config
  
  return formIds;
}

/**
 * Checks function integrity
 */
function checkFunctionIntegrity() {
  const functionHealth = {
    status: 'Unknown',
    available: [],
    missing: [],
    details: {}
  };
  
  try {
    // Key functions that should exist
    const keyFunctions = [
      'setupAndTestVisitUpdateRobust',
      'runAllVisitUpdateTests',
      'handleVisitUpdateFormSubmit',
      'validateVisitUpdateData',
      'sendVisitUpdateNotifications',
      'validateClientId',
      'validateOrderId',
      'setupVisitUpdateTestDataRobust',
      'onFormSubmitTrigger',
      'sendWhatsAppMessage'
    ];
    
    keyFunctions.forEach(funcName => {
      try {
        const func = eval(funcName);
        if (typeof func === 'function') {
          functionHealth.available.push(funcName);
        } else {
          functionHealth.missing.push(funcName);
        }
      } catch (error) {
        functionHealth.missing.push(funcName);
      }
    });
    
    const totalFunctions = keyFunctions.length;
    const availableCount = functionHealth.available.length;
    const availabilityRate = (availableCount / totalFunctions) * 100;
    
    functionHealth.status = availabilityRate === 100 ? 'Healthy' :
                           availabilityRate >= 80 ? 'Warning' : 'Critical';
    
    functionHealth.details = {
      total: totalFunctions,
      available: availableCount,
      missing: functionHealth.missing.length,
      availabilityRate: Math.round(availabilityRate)
    };
    
  } catch (error) {
    functionHealth.status = 'Critical';
    functionHealth.details = { error: error.message };
  }
  
  return functionHealth;
}

/**
 * Checks API integrations
 */
function checkAPIIntegrations() {
  const apiHealth = {
    status: 'Unknown',
    integrations: {},
    details: {}
  };
  
  try {
    // Check WhatsApp (Maytapi) integration
    apiHealth.integrations.whatsapp = checkWhatsAppIntegration();
    
    // Check Gmail integration
    apiHealth.integrations.gmail = checkGmailIntegration();
    
    // Check Google Drive integration
    apiHealth.integrations.drive = checkDriveIntegration();
    
    // Determine overall API health
    const integrationStatuses = Object.values(apiHealth.integrations).map(i => i.status);
    const healthyCount = integrationStatuses.filter(s => s === 'Healthy').length;
    const totalCount = integrationStatuses.length;
    
    apiHealth.status = healthyCount === totalCount ? 'Healthy' :
                      healthyCount > 0 ? 'Warning' : 'Critical';
    
    apiHealth.details = {
      total: totalCount,
      healthy: healthyCount,
      integrationResults: apiHealth.integrations
    };
    
  } catch (error) {
    apiHealth.status = 'Critical';
    apiHealth.details = { error: error.message };
  }
  
  return apiHealth;
}

/**
 * Checks WhatsApp API integration
 */
function checkWhatsAppIntegration() {
  try {
    if (!CONFIG.MAYTAPI_CONFIG || !CONFIG.MAYTAPI_CONFIG.API_KEY || 
        CONFIG.MAYTAPI_CONFIG.API_KEY.includes('Replace')) {
      return { status: 'Warning', issue: 'API key not configured' };
    }
    
    // Could add actual API test here if needed
    return { status: 'Healthy', details: 'Configuration present' };
    
  } catch (error) {
    return { status: 'Critical', issue: error.message };
  }
}

/**
 * Checks Gmail integration
 */
function checkGmailIntegration() {
  try {
    // Test Gmail access
    const drafts = GmailApp.getDrafts();
    return { status: 'Healthy', details: 'Gmail access confirmed' };
    
  } catch (error) {
    return { status: 'Critical', issue: error.message };
  }
}

/**
 * Checks Google Drive integration
 */
function checkDriveIntegration() {
  try {
    // Test Drive access
    const files = DriveApp.getFiles();
    return { status: 'Healthy', details: 'Drive access confirmed' };
    
  } catch (error) {
    return { status: 'Critical', issue: error.message };
  }
}

/**
 * Checks trigger health
 */
function checkTriggerHealth() {
  const triggerHealth = {
    status: 'Unknown',
    triggers: [],
    details: {}
  };
  
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    triggers.forEach(trigger => {
      triggerHealth.triggers.push({
        id: trigger.getUniqueId(),
        handlerFunction: trigger.getHandlerFunction(),
        eventType: trigger.getEventType().toString(),
        source: trigger.getTriggerSource().toString()
      });
    });
    
    triggerHealth.status = triggers.length > 0 ? 'Healthy' : 'Warning';
    triggerHealth.details = {
      total: triggers.length,
      formTriggers: triggers.filter(t => t.getEventType().toString().includes('FORM')).length,
      timeTriggers: triggers.filter(t => t.getEventType().toString().includes('TIME')).length
    };
    
  } catch (error) {
    triggerHealth.status = 'Critical';
    triggerHealth.details = { error: error.message };
  }
  
  return triggerHealth;
}

/**
 * Calculates overall system health
 */
function calculateOverallHealth(components) {
  const statuses = Object.values(components).map(c => c.status);
  
  if (statuses.includes('Critical')) return 'Critical';
  if (statuses.includes('Warning')) return 'Warning';
  if (statuses.every(s => s === 'Healthy')) return 'Healthy';
  
  return 'Unknown';
}

/**
 * Generates recommendations based on health check
 */
function generateRecommendations(components) {
  const recommendations = [];
  
  // Configuration recommendations
  if (components.configuration && components.configuration.status !== 'Healthy') {
    recommendations.push('Update CONFIG with proper spreadsheet IDs and API keys');
    recommendations.push('Configure WhatsApp API credentials');
  }
  
  // Spreadsheet recommendations
  if (components.spreadsheets && components.spreadsheets.details.accessibilityRate < 100) {
    recommendations.push('Fix inaccessible spreadsheets or update IDs in CONFIG');
  }
  
  // Form recommendations
  if (components.forms && components.forms.details.total === 0) {
    recommendations.push('Run master deployment to create all forms');
  }
  
  // Function recommendations
  if (components.functions && components.functions.details.availabilityRate < 100) {
    recommendations.push('Deploy missing function files to Google Apps Script');
  }
  
  // API recommendations
  if (components.apis && components.apis.status !== 'Healthy') {
    recommendations.push('Configure and test API integrations');
  }
  
  // Trigger recommendations
  if (components.triggers && components.triggers.details.total === 0) {
    recommendations.push('Set up form submission triggers');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System appears healthy - ready for production use');
  }
  
  return recommendations;
}

/**
 * Sends health report email
 */
function sendHealthReportEmail(healthReport) {
  try {
    const subject = `🔍 Anwar Sales Ecosystem - System Health Report (${healthReport.overallStatus})`;
    const body = generateHealthReportEmail(healthReport);
    
    GmailApp.sendEmail(
      'asim.ilyus@anwargroup.com',
      subject,
      '',
      { htmlBody: body }
    );
    
    console.log('✅ Health report email sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending health report email:', error);
  }
}

/**
 * Generates health report email HTML
 */
function generateHealthReportEmail(healthReport) {
  const statusColor = {
    'Healthy': '#0f9d58',
    'Warning': '#f9ab00',
    'Critical': '#d93025',
    'Unknown': '#666'
  };
  
  let emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: ${statusColor[healthReport.overallStatus]}; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #4285f4; }
        .status-healthy { color: #0f9d58; }
        .status-warning { color: #f9ab00; }
        .status-critical { color: #d93025; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .recommendation { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 3px solid #4285f4; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔍 System Health Report</h1>
        <h2>Overall Status: ${healthReport.overallStatus}</h2>
        <p>Report Generated: ${healthReport.timestamp.toLocaleString()}</p>
      </div>
      
      <div class="section">
        <h2>📊 Component Health Summary</h2>
        <table>
          <tr><th>Component</th><th>Status</th><th>Details</th></tr>`;
  
  Object.keys(healthReport.components).forEach(componentKey => {
    const component = healthReport.components[componentKey];
    const statusClass = `status-${component.status.toLowerCase()}`;
    
    emailBody += `
      <tr>
        <td>${componentKey.charAt(0).toUpperCase() + componentKey.slice(1)}</td>
        <td><span class="${statusClass}">●</span> ${component.status}</td>
        <td>${JSON.stringify(component.details || {})}</td>
      </tr>`;
  });
  
  emailBody += `</table></div>`;
  
  // Add detailed issues for each component
  Object.keys(healthReport.components).forEach(componentKey => {
    const component = healthReport.components[componentKey];
    
    if (component.issues && component.issues.length > 0) {
      emailBody += `
        <div class="section">
          <h3>${componentKey.charAt(0).toUpperCase() + componentKey.slice(1)} Issues</h3>
          <ul>`;
      
      component.issues.forEach(issue => {
        emailBody += `<li>${issue}</li>`;
      });
      
      emailBody += `</ul></div>`;
    }
  });
  
  // Add recommendations
  if (healthReport.recommendations && healthReport.recommendations.length > 0) {
    emailBody += `
      <div class="section">
        <h2>💡 Recommendations</h2>`;
    
    healthReport.recommendations.forEach(rec => {
      emailBody += `<div class="recommendation">${rec}</div>`;
    });
    
    emailBody += `</div>`;
  }
  
  // Add next steps
  emailBody += `
    <div class="section">
      <h2>🎯 Next Steps</h2>
      <p>Based on the health check results:</p>
      <ol>`;
  
  if (healthReport.overallStatus === 'Critical') {
    emailBody += `
        <li><strong>Address critical issues immediately</strong></li>
        <li>Do not proceed with deployment until critical issues are resolved</li>
        <li>Re-run health check after fixes</li>`;
  } else if (healthReport.overallStatus === 'Warning') {
    emailBody += `
        <li>Address warning issues before deployment</li>
        <li>Consider running master deployment to fix missing components</li>
        <li>Test system functionality after fixes</li>`;
  } else {
    emailBody += `
        <li>System is healthy and ready for deployment</li>
        <li>Run master deployment if you need to create missing forms/sheets</li>
        <li>Proceed with production use</li>`;
  }
  
  emailBody += `
      </ol>
    </div>
    
    <div class="section">
      <h2>🔧 Available Commands</h2>
      <ul>
        <li><code>performSystemHealthCheck()</code> - Run this health check again</li>
        <li><code>deployCompleteAnwarSalesEcosystem()</code> - Full system deployment</li>
        <li><code>setupAndTestVisitUpdateRobust()</code> - Setup test data for Visit Updates</li>
        <li><code>testDeploymentSystem()</code> - Test deployment capabilities</li>
      </ul>
    </div>
    
    </body>
    </html>`;
  
  return emailBody;
}

/**
 * Quick system status for console
 */
function quickSystemStatus() {
  console.log('🔍 Quick System Status Check...');
  
  try {
    // Quick CONFIG check
    const configExists = typeof CONFIG !== 'undefined';
    console.log(`CONFIG: ${configExists ? '✅' : '❌'}`);
    
    // Quick spreadsheet check
    if (configExists && CONFIG.SPREADSHEET_IDS && CONFIG.SPREADSHEET_IDS.CRM) {
      try {
        SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
        console.log('CRM Spreadsheet: ✅');
      } catch {
        console.log('CRM Spreadsheet: ❌');
      }
    } else {
      console.log('CRM Spreadsheet: ❌ (Not configured)');
    }
    
    // Quick function check
    const keyFunctions = ['setupAndTestVisitUpdateRobust', 'runAllVisitUpdateTests'];
    keyFunctions.forEach(funcName => {
      try {
        const func = eval(funcName);
        console.log(`${funcName}: ${typeof func === 'function' ? '✅' : '❌'}`);
      } catch {
        console.log(`${funcName}: ❌`);
      }
    });
    
    console.log('✅ Quick status check completed');
    
  } catch (error) {
    console.error('❌ Quick status check failed:', error);
  }
}
