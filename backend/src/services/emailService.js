const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

const sendVerificationEmail = async ({ email, name, token }) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  if (process.env.EMAIL_PREVIEW === 'true') {
    console.log(`Email verification link for ${email}: ${verificationUrl}`);
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Verify your GCAA Attendance account',
    text: `Hello ${name}, verify your GCAA Attendance account here: ${verificationUrl}`,
    html: `<p>Hello ${name},</p><p>Verify your GCAA Attendance account by clicking the link below.</p><p><a href="${verificationUrl}">Verify email address</a></p><p>This link expires in 24 hours.</p>`
  });
};

const sendLoginCodeEmail = async ({ email, name, code }) => {
  if (process.env.EMAIL_PREVIEW === 'true') {
    console.log(`Two-step login code for ${email}: ${code}`);
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your GCAA Attendance login code',
    text: `Hello ${name}, your GCAA Attendance login code is ${code}. It expires in 10 minutes.`,
    html: `<p>Hello ${name},</p><p>Your GCAA Attendance login code is:</p><p style="font-size: 24px; font-weight: bold; letter-spacing: 6px;">${code}</p><p>This code expires in 10 minutes.</p>`
  });
};

module.exports = { sendVerificationEmail, sendLoginCodeEmail };