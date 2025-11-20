import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        saleItems: {
          include: {
            medicine: true,
            sale: {
              include: {
                customer: true,
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(prescriptions);
  } catch (err) {
    console.error("Prescription fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load prescriptions" },
      { status: 500 }
    );
  }
}
