import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const q = (sp.get("q") || "").trim();
    const status = sp.get("status") || "";
    const paymentStatus = sp.get("paymentStatus") || "";
    const deliveryMethod = sp.get("deliveryMethod") || "";
    const dateFrom = sp.get("dateFrom") || "";
    const dateTo = sp.get("dateTo") || "";
    const card = sp.get("card") || "";

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
    const validPaymentStatuses = ["PAID", "PENDING", "FAILED", "REFUNDED"];
    const validDeliveryMethods = ["STANDARD", "EXPRESS", "PICKUP"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (q) {
        const maybeOrderId = Number(q);
        where.OR = [
            Number.isFinite(maybeOrderId) ? { id: maybeOrderId } : undefined,
            { user: { fullName: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { items: { some: { book: { title: { contains: q, mode: "insensitive" } } } } },
        ].filter(Boolean);
    }

    if (validStatuses.includes(status)) {
        where.status = status;
    }

    if (validPaymentStatuses.includes(paymentStatus)) {
        where.paymentStatus = paymentStatus;
    }

    if (validDeliveryMethods.includes(deliveryMethod)) {
        where.deliveryMethod = deliveryMethod;
    }

    if (dateFrom || dateTo) {
        where.createdAt = {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
        };
    }

    if (card === "today") {
        where.createdAt = { gte: startOfToday() };
    } else if (card === "pending") {
        where.status = "PENDING";
    } else if (card === "processing") {
        where.status = "PROCESSING";
    } else if (card === "shipped") {
        where.status = "SHIPPED";
    } else if (card === "delivered") {
        where.status = "DELIVERED";
    } else if (card === "cancelled_refunded") {
        where.status = { in: ["CANCELLED", "REFUNDED"] };
    }

    const [orders, totalOrdersToday, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrRefunded] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        address: true,
                        city: true,
                        postalCode: true,
                    },
                },
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                quantity: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.order.count({ where: { createdAt: { gte: startOfToday() } } }),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PROCESSING" } }),
        prisma.order.count({ where: { status: "SHIPPED" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
        prisma.order.count({ where: { status: { in: ["CANCELLED", "REFUNDED"] } } }),
    ]);

    return NextResponse.json({
        orders,
        summary: {
            totalOrdersToday,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrRefunded,
        },
    });
}
