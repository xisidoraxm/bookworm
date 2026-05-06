import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET reading status for a user + book
export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get("username");
    const bookId = Number(req.nextUrl.searchParams.get("bookId"));
    if (!username || !bookId) return NextResponse.json({ status: null, progress: 0 });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ status: null, progress: 0 });

    const entry = await prisma.readingStatus.findUnique({
        where: { userId_bookId: { userId: user.id, bookId } },
    });

    return NextResponse.json({
        status: entry?.status || null,
        progress: entry?.progress || 0,
    });
}

// POST set/update reading status
export async function POST(req: NextRequest) {
    const { username, bookId, status, progress } = await req.json();
    if (!username || !bookId || !status) {
        return NextResponse.json({ error: "username, bookId, status required" }, { status: 400 });
    }

    const validStatuses = ["want-to-read", "currently-reading", "finished"];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const entry = await prisma.readingStatus.upsert({
        where: { userId_bookId: { userId: user.id, bookId } },
        update: {
            status,
            progress: status === "finished" ? 100 : (progress ?? 0),
        },
        create: {
            userId: user.id,
            bookId,
            status,
            progress: status === "finished" ? 100 : (progress ?? 0),
        },
    });

    return NextResponse.json(entry);
}

// DELETE remove reading status
export async function DELETE(req: NextRequest) {
    const { username, bookId } = await req.json();
    if (!username || !bookId) {
        return NextResponse.json({ error: "username, bookId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.readingStatus.deleteMany({
        where: { userId: user.id, bookId },
    });

    return NextResponse.json({ status: null, progress: 0 });
}
