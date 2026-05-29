"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import type { Book } from "@/lib/types";

type Props = {
    book: Pick<Book, "id" | "title" | "author" | "price" | "coverImage" | "inStock" | "quantity">;
};

const btnBase: React.CSSProperties = {
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
};

export default function AddToCartButton({ book }: Props) {
    const { addToCart, updateQuantity, removeFromCart, items } = useCart();
    const inCart = items.find((i) => i.id === book.id);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored && JSON.parse(stored).role === "ADMIN") {
                setIsAdmin(true);
            }
        } catch { /* ignore */ }
    }, []);

    if (!mounted) return null;
    if (isAdmin) return null;

    function handleAdd() {
        if (!book.inStock) return;
        addToCart({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            coverImage: book.coverImage,
        });
    }

    const remaining = book.quantity - (inCart?.quantity ?? 0);

    if (!book.inStock || book.quantity === 0) {
        return (
            <button disabled style={{ ...btnBase, background: "var(--border)", color: "var(--text-muted)", padding: "0.75rem 2rem", cursor: "not-allowed", opacity: 0.6 }}>
                Out of Stock
            </button>
        );
    }

    if (!inCart) {
        return (
            <button onClick={handleAdd} style={{ ...btnBase, background: "var(--accent)", color: "#fff", padding: "0.75rem 2rem" }}>
                🛒 Add to Cart
            </button>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                border: "2px solid var(--accent)",
                borderRadius: "10px",
                overflow: "hidden",
            }}>
                <button
                    onClick={() => inCart.quantity > 1 ? updateQuantity(book.id, inCart.quantity - 1) : removeFromCart(book.id)}
                    style={{
                        ...btnBase,
                        background: "var(--bg)",
                        color: "var(--text)",
                        width: "42px",
                        height: "42px",
                        borderRadius: 0,
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {inCart.quantity === 1 ? "🗑" : "−"}
                </button>
                <span style={{
                    width: "50px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text)",
                    background: "var(--surface)",
                    lineHeight: "42px",
                    borderLeft: "1px solid var(--border)",
                    borderRight: "1px solid var(--border)",
                }}>
                    {inCart.quantity}
                </span>
                <button
                    onClick={() => updateQuantity(book.id, inCart.quantity + 1)}
                    disabled={remaining <= 0}
                    style={{
                        ...btnBase,
                        background: remaining <= 0 ? "var(--border)" : "var(--accent)",
                        color: remaining <= 0 ? "var(--text-muted)" : "#fff",
                        width: "42px",
                        height: "42px",
                        borderRadius: 0,
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: remaining <= 0 ? "not-allowed" : "pointer",
                    }}
                >
                    +
                </button>
            </div>
            <span style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.9rem" }}>
                ✓ In your cart{remaining <= 0 ? " (max reached)" : ""}
            </span>
        </div>
    );
}
