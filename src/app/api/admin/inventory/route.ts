import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 3;

function buildStockStatusFilter(status: string | null) {
    if (!status) return undefined;

    if (status === "IN_STOCK") {
        return { quantity: { gte: LOW_STOCK_THRESHOLD } };
    }
    if (status === "LOW_STOCK") {
        return { quantity: { gt: 0, lt: LOW_STOCK_THRESHOLD } };
    }
    if (status === "OUT_OF_STOCK") {
        return { quantity: { lte: 0 } };
    }

    return undefined;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const genre = searchParams.get("genre")?.trim() ?? "";
    const stockStatus = searchParams.get("stockStatus")?.trim() ?? "";
    const minPriceRaw = searchParams.get("minPrice")?.trim() ?? "";
    const maxPriceRaw = searchParams.get("maxPrice")?.trim() ?? "";

    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

    const andFilters: Prisma.BookWhereInput[] = [];

    if (q) {
        andFilters.push({
            OR: [
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
            ],
        });
    }

    if (genre) {
        andFilters.push({ genre });
    }

    const stockFilter = buildStockStatusFilter(stockStatus);
    if (stockFilter) {
        andFilters.push(stockFilter);
    }

    if (Number.isFinite(minPrice)) {
        andFilters.push({ price: { gte: minPrice } });
    }

    if (Number.isFinite(maxPrice)) {
        andFilters.push({ price: { lte: maxPrice } });
    }

    const where: Prisma.BookWhereInput = andFilters.length ? { AND: andFilters } : {};

    const [books, allBooks, genres] = await Promise.all([
        prisma.book.findMany({
            where,
            orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
            select: {
                id: true,
                title: true,
                author: true,
                genre: true,
                price: true,
                quantity: true,
                inStock: true,
                coverImage: true,
                updatedAt: true,
            },
        }),
        prisma.book.findMany({
            select: { id: true, quantity: true },
        }),
        prisma.book.findMany({
            distinct: ["genre"],
            select: { genre: true },
            orderBy: { genre: "asc" },
        }),
    ]);

    const totalBooks = allBooks.length;
    const totalUnits = allBooks.reduce((sum, book) => sum + Math.max(0, book.quantity), 0);
    const lowStockCount = allBooks.filter(
        (book) => book.quantity > 0 && book.quantity < LOW_STOCK_THRESHOLD
    ).length;
    const outOfStockCount = allBooks.filter((book) => book.quantity <= 0).length;

    const lowStockItems = books
        .filter((book) => book.quantity > 0 && book.quantity < LOW_STOCK_THRESHOLD)
        .map((book) => ({ id: book.id, title: book.title, quantity: book.quantity }));

    return NextResponse.json({
        books,
        genres: genres.map((g) => g.genre),
        overview: {
            totalBooks,
            totalUnits,
            lowStockCount,
            outOfStockCount,
        },
        lowStockItems,
        threshold: LOW_STOCK_THRESHOLD,
    });
}
