import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/AddToCartButton";
import BookInteractions from "@/components/BookInteractions";
import styles from "./page.module.css";

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) notFound();

    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) notFound();

    const suggested = await prisma.book.findMany({
        where: {
            genre: book.genre,
            id: { not: book.id },
        },
        take: 6,
    });

    const fullStars = Math.floor(book.rating);
    const hasHalf = book.rating - fullStars >= 0.3;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className={styles.detailPage}>
            <div className="container">
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <Link href="/browse" className={styles.breadcrumbLink}>Browse Books</Link>
                    <span className={styles.breadcrumbSep}>›</span>
                    <Link href={`/browse?genre=${encodeURIComponent(book.genre)}`} className={styles.breadcrumbLink}>{book.genre}</Link>
                    <span className={styles.breadcrumbSep}>›</span>
                    <span className={styles.breadcrumbCurrent}>{book.title}</span>
                </div>

                {/* Main layout: Cover | Info | Buy Box */}
                <div className={styles.mainGrid}>
                    {/* Cover */}
                    <div className={styles.coverSection}>
                        {book.coverImage ? (
                            <Image
                                src={book.coverImage}
                                alt={book.title}
                                width={340}
                                height={500}
                                className={styles.coverImage}
                                priority
                            />
                        ) : (
                            <div className={styles.coverPlaceholder}>
                                <span>📖</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.tags}>
                            <span className={styles.genreTag}>{book.genre}</span>
                            {book.rating >= 4.5 && <span className={styles.badgeTag}>★ Top Rated</span>}
                        </div>

                        <h1 className={styles.title}>{book.title}</h1>
                        <p className={styles.author}>by <strong>{book.author}</strong></p>

                        <div className={styles.ratingRow}>
                            <span className={styles.stars}>
                                {"★".repeat(fullStars)}
                                {hasHalf && "★"}
                                {"☆".repeat(emptyStars)}
                            </span>
                            <span className={styles.ratingNumber}>{book.rating.toFixed(1)}</span>
                            <span className={styles.ratingLabel}>out of 5</span>
                        </div>

                        <div className={styles.divider} />

                        {/* Description */}
                        <div className={styles.descriptionSection}>
                            <h2 className={styles.sectionHeading}>About this book</h2>
                            <p className={styles.description}>
                                {book.fullDescription || book.description || "No description available."}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Genre</span>
                                <span className={styles.metaValue}>{book.genre}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Format</span>
                                <span className={styles.metaValue}>Paperback</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Language</span>
                                <span className={styles.metaValue}>English</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Rating</span>
                                <span className={styles.metaValue}>★ {book.rating.toFixed(1)} / 5</span>
                            </div>
                        </div>

                        {book.wikipediaUrl && (
                            <a
                                href={book.wikipediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.wikiLink}
                            >
                                📖 Read more on Wikipedia →
                            </a>
                        )}
                    </div>

                    {/* Buy Box */}
                    <div className={styles.buyBox}>
                        <span className={styles.buyPrice}>${book.price.toFixed(2)}</span>

                        <div className={styles.buyStock}>
                            <span className={book.inStock ? styles.stockIn : styles.stockOut}>
                                {book.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                            </span>
                        </div>

                        <AddToCartButton book={book} />

                        <div className={styles.buyInfo}>
                            <div className={styles.buyInfoRow}>
                                <span className={styles.buyInfoIcon}>🚚</span>
                                <span>Free shipping on orders over $35</span>
                            </div>
                            <div className={styles.buyInfoRow}>
                                <span className={styles.buyInfoIcon}>↩️</span>
                                <span>30-day free returns</span>
                            </div>
                            <div className={styles.buyInfoRow}>
                                <span className={styles.buyInfoIcon}>🔒</span>
                                <span>Secure checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggested Books */}
                {suggested.length > 0 && (
                    <div className={styles.suggestedSection}>
                        <div className={styles.suggestedHeader}>
                            <h2 className={styles.suggestedTitle}>You might also like</h2>
                            <Link href={`/browse?genre=${encodeURIComponent(book.genre)}`} className={styles.suggestedViewAll}>
                                View all {book.genre} →
                            </Link>
                        </div>
                        <div className={styles.suggestedScroll}>
                            {suggested.map((s) => (
                                <Link key={s.id} href={`/book/${s.id}`} className={styles.suggestedCard}>
                                    <div className={styles.suggestedCover}>
                                        {s.coverImage ? (
                                            <Image
                                                src={s.coverImage}
                                                alt={s.title}
                                                width={130}
                                                height={185}
                                                className={styles.suggestedImage}
                                            />
                                        ) : (
                                            <span className={styles.suggestedEmoji}>📖</span>
                                        )}
                                    </div>
                                    <h3 className={styles.suggestedBookTitle}>{s.title}</h3>
                                    <p className={styles.suggestedAuthor}>{s.author}</p>
                                    <div className={styles.suggestedBottom}>
                                        <span className={styles.suggestedRating}>★ {s.rating.toFixed(1)}</span>
                                        <span className={styles.suggestedPrice}>${s.price.toFixed(2)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* User interactions: ratings, reviews, wishlist, reading status */}
                <BookInteractions bookId={book.id} />
            </div>
        </div>
    );
}
