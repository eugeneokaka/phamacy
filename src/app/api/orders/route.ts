import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth(); // Clerk ID
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the actual user in the database
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    const dbUserId = user.id;

    const body = await req.json();
    const { supplier, totalCost, medicines } = body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json(
        { error: "At least one medicine entry is required" },
        { status: 400 }
      );
    }

    // Validate medicines
    for (const m of medicines) {
      if (
        !m.name ||
        !m.expiryDate ||
        m.costPrice == null ||
        m.quantity == null
      ) {
        return NextResponse.json(
          {
            error:
              "Each medicine entry must include name, expiryDate, costPrice and quantity",
          },
          { status: 400 }
        );
      }
    }

    // 1) Create medicines and batches
    const createdBatches: { id: string; medicineId: string }[] = [];

    for (const m of medicines) {
      const createdMed = await prisma.medicine.create({
        data: {
          name: m.name,
          genericName: m.genericName ?? null,
          category: m.category ?? null,
          description: m.description ?? null,
          sellingPrice: m.sellingPrice ? Number(m.sellingPrice) : 0,
          expiryDate: new Date(m.expiryDate),
          reorderLevel: m.reorderLevel ? Number(m.reorderLevel) : 0,
        },
      });

      const createdBatch = await prisma.batch.create({
        data: {
          medicineId: createdMed.id,
          userId: dbUserId,
          expiryDate: new Date(m.expiryDate),
          costPrice: Number(m.costPrice),
          quantity: Number(m.quantity),
        },
      });

      createdBatches.push({ id: createdBatch.id, medicineId: createdMed.id });
    }

    // 2) Create the order
    const newOrder = await prisma.order.create({
      data: {
        supplier: supplier ?? null,
        totalCost: totalCost != null ? Number(totalCost) : undefined,
      },
    });

    // 3) Link batches to the order
    for (const b of createdBatches) {
      await prisma.batch.update({
        where: { id: b.id },
        data: { orderId: newOrder.id },
      });
    }

    // 4) Create activity log
    await prisma.activityLog.create({
      data: {
        userId: dbUserId,
        action: `Created order ${newOrder.ordernumber ?? newOrder.id} with ${
          createdBatches.length
        } batches`,
        tableName: "Order",
        recordId: newOrder.id,
      },
    });

    // 5) Return the order with batches and medicines
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        batches: { include: { medicine: true } },
      },
    });

    return NextResponse.json(orderWithDetails, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
