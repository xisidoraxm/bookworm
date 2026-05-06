"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./BookwormAI.module.css";

type Message = {
    role: "user" | "assistant";
    content: string;
};

type BookCardData = {
    id: number;
    title: string;
    author: string;
    rating: number;
    price: number;
    coverImage: string | null;
    inStock: boolean;
};

type BookMap = Record<number, BookCardData>;

const QUICK_CHIPS = [
    "✨ Surprise me",
    "🔥 Show trending books",
    "☕ I want something cozy",
    "⚡ Find me a fast read",
    "🌙 Something dark & twisty",
];

const MOODS = [
    { emoji: "☕", label: "Cozy" },
    { emoji: "🌑", label: "Dark" },
    { emoji: "🗺️", label: "Adventurous" },
    { emoji: "💔", label: "Emotional" },
    { emoji: "⚡", label: "Fast-paced" },
    { emoji: "🤔", label: "Thought-provoking" },
];

const STORAGE_KEY = "bookworm_ai_chat";
const BOOKS_STORAGE_KEY = "bookworm_ai_books";

function loadMessages(): Message[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function loadBookMap(): BookMap {
    if (typeof window === "undefined") return {};
    try {
        const raw = sessionStorage.getItem(BOOKS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function getUser(): { username: string; fullName: string } | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("loggedUser");
        if (!raw) return null;
        const user = JSON.parse(raw);
        return { username: user.username, fullName: user.fullName || user.username };
    } catch {
        return null;
    }
}

function BookCard({ book }: { book: BookCardData }) {
    return (
        <a href={`/book/${book.id}`} className={styles.bookCard}>
            <div className={styles.bookCardCover}>
                {book.coverImage ? (
                    <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={48}
                        height={68}
                        className={styles.bookCardImg}
                    />
                ) : (
                    <span className={styles.bookCardEmoji}>📖</span>
                )}
            </div>
            <div className={styles.bookCardInfo}>
                <span className={styles.bookCardTitle}>{book.title}</span>
                <span className={styles.bookCardAuthor}>{book.author}</span>
                <div className={styles.bookCardMeta}>
                    <span className={styles.bookCardRating}>★ {book.rating.toFixed(1)}</span>
                    <span className={styles.bookCardPrice}>${book.price.toFixed(2)}</span>
                </div>
            </div>
            <span className={styles.bookCardArrow}>→</span>
        </a>
    );
}

function parseMessageContent(content: string, bookMap: BookMap): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\[\[bookcard:(\d+)\]\]|\[\[book:(\d+)\]\]/g;
    let lastIndex = 0;
    let match;
    let counter = 0;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        if (match[1]) {
            parts.push(<strong key={`b-${counter}`}>{match[1]}</strong>);
        } else if (match[2]) {
            const bookId = parseInt(match[2], 10);
            const book = bookMap[bookId];
            if (book) {
                parts.push(<BookCard key={`card-${counter}`} book={book} />);
            } else {
                parts.push(
                    <a key={`l-${counter}`} href={`/book/${bookId}`}>
                        View Book →
                    </a>
                );
            }
        } else if (match[3]) {
            parts.push(
                <a key={`l-${counter}`} href={`/book/${match[3]}`}>
                    View Book →
                </a>
            );
        }
        lastIndex = match.index + match[0].length;
        counter++;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts;
}

export default function BookwormAI() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [bookMap, setBookMap] = useState<BookMap>({});
    const [loaded, setLoaded] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const user = getUser();

    // Load chat history from sessionStorage on mount
    useEffect(() => {
        setMessages(loadMessages());
        setBookMap(loadBookMap());
        setLoaded(true);
    }, []);

    // Persist messages to sessionStorage on change
    useEffect(() => {
        if (loaded) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, loaded]);

    useEffect(() => {
        if (loaded) {
            sessionStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(bookMap));
        }
    }, [bookMap, loaded]);

    // Show tooltip briefly on first visit
    useEffect(() => {
        const seen = sessionStorage.getItem("bookworm_ai_seen");
        if (!seen) {
            const timer = setTimeout(() => setShowTooltip(true), 2000);
            const hide = setTimeout(() => {
                setShowTooltip(false);
                sessionStorage.setItem("bookworm_ai_seen", "1");
            }, 7000);
            return () => { clearTimeout(timer); clearTimeout(hide); };
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    async function sendMessage(text: string) {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setError(null);
        const userMsg: Message = { role: "user", content: trimmed };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai-recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    username: user?.username || null,
                    mood: selectedMood,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            if (data.books) {
                setBookMap((prev) => ({ ...prev, ...data.books }));
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch {
            setError("Could not reach the AI service. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    function handleChipClick(chip: string) {
        const text = chip.replace(/^[^\w]*/, "").trim();
        sendMessage(text);
    }

    function handleMoodSelect(mood: string) {
        setSelectedMood((prev) => (prev === mood ? null : mood));
    }

    function handleOpen() {
        setOpen(true);
        setShowTooltip(false);
        sessionStorage.setItem("bookworm_ai_seen", "1");
    }

    const greeting = user
        ? `Hi ${user.fullName.split(" ")[0]}! 👋 What kind of story are you in the mood for tonight?`
        : "Hey there! 👋 I'm Bookworm AI — your personal book companion. What are you in the mood to read?";

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className={styles.overlay}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Chat panel */}
            {open && (
                <div className={styles.chatPanel}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <span className={styles.headerIcon}>🦉</span>
                            <div className={styles.headerText}>
                                <h3>Bookworm AI</h3>
                                <p>Your personal book companion</p>
                            </div>
                        </div>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {/* Cozy greeting */}
                        {messages.length === 0 && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                {greeting}
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`${styles.message} ${
                                    msg.role === "user"
                                        ? styles.user
                                        : styles.assistant
                                }`}
                            >
                                {msg.role === "assistant"
                                    ? parseMessageContent(msg.content, bookMap)
                                    : msg.content}
                            </div>
                        ))}

                        {loading && (
                            <div className={styles.typing}>
                                <span className={styles.typingLabel}>Bookworm is thinking</span>
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </div>
                        )}

                        {error && (
                            <div className={styles.error}>{error}</div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mood selector + Quick chips (shown when chat is empty) */}
                    {messages.length === 0 && !loading && (
                        <div className={styles.starterArea}>
                            {/* Mood selector */}
                            <div className={styles.moodSection}>
                                <span className={styles.moodLabel}>Pick a mood:</span>
                                <div className={styles.moodChips}>
                                    {MOODS.map((m) => (
                                        <button
                                            key={m.label}
                                            className={`${styles.moodChip} ${selectedMood === m.label ? styles.moodChipActive : ""}`}
                                            onClick={() => handleMoodSelect(m.label)}
                                        >
                                            {m.emoji} {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Quick prompt chips */}
                            <div className={styles.quickChips}>
                                {QUICK_CHIPS.map((c) => (
                                    <button
                                        key={c}
                                        className={styles.quickChip}
                                        onClick={() => handleChipClick(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Persistent quick chips (always visible, scrollable) */}
                    {messages.length > 0 && !loading && (
                        <div className={styles.persistentChips}>
                            {QUICK_CHIPS.map((c) => (
                                <button
                                    key={c}
                                    className={styles.persistentChip}
                                    onClick={() => handleChipClick(c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.inputArea}>
                        <textarea
                            ref={inputRef}
                            className={styles.inputField}
                            placeholder="Ask me for a book recommendation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                            aria-label="Send message"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {showTooltip && !open && (
                <div className={styles.tooltip}>
                    Need a book buddy? 📚
                </div>
            )}

            {/* Floating button */}
            <button
                className={`${styles.floatingBtn} ${
                    open ? styles.floatingBtnOpen : ""
                }`}
                onClick={() => (open ? setOpen(false) : handleOpen())}
                onMouseEnter={() => !open && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label={open ? "Close Bookworm AI" : "Open Bookworm AI"}
            >
                {open ? "✕" : "🦉"}
            </button>
        </>
    );
}
