import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Top 5 most sold
    const mostSoldGrouped = await prisma.saleItem.groupBy({
      by: ["medicineId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const mostSold = await Promise.all(
      mostSoldGrouped.map(async (item) => {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });
        return { ...item, medicine };
      })
    );

    // Top 5 least sold
    const leastSoldGrouped = await prisma.saleItem.groupBy({
      by: ["medicineId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "asc" } },
      take: 5,
    });

    const leastSold = await Promise.all(
      leastSoldGrouped.map(async (item) => {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });
        return { ...item, medicine };
      })
    );

    // Top 5 most expensive medicines
    const mostExpensive = await prisma.medicine.findMany({
      orderBy: { sellingPrice: "desc" }, // <-- fixed here
      take: 5,
    });

    return new Response(
      JSON.stringify({ mostSold, leastSold, mostExpensive }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch summary" }), {
      status: 500,
    });
  }
}
