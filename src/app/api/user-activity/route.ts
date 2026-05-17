import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get("username");
    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.findMany({
        where: { userId: user.id },
        include: {
            book: {
                select: { id: true, title: true, author: true, coverImage: true, price: true, genre: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const readingStatuses = await prisma.readingStatus.findMany({
        where: { userId: user.id },
        include: {
            book: {
                select: { id: true, title: true, author: true, coverImage: true, genre: true },
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ wishlist, readingStatuses });
}

export async function POST(req: NextRequest) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Update user's lastActive timestamp
    const user = await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() },
        select: { id: true, lastActive: true },
    });

    return NextResponse.json(user);
}
