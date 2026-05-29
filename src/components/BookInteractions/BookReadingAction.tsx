"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./BookInteractions.module.css";

type Props = {
    bookId: number;
};

export default function BookReadingAction({ bookId }: Props) {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [readingStatus, setReadingStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                setUsername(user.username);
                setIsAdmin(user.role === "ADMIN");
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const fetchData = useCallback(async () => {
        if (!username || isAdmin) return;
        const res = await fetch(`/api/reading-status?username=${encodeURIComponent(username)}&bookId=${bookId}`);
        const s = await res.json();
        setReadingStatus(s.status);
        setProgress(s.progress);
    }, [bookId, username, isAdmin]);

    useEffect(() => {
        if (!loading) fetchData();
    }, [loading, fetchData]);

    async function updateReadingStatus(status: string) {
        if (!username) return;
        const res = await fetch("/api/reading-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId, status, progress: status === "finished" ? 100 : progress }),
        });
        const data = await res.json();
        setReadingStatus(data.status);
        setProgress(data.progress);
    }

    async function removeReadingStatus() {
        if (!username) return;
        await fetch("/api/reading-status", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId }),
        });
        setReadingStatus(null);
        setProgress(0);
    }

    async function updateProgress(newProgress: number) {
        if (!username) return;
        const p = Math.max(0, Math.min(100, newProgress));
        const res = await fetch("/api/reading-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId, status: p >= 100 ? "finished" : "currently-reading", progress: p }),
        });
        const data = await res.json();
        setReadingStatus(data.status);
        setProgress(data.progress);
        setToast(true);
        setTimeout(() => setToast(false), 2000);
    }

    const statusLabels: Record<string, string> = {
        "want-to-read": "⭐ Want to Read",
        "currently-reading": "📖 Currently Reading",
        "finished": "✔ Finished",
    };

    if (loading || !username || isAdmin || readingStatus === "finished") return null;

    return (
        <div className={styles.buyBoxActions}>
            <span className={styles.buyBoxActionsLabel}>Your Reading Activity</span>

            {/* Row 1: Status dropdown + Save */}
            <div className={styles.buyBoxActionsRow}>
                <select
                    className={styles.statusSelect}
                    value={readingStatus || ""}
                    onChange={(e) => {
                        if (e.target.value === "") {
                            removeReadingStatus();
                        } else {
                            updateReadingStatus(e.target.value);
                        }
                    }}
                >
                    <option value="">📖 Reading status...</option>
                    <option value="want-to-read">⭐ Want to Read</option>
                    <option value="currently-reading">📖 Currently Reading</option>
                    <option value="finished">✔ Finished</option>
                </select>
            </div>

            {/* Row 2: Progress bar (compact horizontal) */}
            {readingStatus === "currently-reading" && (
                <>
                    <div className={styles.progressRow}>
                        <span className={styles.progressPct}>{progress}%</span>
                        <div className={styles.progressBarBg}>
                            <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className={styles.progressSlider}
                        />
                        <button className={styles.progressSaveBtn} onClick={() => updateProgress(progress)}>
                            Save Progress
                        </button>
                    </div>
                    <div className={styles.progressMicrocopy}>
                        {progress >= 90
                            ? "Almost there — keep going!"
                            : progress > 0
                                ? `You've read ${progress}% of this book.`
                                : "Track your progress as you read."}
                    </div>
                    {toast && (
                        <div className={styles.toast}>✓ Progress saved!</div>
                    )}
                </>
            )}

            {/* Status badge for non-progress states */}
            {readingStatus && readingStatus !== "currently-reading" && (
                <div className={styles.statusBadge}>
                    {statusLabels[readingStatus]}
                </div>
            )}
        </div>
    );
}
