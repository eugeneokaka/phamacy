// app/api/sales/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

//
// GET single medicine + batches
//
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        batches: {
          include: { order: true, user: true },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    const remainingStock = medicine.batches.reduce(
      (sum, b) => sum + b.quantity,
      0
    );

    return NextResponse.json({
      medicine,
      remainingStock,
      lowStock: remainingStock <= medicine.reorderLevel,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//
// POST: Make a sale (with prescription + doctorName + notes)
//
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    // AUTH
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Prisma user for doctor name
    const prismaUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const doctorName = `${prismaUser.firstName} ${prismaUser.lastName}`;

    const body = await req.json();
    const {
      batchId,
      quantity,
      unitPrice,
      paymentMethod,
      discount,
      patientName,
      notes,
    } = body;

    const qty = Number(quantity || 0);

    if (!batchId || qty <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields (batchId, quantity)" },
        { status: 400 }
      );
    }

    if (!patientName || !patientName.trim()) {
      return NextResponse.json(
        { error: "Patient name is required" },
        { status: 400 }
      );
    }

    // Fetch batch + medicine
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { medicine: true },
    });

    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!batch)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    if (batch.medicineId !== id)
      return NextResponse.json(
        { error: "Batch does not belong to this medicine" },
        { status: 400 }
      );

    if (batch.quantity < qty) {
      return NextResponse.json(
        { error: "Insufficient stock", available: batch.quantity },
        { status: 400 }
      );
    }

    // Pricing
    const price = unitPrice
      ? Number(unitPrice)
      : Number(batch.medicine.sellingPrice);

    const disc = Number(discount || 0);

    const totalPrice = price * qty;
    const totalAmount = totalPrice - disc;

    // Create prescription (UPDATED)
    const prescription = await prisma.prescription.create({
      data: {
        patientName,
        doctorName, // <- doctor name from user model
        notes: notes || null,
        fileUrl: null,
      },
    });

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        userId: prismaUser.id,
        totalAmount,
        discount: disc,
        paymentMethod: paymentMethod || null,
      },
    });

    // Create sale item (with prescriptionId)
    const saleItem = await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        batchId: batch.id,
        medicineId: batch.medicineId,
        name: batch.medicine.name,
        quantity: qty,
        unitPrice: price,
        totalPrice,
        prescriptionId: prescription.id,
      },
    });

    // Update batch qty
    const updatedBatch = await prisma.batch.update({
      where: { id: batch.id },
      data: { quantity: batch.quantity - qty },
    });

    // Recompute stock
    const batches = await prisma.batch.findMany({
      where: { medicineId: batch.medicineId },
      select: { quantity: true },
    });

    const remainingStock = batches.reduce((sum, b) => sum + b.quantity, 0);
    const lowStock = remainingStock <= batch.medicine.reorderLevel;

    if (lowStock) {
      await prisma.activityLog.create({
        data: {
          userId: prismaUser.id,
          action: `Low stock for ${batch.medicine.name} (${remainingStock} left)`,
          tableName: "Medicine",
          recordId: batch.medicineId,
        },
      });
    }

    return NextResponse.json(
      {
        sale,
        saleItem,
        updatedBatch,
        remainingStock,
        lowStock,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log("POST /api/sales/[id] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
