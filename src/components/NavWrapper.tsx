"use client"
import React from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function NavWrapper() {
    const pathname = usePathname() || "/";
    if (pathname === "/" || pathname.startsWith("/register")) return null;
    return <Nav />;
}
