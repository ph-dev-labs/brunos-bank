import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "Standard Chartered <noreply@bank.local>";

export async function sendOtpEmail(to: string, code: string, name: string) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[LOCAL TEST] OTP Code for ${to} is: ${code}`);
      return;
    }

    const info = await transporter.sendMail({
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
    console.log("OTP Email sent successfully", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[LOCAL TEST] Welcome Email would be sent to ${to}`);
      return;
    }

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Welcome to Standard Chartered!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #22c55e;">Welcome to Standard Chartered, ${name}! 🎉</h2>
          <p>We're thrilled to have you on board.</p>
          <p>Your account has been successfully created and credited with a <strong>$100.00</strong> welcome bonus!</p>
          <p>You can now log in to your dashboard to start managing your finances, applying for loans, and making transfers.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Go to Dashboard</a>
        </div>
      `,
    });
    console.log("Welcome Email sent successfully", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
