"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    book: {
        id: number;
        title: string;
        author: string;
        genre: string;
        coverImage: string | null;
    };
};

type Order = {
    id: number;
    total: number;
    createdAt: string;
    items: OrderItem[];
};

export default function Dashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

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

    if (loading) {
        return (
            <div className={styles.dashboardPage}>
                <div className="container text-center" style={{ paddingTop: "8rem" }}>
                    <p className={styles.subtitle}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const totalBooks = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
    const totalOrders = orders.length;

    // Unique books & genres
    const uniqueBooks = new Map<number, { title: string; author: string; coverImage: string | null; genre: string }>();
    const genreMap: Record<string, number> = {};
    const authorSet = new Set<string>();
    orders.forEach((o) =>
        o.items.forEach((i) => {
            if (!uniqueBooks.has(i.book.id)) uniqueBooks.set(i.book.id, i.book);
            genreMap[i.book.genre] = (genreMap[i.book.genre] || 0) + i.quantity;
            authorSet.add(i.book.author);
        })
    );
    const genres = Object.entries(genreMap).sort((a, b) => b[1] - a[1]);
    const maxGenreCount = genres.length > 0 ? genres[0][1] : 1;

    // Monthly book count (not spending)
    const monthlyBooks: Record<string, number> = {};
    orders.forEach((o) => {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyBooks[key] = (monthlyBooks[key] || 0) + o.items.reduce((s, i) => s + i.quantity, 0);
    });
    const months = Object.entries(monthlyBooks).sort((a, b) => a[0].localeCompare(b[0]));
    const maxMonthly = months.length > 0 ? Math.max(...months.map((m) => m[1])) : 1;

    // Most recent book
    const lastOrder = orders[0];
    const lastBook = lastOrder?.items[0]?.book;

    return (
        <div className={styles.dashboardPage}>
            <div className="container">
                <h1 className={`text-center mt-5 ${styles.heading}`}>My Dashboard</h1>
                <p className={`text-center ${styles.subtitle}`}>
                    Welcome back, {username}
                </p>

                {/* Stats cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📦</span>
                        <span className={styles.statValue}>{totalOrders}</span>
                        <span className={styles.statLabel}>Orders Placed</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>📚</span>
                        <span className={styles.statValue}>{totalBooks}</span>
                        <span className={styles.statLabel}>Books Collected</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>🎭</span>
                        <span className={styles.statValue}>{genres.length}</span>
                        <span className={styles.statLabel}>Genres Explored</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>✍️</span>
                        <span className={styles.statValue}>{authorSet.size}</span>
                        <span className={styles.statLabel}>Authors Read</span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📖</span>
                        <p>You haven&apos;t made any purchases yet.</p>
                        <Link href="/" className={styles.browseBtn}>Browse Books</Link>
                    </div>
                ) : (
                    <>
                        {/* My Library - hero section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>📖 My Library</h2>
                                <span className={styles.sectionBadge}>{uniqueBooks.size} titles</span>
                            </div>
                            <div className={styles.libraryGrid}>
                                {[...uniqueBooks.entries()].map(([id, book]) => (
                                    <Link key={id} href={`/book/${id}`} className={styles.libraryItem}>
                                        <div className={styles.libraryCover}>
                                            {book.coverImage ? (
                                                <Image
                                                    src={book.coverImage}
                                                    alt={book.title}
                                                    width={80}
                                                    height={115}
                                                    className={styles.libraryImg}
                                                />
                                            ) : (
                                                <div className={styles.libraryPlaceholder}>📖</div>
                                            )}
                                        </div>
                                        <span className={styles.libraryTitle}>{book.title}</span>
                                        <span className={styles.libraryAuthor}>{book.author}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={styles.twoCol}>
                            {/* Reading Activity */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>📈 Reading Activity</h2>
                                <p className={styles.chartSubtitle}>Books added per month</p>
                                <div className={styles.chart}>
                                    {months.map(([month, count]) => {
                                        const pct = (count / maxMonthly) * 100;
                                        return (
                                            <div key={month} className={styles.chartCol}>
                                                <div className={styles.chartBarWrap}>
                                                    <div className={styles.bar} style={{ height: `${pct}%` }}>
                                                        <span className={styles.chartAmount}>{count}</span>
                                                    </div>
                                                </div>
                                                <span className={styles.chartLabel}>
                                                    {new Date(month + "-01").toLocaleString("default", { month: "short" })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Favorite Genres */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>🎭 Favorite Genres</h2>
                                <div className={styles.genreList}>
                                    {genres.map(([genre, count], idx) => (
                                        <div key={genre} className={styles.genreRow}>
                                            <div className={styles.genreInfo}>
                                                <span className={styles.genreRank}>#{idx + 1}</span>
                                                <span className={styles.genreName}>{genre}</span>
                                                <span className={styles.genreCount}>{count}</span>
                                            </div>
                                            <div className={styles.genreBarBg}>
                                                <div
                                                    className={styles.genreBarFill}
                                                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Purchase History - collapsible */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>🧾 Purchase History</h2>
                                <span className={styles.sectionBadge}>{totalOrders} orders</span>
                            </div>
                            <div className={styles.orderList}>
                                {orders.map((order) => {
                                    const isExpanded = expandedOrder === order.id;
                                    const bookCount = order.items.reduce((s, i) => s + i.quantity, 0);
                                    return (
                                        <div key={order.id} className={`${styles.orderCard} ${isExpanded ? styles.orderExpanded : ""}`}>
                                            <button
                                                className={styles.orderHeader}
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            >
                                                <div className={styles.orderLeft}>
                                                    <span className={styles.orderDate}>
                                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                    <span className={styles.orderSummary}>
                                                        {bookCount} book{bookCount !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div className={styles.orderRight}>
                                                    <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                                                    <span className={`${styles.orderChevron} ${isExpanded ? styles.chevronOpen : ""}`}>
                                                        ▾
                                                    </span>
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className={styles.orderItems}>
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
                                                                    width={40}
                                                                    height={56}
                                                                    className={styles.orderItemImg}
                                                                />
                                                            ) : (
                                                                <div className={styles.orderItemPlaceholder}>📖</div>
                                                            )}
                                                            <div className={styles.orderItemInfo}>
                                                                <span className={styles.orderItemTitle}>{item.book.title}</span>
                                                                <span className={styles.orderItemMeta}>
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
                        </div>

                        {/* Call to action */}
                        {lastBook && (
                            <div className={styles.ctaSection}>
                                <p className={styles.ctaText}>
                                    Your last read was <strong>{lastBook.title}</strong> — ready for your next adventure?
                                </p>
                                <Link href="/" className={styles.browseBtn}>Discover More Books</Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
