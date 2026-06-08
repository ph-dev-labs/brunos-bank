import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [users, transactions, loans, totalAccounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "user" },
      include: { accounts: true, loans: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      include: {
        sender: { include: { user: true } },
        receiver: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.loan.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.count(),
  ]);

  const totalBalance = await prisma.account.aggregate({ _sum: { balance: true } });

  return NextResponse.json({ users, transactions, loans, totalAccounts, totalBalance: totalBalance._sum.balance });
}

// PATCH — approve/reject loans
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { loanId, status } = await req.json();

  const loan = await prisma.loan.update({
    where: { id: loanId },
    data: { status },
    include: { user: true },
  });

  // If approved, credit the user's account
  if (status === "approved") {
    const account = await prisma.account.findFirst({ where: { userId: loan.userId } });
    if (account) {
      await prisma.$transaction([
        prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: loan.amount } },
        }),
        prisma.transaction.create({
          data: {
            amount: loan.amount,
            type: "deposit",
            description: "Loan disbursement",
            status: "completed",
            receiverId: account.id,
          },
        }),
        prisma.notification.create({
          data: {
            title: "Loan Approved!",
            message: `Your loan of $${loan.amount.toLocaleString()} has been approved and credited to your account.`,
            userId: loan.userId,
          },
        }),
      ]);
    }
  } else if (status === "rejected") {
    await prisma.notification.create({
      data: {
        title: "Loan Application Update",
        message: `Unfortunately, your loan application for $${loan.amount.toLocaleString()} was not approved.`,
        userId: loan.userId,
      },
    });
  }

  return NextResponse.json({ message: `Loan ${status}` });
}

// POST — admin deposits money into a user's account
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, amount, description } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit details" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { userId },
      include: { user: true },
    });

    if (!account) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          amount,
          type: "deposit",
          description: description || "Admin deposit",
          status: "completed",
          receiverId: account.id,
        },
      }),
      prisma.notification.create({
        data: {
          title: "Deposit Received",
          message: `$${amount.toLocaleString()} has been deposited into your account. ${description ? `Note: ${description}` : ""}`,
          userId,
        },
      }),
    ]);

    return NextResponse.json({ message: `$${amount.toLocaleString()} deposited to ${account.user.name}'s account` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 });
  }
}

// PUT — admin creates another admin
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "admin",
      },
    });

    return NextResponse.json({ message: "Admin created successfully", adminId: admin.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
