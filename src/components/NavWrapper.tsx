"use client"
import React from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function NavWrapper() {
    const pathname = usePathname() || "/";

    // hide nav on root (login) and register pages
    if (pathname === "/" || pathname.startsWith("/register")) return null;

    return <Nav />;
}
