import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { accountNumber, amount, description } = await req.json();

    if (!accountNumber || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid transfer details" }, { status: 400 });
    }

    const senderAccount = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!senderAccount) return NextResponse.json({ error: "Sender account not found" }, { status: 404 });

    if (senderAccount.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const receiverAccount = await prisma.account.findUnique({
      where: { accountNumber },
      include: { user: true },
    });

    if (!receiverAccount) return NextResponse.json({ error: "Recipient account not found" }, { status: 404 });
    if (receiverAccount.id === senderAccount.id) {
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 });
    }

    // Atomic transaction
    await prisma.$transaction([
      prisma.account.update({
        where: { id: senderAccount.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.account.update({
        where: { id: receiverAccount.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          amount,
          type: "transfer",
          description: description || "Bank transfer",
          status: "completed",
          senderId: senderAccount.id,
          receiverId: receiverAccount.id,
        },
      }),
      // Notify receiver
      prisma.notification.create({
          data: {
            title: "Money Received",
            message: `You received $${amount.toLocaleString()} from ${session.user.name}`,
            userId: receiverAccount.userId,
          },
      }),
      // Notify sender
      prisma.notification.create({
          data: {
            title: "Transfer Successful",
            message: `You sent $${amount.toLocaleString()} to ${receiverAccount.user.name}`,
            userId: senderAccount.userId,
          },
      }),
    ]);

    return NextResponse.json({ message: "Transfer successful" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }
}
