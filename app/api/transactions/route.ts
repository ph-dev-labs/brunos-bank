import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ transactions: [] });

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderId: account.id }, { receiverId: account.id }],
    },
    include: {
      sender: { include: { user: true } },
      receiver: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ transactions, account });
}
