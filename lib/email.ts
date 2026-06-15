import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.SMTP_FROM_EMAIL || "Strantchar <noreply@strantchar.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.strantchar.com';

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Strantchar</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0e0e0;">

        <!-- Header -->
        <tr>
          <td style="background:#0d2340;padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">Strantchar</p>
                  <p style="margin:4px 0 0;color:#8fa8c8;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Private Banking</p>
                </td>
                <td align="right">
                  <p style="margin:0;color:#4a7ab5;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Secure Communication</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        ${body}

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;border-top:1px solid #e8e8e8;padding:24px 40px;">
            <p style="margin:0 0 8px;font-size:11px;color:#888888;line-height:1.6;">
              This message was sent to you by Strantchar. If you did not request this communication or believe you received it in error, please disregard this email or contact our support team immediately.
            </p>
            <p style="margin:0;font-size:11px;color:#aaaaaa;">
              &copy; ${new Date().getFullYear()} Strantchar. All rights reserved. &nbsp;|&nbsp;
              <a href="${APP_URL}" style="color:#4a7ab5;text-decoration:none;">www.strantchar.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Divider helper ───────────────────────────────────────────────────────────
const divider = `<tr><td style="padding:0 40px;"><div style="height:1px;background:#eeeeee;"></div></td></tr>`;

