import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userId");

    if (!userID) {
      return NextResponse.json({ error: "No Users founded" }, { status: 400 });
    }

    const profile = await prisma?.profile.findUnique({
      where: { userId: userID },
      select: { subscriptionActive: true },
    });

    return NextResponse.json({
      subscriptionActive: profile?.subscriptionActive,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Error" + error.message },
      { status: 500 }
    );
  }
}
