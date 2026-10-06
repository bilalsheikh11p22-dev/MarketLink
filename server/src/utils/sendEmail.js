import nodemailer from 'nodemailer'

let cachedTransporter = null

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter
  cachedTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  })
  return cachedTransporter
}

/**
 * Sends a real email via SMTP when EMAIL_HOST/EMAIL_USER/EMAIL_PASS are set.
 * In development, if no SMTP credentials are configured, it logs the email
 * to the server console instead of failing, so the flow is still testable
 * end-to-end without real credentials.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    console.warn('\n[sendEmail] EMAIL_HOST/EMAIL_USER/EMAIL_PASS are not set — printing email instead of sending it.')
    console.warn(`[sendEmail] To: ${to}\n[sendEmail] Subject: ${subject}\n[sendEmail] Body:\n${text || html}\n`)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email service is not configured on the server')
    }
    return { delivered: false, dev: true }
  }

  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `MarketLink <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text
  })
  return { delivered: true }
}

export function otpEmailTemplate(code, name) {
  return {
    subject: 'Your MarketLink password reset code',
    text: `Hi ${name || ''},\n\nYour MarketLink password reset code is: ${code}\nThis code expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee">
        <h2 style="color:#2f4a34;margin-bottom:4px;">MarketLink</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#2f4a34;margin:24px 0;">${code}</p>
        <p style="color:#666;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  }
}
