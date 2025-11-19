// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prismaUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // query params
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const batchNumber = url.searchParams.get("batchNumber");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: true,
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // filter by medicine name or batch number client-side
    const filteredSales = sales.filter((sale) =>
      sale.items.some((item) => {
        const matchMedicine = item.medicine.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchBatch =
          batchNumber && item.batch
            ? item.batch.batchNumber.toString() === batchNumber
            : true;
        return matchMedicine && matchBatch;
      })
    );

    return NextResponse.json(filteredSales);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
