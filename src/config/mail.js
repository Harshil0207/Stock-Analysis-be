import dotenv from 'dotenv';

dotenv.config();

const mailConfig = {
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    email: process.env.SMTP_FROM_EMAIL || 'noreply@stockmarketapp.com',
    name: process.env.SMTP_FROM_NAME || 'Stock Market App',
  },
};

export default mailConfig;
