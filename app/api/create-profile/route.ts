import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("Creating profile...");

    const clerkUser = await currentUser();
    console.log("Clerk user:", clerkUser);
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized! User not found" },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (existingProfile) {
      console.log("Profile already exists:", existingProfile);
      return NextResponse.json(
        { message: "Profile already exists", profile: existingProfile },
        { status: 200 }
      );
    }

    const newProfile = await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    console.log("Inserted profile:", newProfile);

    return NextResponse.json(
      { message: "Profile created successfully", profile: newProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "This is your create-profile API" });
}
