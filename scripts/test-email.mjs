import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
});

const testEmail = process.argv[2] || 'test@example.com';

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
    console.error('[Test] ❌ Error sending email:', error);
    process.exit(1);
  } else {
    console.log('[Test] ✅ Email sent successfully!');
    console.log('[Test] Response:', info.response);
    process.exit(0);
  }
});
