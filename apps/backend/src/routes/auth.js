import express from 'express';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { db } from '../db.js';
import { sendSmsNotification } from '../services/telephonyService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sampark_hackathon_super_secret_key_2026';

// Twilio Verify Client
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA08dcf91f921ee15f096fd272f4b6bb78';

if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('Failed to initialize Twilio client for Verify:', err.message);
  }
}

// Request OTP (supports channel: 'sms' or 'call')
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, language = 'hi', channel = 'call' } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const fullPhone = `+91${cleanPhone}`;
    let twilioVerifySuccess = false;
    let fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Try real Twilio Verify Voice Call or SMS
    if (twilioClient && verifyServiceSid) {
      try {
        console.log(`[Twilio Verify] Dispatching verification via ${channel} to ${fullPhone}...`);
        const verification = await twilioClient.verify.v2.services(verifyServiceSid)
          .verifications
          .create({ to: fullPhone, channel: channel === 'call' ? 'call' : 'sms' });
        
        console.log(`[Twilio Verify] ✓ Dispatched! Status: ${verification.status}, Channel: ${verification.channel}`);
        twilioVerifySuccess = true;
      } catch (twilioErr) {
        console.warn(`[Twilio Verify] ${channel} failed (${twilioErr.message}). Using local OTP engine.`);
      }
    }

    // 2. Always maintain local DB OTP so login is 100% resilient
    db.saveOtp(cleanPhone, fallbackCode);

    // 3. Dispatch in-app SMS / simulator notification
    let message = '';
    if (language === 'ta') {
      message = `உங்கள் சம்பார்க் உள்நுழைவு குறியீடு: ${fallbackCode}.`;
    } else if (language === 'hi') {
      message = `आपका संपर्क लॉगिन ओटीपी: ${fallbackCode}।`;
    } else {
      message = `Your Sampark verification code is ${fallbackCode}.`;
    }

    await sendSmsNotification(cleanPhone, message);

    return res.json({
      success: true,
      message: twilioVerifySuccess 
        ? (channel === 'call' ? 'Twilio Voice Call initiated to your phone!' : 'SMS sent via Twilio!') 
        : 'OTP generated successfully',
      phone: cleanPhone,
      channel: channel,
      twilio_live: twilioVerifySuccess,
      demo_otp: fallbackCode
    });
  } catch (err) {
    console.error('Error in send-otp:', err);
    res.status(500).json({ error: 'Failed to dispatch OTP' });
  }
});

// Verify OTP & Login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, language = 'hi', name = '' } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const fullPhone = `+91${cleanPhone}`;
    let isCodeValid = false;

    // 1. Check Twilio Verify API if active
    if (twilioClient && verifyServiceSid && otp.length === 6 && otp !== '123456') {
      try {
        const check = await twilioClient.verify.v2.services(verifyServiceSid)
          .verificationChecks
          .create({ to: fullPhone, code: otp.trim() });
        
        if (check.status === 'approved') {
          console.log(`[Twilio Verify] ✓ Phone ${fullPhone} approved by Twilio!`);
          isCodeValid = true;
        }
      } catch (err) {
        // Fall back to local check
      }
    }

    // 2. Fall back to local DB check / universal demo code
    if (!isCodeValid) {
      isCodeValid = db.verifyOtp(cleanPhone, otp.trim());
    }

    if (!isCodeValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP. Please try again or use 123456.' });
    }

    // Ensure citizen exists
    let user = db.getUserByPhone(cleanPhone);
    if (!user) {
      user = db.createUser(cleanPhone, name, language);
    } else if (language && user.language !== language) {
      user = db.updateUserLanguage(cleanPhone, language);
    }

    // Sign JWT
    const token = jwt.sign(
      { phone: user.phone, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get current profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserByPhone(decoded.phone);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
});

// Update Language Preference
router.post('/language', (req, res) => {
  const { phone, language } = req.body;
  if (!phone || !language) {
    return res.status(400).json({ error: 'Phone and language are required' });
  }
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const updated = db.updateUserLanguage(cleanPhone, language);
  return res.json({ success: true, user: updated });
});

export default router;
