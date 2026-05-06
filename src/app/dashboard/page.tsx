"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUserOrders } from "@/lib/useUserOrders";
import styles from "./page.module.css";

type WishlistItem = {
    id: number;
    book: { id: number; title: string; author: string; coverImage: string | null; price: number; genre: string };
};

type ReadingStatusItem = {
    id: number;
    status: string;
    progress: number;
    book: { id: number; title: string; author: string; coverImage: string | null; genre: string };
};

export default function Dashboard() {
    const { orders, loading, username } = useUserOrders();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [readingStatuses, setReadingStatuses] = useState<ReadingStatusItem[]>([]);

    useEffect(() => {
        if (username) {
            fetch(`/api/user-activity?username=${encodeURIComponent(username)}`)
                .then((r) => r.json())
                .then((data) => {
                    setWishlist(data.wishlist || []);
                    setReadingStatuses(data.readingStatuses || []);
                });
        }
    }, [username]);

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

    const genreSet = new Set<string>();
    const authorSet = new Set<string>();
    orders.forEach((o) =>
        o.items.forEach((i) => {
            genreSet.add(i.book.genre);
            authorSet.add(i.book.author);
        })
    );

    const currentlyReading = readingStatuses.filter((s) => s.status === "currently-reading");
    const finished = readingStatuses.filter((s) => s.status === "finished");
    const wantToRead = readingStatuses.filter((s) => s.status === "want-to-read");

    // Recent books (last 3 unique from orders)
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

    // Reading insights
    const topGenre = (() => {
        const gm: Record<string, number> = {};
        readingStatuses.forEach((s) => { gm[s.book.genre] = (gm[s.book.genre] || 0) + 1; });
        const sorted = Object.entries(gm).sort((a, b) => b[1] - a[1]);
        return sorted[0]?.[0] || null;
    })();

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
                        <span className={styles.statIcon}>✅</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{finished.length}</span>
                            <span className={styles.statLabel}>Books Read</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>📖</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{currentlyReading.length}</span>
                            <span className={styles.statLabel}>In Progress</span>
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

                {orders.length === 0 && readingStatuses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📖</span>
                        <p>Start your reading journey!</p>
                        <Link href="/browse" className={styles.primaryBtn}>Browse Books</Link>
                    </div>
                ) : (
                    <div className={styles.twoCol}>
                        {/* Left column — primary content */}
                        <div className={styles.mainCol}>
                            {/* Currently Reading — the heart of the dashboard */}
                            {currentlyReading.length > 0 && (
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>📖 Currently Reading</h2>
                                    <div className={styles.readingList}>
                                        {currentlyReading.map((item) => (
                                            <Link key={item.id} href={`/book/${item.book.id}`} className={styles.readingCard}>
                                                <div className={styles.readingCover}>
                                                    {item.book.coverImage ? (
                                                        <Image src={item.book.coverImage} alt={item.book.title} width={60} height={85} className={styles.readingImg} />
                                                    ) : (
                                                        <div className={styles.readingPlaceholder}>📖</div>
                                                    )}
                                                </div>
                                                <div className={styles.readingInfo}>
                                                    <span className={styles.readingBookTitle}>{item.book.title}</span>
                                                    <span className={styles.readingAuthor}>{item.book.author}</span>
                                                    <div className={styles.readingProgressBar}>
                                                        <div className={styles.readingProgressFill} style={{ width: `${item.progress}%` }} />
                                                    </div>
                                                    <span className={styles.readingPct}>{item.progress}% complete</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recently Added to My Books */}
                            {recentBooks.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Recently Added</h2>
                                        <Link href="/my-books" className={styles.seeAll}>See all →</Link>
                                    </div>
                                    <div className={styles.recentList}>
                                        {recentBooks.map((book) => (
                                            <Link key={book.id} href={`/book/${book.id}`} className={styles.recentCard}>
                                                <div className={styles.recentCover}>
                                                    {book.coverImage ? (
                                                        <Image src={book.coverImage} alt={book.title} width={50} height={72} className={styles.recentImg} />
                                                    ) : (
                                                        <div className={styles.recentPlaceholder}>📖</div>
                                                    )}
                                                </div>
                                                <div className={styles.recentInfo}>
                                                    <span className={styles.recentTitle}>{book.title}</span>
                                                    <span className={styles.recentAuthor}>{book.author}</span>
                                                </div>
                                                <span className={styles.recentGenre}>{book.genre}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Want to Read */}
                            {wantToRead.length > 0 && (
                                <div className={styles.section}>
                                    <h2 className={styles.sectionTitle}>⭐ Want to Read</h2>
                                    <div className={styles.wantGrid}>
                                        {wantToRead.slice(0, 4).map((item) => (
                                            <Link key={item.id} href={`/book/${item.book.id}`} className={styles.wantCard}>
                                                {item.book.coverImage ? (
                                                    <Image src={item.book.coverImage} alt={item.book.title} width={70} height={100} className={styles.wantImg} />
                                                ) : (
                                                    <div className={styles.wantPlaceholder}>📖</div>
                                                )}
                                                <span className={styles.wantTitle}>{item.book.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right column — sidebar */}
                        <div className={styles.sideCol}>
                            {/* Saved for Later */}
                            {wishlist.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>❤️ Saved</h2>
                                        <span className={styles.sectionBadge}>{wishlist.length}</span>
                                    </div>
                                    <div className={styles.savedList}>
                                        {wishlist.slice(0, 4).map((item) => (
                                            <Link key={item.id} href={`/book/${item.book.id}`} className={styles.savedCard}>
                                                {item.book.coverImage ? (
                                                    <Image src={item.book.coverImage} alt={item.book.title} width={40} height={58} className={styles.savedImg} />
                                                ) : (
                                                    <div className={styles.savedPlaceholder}>📖</div>
                                                )}
                                                <div className={styles.savedInfo}>
                                                    <span className={styles.savedTitle}>{item.book.title}</span>
                                                    <span className={styles.savedPrice}>${item.book.price.toFixed(2)}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reading Insights */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>💡 Insights</h2>
                                <div className={styles.insightsList}>
                                    {totalBooks > 0 && (
                                        <div className={styles.insightItem}>
                                            <span className={styles.insightIcon}>📚</span>
                                            <span>You&apos;ve collected <strong>{totalBooks}</strong> books</span>
                                        </div>
                                    )}
                                    {finished.length > 0 && (
                                        <div className={styles.insightItem}>
                                            <span className={styles.insightIcon}>✅</span>
                                            <span>Finished <strong>{finished.length}</strong> book{finished.length !== 1 ? "s" : ""}</span>
                                        </div>
                                    )}
                                    {topGenre && (
                                        <div className={styles.insightItem}>
                                            <span className={styles.insightIcon}>🎭</span>
                                            <span>Your top genre is <strong>{topGenre}</strong></span>
                                        </div>
                                    )}
                                    {currentlyReading.length > 0 && (
                                        <div className={styles.insightItem}>
                                            <span className={styles.insightIcon}>📖</span>
                                            <span><strong>{currentlyReading.length}</strong> book{currentlyReading.length !== 1 ? "s" : ""} in progress</span>
                                        </div>
                                    )}
                                    {wishlist.length > 0 && (
                                        <div className={styles.insightItem}>
                                            <span className={styles.insightIcon}>❤️</span>
                                            <span><strong>{wishlist.length}</strong> book{wishlist.length !== 1 ? "s" : ""} saved for later</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
