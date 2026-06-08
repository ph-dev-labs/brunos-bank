import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/email";

// Request reset code
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // We shouldn't reveal if a user exists or not for security reasons,
    // but in this demo we will just return a success message regardless
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset code has been sent." });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.updateMany({
      where: { email, type: "reset", used: false },
      data: { used: true },
    });

    await prisma.otpCode.create({
      data: {
        code,
        email,
        type: "reset",
        expiresAt,
      },
    });

    console.log(`[RESET OTP] ${email} - Code: ${code}`);
    await sendOtpEmail(email, code, user.name);

    return NextResponse.json({ message: "If an account exists, a reset code has been sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// Verify code and reset password
export async function PUT(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type: "reset",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password and mark OTP as used atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashed },
      }),
      prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
