# Enhanced Webhook Setup - Debugging & Alternative Methods

## 🔧 What I Added

Based on your correct Maytapi API endpoint `POST https://api.maytapi.com/api/{{product_id}}/setWebhook`, I've enhanced the webhook setup with:

### 1. Enhanced Debugging
The `setMaytapiWebhook()` function now shows detailed debugging information:

```javascript
console.log('🔗 API URL:', apiUrl);
console.log('📦 Payload:', JSON.stringify(payload, null, 2));
console.log('🔑 Using API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'Missing');
console.log('📥 Raw Response:', responseText);
```

### 2. Alternative Setup Methods
Added `tryAlternativeWebhookSetup()` function with two fallback approaches:

**Method 1: With Phone ID in URL**
```javascript
https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}/setWebhook
```

**Method 2: Form-encoded Payload**
```javascript
Content-Type: application/x-www-form-urlencoded
webhook=your_webhook_url
```

## 🧪 How to Test

Run the enhanced webhook setup:

```javascript
setupMaytapiWebhook();
```

You'll now see detailed logs showing:
- ✅ Exact API URL being called
- ✅ Complete payload being sent  
- ✅ API key verification (first 8 characters)
- ✅ Raw API response from Maytapi
- ✅ Alternative methods if primary fails

## 📊 Expected Results

The enhanced debugging will help identify:

1. **Authentication Issues**: If API key is missing/invalid
2. **URL Problems**: If the endpoint format is wrong
3. **Payload Issues**: If Maytapi expects different payload format
4. **API Response**: Exact error message from Maytapi

## 🔍 Debugging Your Current Setup

Your current configuration looks correct:
```javascript
MAYTAPI_CONFIG: {
  PRODUCT_ID: '55968f1b-01dc-4f02-baca-af83b92ca455',
  PHONE_ID: '90126',
  API_KEY: '183bcf62-cf0e-4e1d-9f22-59b0a730cd0b',
  API_URL: 'https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/90126/sendMessage'
}
```

The webhook setup uses the correct endpoint format you provided:
```
POST https://api.maytapi.com/api/55968f1b-01dc-4f02-baca-af83b92ca455/setWebhook
```

## 🚀 Next Steps

1. **Run Enhanced Setup**: Execute `setupMaytapiWebhook()` to see detailed debugging
2. **Check Logs**: Review the console output for specific error details
3. **Try Alternatives**: The function will automatically try alternative methods
4. **Manual Fallback**: If all automated methods fail, set webhook manually in Maytapi Console

The enhanced debugging will give us exact details about why the webhook setup is returning "Unknown error" and help fix it! 🎯

---

**Status**: ✅ Enhanced Debugging and Alternative Methods Deployed  
**Next Action**: Run `setupMaytapiWebhook()` to see detailed logs
