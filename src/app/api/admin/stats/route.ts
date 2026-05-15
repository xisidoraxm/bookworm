import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const [totalUsers, totalBooks, totalOrders, orders, recentOrders, topBooks] = await Promise.all([
        prisma.user.count(),
        prisma.book.count(),
        prisma.order.count(),
        prisma.order.findMany({ select: { total: true, createdAt: true } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { username: true, fullName: true } },
                items: {
                    include: {
                        book: { select: { id: true, title: true, author: true, coverImage: true } },
                    },
                },
            },
        }),
        prisma.orderItem.groupBy({
            by: ["bookId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
        }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Monthly revenue for the last 6 months
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const monthOrders = orders.filter(
            (o) => new Date(o.createdAt) >= start && new Date(o.createdAt) < end
        );
        monthlyRevenue.push({
            month: start.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            revenue: monthOrders.reduce((s, o) => s + o.total, 0),
            orders: monthOrders.length,
        });
    }

    // Resolve top book titles
    const topBookIds = topBooks.map((b) => b.bookId);
    const books = await prisma.book.findMany({
        where: { id: { in: topBookIds } },
        select: { id: true, title: true, author: true, coverImage: true },
    });
    const topSellingBooks = topBooks.map((tb) => {
        const book = books.find((b) => b.id === tb.bookId);
        return {
            bookId: tb.bookId,
            title: book?.title ?? "Unknown",
            author: book?.author ?? "Unknown",
            coverImage: book?.coverImage ?? null,
            totalSold: tb._sum.quantity ?? 0,
        };
    });

    return NextResponse.json({
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        recentOrders: recentOrders.map((o) => ({
            id: o.id,
            total: o.total,
            createdAt: o.createdAt,
            user: o.user,
            itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
        })),
        topSellingBooks,
    });
}
