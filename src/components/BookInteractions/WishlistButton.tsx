"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./WishlistButton.module.css";

type Props = {
    bookId: number;
};

export default function WishlistButton({ bookId }: Props) {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setUsername(user.username);
                setIsAdmin(user.role === "ADMIN");
            } catch { /* ignore */ }
        }
        setMounted(true);
    }, []);

    const fetchWishlist = useCallback(async () => {
        if (!username || isAdmin) return;
        const res = await fetch(`/api/wishlist?username=${encodeURIComponent(username)}&bookId=${bookId}`);
        const data = await res.json();
        setWishlisted(data.wishlisted);
    }, [bookId, username, isAdmin]);

    useEffect(() => {
        if (mounted) fetchWishlist();
    }, [mounted, fetchWishlist]);

    async function toggleWishlist() {
        if (!username) return;
        const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId }),
        });
        const data = await res.json();
        setWishlisted(data.wishlisted);
    }

    if (!mounted || !username || isAdmin) return null;

    return (
        <button
            className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ""}`}
            onClick={toggleWishlist}
        >
            {wishlisted ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
        </button>
    );
}
