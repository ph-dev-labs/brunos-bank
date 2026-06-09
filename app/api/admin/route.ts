import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateAccountNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [users, transactions, loans, cards, totalAccounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "user" },
      include: { accounts: true, loans: true, cards: true, imfCodes: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      include: {
        sender: { include: { user: true } },
        receiver: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.loan.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.card.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.count(),
  ]);

  const totalBalance = await prisma.account.aggregate({ _sum: { balance: true } });

  return NextResponse.json({ users, transactions, loans, cards, totalAccounts, totalBalance: totalBalance._sum.balance });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "approve_loan" || action === "reject_loan") {
    const { loanId } = body;
    const status = action === "approve_loan" ? "approved" : "rejected";

    const loan = await prisma.loan.update({
      where: { id: loanId },
      data: { status },
      include: { user: true },
    });

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
    } else {
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

  if (action === "edit_user") {
    const { userId, name, email, phone } = body;
    await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone },
    });
    return NextResponse.json({ message: "User updated successfully" });
  }

  if (action === "approve_card" || action === "reject_card") {
    const { cardId } = body;
    const status = action === "approve_card" ? "approved" : "rejected";
    const card = await prisma.card.update({
      where: { id: cardId },
      data: { status },
    });
    
    await prisma.notification.create({
      data: {
        title: "Card Application Update",
        message: `Your card application has been ${status}.`,
        userId: card.userId,
      },
    });

    return NextResponse.json({ message: `Card ${status}` });
  }

  if (action === "approve_external_transfer" || action === "reject_external_transfer") {
    const { transactionId } = body;
    const status = action === "approve_external_transfer" ? "completed" : "failed";
    
    const tx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    // If rejected, we should refund the sender
    if (status === "failed" && tx.senderId) {
      await prisma.account.update({
        where: { id: tx.senderId },
        data: { balance: { increment: tx.amount } }
      });
      await prisma.transaction.create({
        data: {
          amount: tx.amount,
          type: "deposit",
          description: "Refund: External transfer rejected",
          status: "completed",
          receiverId: tx.senderId,
        }
      });
    }

    await prisma.notification.create({
      data: {
        title: "External Transfer Update",
        message: `Your external transfer of ${tx.amount} to ${tx.externalBank} has been ${status}.`,
        userId: tx.senderId ? (await prisma.account.findUnique({where: {id: tx.senderId}}))?.userId || "" : "",
      },
    });

    return NextResponse.json({ message: `External transfer ${status}` });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "deposit" || action === "debit") {
      const { userId, amount, description } = body;
      if (!userId || !amount || amount <= 0) return NextResponse.json({ error: "Invalid details" }, { status: 400 });

      const account = await prisma.account.findFirst({ where: { userId }, include: { user: true } });
      if (!account) return NextResponse.json({ error: "User account not found" }, { status: 404 });

      if (action === "debit" && account.balance < amount) {
        return NextResponse.json({ error: "Insufficient balance for debit" }, { status: 400 });
      }

      const balanceChange = action === "deposit" ? { increment: amount } : { decrement: amount };
      
      await prisma.$transaction([
        prisma.account.update({
          where: { id: account.id },
          data: { balance: balanceChange },
        }),
        prisma.transaction.create({
          data: {
            amount,
            type: action === "deposit" ? "deposit" : "withdrawal",
            description: description || `Admin ${action}`,
            status: "completed",
            [action === "deposit" ? "receiverId" : "senderId"]: account.id,
          },
        }),
        prisma.notification.create({
          data: {
            title: action === "deposit" ? "Deposit Received" : "Account Debited",
            message: `$${amount.toLocaleString()} has been ${action === "deposit" ? "deposited into" : "debited from"} your account.`,
            userId,
          },
        }),
      ]);
      return NextResponse.json({ message: `Successfully ${action}ed ${account.user.name}'s account` });
    }

    if (action === "create_user" || action === "create_admin") {
      const { name, email, password, imfCode } = body;
      if (!name || !email || !password) return NextResponse.json({ error: "All fields are required" }, { status: 400 });

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

      const hashed = await bcrypt.hash(password, 10);
      const role = action === "create_admin" ? "admin" : "user";

      const user = await prisma.user.create({
        data: { name, email, password: hashed, role },
      });

      if (role === "user") {
        await prisma.account.create({
          data: {
            userId: user.id,
            accountNumber: generateAccountNumber(),
            balance: 0,
            type: "savings",
          },
        });
        
        if (imfCode && imfCode.trim() !== "") {
          await prisma.imfCode.create({
            data: { code: imfCode.trim(), userId: user.id },
          });
        }
      }
      return NextResponse.json({ message: `${role} created successfully` });
    }

    if (action === "generate_imf") {
      const { userId } = body;
      const code = "IMF-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
      
      const imfCode = await prisma.imfCode.create({
        data: { code, userId },
      });
      return NextResponse.json({ message: "IMF Code generated", code: imfCode.code });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
