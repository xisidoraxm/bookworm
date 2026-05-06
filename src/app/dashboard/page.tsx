"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserOrders } from "@/lib/useUserOrders";
import styles from "./page.module.css";

export default function Dashboard() {
    const { orders, loading, username } = useUserOrders();

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container text-center" style={{ paddingTop: "8rem" }}>
                    <p className={styles.loadingText}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const totalBooks = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
    const totalOrders = orders.length;

    const uniqueBooks = new Map<number, { title: string; author: string; coverImage: string | null; genre: string }>();
    const genreSet = new Set<string>();
    const authorSet = new Set<string>();
    orders.forEach((o) =>
        o.items.forEach((i) => {
            if (!uniqueBooks.has(i.book.id)) uniqueBooks.set(i.book.id, i.book);
            genreSet.add(i.book.genre);
            authorSet.add(i.book.author);
        })
    );

    const lastOrder = orders[0];
    const lastBook = lastOrder?.items[0]?.book;

    // Recent books (last 3 unique)
    const recentBooks: { id: number; title: string; author: string; coverImage: string | null; genre: string }[] = [];
    for (const order of orders) {
        for (const item of order.items) {
            if (!recentBooks.find((b) => b.id === item.book.id)) {
                recentBooks.push(item.book);
            }
            if (recentBooks.length >= 3) break;
        }
        if (recentBooks.length >= 3) break;
    }

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Welcome */}
                <div className={styles.welcome}>
                    <h1 className={styles.welcomeTitle}>
                        Welcome back, <span className={styles.welcomeName}>{username}</span>
                    </h1>
                    <p className={styles.welcomeSub}>Here&apos;s your reading snapshot</p>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>📦</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{totalOrders}</span>
                            <span className={styles.statLabel}>Orders</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>📚</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{totalBooks}</span>
                            <span className={styles.statLabel}>Books</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>🎭</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{genreSet.size}</span>
                            <span className={styles.statLabel}>Genres</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>✍️</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{authorSet.size}</span>
                            <span className={styles.statLabel}>Authors</span>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📖</span>
                        <p>You haven&apos;t made any purchases yet.</p>
                        <Link href="/browse" className={styles.primaryBtn}>Browse Books</Link>
                    </div>
                ) : (
                    <>
                        {/* Last read CTA */}
                        {lastBook && (
                            <div className={styles.lastRead}>
                                <div className={styles.lastReadContent}>
                                    <span className={styles.lastReadLabel}>Your last read</span>
                                    <h2 className={styles.lastReadTitle}>{lastBook.title}</h2>
                                    <p className={styles.lastReadAuthor}>by {lastBook.author}</p>
                                    <Link href={`/book/${lastBook.id}`} className={styles.lastReadLink}>
                                        View book →
                                    </Link>
                                </div>
                                {lastBook.coverImage && (
                                    <Image
                                        src={lastBook.coverImage}
                                        alt={lastBook.title}
                                        width={90}
                                        height={130}
                                        className={styles.lastReadCover}
                                    />
                                )}
                            </div>
                        )}

                        {/* Recently added */}
                        {recentBooks.length > 0 && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Recently Added</h2>
                                    <Link href="/my-books" className={styles.seeAll}>See all →</Link>
                                </div>
                                <div className={styles.recentGrid}>
                                    {recentBooks.map((book) => (
                                        <Link key={book.id} href={`/book/${book.id}`} className={styles.recentCard}>
                                            <div className={styles.recentCover}>
                                                {book.coverImage ? (
                                                    <Image
                                                        src={book.coverImage}
                                                        alt={book.title}
                                                        width={100}
                                                        height={145}
                                                        className={styles.recentImg}
                                                    />
                                                ) : (
                                                    <div className={styles.recentPlaceholder}>📖</div>
                                                )}
                                            </div>
                                            <div className={styles.recentInfo}>
                                                <span className={styles.recentTitle}>{book.title}</span>
                                                <span className={styles.recentAuthor}>{book.author}</span>
                                                <span className={styles.recentGenre}>{book.genre}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick links */}
                        <div className={styles.quickLinks}>
                            <Link href="/my-books" className={styles.quickLink}>
                                <span className={styles.quickIcon}>📖</span>
                                <span className={styles.quickLabel}>My Books</span>
                                <span className={styles.quickDesc}>{uniqueBooks.size} titles</span>
                            </Link>
                            <Link href="/purchases" className={styles.quickLink}>
                                <span className={styles.quickIcon}>🧾</span>
                                <span className={styles.quickLabel}>Purchases</span>
                                <span className={styles.quickDesc}>{totalOrders} orders</span>
                            </Link>
                            <Link href="/browse" className={styles.quickLink}>
                                <span className={styles.quickIcon}>🔍</span>
                                <span className={styles.quickLabel}>Browse</span>
                                <span className={styles.quickDesc}>Find new books</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
