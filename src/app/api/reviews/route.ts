import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET reviews for a book
export async function GET(req: NextRequest) {
    const bookId = Number(req.nextUrl.searchParams.get("bookId"));
    if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

    const reviews = await prisma.review.findMany({
        where: { bookId },
        include: { user: { select: { username: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
}

// POST create/update a review
export async function POST(req: NextRequest) {
    const { username, bookId, rating, text } = await req.json();
    if (!username || !bookId || !rating) {
        return NextResponse.json({ error: "username, bookId, rating required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const review = await prisma.review.upsert({
        where: { userId_bookId: { userId: user.id, bookId } },
        update: { rating, text: text || null },
        create: { userId: user.id, bookId, rating, text: text || null },
    });

    // Update book average rating
    const agg = await prisma.review.aggregate({
        where: { bookId },
        _avg: { rating: true },
    });
    await prisma.book.update({
        where: { id: bookId },
        data: { rating: agg._avg.rating || 0 },
    });

    return NextResponse.json(review);
}
