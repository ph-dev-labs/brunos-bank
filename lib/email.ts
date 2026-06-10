import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.SMTP_FROM_EMAIL || "Standard Chartered <noreply@admin-chartered.site>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.admin-chartered.site';

// ─── OTP Email ────────────────────────────────────────────────────────────────
export async function sendOtpEmail(to: string, code: string, name: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL TEST] OTP Code for ${to} is: ${code}`);
      return;
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Your Standard Chartered Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #22c55e;">Standard Chartered</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #111;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    console.log("OTP Email sent successfully", data.data?.id);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

// ─── Welcome Email (basic) ────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL TEST] Welcome Email would be sent to ${to}`);
      return;
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Welcome to Standard Chartered!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #22c55e;">Welcome to Standard Chartered, ${name}! 🎉</h2>
          <p>We're thrilled to have you on board.</p>
          <p>Your account has been successfully created and credited with a <strong>$100.00</strong> welcome bonus!</p>
          <p>You can now log in to your dashboard to start managing your finances, applying for loans, and making transfers.</p>
          <a href="${appUrl}/login" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Go to Dashboard</a>
        </div>
      `,
    });
    console.log("Welcome Email sent successfully", data.data?.id);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

// ─── Welcome + Password Email (admin onboarding) ──────────────────────────────
export async function sendWelcomeWithPasswordEmail(
  to: string,
  name: string,
  email: string,
  password: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[LOCAL TEST] Welcome+Password Email for ${to}: email=${email} password=${password}`);
      return;
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Welcome to Standard Chartered — Your Account Is Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Standard Chartered</h1>
            <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px;">Your account has been created</p>
          </div>

          <!-- Body -->
          <div style="padding: 36px 40px; background: #1e293b;">
            <h2 style="color: #f1f5f9; font-size: 20px; margin: 0 0 8px;">Welcome, ${name}! 🎉</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
              Your Standard Chartered banking account has been set up by our team. You can now log in and access all banking features.
            </p>

            <!-- Credentials Box -->
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
              <p style="color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">Your Login Credentials</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px; width: 100px;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 14px; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Password</td>
                  <td style="padding: 10px 0; color: #4ade80; font-size: 16px; font-weight: 700; letter-spacing: 2px; font-family: monospace;">${password}</td>
                </tr>
              </table>
            </div>

            <p style="color: #f59e0b; font-size: 12px; background: #451a03; border: 1px solid #92400e; padding: 12px 16px; border-radius: 8px; margin-bottom: 28px;">
              ⚠️ Please change your password after your first login for security.
            </p>

            <a href="${appUrl}/login"
               style="display: block; text-align: center; background: #16a34a; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">
              Log In to Your Account →
            </a>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; background: #0f172a; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">
              This email was sent by Standard Chartered. If you believe this was a mistake, please contact support.
            </p>
          </div>
        </div>
      `,
    });
    console.log("Welcome+Password Email sent successfully", data.data?.id);
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
      console.log(`[LOCAL TEST] Transaction email for ${to}: ${type} $${amount}`);
      return;
    }

    const typeConfig: Record<typeof type, { label: string; emoji: string; color: string; bgColor: string }> = {
      deposit: { label: "Credit Alert", emoji: "⬇️", color: "#22c55e", bgColor: "#052e16" },
      withdrawal: { label: "Debit Alert", emoji: "⬆️", color: "#ef4444", bgColor: "#450a0a" },
      transfer_sent: { label: "Transfer Sent", emoji: "📤", color: "#f59e0b", bgColor: "#451a03" },
      transfer_received: { label: "Transfer Received", emoji: "📥", color: "#22c55e", bgColor: "#052e16" },
    };

    const config = typeConfig[type];
    const amountFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    const date = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    const counterpartyRow = counterparty
      ? `<tr>
           <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px; width: 120px;">${type === "transfer_sent" ? "Recipient" : "Sender"}</td>
           <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 14px;">${counterparty}</td>
         </tr>`
      : "";

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `${config.emoji} ${config.label} — ${amountFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 28px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Standard Chartered</h1>
          </div>

          <!-- Alert Banner -->
          <div style="background: ${config.bgColor}; border-bottom: 2px solid ${config.color}; padding: 20px 40px; text-align: center;">
            <p style="color: ${config.color}; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px;">${config.emoji} ${config.label}</p>
            <p style="color: #ffffff; font-size: 36px; font-weight: 800; margin: 0; font-family: monospace;">${amountFormatted}</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 40px; background: #1e293b;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">Hi <strong style="color: #f1f5f9;">${name}</strong>, here are the details of your transaction:</p>

            <!-- Details Table -->
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                ${counterpartyRow}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px; width: 120px;">Description</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 14px;">${description || "Bank Transaction"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 13px;">Amount</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #1e293b; color: ${config.color}; font-size: 15px; font-weight: 700;">${amountFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Date & Time</td>
                  <td style="padding: 10px 0; color: #f1f5f9; font-size: 14px;">${date}</td>
                </tr>
              </table>
            </div>

            <p style="color: #64748b; font-size: 12px; margin: 0 0 20px;">If you did not authorise this transaction, please contact our support team immediately.</p>

            <a href="${appUrl}/dashboard"
               style="display: block; text-align: center; background: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
              View in Dashboard →
            </a>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 40px; background: #0f172a; text-align: center;">
            <p style="color: #475569; font-size: 11px; margin: 0;">© 2025 Standard Chartered. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    console.log(`Transaction email (${type}) sent successfully`, data.data?.id);
  } catch (error) {
    console.error("Error sending transaction email:", error);
  }
}
