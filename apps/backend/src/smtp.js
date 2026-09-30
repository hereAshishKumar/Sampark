import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { db } from './db.js';
import { sendSmsNotification, triggerIvrCall } from './services/telephonyService.js';
import { v4 as uuidv4 } from 'uuid';

export function startSmtpServer(port = 2525) {
  const server = new SMTPServer({
    authOptional: true, // Allow test tools and local clients to send without mandatory SMTP auth
    disabledCommands: ['STARTTLS'], // Simple plain SMTP for local network & containers
    
    onConnect(session, callback) {
      console.log(`[SMTP] Incoming connection from ${session.remoteAddress}`);
      return callback(); // Accept connection
    },

    onMailFrom(address, session, callback) {
      // Accept sender
      return callback();
    },

    onRcptTo(address, session, callback) {
      // Validate recipient domain or extract phone
      const to = address.address;
      const localPart = to.split('@')[0];
      const cleanPhone = localPart.replace(/[^0-9]/g, '').slice(-10);

      if (cleanPhone.length !== 10) {
        console.warn(`[SMTP] Recipient '${to}' does not contain a valid 10-digit phone number.`);
        // We still accept it to prevent bounces during hackathons, or reject with callback(new Error(...))
      }
      return callback();
    },

    async onData(stream, session, callback) {
      try {
        const parsed = await simpleParser(stream);

        // Determine recipient phone number
        const toAddresses = parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : [];
        let recipientAddress = toAddresses.length > 0 ? (toAddresses[0].text || toAddresses[0].value?.[0]?.address || '') : '';
        
        let cleanPhone = recipientAddress.split('@')[0].replace(/[^0-9]/g, '').slice(-10);
        if (!cleanPhone || cleanPhone.length < 10) {
          cleanPhone = "9876543210"; // Default fallback demo citizen
        }

        const senderAddress = parsed.from?.text || parsed.from?.value?.[0]?.address || 'unknown@sender.com';
        const senderName = parsed.from?.value?.[0]?.name || senderAddress.split('@')[0];
        const subject = parsed.subject || '(No Subject)';
        const bodyText = parsed.text || '';
        const bodyHtml = parsed.html || `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`;

        const emailRecord = {
          id: uuidv4(),
          user_phone: cleanPhone,
          sender: senderAddress,
          sender_name: senderName,
          recipient: `${cleanPhone}@${process.env.DOMAIN || 'sampark.in'}`,
          subject: subject,
          body_text: bodyText,
          body_html: bodyHtml,
          received_at: new Date().toISOString(),
          is_read: false,
          folder: 'inbox',
          has_attachments: (parsed.attachments && parsed.attachments.length > 0)
        };

        // 1. Ensure user exists (auto-create citizen account if email received)
        let user = db.getUserByPhone(cleanPhone);
        if (!user) {
          user = db.createUser(cleanPhone, `Citizen ${cleanPhone}`, 'hi');
          console.log(`[SMTP] Auto-created new citizen account for phone: ${cleanPhone}`);
        }

        // 2. Save email to database
        db.saveIncomingEmail(emailRecord);
        console.log(`[SMTP] ✓ Successfully stored email for ${cleanPhone}: "${subject}" from ${senderName}`);

        // 3. Dispatch SMS Notification
        const userLang = user?.language || 'hi';
        let smsText = '';
        if (userLang === 'ta') {
          smsText = `சம்பார்க் அறிவிப்பு: ${senderName} இடமிருந்து புதிய மின்னஞ்சல்: "${subject}". படிக்க உள்நுழைக.`;
        } else if (userLang === 'hi') {
          smsText = `संपर्क अलर्ट: ${senderName} से नया ईमेल प्राप्त हुआ: "${subject}". पढ़ने के लिए sampark.in खोलें.`;
        } else {
          smsText = `Sampark Alert: New email from ${senderName}: "${subject}". Login to sampark.in to view.`;
        }

        sendSmsNotification(cleanPhone, smsText);

        // 4. Trigger IVR voice call alert
        triggerIvrCall(cleanPhone, `New email from ${senderName} with subject: ${subject}`);

        return callback();
      } catch (err) {
        console.error('[SMTP] Error parsing incoming email:', err);
        return callback(new Error('Failed to process message'));
      }
    }
  });

  server.listen(port, () => {
    console.log(`✓ Local SMTP Server listening on port ${port} (ready to accept incoming emails)`);
  });

  server.on('error', (err) => {
    console.error('[SMTP] Server error:', err.message);
  });

  return server;
}
