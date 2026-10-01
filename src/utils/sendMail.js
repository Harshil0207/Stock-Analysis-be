import nodemailer from 'nodemailer';
import config from '../config/index.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  auth: {
    user: config.mail.auth.user,
    pass: config.mail.auth.pass,
  },
});


const sendMail = async ({ to, subject, html }) => {
  try {
    const pass = config.mail.auth.pass;
    const isPlaceholder = !pass || pass.startsWith('YOUR_') || pass.includes('PLACEHOLDER');

    if (!config.mail.auth.user || isPlaceholder) {
      logger.warn(`SMTP credentials not configured (placeholder detected). Email to ${to} skipped.`);
      logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
      return { messageId: 'mock-message-id-development' };
    }

    const mailOptions = {
      from: `"${config.mail.from.name}" <${config.mail.from.email}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};

export default sendMail;
