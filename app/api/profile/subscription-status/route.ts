import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();

    const userID = clerkUser?.id;
    if (!userID) {
      return NextResponse.json({ error: "No User found!" }, { status: 404 });
    }
    const profile = await prisma?.profile.findUnique({
      where: { userId: userID },
    });
    if (!profile) {
      return NextResponse.json({ error: "No Profile found!" }, { status: 404 });
    }

    return NextResponse.json({ subscription: profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch subscription details." + error.message },
      { status: 500 }
    );
  }
}
