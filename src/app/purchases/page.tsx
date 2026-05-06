"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUserOrders } from "@/lib/useUserOrders";
import styles from "./page.module.css";

export default function Purchases() {
    const { orders, loading } = useUserOrders();
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [yearFilter, setYearFilter] = useState<string>("");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

    const years = useMemo(() => {
        const set = new Set(orders.map((o) => new Date(o.createdAt).getFullYear().toString()));
        return [...set].sort().reverse();
    }, [orders]);

    const filtered = useMemo(() => {
        let result = orders;
        if (yearFilter) {
            result = result.filter((o) => new Date(o.createdAt).getFullYear().toString() === yearFilter);
        }
        if (sortDir === "asc") {
            result = [...result].reverse();
        }
        return result;
    }, [orders, yearFilter, sortDir]);

    const totalSpent = filtered.reduce((s, o) => s + o.total, 0);
    const totalBooks = filtered.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container text-center" style={{ paddingTop: "8rem" }}>
                    <p className={styles.loadingText}>Loading purchases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.heading}>🧾 Purchase History</h1>
                    <p className={styles.subtitle}>{orders.length} orders total</p>
                </div>

                {/* Summary bar */}
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryValue}>{filtered.length}</span>
                        <span className={styles.summaryLabel}>Orders{yearFilter ? ` in ${yearFilter}` : ""}</span>
                    </div>
                    <div className={styles.summaryDivider} />
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryValue}>{totalBooks}</span>
                        <span className={styles.summaryLabel}>Books</span>
                    </div>
                    <div className={styles.summaryDivider} />
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryValue}>${totalSpent.toFixed(2)}</span>
                        <span className={styles.summaryLabel}>Total</span>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.toolbar}>
                    <div className={styles.filters}>
                        <select
                            className={styles.select}
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                        >
                            <option value="">All Years</option>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button
                            className={styles.sortBtn}
                            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                            title={sortDir === "desc" ? "Newest first" : "Oldest first"}
                        >
                            {sortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
                        </button>
                    </div>
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No orders found for this period.</p>
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {filtered.map((order) => {
                            const isOpen = expandedOrder === order.id;
                            const bookCount = order.items.reduce((s, i) => s + i.quantity, 0);
                            return (
                                <div key={order.id} className={`${styles.orderCard} ${isOpen ? styles.orderOpen : ""}`}>
                                    <button
                                        className={styles.orderHeader}
                                        onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                                    >
                                        <div className={styles.orderMeta}>
                                            <span className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span className={styles.orderBadge}>
                                                {bookCount} book{bookCount !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div className={styles.orderEnd}>
                                            <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                                            <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`}>▾</span>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className={styles.orderBody}>
                                            {order.items.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/book/${item.book.id}`}
                                                    className={styles.orderItem}
                                                >
                                                    {item.book.coverImage ? (
                                                        <Image
                                                            src={item.book.coverImage}
                                                            alt={item.book.title}
                                                            width={44}
                                                            height={62}
                                                            className={styles.itemImg}
                                                        />
                                                    ) : (
                                                        <div className={styles.itemPlaceholder}>📖</div>
                                                    )}
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemTitle}>{item.book.title}</span>
                                                        <span className={styles.itemMeta}>
                                                            {item.book.author} · Qty: {item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
