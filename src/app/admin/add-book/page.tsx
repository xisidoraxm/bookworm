"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import styles from "./page.module.css";

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

export default function AddBook() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [coverUrl, setCoverUrl] = useState("");
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
        } catch { /* ignore */ }
        router.push("/");
    }, [router]);

    function handleCoverUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value.trim();
        setCoverUrl(url);
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
        img.onload = () => { setCoverValid(true); setCoverChecking(false); };
        img.onerror = () => { setCoverValid(false); setCoverChecking(false); };
        img.src = url;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const title = formData.get("title")?.toString().trim() || "";
        const author = formData.get("author")?.toString().trim() || "";
        const description = formData.get("description")?.toString().trim() || "";
        const fullDescription = formData.get("fullDescription")?.toString().trim() || "";
        const wikipediaUrl = formData.get("wikipediaUrl")?.toString().trim() || "";
        const coverImage = formData.get("coverImage")?.toString().trim() || "";
        const genre = formData.get("genre")?.toString() || "";
        const format = formData.get("format")?.toString() || "PAPERBACK";
        const price = parseFloat(formData.get("price")?.toString() || "0");
        const quantity = parseInt(formData.get("quantity")?.toString() || "0", 10);

        if (!title || !author || !genre || !price) {
            toast.error("Please fill in all required fields");
            setLoading(false);
            return;
        }

        if (coverImage && coverValid === false) {
            toast.error("Cover image URL is not valid or the image could not be loaded. Please fix it or remove it.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/books", {
                method: "POST",
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
                toast.error(data.error || "Failed to add book");
                setLoading(false);
                return;
            }

            const book = await res.json();
            toast.success("Book added successfully!", { autoClose: 1200 });
            setTimeout(() => router.push(`/book/${book.id}`), 1300);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!authorized) return null;

    return (
        <div className={styles.addBookPage}>
            <ToastContainer />
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Add New Book</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Fill in the details below to add a new book to the store
                        </p>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
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
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="genre">
                                            Genre <span className={styles.required}>*</span>
                                        </label>
                                        <select id="genre" name="genre" className={styles.select} required>
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
                                        <select id="format" name="format" className={styles.select} required>
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
                                            defaultValue="0"
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
                                        value={coverUrl}
                                        onChange={handleCoverUrlChange}
                                    />
                                    {coverChecking && (
                                        <span className={styles.fieldHint}>Checking image...</span>
                                    )}
                                    {coverValid === false && !coverChecking && coverUrl && (
                                        <span className={styles.fieldError}>⚠ Could not load image from this URL. Please check the link.</span>
                                    )}
                                    {coverValid === true && (
                                        <div className={styles.coverPreview}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={coverUrl} alt="Cover preview" className={styles.coverPreviewImg} />
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
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? "Adding Book..." : "Add Book"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
