import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import BookList from "./BookList";

export default async function Browse({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
    const { genre } = await searchParams;
    const books = await prisma.book.findMany({
        orderBy: { createdAt: "desc" },
    });

    const genres = [...new Set(books.map((b) => b.genre))].sort();

    return (
        <div className={styles.homePage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Browse Books</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Search, filter, and find your next favorite read
                        </p>
                    </div>
                </div>

                <BookList books={books} genres={genres} initialGenre={genre || null} />

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