import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user || user.accounts.length === 0) {
      return NextResponse.json({ error: "No account found" }, { status: 404 });
    }

    const accountId = user.accounts[0].id;

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: accountId }, { receiverId: accountId }],
      },
      include: {
        sender: { include: { user: true } },
        receiver: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const csvRows = [
      ["Date", "Description", "Type", "Amount", "Status"],
    ];

    for (const tx of transactions) {
      const isSender = tx.senderId === accountId;
      const type = tx.type === "transfer" ? (isSender ? "Debit" : "Credit") : tx.type === "deposit" ? "Credit" : "Debit";
      const amount = (isSender ? "-" : "") + tx.amount.toFixed(2);
      const date = tx.createdAt.toISOString().split("T")[0];
      const desc = `"${tx.description || (isSender ? `Transfer to ${tx.receiver?.user.name}` : `Transfer from ${tx.sender?.user.name}`)}"`;

      csvRows.push([date, desc, type, amount, tx.status]);
    }

    const csvString = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="standard_chartered_statement_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate statement" }, { status: 500 });
  }
}
