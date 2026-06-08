import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "Standard Chartered <onboarding@resend.dev>";

export async function sendOtpEmail(to: string, code: string, name: string) {
  try {
    await resend.emails.send({
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
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Welcome to Standard Chartered!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #22c55e;">Welcome to Standard Chartered, ${name}! 🎉</h2>
          <p>We're thrilled to have you on board.</p>
          <p>Your account has been successfully created and credited with a <strong>$100.00</strong> welcome bonus!</p>
          <p>You can now log in to your dashboard to start managing your finances, applying for loans, and making transfers.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">Go to Dashboard</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
