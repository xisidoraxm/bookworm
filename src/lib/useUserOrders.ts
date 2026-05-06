"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "./types";

export function useUserOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (!stored) {
            router.push("/login");
            return;
        }
        try {
            const user = JSON.parse(stored);
            setUsername(user.username);
            fetch(`/api/orders?username=${encodeURIComponent(user.username)}`)
                .then((r) => r.json())
                .then((data) => {
                    setOrders(data);
                    setLoading(false);
                });
        } catch {
            router.push("/login");
        }
    }, [router]);

    return { orders, loading, username };
}
