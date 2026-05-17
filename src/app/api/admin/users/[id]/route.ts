import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            lastActive: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: { orders: true, reviews: true, wishlist: true, readingStatus: true },
            },
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Enrich with aggregates
    const [booksOwned, currentReads, totalSpentAgg, purchases] = await Promise.all([
        prisma.orderItem.aggregate({
            where: { order: { userId } },
            _sum: { quantity: true },
        }),
        prisma.readingStatus.count({ where: { userId, status: "currently-reading" } }),
        prisma.order.aggregate({ where: { userId }, _sum: { total: true } }),
        prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                items: {
                    include: {
                        book: { select: { id: true, title: true, author: true, coverImage: true } },
                    },
                },
            },
        }),
    ]);

    return NextResponse.json({
        ...user,
        booksOwned: booksOwned._sum.quantity || 0,
        currentReads,
        totalSpent: totalSpentAgg._sum.total || 0,
        purchases: purchases.map((o) => ({
            id: o.id,
            total: o.total,
            createdAt: o.createdAt,
            items: o.items.map((i) => ({
                quantity: i.quantity,
                price: i.price,
                book: i.book,
            })),
        })),
    });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (body.role === "ADMIN" || body.role === "USER") data.role = body.role;
    if (body.status === "ACTIVE" || body.status === "SUSPENDED") data.status = body.status;
    if (typeof body.fullName === "string" && body.fullName.trim()) data.fullName = body.fullName.trim();
    if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim();
    if (typeof body.phone === "string" && body.phone.trim()) data.phone = body.phone.trim();

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true, username: true, fullName: true, email: true, phone: true,
            role: true, status: true, lastActive: true, createdAt: true,
        },
    });

    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Cascade-delete related records first
    await prisma.$transaction([
        prisma.readingStatus.deleteMany({ where: { userId } }),
        prisma.wishlist.deleteMany({ where: { userId } }),
        prisma.review.deleteMany({ where: { userId } }),
        prisma.orderItem.deleteMany({ where: { order: { userId } } }),
        prisma.order.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ success: true });
}
