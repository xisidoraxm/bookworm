import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const books = await prisma.book.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.homePage}>
            <div className="container">
            <div className="row">
                <div className="col-12">
                    <h1 className={`text-center mt-5 ${styles.heading}`}>Welcome to Bookworm</h1>
                    <p className={`text-center ${styles.subtitle}`}>
                        Discover your next favorite read
                    </p>
                </div>
            </div>

            <div className="row mt-4">
                {books.map((book) => (
                    <div key={book.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className={`card h-100 ${styles.bookCard}`}>
                            <div className={styles.bookCover}>
                                <span className={styles.bookEmoji}>📖</span>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className={`card-title ${styles.bookTitle}`}>{book.title}</h5>
                                <p className={styles.bookAuthor}>by {book.author}</p>
                                <p className={`card-text ${styles.bookDescription}`}>
                                    {book.description}
                                </p>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={styles.genre}>{book.genre}</span>
                                        <span className={styles.rating}>★ {book.rating.toFixed(1)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={styles.price}>${book.price.toFixed(2)}</span>
                                        <span className={book.inStock ? styles.inStock : styles.outOfStock}>
                                            {book.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {books.length === 0 && (
                <div className="row">
                    <div className="col-12 text-center mt-5">
                        <p className={styles.subtitle}>No books available yet. Check back soon!</p>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}