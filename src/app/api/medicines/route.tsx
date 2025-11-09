import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name") || undefined;
    const category = searchParams.get("category") || undefined;
    const expiryDate = searchParams.get("expiryDate") || undefined;
    const filterMode = searchParams.get("filterMode") || "all";

    const medicines = await prisma.medicine.findMany({
      where: {
        ...(name && {
          name: { contains: name, mode: "insensitive" },
        }),
        ...(category && {
          category: { contains: category, mode: "insensitive" },
        }),
        ...(expiryDate && {
          expiryDate: { lte: new Date(expiryDate) },
        }),
      },
      include: {
        batches: true,
      },
      orderBy: { name: "asc" },
    });

    // Compute quantity + expiring soon on server
    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 30);

    const processed = medicines
      .map((m) => {
        const totalQty = m.batches.reduce((sum, b) => sum + b.quantity, 0);
        const isLowStock = totalQty < 10;
        const isExpiringSoon = m.expiryDate && new Date(m.expiryDate) <= soon;

        return {
          ...m,
          totalQty,
          isLowStock,
          isExpiringSoon,
        };
      })
      .filter((m) => {
        if (filterMode === "lowStock") return m.isLowStock;
        if (filterMode === "expiringSoon") return m.isExpiringSoon;
        return true; // all
      });

    return NextResponse.json(processed);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { name, category, quantity, costPrice } = data;
    if (!name || !category || !quantity || !costPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        description: data.description,
        sellingPrice: parseFloat(data.sellingPrice),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        reorderLevel: Number(quantity),

        batches: {
          create: {
            quantity: Number(quantity),
            costPrice: Number(costPrice),
            expiryDate: new Date(data.expiryDate),
          },
        },
      },
      include: { batches: true },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
