import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { externalBank, externalAccountName, externalAccountNumber, amount, description, imfCode, taxCode, cotCode } = await req.json();

    if (!externalBank || !externalAccountName || !externalAccountNumber || !amount || amount <= 0 || !imfCode || !taxCode || !cotCode) {
      return NextResponse.json({ error: "All fields including IMF, Tax, and COT codes are required" }, { status: 400 });
    }

    // Verify all 3 codes belong to this user
    const [validImf, validTax, validCot] = await Promise.all([
      prisma.imfCode.findFirst({ where: { code: imfCode, userId: session.user.id } }),
      prisma.taxCode.findFirst({ where: { code: taxCode, userId: session.user.id } }),
      prisma.cotCode.findFirst({ where: { code: cotCode, userId: session.user.id } }),
    ]);

    if (!validImf) return NextResponse.json({ error: "Invalid IMF code" }, { status: 400 });
    if (!validTax) return NextResponse.json({ error: "Invalid Tax code" }, { status: 400 });
    if (!validCot) return NextResponse.json({ error: "Invalid COT code" }, { status: 400 });

    const senderAccount = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!senderAccount) return NextResponse.json({ error: "Sender account not found" }, { status: 404 });

    if (senderAccount.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // results[1] is the created transaction
    const results = await prisma.$transaction([
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
          imfCode: validImf.code,
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

    return NextResponse.json({ 
      message: "Transfer initiated successfully, pending admin approval.",
      transaction: results[1]
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "External transfer failed" }, { status: 500 });
  }
}
