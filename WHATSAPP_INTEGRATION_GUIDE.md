# WhatsApp Integration Guide - Maytapi Implementation

## Overview

This document provides comprehensive guidance for setting up and using the Maytapi WhatsApp API integration with the Anwar Sales Ecosystem. The integration allows employees to access their personal data sheets via WhatsApp messages.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Deployment](#deployment)
4. [Webhook Setup](#webhook-setup)
5. [Testing](#testing)
6. [User Guide](#user-guide)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## Prerequisites

### Maytapi Account Setup

1. **Create Account**: Visit [Maytapi Console](https://console.maytapi.com/register)
2. **Create Instance**: Add a new WhatsApp instance
3. **Connect Phone**: Scan QR code to connect your WhatsApp Business account
4. **Get Credentials**: Note down your Product ID, Phone ID, and API Key

### Google Apps Script Setup

1. **Project Access**: Ensure you have access to the Anwar Sales Ecosystem Apps Script project
2. **Permissions**: Admin access required for deployment and webhook configuration
3. **Spreadsheet Access**: Verify access to all CRM and user sheet folders

## Configuration

### 1. Update CONFIG Object

In `config.js`, update the Maytapi configuration:

```javascript
MAYTAPI_CONFIG: {
  PRODUCT_ID: 'your-product-id',
  PHONE_ID: 'your-phone-id', 
  API_KEY: 'your-api-key',
  API_URL: 'https://api.maytapi.com/api/your-product-id/your-phone-id/sendMessage'
}
```

### 2. Webhook Configuration

The webhook endpoint is implemented in `whatsapp-integration.js` with the `doPost()` function. It handles:

- **Message Webhooks**: Incoming text and media messages
- **Status Webhooks**: Connection status changes
- **Acknowledgment Webhooks**: Message delivery confirmations
- **Error Webhooks**: API error notifications

## Deployment

### 1. Deploy as Web App

1. In Google Apps Script Editor, click **Deploy** > **New Deployment**
2. Choose **Type**: Web app
3. Set **Execute as**: Me (your account)
4. Set **Who has access**: Anyone
5. Click **Deploy** and copy the web app URL

### 2. Configure Webhook URL

Use the setup script to configure the webhook:

```javascript
// Run this function after deployment
setupMaytapiWebhook();
```

Or manually configure in Maytapi dashboard:
1. Go to [Maytapi Console](https://console.maytapi.com/)
2. Select your instance
3. Set webhook URL to: `https://script.google.com/macros/s/AKfycbxObIdZ5PfAK8mXDBQTh6dlSQ5GWNsPgUUOXPPwUlGacNkb8mNGTdPO765SoTPD_227Hw/exec`

## Webhook Setup

### Automatic Setup

Run the automated setup script:

```javascript
// Complete setup and verification
completeMaytapiSetup();
```

### Manual Setup

1. **Get Web App URL**: After deployment, copy the web app URL
2. **Set Webhook**: In Maytapi dashboard, set webhook URL
3. **Test Connection**: Send a test message to verify

### Webhook Payload Structure

The integration handles Maytapi's webhook payloads:

```javascript
// Text message webhook
{
  "type": "message",
  "message": {
    "type": "text",
    "text": "need to see data",
    "fromMe": false,
    "_serialized": "message_id"
  },
  "conversation": "8801234567890@c.us"
}

// Status change webhook
{
  "type": "status",
  "phone_id": "90126",
  "status": "connected"
}

// Message acknowledgment webhook
{
  "type": "ack",
  "data": [
    {
      "msgId": "message_id",
      "ackType": "delivered"
    }
  ]
}
```

## Testing

### 1. Run Integration Tests

Execute comprehensive test suite:

```javascript
// Test all webhook handlers
runAllMaytapiTests();

// Test specific components
testMaytapiWebhookIntegration();
testCompleteUserFlow();
```

### 2. Manual Testing

1. **Send Test Message**: Use `sendTestWhatsAppMessage()` function
2. **Verify Webhook**: Check Apps Script logs for incoming requests
3. **Test User Flow**: Send "need to see data" from registered WhatsApp number

### 3. Performance Testing

```javascript
// Test webhook performance
testWebhookPerformance();
```

## User Guide

### For Employees

#### Getting Started

1. **Registration**: Ensure your WhatsApp number is registered in the employee database
2. **Send Command**: Send "need to see data" to the business WhatsApp number
3. **Select Sheet**: Choose from the numbered list of available data sheets
4. **Access Data**: Receive direct link to your personal data sheet

#### Available Commands

- **"need to see data"** or **"show my data"**: Request access to personal data sheets
- **"help"**: Get list of available commands and instructions
- **Sheet name or number**: Select specific data sheet from the list

#### Example Interaction

```
User: need to see data

Bot: 📄 Hi John Doe!

Here are your available data sheets:

1. Orders
   📅 Last updated: 2024-01-15

2. Visits  
   📅 Last updated: 2024-01-14

📝 Reply with the number or name of the sheet you want to access.
Example: Reply '1' or 'Orders'

User: 1

Bot: 📊 Here's your Orders data sheet:
🔗 https://docs.google.com/spreadsheets/d/abc123.../edit

This sheet contains all your order submissions and their current status.
```

### For Administrators

#### Monitoring

1. **Check Logs**: Monitor Apps Script execution logs
2. **Webhook Status**: Use `getMaytapiWebhookStatus()` to verify configuration
3. **API Status**: Use `testMaytapiConnection()` to check API connectivity

#### User Management

1. **Add Users**: Ensure WhatsApp numbers are in employee database
2. **Update Permissions**: Manage sheet access permissions
3. **Monitor Usage**: Track user interactions and data access

## Troubleshooting

### Common Issues

#### 1. Messages Not Received

**Symptoms**: Webhook not triggered, no incoming messages logged

**Solutions**:
- Verify webhook URL is correctly configured
- Check if web app is deployed with public access
- Ensure phone is connected and online in Maytapi dashboard

```javascript
// Troubleshoot webhook issues
troubleshootMaytapiIntegration();
```

#### 2. API Connection Errors

**Symptoms**: Failed to send messages, API errors in logs

**Solutions**:
- Verify API credentials in CONFIG.MAYTAPI_CONFIG
- Check phone connection status
- Ensure sufficient API credits

```javascript
// Test API connection
testMaytapiConnection();
```

#### 3. User Not Found

**Symptoms**: "WhatsApp number not registered" error

**Solutions**:
- Add user to employee database with correct WhatsApp number
- Verify phone number format (include country code)
- Check `findEmployeeByWhatsApp()` function

#### 4. Sheet Access Issues

**Symptoms**: Cannot access or create user sheets

**Solutions**:
- Verify folder permissions in CONFIG.USER_SHEETS_CONFIG
- Check if user sheets feature is enabled
- Ensure sufficient Google Drive storage

### Debug Functions

```javascript
// Test specific user interaction
testCompleteUserFlow();

// Verify configuration
troubleshootMaytapiIntegration();

// Test webhook handling
testMaytapiWebhookIntegration();

// Check API connectivity
testMaytapiConnection();
```

### Log Analysis

Monitor these key log entries:

- `📱 Received WhatsApp message from...`: Incoming message processed
- `📤 Sending WhatsApp message to...`: Outgoing message sent
- `❌ Error handling WhatsApp message...`: Processing errors
- `📦 Webhook payload:`: Raw webhook data received

## API Reference

### Core Functions

#### `handleIncomingWhatsAppMessage(phone, message)`
Main message processing function
- **phone**: Sender's phone number
- **message**: Message content

#### `doPost(e)`
Webhook handler for Maytapi requests
- **e**: Event object containing webhook data

#### `sendWhatsAppMessage(phone, message)`
Send WhatsApp message (from notifications.js)
- **phone**: Recipient phone number
- **message**: Message content

### Setup Functions

#### `setupMaytapiWebhook()`
Configure webhook URL in Maytapi

#### `testMaytapiConnection()`
Test API connectivity and credentials

#### `getMaytapiWebhookStatus()`
Get current webhook configuration

### Testing Functions

#### `runAllMaytapiTests()`
Execute complete test suite

#### `testMaytapiWebhookIntegration()`
Test webhook handling

#### `testCompleteUserFlow()`
Test end-to-end user interaction

## Security Considerations

### 1. Webhook Security

- Webhook URL should be HTTPS only
- Consider implementing webhook signature verification
- Monitor for unusual traffic patterns

### 2. Data Protection

- User sheets contain personal submission data
- Access is restricted to sheet owner only
- Audit logs track data access

### 3. Phone Number Privacy

- Phone numbers are stored securely in employee database
- No phone numbers exposed in logs or error messages
- Access requires prior registration

## Performance Optimization

### 1. Caching Strategy

- Conversation states cached for 10 minutes
- Employee lookups cached to reduce database queries
- Sheet metadata cached for faster response

### 2. Error Handling

- Graceful degradation for non-critical errors
- Automatic retry for temporary failures
- Comprehensive error logging

### 3. Rate Limiting

- Built-in Maytapi rate limits respected
- Message queuing for high-volume scenarios
- Webhook timeout handling

## Maintenance

### Regular Tasks

1. **Monitor API Usage**: Check Maytapi credit usage and limits
2. **Review Logs**: Weekly review of error logs and user interactions
3. **Update Dependencies**: Keep Apps Script libraries updated
4. **Test Functionality**: Monthly end-to-end testing

### Updates and Changes

1. **Configuration Changes**: Update CONFIG object and redeploy
2. **Webhook Updates**: Redeploy web app after webhook changes
3. **API Upgrades**: Monitor Maytapi API version updates

## Support and Resources

### Documentation
- [Maytapi API Documentation](https://maytapi.com/whatsapp-api-documentation)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)

### Community and Support
- [Maytapi Support](mailto:info@maytapi.com)
- Internal IT support for deployment issues

### Example Projects
- [Maytapi NodeJS Example](https://github.com/maytapi-com/whatsapp-api-nodejs-example)
- [Maytapi Python Example](https://github.com/maytapi-com/whatsapp-api-python-example)

---

**Version**: 2.0  
**Last Updated**: January 2024  
**Author**: Anwar Sales Ecosystem Development Team
