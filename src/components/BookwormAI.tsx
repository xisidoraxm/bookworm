"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./BookwormAI.module.css";

type Message = {
    role: "user" | "assistant";
    content: string;
};

const STARTERS = [
    "📚 What kind of book are you in the mood for?",
    "⚡ Do you prefer fast-paced or slow-burn stories?",
    "❤️ Name a book you loved — I'll find similar ones.",
];

function parseMessageContent(content: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\[\[book:(\d+)\]\]/g;
    let lastIndex = 0;
    let match;

    let processed = content;
    const bookLinks: { id: string; placeholder: string }[] = [];
    const boldTexts: { text: string; placeholder: string }[] = [];

    let counter = 0;

    // First pass: collect all matches
    while ((match = regex.exec(content)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        if (match[1]) {
            // Bold text: **text**
            parts.push(<strong key={`b-${counter}`}>{match[1]}</strong>);
        } else if (match[2]) {
            // Book link: [[book:ID]]
            parts.push(
                <a key={`l-${counter}`} href={`/book/${match[2]}`}>
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

const STORAGE_KEY = "bookworm_ai_chat";

function loadMessages(): Message[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export default function BookwormAI() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load chat history from sessionStorage on mount
    useEffect(() => {
        setMessages(loadMessages());
        setLoaded(true);
    }, []);

    // Persist messages to sessionStorage on change
    useEffect(() => {
        if (loaded) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, loaded]);

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
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
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

    function handleStarterClick(starter: string) {
        // Strip the emoji prefix for a cleaner user message
        const text = starter.replace(/^[^\w]*/, "").trim();
        sendMessage(text);
    }

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
                                <p>Your personal book advisor</p>
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
                        {/* Welcome message */}
                        {messages.length === 0 && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                Hey there! 👋 I&apos;m Bookworm AI — your personal book
                                advisor. Tell me what you&apos;re in the mood for, or pick
                                a prompt below to get started!
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
                                    ? parseMessageContent(msg.content)
                                    : msg.content}
                            </div>
                        ))}

                        {loading && (
                            <div className={styles.typing}>
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

                    {/* Starter prompts */}
                    {messages.length === 0 && !loading && (
                        <div className={styles.starters}>
                            {STARTERS.map((s) => (
                                <button
                                    key={s}
                                    className={styles.starterBtn}
                                    onClick={() => handleStarterClick(s)}
                                >
                                    {s}
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

            {/* Floating button */}
            <button
                className={`${styles.floatingBtn} ${
                    open ? styles.floatingBtnOpen : ""
                }`}
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close Bookworm AI" : "Open Bookworm AI"}
            >
                {open ? "✕" : "🦉"}
            </button>
        </>
    );
}
