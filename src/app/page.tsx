import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./discover.module.css";

export default async function Discover() {
    const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
    const genres = [...new Set(books.map((b) => b.genre))].sort();

    const bestsellers = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const classics = books.filter((b) => b.genre === "Classic").slice(0, 4);
    const budget = [...books].filter((b) => b.price < 12 && b.inStock).sort((a, b) => a.price - b.price).slice(0, 4);
    const staffPicks = [...books].filter((b) => b.rating >= 4.4 && b.inStock).slice(0, 4);
    const newArrivals = books.slice(0, 4);

    const collections = [
        { title: "⭐ Bestsellers", books: bestsellers },
        { title: "🆕 New Arrivals", books: newArrivals },
        { title: "📚 Classics You Must Read", books: classics, genre: "Classic" },
        { title: "💰 Great Reads Under $12", books: budget },
        { title: "✨ Staff Picks", books: staffPicks },
    ].filter((c) => c.books.length > 0);

    return (
        <div className={styles.page}>
            {/* Hero */}
            <div className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Find your next great read</h1>
                    <p className={styles.heroSub}>
                        Over {books.length} titles across {genres.length} genres — curated for every reader
                    </p>
                    <Link href="/browse" className={styles.heroCta}>
                        Browse All Books →
                    </Link>
                </div>
            </div>

            <div className="container">
                {/* Genre chips */}
                <div className={styles.genreChips}>
                    <span className={styles.genreChipsLabel}>Explore by genre</span>
                    <div className={styles.chips}>
                        {genres.map((g) => (
                            <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className={styles.chip}>
                                {g}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Collections */}
                {collections.map((col) => (
                    <section key={col.title} className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{col.title}</h2>
                            {col.genre ? (
                                <Link href={`/browse?genre=${encodeURIComponent(col.genre)}`} className={styles.viewAll}>
                                    View all →
                                </Link>
                            ) : (
                                <Link href="/browse" className={styles.viewAll}>
                                    View all →
                                </Link>
                            )}
                        </div>
                        <div className={styles.grid}>
                            {col.books.map((book) => (
                                <Link key={book.id} href={`/book/${book.id}`} className={styles.card}>
                                    <div className={styles.cover}>
                                        {book.coverImage ? (
                                            <Image
                                                src={book.coverImage}
                                                alt={book.title}
                                                width={160}
                                                height={230}
                                                className={styles.coverImg}
                                            />
                                        ) : (
                                            <div className={styles.coverPlaceholder}>📖</div>
                                        )}
                                        {book.rating >= 4.5 && (
                                            <span className={styles.badge}>★ Top Rated</span>
                                        )}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardTitle}>{book.title}</span>
                                        <span className={styles.cardAuthor}>by {book.author}</span>
                                        <div className={styles.cardBottom}>
                                            <span className={styles.cardRating}>★ {book.rating.toFixed(1)}</span>
                                            <span className={styles.cardPrice}>${book.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Bottom CTA */}
                <div className={styles.bottomCta}>
                    <p className={styles.bottomText}>Ready to explore the full catalog?</p>
                    <Link href="/browse" className={styles.bottomBtn}>Browse All Books</Link>
                </div>
            </div>
        </div>
    );
}
