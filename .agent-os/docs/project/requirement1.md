📌 Implementation Plan: Per-Submitter Sheet Access and WhatsApp Query Integration
🔧 Technical Components and Workflow
✅ Feature Workflow:
Form Submission & Data Logging:

User submits data (Order, Visit, IHB, Site Prescription).

Trigger (onFormSubmit) writes data into:

Master CRM sheet

Personal submitter-specific spreadsheet

Sheet Metadata Management:

Create a new Google Sheet: USER_SHEET_MAP to store sheet metadata:

pgsql
Copy
Edit
Columns: Email | Sheet Type | Sheet Name | Sheet ID
Update metadata every time a user-specific sheet is created.

WhatsApp Interaction via Maytapi API:

User texts: "need to see data"

System identifies user via EMPLOYEES sheet (WhatsApp to email).

System replies with a numbered list of available sheets from USER_SHEET_MAP.

User selects a sheet by replying with a number or name.

System responds with a direct link to the Google Sheet or exports it as PDF/CSV.

Stateful Conversation Handling:

Maintain state using CacheService or PropertiesService for short-term memory.

Map each user's WhatsApp number to the previously sent sheet list.

⚙️ Implementation Steps (Detailed)
📁 Step 1: User-Specific Sheet Creation
Function: getOrCreateUserSheet(email, type)

javascript
Copy
Edit
function getOrCreateUserSheet(email, type) {
  const folder = DriveApp.getFolderById(CONFIG.USER_SHEETS_FOLDER_ID);
  const sheetName = `${type}_${email}`;
  
  const userSheetMap = getUserSheetMap();
  const existingEntry = userSheetMap.find(entry => entry.email === email && entry.sheetType === type);
  
  if (existingEntry) {
    return SpreadsheetApp.openById(existingEntry.sheetId);
  }
  
  const newSheet = SpreadsheetApp.create(sheetName);
  DriveApp.getFileById(newSheet.getId()).moveTo(folder);
  
  appendUserSheetMap(email, type, sheetName, newSheet.getId());
  
  return newSheet;
}
Function: appendRowToUserSheet(sheetId, sheetName, data)

javascript
Copy
Edit
function appendRowToUserSheet(sheetId, sheetName, data) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName) ||
                SpreadsheetApp.openById(sheetId).insertSheet(sheetName);
  sheet.appendRow(data);
}
📋 Step 2: Sheet Registry (USER_SHEET_MAP)
Structure:

pgsql
Copy
Edit
Columns: Email | Sheet Type | Sheet Name | Sheet ID
Functions to manage registry:

javascript
Copy
Edit
function getUserSheetMap() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = getOrCreateSheet(ss, 'USER_SHEET_MAP', ['Email', 'Sheet Type', 'Sheet Name', 'Sheet ID']);
  return sheet.getDataRange().getValues().slice(1).map(row => ({
    email: row[0],
    sheetType: row[1],
    sheetName: row[2],
    sheetId: row[3]
  }));
}

function appendUserSheetMap(email, type, name, sheetId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_IDS.CRM);
  const sheet = getOrCreateSheet(ss, 'USER_SHEET_MAP', ['Email', 'Sheet Type', 'Sheet Name', 'Sheet ID']);
  sheet.appendRow([email, type, name, sheetId]);
}
📲 Step 3: WhatsApp Message Parser (Maytapi Integration)
Webhook Handler:

javascript
Copy
Edit
function handleIncomingWhatsAppMessage(phone, message) {
  const employee = findEmployeeByWhatsApp(phone);
  if (!employee) {
    sendWhatsAppMessage(phone, "❌ Your WhatsApp number is not registered.");
    return;
  }

  const state = getStateForUser(phone);
  
  if (message.toLowerCase().includes("need to see data")) {
    const sheets = listSheetsForUser(employee.email);
    
    if (sheets.length === 0) {
      sendWhatsAppMessage(phone, "📭 You have no data submissions yet.");
      return;
    }
    
    let reply = "📄 Here are your available data sheets:\n";
    sheets.forEach((sheet, i) => {
      reply += `${i + 1}. ${sheet.sheetType}\n`;
    });
    
    storeTempState(phone, sheets);
    sendWhatsAppMessage(phone, reply);
  } else if (state) {
    const sheet = matchSheetFromReply(phone, message);
    
    if (sheet) {
      const url = `https://docs.google.com/spreadsheets/d/${sheet.sheetId}`;
      sendWhatsAppMessage(phone, `🔗 Here is your requested sheet: ${url}`);
    } else {
      sendWhatsAppMessage(phone, "❌ Could not understand your request. Please reply with the number or sheet name.");
    }
  } else {
    sendWhatsAppMessage(phone, "❌ Unrecognized request. Please type 'need to see data' to begin.");
  }
}
🛠️ Step 4: Stateful Tracking
Temporary State Storage (CacheService):

javascript
Copy
Edit
function storeTempState(phone, sheets) {
  const cache = CacheService.getScriptCache();
  cache.put(`state_${phone}`, JSON.stringify(sheets), 600); // 10 minutes expiration
}

function getStateForUser(phone) {
  const cache = CacheService.getScriptCache();
  const data = cache.get(`state_${phone}`);
  return data ? JSON.parse(data) : null;
}

function matchSheetFromReply(phone, reply) {
  const sheets = getStateForUser(phone);
  if (!sheets) return null;
  
  const index = parseInt(reply.trim(), 10) - 1;
  if (!isNaN(index) && sheets[index]) {
    return sheets[index];
  }
  
  return sheets.find(sheet => sheet.sheetType.toLowerCase() === reply.toLowerCase());
}
📑 Step 5: Integration with Existing Modules
Update existing onFormSubmit handlers (order.js, visit.js, ihb.js, site-prescription.js) to write data to user-specific sheets.

Example (order.js):

javascript
Copy
Edit
function handleOrderFormSubmit(e) {
  const data = e.values;
  const email = data[1];
  
  const userSheet = getOrCreateUserSheet(email, 'Orders');
  appendRowToUserSheet(userSheet.getId(), 'Orders', data);
  
  // existing CRM logic...
}
🚨 Step 6: Error Handling & Edge Cases
WhatsApp number not found:

Send polite error message and instruct user on how to register.

Invalid sheet selection:

Prompt user clearly and provide instruction again.

No available sheets:

Inform user gracefully.

📊 Step 7: Metrics & Logging
Add logging in CRM for each WhatsApp interaction.

Count queries per user monthly.

Error logs via Google Apps Script’s Logger.

🧪 Step 8: Testing Plan
Unit Tests:

Sheet creation functions.

Metadata storage/retrieval.

WhatsApp message parsing logic.

End-to-End Tests:

Submit data via forms and validate personal sheets.

Perform WhatsApp interaction sequence:

"need to see data" → receive list.

Reply with number/name → receive link.

📅 Timeline: (4 Weeks Total)
Week	Task
1	Design metadata structure and user-specific sheet logic
2	Develop WhatsApp message parsing and state management
3	Integrate with existing forms and conduct thorough testing
4	Deploy, monitor, refine, document

✅ Acceptance Criteria
Data submission auto-creates personal sheets and updates metadata.

WhatsApp command "need to see data" returns correct sheet list.

Selecting sheet via WhatsApp returns accurate Google Sheet link.

Errors and invalid inputs handled clearly and gracefully.

Following this detailed implementation plan will ensure a robust, user-friendly, and reliable integration of the Per-Submitter Sheet Access and WhatsApp Query feature within your existing system architecture.






