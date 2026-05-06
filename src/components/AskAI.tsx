"use client";

import { useState } from "react";
import styles from "./AskAI.module.css";

export default function AskAIButton({ bookId, bookTitle }: { bookId: number; bookTitle: string }) {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleAsk() {
        if (loading) return;
        setLoading(true);
        setError(null);

        let username: string | null = null;
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) username = JSON.parse(stored).username;
        } catch { /* ignore */ }

        try {
            const res = await fetch("/api/ai-recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `Is the book "${bookTitle}" right for me? Tell me who it's for, what mood it fits, and suggest 2 similar alternatives from your catalog.` }],
                    username,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            // Clean up bookcard tokens for display (just show bold titles)
            const cleaned = data.reply.replace(/\[\[bookcard:(\d+)\]\]/g, "").replace(/\[\[book:(\d+)\]\]/g, "");
            setResponse(cleaned);
        } catch {
            setError("Could not reach the AI service.");
        } finally {
            setLoading(false);
        }
    }

    if (response) {
        return (
            <div className={styles.responseCard}>
                <div className={styles.responseHeader}>
                    <span>🦉 Bookworm AI says:</span>
                    <button className={styles.dismissBtn} onClick={() => setResponse(null)}>✕</button>
                </div>
                <p className={styles.responseText}>{response}</p>
            </div>
        );
    }

    return (
        <button
            className={styles.askBtn}
            onClick={handleAsk}
            disabled={loading}
        >
            {loading ? (
                <>🦉 Thinking...</>
            ) : (
                <>🦉 Ask AI: Is this book right for me?</>
            )}
        </button>
    );
}
