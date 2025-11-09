import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // your prisma client path

interface SignUpBody {
  email: string;
  firstName: string;
  lastName: string;
  role?: "ADMIN" | "PHARMACIST" | "CASHIER" | "ACCOUNTANT";
  clerkId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SignUpBody = await req.json();
    console.log("Received sign-up data:", body);

    if (!body.email || !body.firstName || !body.lastName || !body.clerkId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        clerkId: body.clerkId,
        role: body.role || "CASHIER",
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
