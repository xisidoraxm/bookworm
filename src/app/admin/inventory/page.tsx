"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
const LOW_STOCK_THRESHOLD = 3;

type StockReason = "DAMAGED" | "LOST" | "INVENTORY_CORRECTION" | "SUPPLIER_RETURN" | "CUSTOMER_RETURN" | "OTHER";

type InventoryBook = {
    id: number;
    title: string;
    author: string;
    genre: string;
    price: number;
    quantity: number;
    inStock: boolean;
    coverImage: string | null;
    updatedAt: string;
};

type InventoryResponse = {
    books: InventoryBook[];
    genres: string[];
    overview: {
        totalBooks: number;
        totalUnits: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    lowStockItems: { id: number; title: string; quantity: number }[];
    threshold: number;
};

function getStockStatus(quantity: number): StockStatus {
    if (quantity <= 0) return "OUT_OF_STOCK";
    if (quantity < LOW_STOCK_THRESHOLD) return "LOW_STOCK";
    return "IN_STOCK";
}

function statusLabel(status: StockStatus) {
    if (status === "IN_STOCK") return "In Stock";
    if (status === "LOW_STOCK") return "Low Stock";
    return "Out of Stock";
}

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function InventoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState<InventoryBook[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [overview, setOverview] = useState<InventoryResponse["overview"]>({
        totalBooks: 0,
        totalUnits: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
    });
    const [lowStockItems, setLowStockItems] = useState<InventoryResponse["lowStockItems"]>([]);

    const [q, setQ] = useState("");
    const [genre, setGenre] = useState("");
    const [stockStatus, setStockStatus] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [activeBook, setActiveBook] = useState<InventoryBook | null>(null);
    const [addUnits, setAddUnits] = useState(0);
    const [removeUnits, setRemoveUnits] = useState(0);
    const [reason, setReason] = useState<StockReason>("INVENTORY_CORRECTION");
    const [otherReason, setOtherReason] = useState("");
    const [notes, setNotes] = useState("");
    const [savingStock, setSavingStock] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) {
                const user = JSON.parse(stored);
                if (user.role === "ADMIN") {
                    setAuthorized(true);
                    return;
                }
            }
        } catch {
            // ignore malformed local storage
        }
        router.push("/");
    }, [router]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (genre) params.set("genre", genre);
        if (stockStatus) params.set("stockStatus", stockStatus);
        if (minPrice.trim()) params.set("minPrice", minPrice.trim());
        if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

        try {
            const res = await fetch(`/api/admin/inventory?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load inventory");

            const json: InventoryResponse = await res.json();
            setBooks(json.books);
            setGenres(json.genres);
            setOverview(json.overview);
            setLowStockItems(json.lowStockItems);
        } catch {
            setError("Could not load inventory. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    }, [genre, maxPrice, minPrice, q, stockStatus]);

    useEffect(() => {
        if (!authorized) return;
        const timer = setTimeout(() => {
            fetchInventory();
        }, 250);
        return () => clearTimeout(timer);
    }, [authorized, fetchInventory]);

    useEffect(() => {
        if (!books.length) return;
        const rawId = searchParams.get("updateStock");
        if (!rawId) return;
        const id = Number(rawId);
        if (!Number.isFinite(id)) return;
        const found = books.find((book) => book.id === id);
        if (found) {
            openStockModal(found);
        }
    }, [books, searchParams]);

    const nextQuantityPreview = useMemo(() => {
        if (!activeBook) return 0;
        return Math.max(0, activeBook.quantity + addUnits - removeUnits);
    }, [activeBook, addUnits, removeUnits]);

    function openStockModal(book: InventoryBook) {
        setActiveBook(book);
        setAddUnits(0);
        setRemoveUnits(0);
        setReason("INVENTORY_CORRECTION");
        setOtherReason("");
        setNotes("");
    }

    function closeStockModal() {
        setActiveBook(null);
        setAddUnits(0);
        setRemoveUnits(0);
        setReason("INVENTORY_CORRECTION");
        setOtherReason("");
        setNotes("");
    }

    async function handleSaveStock() {
        if (!activeBook) return;
        if (reason === "OTHER" && !otherReason.trim()) {
            setError("Please enter a custom reason when selecting Other.");
            return;
        }

        const finalReason = reason === "OTHER" ? otherReason.trim() : reason;
        const combinedNotes = notes.trim()
            ? `${finalReason} - ${notes.trim()}`
            : finalReason;

        setSavingStock(true);

        try {
            const res = await fetch(`/api/admin/inventory/${activeBook.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addUnits, removeUnits, notes: combinedNotes }),
            });

            if (!res.ok) throw new Error("Failed to update stock");

            closeStockModal();
            fetchInventory();
        } catch {
            setError("Stock update failed. Please try again.");
        } finally {
            setSavingStock(false);
        }
    }

    async function handleRemoveBook(bookId: number) {
        const shouldDelete = window.confirm("Remove this book from inventory?");
        if (!shouldDelete) return;

        try {
            const res = await fetch(`/api/admin/inventory/${bookId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove book");
            fetchInventory();
        } catch {
            setError("Could not remove book. Please try again.");
        }
    }

    if (!authorized) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.heading}>Inventory</h1>
                        <p className={styles.subheading}>Admin overview of stock levels and quantity controls.</p>
                    </div>
                    <Link href="/admin/add-book" className={styles.addBookBtn}>+ Add Book</Link>
                </div>

                <div className={styles.toolbar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search by title or author"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    <select className={styles.select} value={genre} onChange={(e) => setGenre(e.target.value)}>
                        <option value="">All Genres</option>
                        {genres.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>

                    <select className={styles.select} value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
                        <option value="">All Stock Statuses</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>

                    <input
                        className={styles.priceInput}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        className={styles.priceInput}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>

                <div className={styles.cards}>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Total Books in Catalog</span>
                        <span className={styles.cardValue}>{overview.totalBooks}</span>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Total Units in Stock</span>
                        <span className={styles.cardValue}>{overview.totalUnits}</span>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Low Stock Items</span>
                        <span className={styles.cardValue}>{overview.lowStockCount}</span>
                    </div>
                    <div className={styles.card}>
                        <span className={styles.cardLabel}>Out of Stock Items</span>
                        <span className={styles.cardValue}>{overview.outOfStockCount}</span>
                    </div>
                </div>

                {lowStockItems.length > 0 && (
                    <div className={styles.alertsSection}>
                        <h2 className={styles.alertsHeading}>Low-Stock Alerts</h2>
                        <div className={styles.alertList}>
                            {lowStockItems.map((item) => (
                                <div key={item.id} className={styles.alertItem}>
                                    <div>
                                        <p className={styles.alertTitle}>{item.title}</p>
                                        <p className={styles.alertMeta}>Current quantity: {item.quantity}</p>
                                    </div>
                                    <button
                                        className={styles.alertAction}
                                        onClick={() => {
                                            const book = books.find((b) => b.id === item.id);
                                            if (book) openStockModal(book);
                                        }}
                                    >
                                        Update Stock
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.tableWrap}>
                    {loading ? (
                        <p className={styles.loading}>Loading inventory...</p>
                    ) : books.length === 0 ? (
                        <p className={styles.loading}>No books match your current filters.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => {
                                    const stock = getStockStatus(book.quantity);

                                    return (
                                        <tr key={book.id}>
                                            <td>
                                                <div className={styles.bookCell}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={book.coverImage || "https://placehold.co/56x84?text=No+Cover"}
                                                        alt={book.title}
                                                        className={styles.cover}
                                                    />
                                                    <div>
                                                        <p className={styles.bookTitle}>{book.title}</p>
                                                        <p className={styles.bookAuthor}>{book.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{book.genre}</td>
                                            <td>{formatPrice(book.price)}</td>
                                            <td>{book.quantity}</td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${
                                                        stock === "IN_STOCK"
                                                            ? styles.statusIn
                                                            : stock === "LOW_STOCK"
                                                              ? styles.statusLow
                                                              : styles.statusOut
                                                    }`}
                                                >
                                                    {statusLabel(stock)}
                                                </span>
                                            </td>
                                            <td>{formatDate(book.updatedAt)}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link className={styles.actionLink} href={`/admin/edit-book/${book.id}`}>Edit</Link>
                                                    <button className={styles.actionBtn} onClick={() => openStockModal(book)}>Update Stock</button>
                                                    <button className={styles.removeBtn} onClick={() => handleRemoveBook(book.id)}>Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {activeBook && (
                <div className={styles.modalBackdrop} onClick={closeStockModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Update Stock</h3>
                        <p className={styles.modalBook}>{activeBook.title}</p>

                        <label className={styles.modalLabel}>Current quantity</label>
                        <input className={`${styles.modalInput} ${styles.readOnlyInput}`} value={activeBook.quantity} readOnly disabled />

                        <label className={styles.modalLabel}>Increase stock (+)</label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            min="0"
                            value={addUnits}
                            onChange={(e) => setAddUnits(Math.max(0, Number(e.target.value) || 0))}
                        />

                        <label className={styles.modalLabel}>Decrease stock (-)</label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            min="0"
                            value={removeUnits}
                            onChange={(e) => setRemoveUnits(Math.max(0, Number(e.target.value) || 0))}
                        />

                        <label className={styles.modalLabel}>Reason</label>
                        <select
                            className={styles.modalInput}
                            value={reason}
                            onChange={(e) => setReason(e.target.value as StockReason)}
                        >
                            <option value="DAMAGED">Damaged</option>
                            <option value="LOST">Lost</option>
                            <option value="INVENTORY_CORRECTION">Inventory correction</option>
                            <option value="SUPPLIER_RETURN">Supplier return</option>
                            <option value="CUSTOMER_RETURN">Customer return</option>
                            <option value="OTHER">Other</option>
                        </select>

                        {reason === "OTHER" && (
                            <>
                                <label className={styles.modalLabel}>Other reason</label>
                                <input
                                    className={styles.modalInput}
                                    type="text"
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Enter custom reason"
                                />
                            </>
                        )}

                        <label className={styles.modalLabel}>Notes (optional)</label>
                        <textarea
                            className={styles.modalTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Restock shipment, damaged return adjustment, etc."
                            rows={3}
                        />

                        <p className={styles.preview}>
                            New quantity after save:{" "}
                            <span className={nextQuantityPreview < LOW_STOCK_THRESHOLD ? styles.previewLow : styles.previewNormal}>
                                {nextQuantityPreview}
                            </span>
                        </p>

                        <div className={styles.modalActions}>
                            <button className={styles.secondaryBtn} onClick={closeStockModal}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handleSaveStock} disabled={savingStock}>
                                {savingStock ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
