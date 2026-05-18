import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

function parseNonNegativeInt(value: unknown, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.floor(parsed));
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const body = await req.json();
    const addUnits = parseNonNegativeInt(body?.addUnits);
    const removeUnits = parseNonNegativeInt(body?.removeUnits);

    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const nextQuantity = Math.max(0, existing.quantity + addUnits - removeUnits);

    const updated = await prisma.book.update({
        where: { id },
        data: {
            quantity: nextQuantity,
            inStock: nextQuantity > 0,
        },
        select: {
            id: true,
            quantity: true,
            inStock: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const existing = await prisma.book.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
