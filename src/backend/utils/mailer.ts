import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "KrishiHat <noreply@krishihat.com>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

// ── Email Templates ─────────────────────────────────────

export function passwordResetTemplate(name: string, resetUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#2d7a2d;">KrishiHat — Password Reset</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2d7a2d;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <p style="color:#9ca3af;font-size:12px;">KrishiHat &mdash; Bangladesh Agricultural Marketplace</p>
    </div>
  `;
}

export function emailVerificationTemplate(name: string, verifyUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#2d7a2d;">KrishiHat — Verify Your Email</h2>
      <p>Hi <strong>${name}</strong>, welcome to KrishiHat!</p>
      <p>Please verify your email address to activate your account.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2d7a2d;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
        Verify Email
      </a>
      <p style="color:#6b7280;font-size:13px;">This link expires in 24 hours.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <p style="color:#9ca3af;font-size:12px;">KrishiHat &mdash; Bangladesh Agricultural Marketplace</p>
    </div>
  `;
}

export function orderConfirmationTemplate(name: string, orderId: string, total: number): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#2d7a2d;">Order Confirmed!</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
      <p>Total: <strong>৳ ${total.toFixed(2)}</strong></p>
      <p style="color:#6b7280;font-size:13px;">You will receive updates as your order is processed.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <p style="color:#9ca3af;font-size:12px;">KrishiHat &mdash; Bangladesh Agricultural Marketplace</p>
    </div>
  `;
}