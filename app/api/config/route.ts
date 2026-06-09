import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: "global" },
    });
    return NextResponse.json({ currency: config?.currency || "USD" });
  } catch (error) {
    return NextResponse.json({ currency: "USD" });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currency } = await req.json();
    if (!currency) {
      return NextResponse.json({ error: "Currency is required" }, { status: 400 });
    }

    const config = await prisma.appConfig.upsert({
      where: { id: "global" },
      update: { currency },
      create: { id: "global", currency },
    });

    return NextResponse.json({ message: "Currency updated", config });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}
