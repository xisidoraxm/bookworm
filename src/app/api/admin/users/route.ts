import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const search = sp.get("search") || "";
    const role = sp.get("role") || "";
    const status = sp.get("status") || "";
    const sort = sp.get("sort") || "newest";
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const registrationDate = sp.get("registrationDate") || "";
    const activityLevel = sp.get("activityLevel") || "";
    const perPage = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
        where.OR = [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
        ];
    }

    if (role === "ADMIN" || role === "USER") {
        where.role = role;
    }

    if (status === "ACTIVE" || status === "SUSPENDED") {
        where.status = status;
    }

    // Registration date filters
    if (registrationDate === "7days") {
        where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (registrationDate === "30days") {
        where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (registrationDate === "90days") {
        where.createdAt = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
    } else if (registrationDate === "1year") {
        where.createdAt = { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
    }

    // Activity level filters
    if (activityLevel === "very-active") {
        where.lastActive = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (activityLevel === "active") {
        where.lastActive = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (activityLevel === "inactive") {
        where.AND = [
            { lastActive: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
            { lastActive: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ];
    } else if (activityLevel === "dormant") {
        where.lastActive = { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "name") orderBy = { fullName: "asc" };
    if (sort === "lastActive") orderBy = { lastActive: "desc" };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy,
            skip: (page - 1) * perPage,
            take: perPage,
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
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                        wishlist: true,
                        readingStatus: true,
                    },
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    // Get book counts for each user (total unique books purchased)
    const userIds = users.map((u) => u.id);
    const bookCounts = await prisma.orderItem.groupBy({
        by: ["orderId"],
        where: { order: { userId: { in: userIds } } },
        _sum: { quantity: true },
    });

    // Get per-user totals via orders
    const userOrderTotals = await prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _sum: { total: true },
        _count: true,
    });

    const userPurchaseMap = new Map(
        userOrderTotals.map((o) => [o.userId, { totalSpent: o._sum.total ?? 0, orderCount: o._count }])
    );

    // Books owned per user
    const booksOwnedRaw = await prisma.orderItem.findMany({
        where: { order: { userId: { in: userIds } } },
        select: { quantity: true, order: { select: { userId: true } } },
    });
    const booksOwnedMap = new Map<number, number>();
    for (const item of booksOwnedRaw) {
        booksOwnedMap.set(item.order.userId, (booksOwnedMap.get(item.order.userId) || 0) + item.quantity);
    }

    // Currently reading per user
    const readingCounts = await prisma.readingStatus.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, status: "currently-reading" },
        _count: true,
    });
    const readingMap = new Map(readingCounts.map((r) => [r.userId, r._count]));

    const enrichedUsers = users.map((u) => ({
        ...u,
        booksOwned: booksOwnedMap.get(u.id) || 0,
        currentReads: readingMap.get(u.id) || 0,
        totalSpent: userPurchaseMap.get(u.id)?.totalSpent || 0,
        orderCount: userPurchaseMap.get(u.id)?.orderCount || 0,
    }));

    return NextResponse.json({
        users: enrichedUsers,
        total,
        page,
        totalPages: Math.ceil(total / perPage),
    });
}
