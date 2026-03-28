import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { username, password, fullName, phone, email } = await req.json();

    if (!username || !password || !fullName || !phone || !email) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
    });

    if (existing) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
        data: {
            username: username.toLowerCase(),
            password,
            fullName,
            phone,
            email,
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
}
