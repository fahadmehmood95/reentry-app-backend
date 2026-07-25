// test-mail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'fahadmehmood9507@gmail.com',
    pass: 'pclfetppznxmyhrg',
  },
});

transporter.verify((err, success) => {
  if (err) console.error('FAILED:', err);
  else console.log('SUCCESS: SMTP connection verified');
});
