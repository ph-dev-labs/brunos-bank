import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be less than 5MB" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: base64String },
      select: { id: true, image: true },
    });

    return NextResponse.json({ message: "Profile picture updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Failed to upload profile picture:", error);
    return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 });
  }
}
