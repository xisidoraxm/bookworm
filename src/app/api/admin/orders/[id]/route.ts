import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { id },
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
                            coverImage: true,
                            quantity: true,
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = await req.json();
    const action = body?.action;

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "updateStatus") {
        const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
        const newStatus = body?.newStatus;
        const note = typeof body?.note === "string" ? body.note.trim() : "";
        const trackingNumber = typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : "";
        const estimatedDeliveryDate = body?.estimatedDeliveryDate ? new Date(body.estimatedDeliveryDate) : null;
        const cancelReason = typeof body?.cancelReason === "string" ? body.cancelReason.trim() : "";

        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
        }

        if (order.status === "DELIVERED") {
            return NextResponse.json({ error: "Delivered orders cannot be changed" }, { status: 400 });
        }

        if (newStatus === "SHIPPED" && !trackingNumber) {
            return NextResponse.json({ error: "Tracking number is required for shipped orders" }, { status: 400 });
        }

        if (newStatus === "CANCELLED" && !cancelReason) {
            return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 });
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (
                newStatus === "CANCELLED" &&
                order.status !== "CANCELLED" &&
                order.status !== "REFUNDED"
            ) {
                for (const item of order.items) {
                    await tx.book.update({
                        where: { id: item.bookId },
                        data: {
                            quantity: { increment: item.quantity },
                            inStock: true,
                        },
                    });
                }
            }

            return tx.order.update({
                where: { id },
                data: {
                    status: newStatus,
                    statusNote: note || null,
                    trackingNumber: newStatus === "SHIPPED" ? trackingNumber : order.trackingNumber,
                    estimatedDeliveryDate: newStatus === "SHIPPED" ? estimatedDeliveryDate : order.estimatedDeliveryDate,
                    cancelReason: newStatus === "CANCELLED" ? cancelReason : order.cancelReason,
                    processingAt: newStatus === "PROCESSING" ? new Date() : order.processingAt,
                    shippedAt: newStatus === "SHIPPED" ? new Date() : order.shippedAt,
                    deliveredAt: newStatus === "DELIVERED" ? new Date() : order.deliveredAt,
                    cancelledAt: newStatus === "CANCELLED" ? new Date() : order.cancelledAt,
                },
            });
        });

        return NextResponse.json(updated);
    }

    if (action === "cancelRefund") {
        const cancelReason = typeof body?.cancelReason === "string" ? body.cancelReason.trim() : "";
        const refundMethod = typeof body?.refundMethod === "string" ? body.refundMethod.trim() : "";
        const refundAmount = Number(body?.refundAmount ?? 0);

        if (!cancelReason) {
            return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 });
        }

        if (!refundMethod) {
            return NextResponse.json({ error: "Refund method is required" }, { status: 400 });
        }

        if (!Number.isFinite(refundAmount) || refundAmount < 0 || refundAmount > order.total) {
            return NextResponse.json({ error: "Refund amount is invalid" }, { status: 400 });
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
                for (const item of order.items) {
                    await tx.book.update({
                        where: { id: item.bookId },
                        data: {
                            quantity: { increment: item.quantity },
                            inStock: true,
                        },
                    });
                }
            }

            return tx.order.update({
                where: { id },
                data: {
                    status: refundAmount > 0 ? "REFUNDED" : "CANCELLED",
                    paymentStatus: refundAmount > 0 ? "REFUNDED" : order.paymentStatus,
                    cancelReason,
                    refundAmount,
                    refundMethod,
                    cancelledAt: new Date(),
                    refundedAt: refundAmount > 0 ? new Date() : order.refundedAt,
                },
            });
        });

        return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
