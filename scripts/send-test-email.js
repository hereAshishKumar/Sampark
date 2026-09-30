import nodemailer from 'nodemailer';

// Parse command line arguments
// Usage: node scripts/send-test-email.js [phone] [senderName] [subject] [body]
const args = process.argv.slice(2);
const phone = args[0] || '9876543210';
const senderName = args[1] || 'State Bank of India';
const subject = args[2] || 'Subsidy Credited: Rs 5,000 for Fertilizer Assistance';
const body = args[3] || `Dear Customer,\n\nYour account has been credited with Rs 5,000 under the Government Agriculture Subvention Scheme.\n\nTransaction ID: TXN99482104\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nThank you for banking with us.\n- SBI Rural Banking Division`;

const recipientEmail = `${phone}@sampark.in`;
const senderEmail = `notifications@${senderName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`;

console.log('----------------------------------------------------');
console.log('🌾 संपर्क (Sampark) SMTP Test Email Dispatcher');
console.log('----------------------------------------------------');
console.log(`📤 Sender:    ${senderName} <${senderEmail}>`);
console.log(`📥 Recipient: ${recipientEmail}`);
console.log(`📋 Subject:   ${subject}`);
console.log(`🔌 Target:    localhost:2525`);
console.log('----------------------------------------------------');

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 2525,
  secure: false,
  tls: { rejectUnauthorized: false }
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: subject,
      text: body,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #0284c7; margin-top: 0;">${senderName}</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p style="font-size: 16px; line-height: 1.6; color: #1e293b;">
            ${body.replace(/\n/g, '<br/>')}
          </p>
          <div style="margin-top: 25px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #64748b;">
            This email was delivered directly to your mobile phone number via <strong>संपर्क (Sampark)</strong>.
          </div>
        </div>
      `
    });

    console.log('✅ Email successfully delivered to local SMTP receiver!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('   Check the Sampark web dashboard or simulator drawer to see the new email & SMS alert!');
  } catch (err) {
    console.error('❌ Failed to deliver email to local SMTP:', err.message);
    console.log('   Make sure the Sampark backend server is running on port 2525.');
  }
}

main();
