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

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            author: true,
                            genre: true,
                            coverImage: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, cartItems, total, shippingAddress, shippingCity, shippingPostalCode, paymentMethod, deliveryMethod } = body;

        if (!userId || !shippingAddress || !shippingCity || !shippingPostalCode || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const validDeliveryMethods = ["STANDARD", "EXPRESS", "PICKUP"];
        const normalizedDeliveryMethod = validDeliveryMethods.includes(deliveryMethod)
            ? deliveryMethod
            : "STANDARD";

        const parsedUserId = Number(userId);
        const parsedTotal = Number(total);

        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            return NextResponse.json(
                { error: "Invalid user session. Please log in again." },
                { status: 400 }
            );
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json(
                { error: "Your cart is empty." },
                { status: 400 }
            );
        }

        if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
            return NextResponse.json(
                { error: "Invalid order total." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: parsedUserId },
            select: { id: true },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "User account not found. Please log in again." },
                { status: 404 }
            );
        }

        const normalizedItems = cartItems.map((item: { bookId: number; quantity: number; price: number }) => ({
            bookId: Number(item.bookId),
            quantity: Number(item.quantity),
            price: Number(item.price),
        }));

        if (normalizedItems.some((item) => !Number.isInteger(item.bookId) || item.bookId <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0 || Number.isNaN(item.price) || item.price < 0)) {
            return NextResponse.json(
                { error: "Cart contains invalid item data." },
                { status: 400 }
            );
        }

        const bookIds = [...new Set(normalizedItems.map((item) => item.bookId))];
        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: { id: true, title: true, quantity: true },
        });

        if (books.length !== bookIds.length) {
            return NextResponse.json(
                { error: "One or more books in your cart no longer exist." },
                { status: 400 }
            );
        }

        const bookMap = new Map(books.map((book) => [book.id, book]));

        for (const item of normalizedItems) {
            const book = bookMap.get(item.bookId);
            if (!book || book.quantity < item.quantity) {
                return NextResponse.json(
                    { error: `Not enough stock for ${book?.title ?? "a selected book"}.` },
                    { status: 400 }
                );
            }
        }

        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId: parsedUserId,
                    total: parsedTotal,
                    shippingAddress,
                    shippingCity,
                    shippingPostalCode,
                    paymentMethod,
                    paymentStatus: "PAID",
                    status: "PENDING",
                    paymentConfirmedAt: new Date(),
                    deliveryMethod: normalizedDeliveryMethod,
                    items: {
                        create: normalizedItems.map((item) => ({
                            bookId: item.bookId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            book: true,
                        },
                    },
                },
            });

            for (const item of normalizedItems) {
                const updated = await tx.book.updateMany({
                    where: {
                        id: item.bookId,
                        quantity: { gte: item.quantity },
                    },
                    data: {
                        quantity: { decrement: item.quantity },
                    },
                });

                if (updated.count === 0) {
                    const book = bookMap.get(item.bookId);
                    throw new Error(`Not enough stock for ${book?.title ?? "a selected book"}.`);
                }
            }

            return createdOrder;
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create order";
        console.error("Error creating order:", message);

        if (message.toLowerCase().includes("stock")) {
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: process.env.NODE_ENV === "development" ? message : "Failed to create order" },
            { status: 500 }
        );
    }
}