// ─── OTP Email ────────────────────────────────────────────────────────────────
export async function sendOtpEmail(to: string, code: string, name: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL] OTP for ${to}: ${code}`);
      return;
    }

    const body = `
      <tr><td style="padding:36px 40px 24px;">
        <p style="margin:0 0 6px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
        <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0d2340;">Security Authentication</p>
        <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.7;">Dear ${name},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
          We received a request to verify your identity on your Strantchar account.
          Please use the one-time code below to complete verification.
        </p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td align="center" style="padding:0 0 28px;">
            <div style="display:inline-block;background:#f0f4f8;border:1px solid #d0dce8;padding:20px 48px;text-align:center;">
              <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:10px;color:#0d2340;font-family:monospace;">${code}</p>
            </div>
            <p style="margin:12px 0 0;font-size:12px;color:#999999;">This code expires in <strong>10 minutes</strong></p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:13px;color:#888888;line-height:1.7;border-top:1px solid #eeeeee;padding-top:20px;">
          If you did not initiate this request, please contact our support team immediately and do not share this code with anyone.
          Strantchar will never ask for your verification code.
        </p>
      </td></tr>`;

    await resend.emails.send({
      from: FROM, to,
      subject: `Your Strantchar Verification Code: ${code}`,
      html: layout(body),
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

// ─── Welcome Email (self-registered) ─────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL] Welcome email to ${to}`);
      return;
    }

    const body = `
      <tr><td style="padding:36px 40px 32px;">
        <p style="margin:0 0 6px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Account Confirmation</p>
        <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0d2340;">Welcome to Strantchar</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.7;">Dear ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.7;">
          We are pleased to confirm that your Strantchar account has been successfully created.
          You now have access to our full suite of banking services, including account management,
          fund transfers, and loan facilities.
        </p>
        <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
          Please log in to your account to review your account details and explore available services.
        </p>
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${APP_URL}/login"
             style="display:inline-block;background:#0d2340;color:#ffffff;padding:13px 28px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;">
            Access Your Account
          </a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:13px;color:#888888;line-height:1.7;border-top:1px solid #eeeeee;padding-top:20px;">
          If you did not create this account, please contact our support team immediately.
        </p>
      </td></tr>`;

    await resend.emails.send({
      from: FROM, to,
      subject: "Welcome to Strantchar — Account Confirmation",
      html: layout(body),
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// ─── Welcome + Password Email (admin-created account) ────────────────────────
export async function sendWelcomeWithPasswordEmail(
  to: string, name: string, email: string, password: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL] Welcome+Password to ${to}`);
      return;
    }

    const body = `
      <tr><td style="padding:36px 40px 8px;">
        <p style="margin:0 0 6px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Account Notification</p>
        <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0d2340;">Your Account Has Been Created</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.7;">Dear ${name},</p>
        <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
          A Strantchar banking account has been set up on your behalf by our team.
          Your account is now active and ready for use. Please find your access credentials below.
        </p>
      </td></tr>

      <!-- Credentials table -->
      <tr><td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d8d8d8;">
          <tr style="background:#f8f9fa;">
            <td colspan="2" style="padding:12px 20px;border-bottom:1px solid #d8d8d8;">
              <p style="margin:0;font-size:11px;color:#666666;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Login Credentials</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;width:130px;font-weight:600;">Email Address</td>
            <td style="padding:14px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#1a1a1a;">${email}</td>
          </tr>
          <tr>
            <td style="padding:14px 20px;font-size:13px;color:#666666;font-weight:600;">Temporary Password</td>
            <td style="padding:14px 20px;font-size:14px;color:#1a1a1a;font-family:monospace;font-weight:700;letter-spacing:2px;">${password}</td>
          </tr>
        </table>
      </td></tr>

      <!-- Security notice -->
      <tr><td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9ec;border-left:3px solid #c9a227;padding:0;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0;font-size:13px;color:#6b5500;line-height:1.7;">
              <strong>Important Security Notice:</strong> For your protection, you are required to change your password
              upon your first login. Do not share your credentials with anyone. Strantchar will never ask
              for your password via email or phone.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 32px;">
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${APP_URL}/login"
             style="display:inline-block;background:#0d2340;color:#ffffff;padding:13px 28px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;">
            Log In to Your Account
          </a>
        </td></tr></table>
      </td></tr>`;

    await resend.emails.send({
      from: FROM, to,
      subject: "Strantchar — Your New Account Credentials",
      html: layout(body),
    });
  } catch (error) {
    console.error("Error sending welcome+password email:", error);
  }
}

// ─── Transaction Notification Email ──────────────────────────────────────────
export async function sendTransactionEmail(
  to: string,
  name: string,
  type: "deposit" | "withdrawal" | "transfer_sent" | "transfer_received",
  amount: number,
  description: string,
  counterparty?: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL] Transaction email (${type}) to ${to}`);
      return;
    }

    const typeConfig = {
      deposit:            { label: "Credit Alert",     direction: "Credited to your account",  subjectPrefix: "Credit Alert"    },
      withdrawal:         { label: "Debit Alert",      direction: "Debited from your account",  subjectPrefix: "Debit Alert"     },
      transfer_sent:      { label: "Transfer Debit",   direction: "Transferred out of account", subjectPrefix: "Transfer Debit"  },
      transfer_received:  { label: "Transfer Credit",  direction: "Transferred into account",   subjectPrefix: "Transfer Credit" },
    };

    const cfg = typeConfig[type];
    const isCredit = type === "deposit" || type === "transfer_received";
    
    // Fetch global currency
    const config = await prisma.appConfig.findUnique({ where: { id: "global" } });
    const globalCurrency = config?.currency || "USD";
    
    const amountFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: globalCurrency }).format(amount);
    const date = new Date().toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const counterpartyRow = counterparty ? `
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;width:160px;font-weight:600;">
              ${type === "transfer_sent" ? "Beneficiary" : "Originator"}
            </td>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#1a1a1a;">${counterparty}</td>
          </tr>` : "";

    const body = `
      <!-- Alert banner -->
      <tr>
        <td style="background:${isCredit ? "#f0f7f0" : "#fdf4f4"};border-top:3px solid ${isCredit ? "#2d6a2d" : "#8b1c1c"};padding:20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:1.5px;">${cfg.label}</p>
                <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${isCredit ? "#2d6a2d" : "#8b1c1c"};">${amountFormatted}</p>
              </td>
              <td align="right" style="vertical-align:top;">
                <p style="margin:0;font-size:11px;color:#999999;">${date}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr><td style="padding:28px 40px 8px;">
        <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.7;">Dear ${name},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.7;">
          We wish to inform you that a transaction has been processed on your Strantchar account.
          Please review the details below.
        </p>
      </td></tr>

      <!-- Transaction detail table -->
      <tr><td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d8d8d8;">
          <tr style="background:#f8f9fa;">
            <td colspan="2" style="padding:12px 20px;border-bottom:1px solid #d8d8d8;">
              <p style="margin:0;font-size:11px;color:#666666;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Transaction Details</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;width:160px;font-weight:600;">Transaction Type</td>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#1a1a1a;">${cfg.label}</td>
          </tr>
          ${counterpartyRow}
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;font-weight:600;">Description</td>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#1a1a1a;">${description || "Bank Transaction"}</td>
          </tr>
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:13px;color:#666666;font-weight:600;">Amount</td>
            <td style="padding:12px 20px;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:700;color:${isCredit ? "#2d6a2d" : "#8b1c1c"};">${amountFormatted}</td>
          </tr>
          <tr>
            <td style="padding:12px 20px;font-size:13px;color:#666666;font-weight:600;">Date &amp; Time</td>
            <td style="padding:12px 20px;font-size:13px;color:#1a1a1a;">${date}</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-left:3px solid #cccccc;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0;font-size:12px;color:#666666;line-height:1.7;">
              If you did not authorise this transaction or suspect any fraudulent activity on your account,
              please contact our fraud prevention team immediately and do not share your account details with anyone.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:0 40px 32px;">
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;background:#0d2340;color:#ffffff;padding:13px 28px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.5px;">
            View Account Statement
          </a>
        </td></tr></table>
      </td></tr>`;

    await resend.emails.send({
      from: FROM, to,
      subject: `Strantchar — ${cfg.subjectPrefix}: ${amountFormatted}`,
      html: layout(body),
    });
  } catch (error) {
    console.error("Error sending transaction email:", error);
  }
}
