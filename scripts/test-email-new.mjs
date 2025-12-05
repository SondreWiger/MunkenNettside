import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

// Load .env file
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      acc[key.trim()] = valueParts.join('=').trim();
      return acc;
    }, {});
  
  Object.assign(process.env, envVars);
}

const testEmail = process.argv[2] || 'test@example.com';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
});

const mailOptions = {
  from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
  to: testEmail,
  subject: '🎭 Test Email from Teateret',
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333;">Test Email from Teateret</h1>
          <p>Hei!</p>
          <p>Dette er en test e-post for å verifisere at e-posttjenesten fungerer korrekt.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Sendt via Brevo SMTP
          </p>
        </div>
      </body>
    </html>
  `,
};

console.log('[Test] Sending test email...');
console.log('[Test] From:', mailOptions.from);
console.log('[Test] To:', mailOptions.to);
console.log('[Test] SMTP Server:', process.env.SMTP_SERVER);

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('[Test] ❌ Error sending email:', error.message);
    process.exit(1);
  } else {
    console.log('[Test] ✅ Email sent successfully!');
    console.log('[Test] Response:', info.response);
    process.exit(0);
  }
});
