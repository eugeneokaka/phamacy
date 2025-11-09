import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../../lib/prisma"; // your prisma client path

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name") || undefined;
    const category = searchParams.get("category") || undefined;
    const expiryDate = searchParams.get("expiryDate") || undefined;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (expiryDate) {
      where.expiryDate = { lte: new Date(expiryDate) };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        batches: true, // optional if you want batch info
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(medicines);
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
    console.log("Received medicine data:", data);
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
        reorderLevel: quantity ? parseInt(quantity) : 0,
        batches: {
          create: {
            quantity: parseInt(quantity),
            costPrice: parseFloat(costPrice),
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
