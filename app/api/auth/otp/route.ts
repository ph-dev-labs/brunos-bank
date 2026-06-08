import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/email";

// Generate and send OTP
export async function POST(req: Request) {
  try {
    const { email, type, name } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing unused OTPs of this type for this email
    await prisma.otpCode.updateMany({
      where: { email, type, used: false },
      data: { used: true },
    });

    await prisma.otpCode.create({
      data: {
        code,
        email,
        type,
        expiresAt,
      },
    });

    // We will pass the user's name or just "User" if not provided
    const userName = name || "User";
    
    // Log the OTP to console for easy testing locally
    console.log(`[OTP GENERATED] ${email} - Code: ${code} (Type: ${type})`);

    // Send the email
    await sendOtpEmail(email, code, userName);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
  }
}

// Verify OTP
export async function PUT(req: Request) {
  try {
    const { email, code, type } = await req.json();

    if (!email || !code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
