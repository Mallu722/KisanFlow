const SmsDeliveryLog = require('../models/SmsDeliveryLog');

/**
 * Reusable sendSms utility — supports MSG91 (India DLT), Twilio, and Simulator fallback.
 * Logs all delivery attempts to the smsdeliverylogs collection in MongoDB.
 *
 * Priority:
 *   1. MSG91     → if MSG91_AUTH_KEY is set and is not a placeholder value
 *   2. Twilio    → if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER are set
 *   3. Simulator → console-only fallback (no real SMS sent)
 */
async function sendSms({ phone, message, templateId = null, notificationId = null, farmerId = null }) {
  if (!phone) {
    console.log('⚠️  [SMS SKIPPED] No phone number provided.');
    return { success: false, reason: 'No phone number provided' };
  }

  const cleanPhone     = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

  let provider     = 'simulator';
  let success      = false;
  let errorMessage = null;

  // Resolve which templateId to use (skip placeholder values)
  const resolvedTemplateId =
    templateId ||
    (process.env.MSG91_DEFAULT_TEMPLATE_ID !== 'your_dlt_template_id_here'
      ? process.env.MSG91_DEFAULT_TEMPLATE_ID
      : null);

  // ─── Console header ──────────────────────────────────────────────────────────
  console.log('\n====================================================================');
  console.log(`📱 [REAL-TIME SMS DISPATCHED] To: ${formattedPhone}`);
  console.log(`💬 Message: "${message}"`);
  if (resolvedTemplateId) console.log(`📋 DLT Template ID: ${resolvedTemplateId}`);
  console.log(`🕒 Sent At: ${new Date().toLocaleString('en-IN')}`);
  console.log('====================================================================');

  // ════════════════════════════════════════════════════════════════════════════
  // 1. MSG91 Integration (India DLT Gateway — Recommended for India)
  // ════════════════════════════════════════════════════════════════════════════
  const msg91Key    = process.env.MSG91_AUTH_KEY;
  const msg91IsReal = msg91Key && msg91Key !== 'your_msg91_auth_key_here';

  if (msg91IsReal && cleanPhone.length === 10) {
    provider = 'msg91';

    const payload = {
      template_id : resolvedTemplateId,
      sender      : process.env.MSG91_SENDER_ID || 'KRHFLW',
      short_url   : '1',
      recipients  : [{ mobiles: `91${cleanPhone}`, message }],
    };

    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method  : 'POST',
        headers : {
          authkey          : msg91Key,
          'content-type'   : 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // MSG91 returns HTTP 200 even for errors — must check data.type
      if (response.ok && data.type === 'success') {
        success = true;
        console.log(`✅ [MSG91 SMS SENT] Delivered to ${formattedPhone}`);
        console.log(`   MSG91 Response:`, JSON.stringify(data));
      } else {
        success      = false;
        errorMessage = data.message || JSON.stringify(data);
        console.error(`❌ [MSG91 ERROR] Response:`, JSON.stringify(data));
        console.error(`   ➜ Common causes: invalid template_id, sender not approved, DLT mismatch.`);
      }
    } catch (err) {
      success      = false;
      errorMessage = err.message;
      console.error(`❌ [MSG91 NETWORK ERROR]:`, err.message);
    }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Twilio Integration (International fallback)
  // ════════════════════════════════════════════════════════════════════════════
  } else if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN  &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    provider = 'twilio';
    let twilio;
    try { twilio = require('twilio'); } catch { twilio = null; }

    if (twilio) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body : message,
          from : process.env.TWILIO_PHONE_NUMBER,
          to   : formattedPhone,
        });
        success = true;
        console.log(`✅ [TWILIO SMS SENT] Delivered to ${formattedPhone}`);
      } catch (err) {
        success      = false;
        errorMessage = err.message;
        console.error(`❌ [TWILIO ERROR]:`, err.message);
      }
    } else {
      errorMessage = 'twilio npm package not installed. Run: npm install twilio';
      console.error(`❌ [TWILIO] ${errorMessage}`);
    }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. Simulator Fallback — console only, no real SMS sent
  // ════════════════════════════════════════════════════════════════════════════
  } else {
    // Treat simulator as "success" so app flow continues unblocked
    success  = true;
    provider = 'simulator';

    if (msg91Key === 'your_msg91_auth_key_here') {
      console.warn(`⚠️  [SMS SIMULATOR] MSG91_AUTH_KEY is still a placeholder.`);
      console.warn(`   ➜ Replace it in backend/.env with your real Auth Key from https://msg91.com`);
    } else {
      console.warn(`⚠️  [SMS SIMULATOR] No SMS provider configured in .env — SMS not actually sent.`);
    }
    console.log(`🔔 [SIMULATOR] Would have sent: "${message}" → ${formattedPhone}`);
  }

  console.log('====================================================================\n');

  // ─── Log delivery attempt to MongoDB (non-blocking) ─────────────────────────
  try {
    await SmsDeliveryLog.create({
      notificationId : notificationId || null,
      farmerId       : farmerId       || null,
      phone          : formattedPhone,
      message,
      templateId     : resolvedTemplateId,
      status         : success ? 'sent' : 'failed',
      provider,
      errorMessage,
      sentAt         : new Date(),
    });
  } catch (logErr) {
    console.error('⚠️  Failed to write SMS delivery log to MongoDB:', logErr.message);
  }

  return { success, provider, phone: formattedPhone, errorMessage };
}

module.exports = { sendSms };
