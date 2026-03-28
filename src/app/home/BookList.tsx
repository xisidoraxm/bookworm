"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

type Book = {
    id: number;
    title: string;
    author: string;
    description: string | null;
    price: number;
    genre: string;
    coverImage: string | null;
    rating: number;
    inStock: boolean;
};

export default function BookList({ books, genres }: { books: Book[]; genres: string[] }) {
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filtered = books.filter((b) => {
        const matchesGenre = !selectedGenre || b.genre === selectedGenre;
        const matchesSearch = !search ||
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase());
        return matchesGenre && matchesSearch;
    });

    return (
        <div className={styles.contentLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className={styles.searchClear}
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            &times;
                        </button>
                    )}
                </div>
                <h3 className={styles.sidebarTitle}>Genres</h3>
                <ul className={styles.genreList}>
                    <li>
                        <button
                            className={`${styles.genreButton} ${!selectedGenre ? styles.genreActive : ""}`}
                            onClick={() => setSelectedGenre(null)}
                        >
                            All Books
                            <span className={styles.genreCount}>{books.length}</span>
                        </button>
                    </li>
                    {genres.map((genre) => (
                        <li key={genre}>
                            <button
                                className={`${styles.genreButton} ${selectedGenre === genre ? styles.genreActive : ""}`}
                                onClick={() => setSelectedGenre(genre)}
                            >
                                {genre}
                                <span className={styles.genreCount}>
                                    {books.filter((b) => b.genre === genre).length}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            <div className={styles.booksGrid}>
                {filtered.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} className={styles.bookCardLink}>
                        <div className={styles.bookCard}>
                        <div className={styles.bookCover}>
                            {book.coverImage ? (
                                <Image
                                    src={book.coverImage}
                                    alt={book.title}
                                    width={200}
                                    height={280}
                                    className={styles.coverImage}
                                />
                            ) : (
                                <span className={styles.bookEmoji}>📖</span>
                            )}
                        </div>
                        <div className={styles.bookBody}>
                            <h5 className={styles.bookTitle}>{book.title}</h5>
                            <p className={styles.bookAuthor}>by {book.author}</p>
                            <p className={styles.bookDescription}>{book.description}</p>
                            <div className={styles.bookFooter}>
                                <div className={styles.bookMeta}>
                                    <span className={styles.genre}>{book.genre}</span>
                                    <span className={styles.rating}>★ {book.rating.toFixed(1)}</span>
                                </div>
                                <div className={styles.bookMeta}>
                                    <span className={styles.price}>${book.price.toFixed(2)}</span>
                                    <span className={book.inStock ? styles.inStock : styles.outOfStock}>
                                        {book.inStock ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        </div>
                    </Link>
                ))}

                {filtered.length === 0 && (
                    <p className={styles.subtitle}>No books found in this genre.</p>
                )}
            </div>
        </div>
    );
}
