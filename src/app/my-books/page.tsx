"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUserOrders } from "@/lib/useUserOrders";
import styles from "./page.module.css";

type BookEntry = {
    id: number;
    title: string;
    author: string;
    genre: string;
    coverImage: string | null;
    addedDate: string;
};

type SortKey = "recent" | "title" | "author" | "genre";

export default function Library() {
    const { orders, loading } = useUserOrders();
    const [search, setSearch] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [sort, setSort] = useState<SortKey>("recent");

    const { books, genres } = useMemo(() => {
        const bookMap = new Map<number, BookEntry>();
        // Orders are sorted desc by date from the API
        for (const order of orders) {
            for (const item of order.items) {
                if (!bookMap.has(item.book.id)) {
                    bookMap.set(item.book.id, {
                        ...item.book,
                        addedDate: order.createdAt,
                    });
                }
            }
        }
        const allBooks = [...bookMap.values()];
        const genreSet = [...new Set(allBooks.map((b) => b.genre))].sort();
        return { books: allBooks, genres: genreSet };
    }, [orders]);

    const filtered = useMemo(() => {
        let result = books;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
            );
        }

        if (selectedGenre) {
            result = result.filter((b) => b.genre === selectedGenre);
        }

        switch (sort) {
            case "title":
                result = [...result].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "author":
                result = [...result].sort((a, b) => a.author.localeCompare(b.author));
                break;
            case "genre":
                result = [...result].sort((a, b) => a.genre.localeCompare(b.genre) || a.title.localeCompare(b.title));
                break;
            case "recent":
            default:
                // Already in recent order from the API
                break;
        }

        return result;
    }, [books, search, selectedGenre, sort]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container text-center" style={{ paddingTop: "8rem" }}>
                    <p className={styles.loadingText}>Loading your library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.heading}>📖 My Books</h1>
                    <p className={styles.subtitle}>{books.length} titles in your collection</p>
                </div>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.searchWrap}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by title or author..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className={styles.searchClear} onClick={() => setSearch("")}>×</button>
                        )}
                    </div>

                    <div className={styles.filters}>
                        <select
                            className={styles.select}
                            value={selectedGenre ?? ""}
                            onChange={(e) => setSelectedGenre(e.target.value || null)}
                        >
                            <option value="">All Genres</option>
                            {genres.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>

                        <select
                            className={styles.select}
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                        >
                            <option value="recent">Recently Added</option>
                            <option value="title">A → Z (Title)</option>
                            <option value="author">A → Z (Author)</option>
                            <option value="genre">By Genre</option>
                        </select>
                    </div>
                </div>

                {/* Book grid */}
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No books match your filters.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map((book) => (
                            <Link key={book.id} href={`/book/${book.id}`} className={styles.card}>
                                <div className={styles.coverWrap}>
                                    {book.coverImage ? (
                                        <Image
                                            src={book.coverImage}
                                            alt={book.title}
                                            width={140}
                                            height={200}
                                            className={styles.coverImg}
                                        />
                                    ) : (
                                        <div className={styles.coverPlaceholder}>📖</div>
                                    )}
                                    <span className={styles.genreTag}>{book.genre}</span>
                                </div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardTitle}>{book.title}</span>
                                    <span className={styles.cardAuthor}>{book.author}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
