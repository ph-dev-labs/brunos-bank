import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loans = await prisma.loan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ loans });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, duration } = await req.json();

    if (!amount || amount <= 0 || !duration) {
      return NextResponse.json({ error: "Invalid loan details" }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        amount,
        duration,
        interest: 5,
        status: "pending",
        userId: session.user.id,
      },
    });

    await prisma.notification.create({
      data: {
        title: "Loan Application Received",
        message: `Your loan application for $${amount.toLocaleString()} is under review.`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Loan application submitted", loan });
  } catch (error) {
    return NextResponse.json({ error: "Failed to apply for loan" }, { status: 500 });
  }
}
