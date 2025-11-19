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
// POST: Make a sale (no transaction version)
//
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  console.log("id", id);

  try {
    // 1️⃣ AUTH – get logged in Clerk user
    const { userId: clerkUserId } = await auth();
    console.log("clerkid", clerkUserId);

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Find Prisma User by clerkId
    const prismaUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!prismaUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      batchId,
      quantity,
      unitPrice,
      customerId,
      paymentMethod,
      discount,
    } = body;
    console.log(body);

    const qty = Number(quantity || 0);

    if (!batchId || qty <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields (batchId, quantity)" },
        { status: 400 }
      );
    }

    // 3️⃣ Fetch batch + medicine
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { medicine: true },
    });
    // fetcch medicine
    const medicine = await prisma.medicine.findUnique({
      where: {
        id,
      },
    });
    console.log("medcine", medicine);

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

    // 4️⃣ Determine pricing
    const price = unitPrice
      ? Number(unitPrice)
      : Number(batch.medicine.sellingPrice);

    const disc = Number(discount || 0);

    const totalPrice = price * qty;
    const totalAmount = totalPrice - disc;

    // 5️⃣ Create sale
    const sale = await prisma.sale.create({
      data: {
        userId: prismaUser.id, // ✨ server-side user!
        customerId: customerId || null,
        totalAmount,
        discount: disc,
        paymentMethod: paymentMethod || null,
      },
    });

    // 6️⃣ Create sale item
    const saleItem = await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        batchId: batch.id,
        medicineId: batch.medicineId,
        name: batch.medicine.name,
        quantity: qty,
        unitPrice: price,
        totalPrice,
      },
    });

    // 7️⃣ Update batch quantity
    const updatedBatch = await prisma.batch.update({
      where: { id: batch.id },
      data: { quantity: batch.quantity - qty },
    });

    // 8️⃣ Recompute stock
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
