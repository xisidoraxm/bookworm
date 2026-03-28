import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    const { id, username, password, fullName, phone, email } = await req.json();

    if (!id) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (username && username.toLowerCase() !== existing.username) {
        const taken = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        });
        if (taken) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }
    }

    const updated = await prisma.user.update({
        where: { id },
        data: {
            ...(username && { username: username.toLowerCase() }),
            ...(password && { password }),
            ...(fullName && { fullName }),
            ...(phone && { phone }),
            ...(email && { email }),
        },
    });

    const { password: _, ...userWithoutPassword } = updated;
    return NextResponse.json(userWithoutPassword);
}
