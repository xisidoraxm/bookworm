"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

type SortKey = "newest" | "price-asc" | "price-desc" | "rating" | "title";
const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export default function BookList({ books, genres }: { books: Book[]; genres: string[] }) {
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");
    const [minRating, setMinRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [perPage, setPerPage] = useState(12);
    const [page, setPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { addToCart, items: cartItems } = useCart();

    useEffect(() => {
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) setIsAdmin(JSON.parse(stored).role === "ADMIN");
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        let result = books.filter((b) => {
            const matchesGenre = !selectedGenre || b.genre === selectedGenre;
            const matchesSearch = !search ||
                b.title.toLowerCase().includes(search.toLowerCase()) ||
                b.author.toLowerCase().includes(search.toLowerCase());
            const matchesRating = b.rating >= minRating;
            const matchesStock = !inStockOnly || b.inStock;
            return matchesGenre && matchesSearch && matchesRating && matchesStock;
        });

        switch (sort) {
            case "price-asc":
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result = [...result].sort((a, b) => b.rating - a.rating);
                break;
            case "title":
                result = [...result].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "newest":
            default:
                break;
        }
        return result;
    }, [books, selectedGenre, search, sort, minRating, inStockOnly]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const hasActiveFilters = selectedGenre || search || minRating > 0 || inStockOnly;

    // Search suggestions
    const suggestions = useMemo(() => {
        if (!search || search.length < 2) return null;
        const q = search.toLowerCase();
        const titleMatches = books.filter((b) => b.title.toLowerCase().includes(q)).slice(0, 3);
        const authorMatches = [...new Set(books.filter((b) => b.author.toLowerCase().includes(q)).map((b) => b.author))].slice(0, 2);
        const genreMatches = genres.filter((g) => g.toLowerCase().includes(q));
        return { titles: titleMatches, authors: authorMatches, genres: genreMatches };
    }, [books, genres, search]);

    const hasSuggestions = suggestions && (
        (suggestions.titles?.length ?? 0) > 0 ||
        (suggestions.authors?.length ?? 0) > 0 ||
        (suggestions.genres?.length ?? 0) > 0
    );

    function clearFilters() {
        setSelectedGenre(null);
        setSearch("");
        setMinRating(0);
        setInStockOnly(false);
        setPage(1);
    }

    function handleGenre(genre: string | null) {
        setSelectedGenre(genre);
        setPage(1);
    }

    function handleAddToCart(e: React.MouseEvent, book: Book) {
        e.preventDefault();
        e.stopPropagation();
        if (!book.inStock) return;
        addToCart({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            coverImage: book.coverImage,
        });
    }

    // Featured: top 4 rated books
    const featured = useMemo(() =>
        [...books].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [books]);

    // Collections
    const collections = useMemo(() => {
        const classics = books.filter((b) => b.genre === "Classic").slice(0, 4);
        const budget = [...books].filter((b) => b.price < 12 && b.inStock).sort((a, b) => a.price - b.price).slice(0, 4);
        const staffPicks = [...books].filter((b) => b.rating >= 4.4 && b.inStock).slice(0, 4);
        return [
            { title: "📚 Classics You Must Read", books: classics, action: () => handleGenre("Classic") },
            { title: "💰 Great Reads Under $12", books: budget, action: null },
            { title: "✨ Staff Picks", books: staffPicks, action: null },
        ].filter((c) => c.books.length > 0);
    }, [books]);

    return (
        <>
            {/* Featured section */}
            {!hasActiveFilters && page === 1 && (
                <>
                    <div className={styles.featuredSection}>
                        <h2 className={styles.featuredTitle}>⭐ Bestsellers</h2>
                        <div className={styles.featuredGrid}>
                            {featured.map((book) => (
                                <Link key={book.id} href={`/book/${book.id}`} className={styles.featuredCard}>
                                    <div className={styles.featuredCover}>
                                        {book.coverImage ? (
                                            <Image src={book.coverImage} alt={book.title} width={100} height={145} className={styles.featuredImg} />
                                        ) : (
                                            <span className={styles.featuredEmoji}>📖</span>
                                        )}
                                    </div>
                                    <div className={styles.featuredInfo}>
                                        <span className={styles.featuredBookTitle}>{book.title}</span>
                                        <span className={styles.featuredAuthor}>{book.author}</span>
                                        <span className={styles.featuredRating}>★ {book.rating.toFixed(1)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Featured collections */}
                    {collections.map((col) => (
                        <div key={col.title} className={styles.collectionSection}>
                            <div className={styles.collectionHeader}>
                                <h2 className={styles.collectionTitle}>{col.title}</h2>
                                {col.action && (
                                    <button className={styles.collectionLink} onClick={col.action}>
                                        View all →
                                    </button>
                                )}
                            </div>
                            <div className={styles.collectionGrid}>
                                {col.books.map((book) => (
                                    <Link key={book.id} href={`/book/${book.id}`} className={styles.collectionCard}>
                                        <div className={styles.collectionCover}>
                                            {book.coverImage ? (
                                                <Image src={book.coverImage} alt={book.title} width={120} height={170} className={styles.collectionImg} />
                                            ) : (
                                                <div className={styles.collectionPlaceholder}>📖</div>
                                            )}
                                        </div>
                                        <span className={styles.collectionBookTitle}>{book.title}</span>
                                        <span className={styles.collectionBookAuthor}>{book.author}</span>
                                        <span className={styles.collectionBookPrice}>${book.price.toFixed(2)}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
                <span
                    className={`${styles.breadcrumbItem} ${!selectedGenre ? styles.breadcrumbActive : styles.breadcrumbLink}`}
                    onClick={() => handleGenre(null)}
                    role="button"
                    tabIndex={0}
                >
                    Browse Books
                </span>
                {selectedGenre && (
                    <>
                        <span className={styles.breadcrumbSep}>›</span>
                        <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                            {selectedGenre}
                        </span>
                    </>
                )}
            </div>

            {/* Top toolbar bar */}
            <div className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <button
                        className={styles.toggleSidebarBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={sidebarOpen ? "Hide filters" : "Show filters"}
                    >
                        {sidebarOpen ? "◀ Hide filters" : "▶ Show filters"}
                    </button>
                    <span className={styles.resultCount}>
                        {filtered.length} book{filtered.length !== 1 ? "s" : ""}
                        {selectedGenre && <> in <strong>{selectedGenre}</strong></>}
                    </span>
                </div>
                <div className={styles.topBarRight}>
                    <select
                        className={styles.toolbarSelect}
                        value={sort}
                        onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
                    >
                        <option value="newest">Newest</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="title">A → Z</option>
                    </select>
                    <select
                        className={styles.toolbarSelect}
                        value={perPage}
                        onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n} per page</option>
                        ))}
                    </select>
                    {hasActiveFilters && (
                        <button className={styles.topBarClear} onClick={clearFilters}>
                            ✕ Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div className={`${styles.contentLayout} ${!sidebarOpen ? styles.contentLayoutCollapsed : ""}`}>
                {/* Sidebar */}
                {sidebarOpen && (
                    <aside className={styles.sidebar}>
                        <div className={styles.searchBar} ref={searchRef}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search books or authors..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                onFocus={() => setSearchFocused(true)}
                            />
                            {search && (
                                <button className={styles.searchClear} onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear search">
                                    &times;
                                </button>
                            )}
                            {/* Search suggestions */}
                            {searchFocused && hasSuggestions && (
                                <div className={styles.suggestions}>
                                    {suggestions.titles.length > 0 && (
                                        <div className={styles.suggestGroup}>
                                            <span className={styles.suggestLabel}>Books</span>
                                            {suggestions.titles.map((b) => (
                                                <Link
                                                    key={b.id}
                                                    href={`/book/${b.id}`}
                                                    className={styles.suggestItem}
                                                    onClick={() => setSearchFocused(false)}
                                                >
                                                    📖 {b.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {suggestions.authors.length > 0 && (
                                        <div className={styles.suggestGroup}>
                                            <span className={styles.suggestLabel}>Authors</span>
                                            {suggestions.authors.map((a) => (
                                                <button
                                                    key={a}
                                                    className={styles.suggestItem}
                                                    onClick={() => { setSearch(a); setSearchFocused(false); setPage(1); }}
                                                >
                                                    ✍️ {a}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {suggestions.genres.length > 0 && (
                                        <div className={styles.suggestGroup}>
                                            <span className={styles.suggestLabel}>Genres</span>
                                            {suggestions.genres.map((g) => (
                                                <button
                                                    key={g}
                                                    className={styles.suggestItem}
                                                    onClick={() => { handleGenre(g); setSearch(""); setSearchFocused(false); }}
                                                >
                                                    🎭 {g}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h3 className={styles.sidebarTitle}>Genres</h3>
                        <ul className={styles.genreList}>
                            <li>
                                <button
                                    className={`${styles.genreButton} ${!selectedGenre ? styles.genreActive : ""}`}
                                    onClick={() => handleGenre(null)}
                                >
                                    All Books
                                    <span className={styles.genreCount}>{books.length}</span>
                                </button>
                            </li>
                            {genres.map((genre) => (
                                <li key={genre}>
                                    <button
                                        className={`${styles.genreButton} ${selectedGenre === genre ? styles.genreActive : ""}`}
                                        onClick={() => handleGenre(genre)}
                                    >
                                        {genre}
                                        <span className={styles.genreCount}>
                                            {books.filter((b) => b.genre === genre).length}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.filterGroup}>
                            <h3 className={styles.sidebarTitle}>Rating</h3>
                            <div className={styles.ratingFilters}>
                                {[0, 3, 3.5, 4, 4.5].map((r) => (
                                    <button
                                        key={r}
                                        className={`${styles.ratingBtn} ${minRating === r ? styles.ratingActive : ""}`}
                                        onClick={() => { setMinRating(r); setPage(1); }}
                                    >
                                        {r === 0 ? "All" : `${r}★+`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                                    className={styles.checkbox}
                                />
                                In stock only
                            </label>
                        </div>

                        {hasActiveFilters && (
                            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                                ✕ Clear all filters
                            </button>
                        )}
                    </aside>
                )}

                {/* Main content */}
                <div className={styles.mainContent}>
                    {/* Book grid */}
                    {paginated.length > 0 ? (
                        <div className={styles.booksGrid}>
                            {paginated.map((book) => {
                                const inCart = cartItems.find((c) => c.id === book.id);
                                return (
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
                                                {/* Hover overlay */}
                                                {!isAdmin && (
                                                <div className={styles.bookOverlay}>
                                                    <button
                                                        className={`${styles.quickAddBtn} ${!book.inStock ? styles.quickAddDisabled : ""}`}
                                                        onClick={(e) => handleAddToCart(e, book)}
                                                        disabled={!book.inStock}
                                                    >
                                                        {!book.inStock
                                                            ? "Out of Stock"
                                                            : inCart
                                                                ? `✓ In Cart (${inCart.quantity})`
                                                                : "🛒 Add to Cart"}
                                                    </button>
                                                </div>
                                                )}
                                                {book.rating >= 4.5 && (
                                                    <span className={styles.bookBadge}>★ Top Rated</span>
                                                )}
                                            </div>
                                            <div className={styles.bookBody}>
                                                <h5 className={styles.bookTitle}>{book.title}</h5>
                                                <p className={styles.bookAuthor}>by {book.author}</p>
                                                <div className={styles.bookFooter}>
                                                    <div className={styles.bookMeta}>
                                                        <span className={styles.rating}>★ {book.rating.toFixed(1)}</span>
                                                        <span className={styles.price}>${book.price.toFixed(2)}</span>
                                                    </div>
                                                    <span className={book.inStock ? styles.inStock : styles.outOfStock}>
                                                        {book.inStock ? "In Stock" : "Out of Stock"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🔍</span>
                            <p className={styles.emptyText}>Nothing matches your filters — try adjusting them.</p>
                            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageBtn}
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className={styles.pageBtn}
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

