import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { externalBank, externalAccountName, externalAccountNumber, amount, description, imfCode } = await req.json();

    if (!externalBank || !externalAccountName || !externalAccountNumber || !amount || amount <= 0 || !imfCode) {
      return NextResponse.json({ error: "All fields including IMF code are required" }, { status: 400 });
    }

    // Verify IMF code
    const validCode = await prisma.imfCode.findFirst({
      where: {
        code: imfCode,
        userId: session.user.id,
        used: false,
      },
    });

    if (!validCode) {
      return NextResponse.json({ error: "Invalid or already used IMF code" }, { status: 400 });
    }

    const senderAccount = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!senderAccount) return NextResponse.json({ error: "Sender account not found" }, { status: 404 });

    if (senderAccount.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Atomic transaction
    await prisma.$transaction([
      prisma.imfCode.update({
        where: { id: validCode.id },
        data: { used: true },
      }),
      prisma.account.update({
        where: { id: senderAccount.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          amount,
          type: "transfer",
          description: description || "External Bank Transfer",
          status: "pending_admin_approval",
          senderId: senderAccount.id,
          externalBank,
          externalAccountName,
          externalAccountNumber,
          imfCode: validCode.code,
        },
      }),
      prisma.notification.create({
        data: {
          title: "External Transfer Initiated",
          message: `Your transfer of $${amount.toLocaleString()} to ${externalBank} is pending admin approval.`,
          userId: senderAccount.userId,
        },
      }),
    ]);

    return NextResponse.json({ message: "Transfer initiated successfully, pending admin approval." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "External transfer failed" }, { status: 500 });
  }
}
