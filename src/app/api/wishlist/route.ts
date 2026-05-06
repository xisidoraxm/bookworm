import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET wishlist status for a user + book
export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get("username");
    const bookId = Number(req.nextUrl.searchParams.get("bookId"));
    if (!username || !bookId) return NextResponse.json({ wishlisted: false });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ wishlisted: false });

    const entry = await prisma.wishlist.findUnique({
        where: { userId_bookId: { userId: user.id, bookId } },
    });

    return NextResponse.json({ wishlisted: !!entry });
}

// POST toggle wishlist
export async function POST(req: NextRequest) {
    const { username, bookId } = await req.json();
    if (!username || !bookId) {
        return NextResponse.json({ error: "username, bookId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.wishlist.findUnique({
        where: { userId_bookId: { userId: user.id, bookId } },
    });

    if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        return NextResponse.json({ wishlisted: false });
    } else {
        await prisma.wishlist.create({ data: { userId: user.id, bookId } });
        return NextResponse.json({ wishlisted: true });
    }
}
