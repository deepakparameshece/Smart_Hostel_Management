const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  let transporter;
  
  // Check if SMTP environment variables are present
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // FALLBACK: Auto-generate Ethereal test SMTP credentials for local testing!
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('✉️ No custom SMTP configured in .env. Initialized Ethereal test mail system.');
    } catch (err) {
      console.error('❌ Failed to initialize fallback Ethereal email service:', err);
      return null;
    }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SmartHostel Support" <noreply@smarthostel.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    
    // If using Ethereal test account, print the browser preview URL!
    if (!hasSmtpConfig) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 Preview Ethereal Email online at: ${previewUrl}`);
      return { previewUrl };
    }

    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error;
  }
};

module.exports = { sendEmail };
