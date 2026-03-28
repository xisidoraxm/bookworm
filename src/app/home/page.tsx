import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import BookList from "./BookList";

export default async function Home() {
    const books = await prisma.book.findMany({
        orderBy: { createdAt: "desc" },
    });

    const genres = [...new Set(books.map((b) => b.genre))].sort();

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

                <BookList books={books} genres={genres} />

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