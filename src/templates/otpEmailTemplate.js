/**
 * Generates an HTML email template for OTP delivery.
 * @param {string} fullName Recipient's name
 * @param {string} otp 6-digit OTP
 * @param {string} purpose Action description (e.g. registration, login, password reset)
 * @param {number} expiryMinutes Time limit in minutes
 * @returns {string} HTML content
 */
const otpEmailTemplate = (fullName, otp, purpose, expiryMinutes = 5) => {
  let actionText = '';
  switch (purpose) {
    case 'REGISTER':
      actionText = 'verify your registration';
      break;
    case 'LOGIN':
      actionText = 'authenticate your login';
      break;
    case 'FORGOT_PASSWORD':
      actionText = 'reset your password';
      break;
    default:
      actionText = 'complete your request';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Verify Your OTP</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body {
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          color: #f8fafc;
          margin: 0;
          padding: 0;
          width: 100% !important;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #1e293b;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #334155;
          margin-top: 40px;
          margin-bottom: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .header {
          padding: 30px;
          text-align: center;
          background: linear-gradient(135deg, #1e40af 0%, #0f172a 100%);
          border-bottom: 1px solid #334155;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #38bdf8;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-text {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f8fafc;
        }
        .info-text {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #94a3b8;
        }
        .otp-container {
          text-align: center;
          padding: 24px;
          background-color: #0f172a;
          border-radius: 8px;
          border: 1px dashed #38bdf8;
          margin-bottom: 30px;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 6px;
          color: #38bdf8;
          margin: 0;
        }
        .footer {
          padding: 30px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          background-color: #0f172a;
          border-top: 1px solid #334155;
        }
        .footer p {
          margin: 0 0 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>STOCK MARKET PLATFORM</h1>
        </div>
        <div class="content">
          <div class="welcome-text">Hello ${fullName},</div>
          <div class="info-text">
            We received a request to ${actionText} for your Stock Market account. 
            Please use the 6-digit OTP code below to proceed.
          </div>
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="info-text" style="font-size: 13px; text-align: center; color: #f43f5e;">
            This OTP is confidential and expires in <strong>${expiryMinutes} minutes</strong>. 
            Do not share this code with anyone. If you did not make this request, please ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Stock Market App Inc. All rights reserved.</p>
          <p>Security Notification Service</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default otpEmailTemplate;
