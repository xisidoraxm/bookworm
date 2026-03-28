import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
    });

    if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
}
