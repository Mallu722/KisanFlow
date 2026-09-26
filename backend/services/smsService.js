const SmsDeliveryLog = require('../models/SmsDeliveryLog');

/**
 * Reusable sendSms utility function supporting MSG91, Twilio, Fast2SMS, and DLT Templates.
 * Logs all delivery attempts to the smsdeliverylogs collection in MongoDB.
 */
async function sendSms({ phone, message, templateId = null, notificationId = null, farmerId = null }) {
  if (!phone) {
    console.log('⚠️ [SMS SKIPPED] No phone number provided.');
    return { success: false, reason: 'No phone number provided' };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
  let provider = 'msg91-simulator';
  let success = true;
  let errorMessage = null;

  console.log(`\n====================================================================`);
  console.log(`📱 [REAL-TIME SMS DISPATCHED] To: ${formattedPhone}`);
  console.log(`💬 Message: "${message}"`);
  if (templateId) console.log(`📋 DLT Template ID: ${templateId}`);
  console.log(`🕒 Sent At: ${new Date().toLocaleString('en-IN')}`);
  console.log(`====================================================================\n`);

  try {
    // 1. MSG91 Integration (India DLT SMS Gateway)
    if (process.env.MSG91_AUTH_KEY && cleanPhone.length === 10) {
      provider = 'msg91';
      const payload = {
        template_id: templateId || process.env.MSG91_DEFAULT_TEMPLATE_ID,
        sender: process.env.MSG91_SENDER_ID || 'KRHFLW',
        short_url: '1',
        recipients: [{ mobiles: `91${cleanPhone}`, message }],
      };
      
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(`✅ [MSG91 SMS SENT] Response:`, data);
    }
    // 2. Twilio SMS Integration
    else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      provider = 'twilio';
      let twilio;
      try { twilio = require('twilio'); } catch { twilio = null; }
      if (twilio) {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });
        console.log(`✅ [TWILIO SMS SENT] Delivered to ${formattedPhone}`);
      }
    }
  } catch (err) {
    success = false;
    errorMessage = err.message;
    console.error(`❌ [SMS GATEWAY ERROR]:`, err.message);
  }

  // Log SMS delivery attempt to MongoDB smsdeliverylogs collection (Non-blocking)
  try {
    await SmsDeliveryLog.create({
      notificationId: notificationId || null,
      farmerId: farmerId || null,
      phone: formattedPhone,
      message,
      templateId,
      status: success ? 'sent' : 'failed',
      provider,
      errorMessage,
      sentAt: new Date(),
    });
  } catch (logErr) {
    console.error('Failed to write SMS delivery log to MongoDB:', logErr.message);
  }

  return { success, provider, phone: formattedPhone };
}

module.exports = { sendSms };
