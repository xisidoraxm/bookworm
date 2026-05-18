"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import styles from "../../add-book/page.module.css";

const GENRES = [
    "Adventure",
    "Classic",
    "Dystopian",
    "Fantasy",
    "Horror",
    "Mystery",
    "Non-Fiction",
    "Romance",
    "Science Fiction",
];

const FORMATS = [
    { value: "PAPERBACK", label: "Paperback" },
    { value: "HARDCOVER", label: "Hardcover" },
];

type BookFormState = {
    title: string;
    author: string;
    description: string;
    fullDescription: string;
    wikipediaUrl: string;
    coverImage: string;
    genre: string;
    format: string;
    price: string;
    quantity: string;
};

const EMPTY_FORM: BookFormState = {
    title: "",
    author: "",
    description: "",
    fullDescription: "",
    wikipediaUrl: "",
    coverImage: "",
    genre: "",
    format: "PAPERBACK",
    price: "",
    quantity: "0",
};

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const rawId = params?.id;
    const bookId = Number(rawId);

    const [authorized, setAuthorized] = useState(false);
    const [loadingBook, setLoadingBook] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<BookFormState>(EMPTY_FORM);
    const [coverValid, setCoverValid] = useState<boolean | null>(null);
    const [coverChecking, setCoverChecking] = useState(false);

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
            // ignore
        }
        router.push("/");
    }, [router]);

    useEffect(() => {
        if (!authorized) return;
        if (!Number.isFinite(bookId)) {
            router.push("/admin/inventory");
            return;
        }

        async function loadBook() {
            setLoadingBook(true);
            try {
                const res = await fetch(`/api/books/${bookId}`);
                if (!res.ok) {
                    toast.error("Could not load book details.");
                    router.push("/admin/inventory");
                    return;
                }

                const book = await res.json();
                setForm({
                    title: book.title ?? "",
                    author: book.author ?? "",
                    description: book.description ?? "",
                    fullDescription: book.fullDescription ?? "",
                    wikipediaUrl: book.wikipediaUrl ?? "",
                    coverImage: book.coverImage ?? "",
                    genre: book.genre ?? "",
                    format: book.format ?? "PAPERBACK",
                    price: String(book.price ?? ""),
                    quantity: String(book.quantity ?? 0),
                });
                setCoverValid(book.coverImage ? true : null);
            } catch {
                toast.error("Something went wrong while loading book details.");
            } finally {
                setLoadingBook(false);
            }
        }

        loadBook();
    }, [authorized, bookId, router]);

    function handleFieldChange<K extends keyof BookFormState>(key: K, value: BookFormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleCoverUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value.trim();
        handleFieldChange("coverImage", url);
        setCoverValid(null);

        if (!url) {
            setCoverChecking(false);
            return;
        }

        try {
            new URL(url);
        } catch {
            setCoverValid(false);
            return;
        }

        setCoverChecking(true);
        const img = new window.Image();
        img.onload = () => {
            setCoverValid(true);
            setCoverChecking(false);
        };
        img.onerror = () => {
            setCoverValid(false);
            setCoverChecking(false);
        };
        img.src = url;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!Number.isFinite(bookId)) return;

        const title = form.title.trim();
        const author = form.author.trim();
        const genre = form.genre;
        const format = form.format || "PAPERBACK";
        const description = form.description.trim();
        const fullDescription = form.fullDescription.trim();
        const wikipediaUrl = form.wikipediaUrl.trim();
        const coverImage = form.coverImage.trim();
        const price = parseFloat(form.price);
        const quantity = parseInt(form.quantity || "0", 10);

        if (!title || !author || !genre || !price) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (coverImage && coverValid === false) {
            toast.error("Cover image URL is not valid or the image could not be loaded. Please fix it or remove it.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 0) {
            toast.error("Quantity must be a non-negative number.");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/books/${bookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    author,
                    description: description || undefined,
                    fullDescription: fullDescription || undefined,
                    wikipediaUrl: wikipediaUrl || undefined,
                    coverImage: coverImage || undefined,
                    genre,
                    format,
                    price,
                    quantity,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Failed to update book");
                setSaving(false);
                return;
            }

            toast.success("Book updated successfully!", { autoClose: 1200 });
            setTimeout(() => router.push(`/book/${bookId}`), 1300);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (!authorized) return null;

    return (
        <div className={styles.addBookPage}>
            <ToastContainer />
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Edit Book</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Update book details, metadata, and inventory settings
                        </p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        {loadingBook ? (
                            <div className={styles.form}>
                                <p className={styles.subtitle}>Loading book data...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>📖 Basic Information</h2>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="title">
                                            Title <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            className={styles.input}
                                            placeholder="Enter book title"
                                            required
                                            value={form.title}
                                            onChange={(e) => handleFieldChange("title", e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="author">
                                            Author <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            id="author"
                                            name="author"
                                            type="text"
                                            className={styles.input}
                                            placeholder="Enter author name"
                                            required
                                            value={form.author}
                                            onChange={(e) => handleFieldChange("author", e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} htmlFor="genre">
                                                Genre <span className={styles.required}>*</span>
                                            </label>
                                            <select
                                                id="genre"
                                                name="genre"
                                                className={styles.select}
                                                required
                                                value={form.genre}
                                                onChange={(e) => handleFieldChange("genre", e.target.value)}
                                            >
                                                <option value="">Select genre</option>
                                                {GENRES.map((g) => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label} htmlFor="format">
                                                Format <span className={styles.required}>*</span>
                                            </label>
                                            <select
                                                id="format"
                                                name="format"
                                                className={styles.select}
                                                required
                                                value={form.format}
                                                onChange={(e) => handleFieldChange("format", e.target.value)}
                                            >
                                                {FORMATS.map((f) => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} htmlFor="price">
                                                Price ($) <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                className={styles.input}
                                                placeholder="0.00"
                                                required
                                                value={form.price}
                                                onChange={(e) => handleFieldChange("price", e.target.value)}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label} htmlFor="quantity">
                                                Quantity
                                            </label>
                                            <input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                min="0"
                                                className={styles.input}
                                                placeholder="0"
                                                value={form.quantity}
                                                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>📝 Description</h2>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="description">
                                            Short Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            className={styles.textarea}
                                            rows={3}
                                            placeholder="A brief summary of the book"
                                            value={form.description}
                                            onChange={(e) => handleFieldChange("description", e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="fullDescription">
                                            Full Description
                                        </label>
                                        <textarea
                                            id="fullDescription"
                                            name="fullDescription"
                                            className={styles.textarea}
                                            rows={6}
                                            placeholder="A detailed description of the book"
                                            value={form.fullDescription}
                                            onChange={(e) => handleFieldChange("fullDescription", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>🔗 Links & Media</h2>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="coverImage">
                                            Cover Image URL
                                        </label>
                                        <input
                                            id="coverImage"
                                            name="coverImage"
                                            type="url"
                                            className={`${styles.input} ${coverValid === false ? styles.inputError : ""} ${coverValid === true ? styles.inputSuccess : ""}`}
                                            placeholder="https://covers.openlibrary.org/b/isbn/..."
                                            value={form.coverImage}
                                            onChange={handleCoverUrlChange}
                                        />
                                        {coverChecking && (
                                            <span className={styles.fieldHint}>Checking image...</span>
                                        )}
                                        {coverValid === false && !coverChecking && form.coverImage && (
                                            <span className={styles.fieldError}>⚠ Could not load image from this URL. Please check the link.</span>
                                        )}
                                        {coverValid === true && form.coverImage && (
                                            <div className={styles.coverPreview}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={form.coverImage} alt="Cover preview" className={styles.coverPreviewImg} />
                                                <span className={styles.fieldSuccess}>✓ Image loaded successfully</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="wikipediaUrl">
                                            Wikipedia URL
                                        </label>
                                        <input
                                            id="wikipediaUrl"
                                            name="wikipediaUrl"
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://en.wikipedia.org/wiki/..."
                                            value={form.wikipediaUrl}
                                            onChange={(e) => handleFieldChange("wikipediaUrl", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
