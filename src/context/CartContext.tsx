"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
    id: number;
    title: string;
    author: string;
    price: number;
    coverImage: string | null;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (book: Omit<CartItem, "quantity">) => void;
    removeFromCart: (bookId: number) => void;
    updateQuantity: (bookId: number, quantity: number) => void;
    clearCart: () => void;
    reloadCart: () => void;
    totalItems: number;
    totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "bookworm_cart";
const GUEST_CART_KEY = "bookworm_cart_guest";

function getCartKey(): string {
    if (typeof window === "undefined") return GUEST_CART_KEY;
    try {
        const stored = localStorage.getItem("loggedUser");
        if (stored) {
            const user = JSON.parse(stored);
            return `${CART_KEY}_user_${user.id}`;
        }
    } catch { /* ignore */ }
    return GUEST_CART_KEY;
}

function loadCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(getCartKey());
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setItems(loadCart());
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) saveCart(items);
    }, [items, loaded]);

    const reloadCart = useCallback(() => {
        setItems(loadCart());
    }, []);

    const addToCart = useCallback((book: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === book.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...book, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((bookId: number) => {
        setItems((prev) => prev.filter((i) => i.id !== bookId));
    }, []);

    const updateQuantity = useCallback((bookId: number, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((i) => (i.id === bookId ? { ...i, quantity } : i))
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, reloadCart, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within a CartProvider");
    return ctx;
}
