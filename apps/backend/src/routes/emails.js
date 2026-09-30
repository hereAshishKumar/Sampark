import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sampark_hackathon_super_secret_key_2026';

// Middleware to extract user from JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const phoneHeader = req.headers['x-user-phone'];
    if (phoneHeader) {
      req.user = { phone: phoneHeader.replace(/[^0-9]/g, '').slice(-10) };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Get emails for logged-in citizen with section counts
router.get('/', authMiddleware, (req, res) => {
  const folder = req.query.folder || 'inbox';
  const emails = db.getEmailsForUser(req.user.phone, folder);
  
  // Calculate counts for all sections
  const allUserEmails = db.getEmailsForUser(req.user.phone, 'all');
  const counts = {
    inbox: allUserEmails.filter(e => e.folder === 'inbox').length,
    unread: allUserEmails.filter(e => !e.is_read && e.folder !== 'trash' && e.folder !== 'spam').length,
    read: allUserEmails.filter(e => e.is_read && e.folder !== 'trash' && e.folder !== 'spam').length,
    starred: allUserEmails.filter(e => e.is_starred && e.folder !== 'trash').length,
    draft: allUserEmails.filter(e => e.folder === 'draft').length,
    spam: allUserEmails.filter(e => e.folder === 'spam').length,
    trash: allUserEmails.filter(e => e.folder === 'trash').length,
    sent: allUserEmails.filter(e => e.folder === 'sent').length
  };

  res.json({ emails, counts });
});

// Get single email & mark read
router.get('/:id', authMiddleware, (req, res) => {
  const email = db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  if (email.user_phone === req.user.phone) {
    db.markAsRead(email.id);
  }
  res.json({ email });
});

// Mark single email as read
router.patch('/:id/read', authMiddleware, (req, res) => {
  const updated = db.markAsRead(req.params.id);
  res.json({ success: true, email: updated });
});

// Toggle starred status
router.patch('/:id/star', authMiddleware, (req, res) => {
  const updated = db.toggleStar(req.params.id);
  res.json({ success: true, email: updated });
});

// Move email to folder (inbox, spam, trash, etc.)
router.patch('/:id/folder', authMiddleware, (req, res) => {
  const { folder } = req.body;
  if (!folder) {
    return res.status(400).json({ error: 'Target folder is required' });
  }
  const updated = db.moveFolder(req.params.id, folder);
  res.json({ success: true, email: updated });
});

// Compose & Send email
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Recipient and subject are required' });
    }

    const domain = process.env.DOMAIN || 'sampark.in';
    const senderEmail = `${req.user.phone}@${domain}`;
    const user = db.getUserByPhone(req.user.phone);

    const sentEmail = {
      id: uuidv4(),
      user_phone: req.user.phone,
      sender: senderEmail,
      sender_name: user?.name || `Citizen ${req.user.phone}`,
      recipient: to,
      subject: subject,
      body_text: body || '',
      body_html: `<p>${(body || '').replace(/\n/g, '<br/>')}</p>`,
      received_at: new Date().toISOString(),
      is_read: true,
      is_starred: false,
      folder: 'sent',
      has_attachments: false
    };

    db.saveIncomingEmail(sentEmail);

    // If recipient is another Sampark user, route to their inbox
    const recipientDomain = to.split('@')[1];
    if (recipientDomain === domain || recipientDomain === 'localhost') {
      const recipientPhone = to.split('@')[0].replace(/[^0-9]/g, '').slice(-10);
      if (recipientPhone.length === 10) {
        const inboxCopy = {
          ...sentEmail,
          id: uuidv4(),
          user_phone: recipientPhone,
          folder: 'inbox',
          is_read: false
        };
        db.saveIncomingEmail(inboxCopy);
      }
    }

    res.json({
      success: true,
      message: 'Email dispatched successfully',
      email: sentEmail
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to dispatch email' });
  }
});

// Delete email (moves to trash or removes permanently)
router.delete('/:id', authMiddleware, (req, res) => {
  db.deleteEmail(req.params.id);
  res.json({ success: true, message: 'Email moved to trash or removed' });
});

export default router;
