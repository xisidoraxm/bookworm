import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            author: true,
            description: true,
            fullDescription: true,
            wikipediaUrl: true,
            price: true,
            genre: true,
            format: true,
            coverImage: true,
            quantity: true,
            inStock: true,
        },
    });

    if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const body = await req.json();
    const {
        title,
        author,
        description,
        fullDescription,
        wikipediaUrl,
        price,
        genre,
        format,
        coverImage,
        quantity,
    } = body;

    const validFormats = ["PAPERBACK", "HARDCOVER"];
    if (format && !validFormats.includes(format)) {
        return NextResponse.json({ error: "Invalid format. Must be one of: Paperback, Hardcover" }, { status: 400 });
    }

    if (!title || !author || !price || !genre) {
        return NextResponse.json({ error: "Title, author, price, and genre are required" }, { status: 400 });
    }

    if (typeof price !== "number" || price <= 0) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 0) {
        return NextResponse.json({ error: "Quantity must be a non-negative number" }, { status: 400 });
    }

    const existingBook = await prisma.book.findUnique({ where: { id }, select: { id: true } });
    if (!existingBook) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const duplicateTitle = await prisma.book.findFirst({
        where: {
            title,
            id: { not: id },
        },
        select: { id: true },
    });

    if (duplicateTitle) {
        return NextResponse.json({ error: "A book with this title already exists" }, { status: 409 });
    }

    const updated = await prisma.book.update({
        where: { id },
        data: {
            title,
            author,
            description: description || null,
            fullDescription: fullDescription || null,
            wikipediaUrl: wikipediaUrl || null,
            price,
            genre,
            format: format || "PAPERBACK",
            coverImage: coverImage || null,
            quantity,
            inStock: quantity > 0,
        },
    });

    return NextResponse.json(updated);
}
