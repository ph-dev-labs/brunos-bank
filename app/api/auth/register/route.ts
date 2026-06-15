import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateAccountNumber, generateCardNumber } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        accounts: {
          create: {
            accountNumber: generateAccountNumber(),
            balance: 100.00, // $100 Welcome bonus
            type: "savings",
          },
        },
        cards: {
          create: {
            cardNumber: generateCardNumber(),
            cardHolder: name.toUpperCase(),
            expiry: "12/28",
            cvv: Math.floor(100 + Math.random() * 900).toString(),
            type: "debit",
          },
        },
        notifications: {
          create: [
            {
              title: "Welcome to Strantchar!",
              message: "Your account is ready. You have received a $100 welcome bonus!",
              read: false,
            },
          ],
        },
      },
    });

    // Send real welcome email via Resend
    await sendWelcomeEmail(email, name);

    return NextResponse.json({ message: "Account created successfully", userId: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
