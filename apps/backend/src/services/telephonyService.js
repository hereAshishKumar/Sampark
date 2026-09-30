import 'dotenv/config';
import twilio from 'twilio';
import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory list of active SSE clients (for real-time in-app phone simulator)
const sseClients = new Set();

export function registerSseClient(res) {
  sseClients.add(res);
  res.on('close', () => {
    sseClients.delete(res);
  });
}

export function broadcastTelephonyEvent(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Twilio Client setup
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const fast2SmsKey = process.env.FAST2SMS_API_KEY;

if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('✓ Twilio Client initialized with Account SID:', accountSid.slice(0, 6) + '...');
  } catch (err) {
    console.warn('! Failed to initialize Twilio client:', err.message);
  }
}

/**
 * Send SMS / Mobile Alert to citizen
 * Supports:
 * 1. Fast2SMS (Free Indian SMS API without credit card)
 * 2. Twilio WhatsApp Sandbox (100% Free with existing Twilio account)
 * 3. Twilio SMS (if sender number provided)
 * 4. In-App Live Telephony Drawer (always active, guaranteed demo)
 */
export async function sendSmsNotification(phone, messageText) {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const fullPhone = `+91${cleanPhone}`;
  
  const logEntry = {
    id: uuidv4(),
    type: 'SMS',
    to: fullPhone,
    from: 'SAMPARK',
    content: messageText,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  // 1. Try Fast2SMS if API key is provided (Free Indian Gateway)
  if (fast2SmsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: messageText,
          language: 'english',
          flash: 0,
          numbers: cleanPhone
        })
      });
      const data = await response.json();
      if (data.return) {
        logEntry.status = 'delivered_fast2sms';
        logEntry.from = 'Fast2SMS';
        console.log(`✓ Real SMS sent via Fast2SMS to ${cleanPhone}`);
      } else {
        console.warn('Fast2SMS response:', data.message);
      }
    } catch (err) {
      console.warn('Fast2SMS failed:', err.message);
    }
  }

  // 2. Try Twilio WhatsApp Sandbox (100% Free, No Credit Card Needed!)
  if (twilioClient && process.env.TWILIO_WHATSAPP_ENABLED === 'true') {
    try {
      const waMsg = await twilioClient.messages.create({
        body: `🌾 *संपर्क (Sampark) Alert*\n\n${messageText}`,
        from: 'whatsapp:+14155238886', // Official Twilio Free WhatsApp Sandbox
        to: `whatsapp:${fullPhone}`
      });
      logEntry.status = 'delivered_whatsapp';
      logEntry.from = 'Twilio WhatsApp';
      logEntry.sid = waMsg.sid;
      console.log(`✓ Twilio WhatsApp alert dispatched to ${fullPhone}`);
    } catch (err) {
      console.warn('Twilio WhatsApp error (join sandbox first):', err.message);
    }
  }

  // 3. Try standard Twilio SMS if sender number is configured
  if (twilioClient && twilioNumber) {
    try {
      const result = await twilioClient.messages.create({
        body: messageText,
        from: twilioNumber,
        to: fullPhone
      });
      logEntry.status = result.status;
      logEntry.sid = result.sid;
      logEntry.from = twilioNumber;
      console.log(`✓ Twilio SMS dispatched to ${fullPhone}, SID: ${result.sid}`);
    } catch (err) {
      logEntry.status = 'simulated';
      logEntry.error = err.message;
    }
  } else if (!fast2SmsKey && process.env.TWILIO_WHATSAPP_ENABLED !== 'true') {
    logEntry.status = 'simulated';
  }

  // 4. Always save to local database log
  db.addTelephonyLog(logEntry);

  // 5. Always broadcast to in-app real-time simulator drawer
  broadcastTelephonyEvent({
    type: 'SMS_RECEIVED',
    data: logEntry
  });

  return logEntry;
}

/**
 * Trigger an automated IVR Voice Call to citizen
 */
export async function triggerIvrCall(phone, emailSummary) {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const fullPhone = `+91${cleanPhone}`;
  
  const logEntry = {
    id: uuidv4(),
    type: 'IVR_CALL',
    to: fullPhone,
    from: '+918000-SAMPARK',
    content: emailSummary,
    timestamp: new Date().toISOString(),
    status: 'simulated'
  };

  db.addTelephonyLog(logEntry);

  broadcastTelephonyEvent({
    type: 'INCOMING_CALL',
    data: logEntry
  });

  return logEntry;
}

/**
 * Generate TwiML (XML) response for Twilio Voice IVR
 */
export function generateIvrTwiml(phone, lang = 'hi') {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const emails = db.getEmailsForUser(phone);
  const unreadCount = emails.filter(e => !e.is_read).length;

  if (lang === 'ta') {
    twiml.say({ language: 'ta-IN', voice: 'Polly.Valluvar' }, 
      `வணக்கம்! சம்பார்க் சேவைக்கு வரவேற்கிறோம். உங்களிடம் ${unreadCount} புதிய மின்னஞ்சல்கள் உள்ளன.`
    );
  } else if (lang === 'hi') {
    twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, 
      `नमस्ते! संपर्क सेवा में आपका स्वागत है। आपके पास ${unreadCount} नए ईमेल संदेश हैं।`
    );
  } else {
    twiml.say({ language: 'en-IN' }, 
      `Welcome to Sampark. You have ${unreadCount} unread email messages.`
    );
  }

  if (emails.length > 0) {
    const latest = emails[0];
    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/telephony/ivr/handle-key?phone=${phone}&id=${latest.id}`,
      method: 'POST'
    });

    if (lang === 'hi') {
      gather.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, 
        `नवीनतम संदेश सुनने के लिए 1 दबाएं।`
      );
    } else if (lang === 'ta') {
      gather.say({ language: 'ta-IN', voice: 'Polly.Valluvar' }, 
        `சமீபத்திய செய்தியைக் கேட்க 1 ஐ அழுத்தவும்.`
      );
    } else {
      gather.say({ language: 'en-IN' }, 
        `Press 1 to listen to your latest email from ${latest.sender_name || latest.sender}.`
      );
    }
  }

  return twiml.toString();
}
