import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { title, author, description, fullDescription, wikipediaUrl, price, genre, format, coverImage, quantity } = body;

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

    if (typeof quantity !== "undefined" && (typeof quantity !== "number" || quantity < 0)) {
        return NextResponse.json({ error: "Quantity must be a non-negative number" }, { status: 400 });
    }

    const existing = await prisma.book.findUnique({ where: { title } });
    if (existing) {
        return NextResponse.json({ error: "A book with this title already exists" }, { status: 409 });
    }

    const book = await prisma.book.create({
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
            inStock: (quantity ?? 0) > 0,
            quantity: quantity ?? 0,
        },
    });

    return NextResponse.json(book, { status: 201 });
}
