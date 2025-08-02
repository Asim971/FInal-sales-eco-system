/**
 * @fileoverview This file contains the notification functionality for the Anwar Sales Ecosystem.
 */

/**
 * Sends a WhatsApp message using the Maytapi API.
 * @param {string} phone The phone number to send the message to.
 * @param {string} message The message to send.
 */
function sendWhatsAppMessage(phone, message) {
  const { API_URL, API_KEY } = CONFIG.MAYTAPI_CONFIG;

  const payload = {
    'to_number': phone,
    'type': 'text',
    'message': message
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'x-maytapi-key': API_KEY
    }
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    Logger.log('WhatsApp API response: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error sending WhatsApp message: ' + error.toString());
  }
}
