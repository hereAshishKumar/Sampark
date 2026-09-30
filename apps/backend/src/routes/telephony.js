import express from 'express';
import { 
  registerSseClient, 
  sendSmsNotification, 
  triggerIvrCall, 
  generateIvrTwiml 
} from '../services/telephonyService.js';
import { db } from '../db.js';

const router = express.Router();

// SSE Stream for real-time live SMS/Call drawer in web frontend
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  registerSseClient(res);
});

// Get telephony logs
router.get('/logs', (req, res) => {
  const logs = db.getTelephonyLogs();
  res.json({ logs });
});

// Send custom test SMS
router.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }
  const log = await sendSmsNotification(phone, message);
  res.json({ success: true, log });
});

// Trigger IVR call
router.post('/trigger-call', async (req, res) => {
  const { phone, summary } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }
  const log = await triggerIvrCall(phone, summary || 'You have new emails waiting in Sampark.');
  res.json({ success: true, log });
});

// Twilio Voice Webhook - Returns TwiML XML
router.all('/ivr/twiml', (req, res) => {
  const phone = req.query.phone || req.body?.From || '9876543210';
  const user = db.getUserByPhone(phone);
  const lang = user?.language || 'hi';

  const xml = generateIvrTwiml(phone, lang);
  res.setHeader('Content-Type', 'text/xml');
  res.send(xml);
});

// Twilio Voice Digits Handler
router.post('/ivr/handle-key', (req, res) => {
  const digits = req.body?.Digits;
  const phone = req.query?.phone || '9876543210';
  const emailId = req.query?.id;
  const user = db.getUserByPhone(phone);
  const lang = user?.language || 'hi';

  const email = emailId ? db.getEmailById(emailId) : null;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang === 'ta' ? 'ta-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN')}">
    ${email ? `संदेश प्रेषक: ${email.sender_name}। विषय: ${email.subject}। संदेश का विवरण: ${email.body_text.slice(0, 150)}` : 'कोई संदेश उपलब्ध नहीं है।'}
  </Say>
  <Say>धन्यवाद! संपर्क से जुड़े रहें।</Say>
  <Hangup/>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
});

export default router;
