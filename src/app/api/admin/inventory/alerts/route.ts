import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 3;

export async function GET() {
    const items = await prisma.book.findMany({
        where: {
            quantity: {
                gt: 0,
                lt: LOW_STOCK_THRESHOLD,
            },
        },
        select: {
            id: true,
            title: true,
            quantity: true,
            updatedAt: true,
        },
        orderBy: [{ quantity: "asc" }, { updatedAt: "desc" }],
        take: 10,
    });

    return NextResponse.json({
        count: items.length,
        items,
        threshold: LOW_STOCK_THRESHOLD,
    });
}
