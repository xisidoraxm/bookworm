import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) notFound();

    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) notFound();

    return (
        <div className={styles.detailPage}>
            <div className="container">
                <Link href="/home" className={styles.backLink}>
                    ← Back to Books
                </Link>

                <div className={styles.detailCard}>
                    <div className={styles.coverSection}>
                        {book.coverImage ? (
                            <Image
                                src={book.coverImage}
                                alt={book.title}
                                width={300}
                                height={450}
                                className={styles.coverImage}
                                priority
                            />
                        ) : (
                            <div className={styles.coverPlaceholder}>
                                <span>📖</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <span className={styles.genre}>{book.genre}</span>
                        <h1 className={styles.title}>{book.title}</h1>
                        <p className={styles.author}>by {book.author}</p>

                        <div className={styles.ratingRow}>
                            <span className={styles.stars}>
                                {"★".repeat(Math.round(book.rating))}
                                {"☆".repeat(5 - Math.round(book.rating))}
                            </span>
                            <span className={styles.ratingValue}>{book.rating.toFixed(1)} / 5</span>
                        </div>

                        <p className={styles.description}>
                            {book.fullDescription || book.description}
                        </p>

                        <div className={styles.priceRow}>
                            <span className={styles.price}>${book.price.toFixed(2)}</span>
                            <span className={book.inStock ? styles.inStock : styles.outOfStock}>
                                {book.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                            </span>
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
                </div>
            </div>
        </div>
    );
}
