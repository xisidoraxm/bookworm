"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./BookInteractions.module.css";

type Review = {
    id: number;
    rating: number;
    text: string | null;
    helpful: number;
    createdAt: string;
    user: { username: string; fullName: string };
};

type Props = {
    bookId: number;
};

type SortKey = "newest" | "highest" | "lowest";

export default function BookInteractions({ bookId }: Props) {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [readingStatus, setReadingStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>("newest");
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(3);

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

    // Fetch all data (only when logged in)
    const fetchData = useCallback(async () => {
        if (!username) return;

        const fetches: Promise<Response>[] = [
            fetch(`/api/reviews?bookId=${bookId}`),
        ];
        if (!isAdmin) {
            fetches.push(
                fetch(`/api/wishlist?username=${encodeURIComponent(username)}&bookId=${bookId}`),
                fetch(`/api/reading-status?username=${encodeURIComponent(username)}&bookId=${bookId}`),
            );
        }
        const responses = await Promise.all(fetches);
        const reviewsRes = responses[0];
        const wishlistRes = !isAdmin ? responses[1] : null;
        const statusRes = !isAdmin ? responses[2] : null;

        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);

        const userReview = reviewsData.find((r: Review) => r.user.username === username);
        if (userReview) {
            setUserRating(userReview.rating);
            setReviewText(userReview.text || "");
        }

        if (wishlistRes) {
            const w = await wishlistRes.json();
            setWishlisted(w.wishlisted);
        }

        if (statusRes) {
            const s = await statusRes.json();
            setReadingStatus(s.status);
            setProgress(s.progress);
        }
    }, [bookId, username, isAdmin]);

    useEffect(() => {
        if (!loading) fetchData();
    }, [loading, fetchData]);

    async function toggleWishlist() {
        if (!username) return;
        const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId }),
        });
        const data = await res.json();
        setWishlisted(data.wishlisted);
    }

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
    }

    async function submitReview() {
        if (!username || userRating === 0) return;
        await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bookId, rating: userRating, text: reviewText }),
        });
        setShowReviewForm(false);
        fetchData();
    }

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === "highest") return b.rating - a.rating;
        if (sortBy === "lowest") return a.rating - b.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const avgRating = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
    }));

    const statusLabels: Record<string, string> = {
        "want-to-read": "⭐ Want to Read",
        "currently-reading": "📖 Currently Reading",
        "finished": "✔ Finished",
    };

    if (loading || !username) return null;

    return (
        <div className={styles.interactions}>
            {/* Reviews section */}
            <div className={styles.reviewsSection}>
                <div className={styles.reviewsHeader}>
                    <div className={styles.reviewsHeaderLeft}>
                        <h2 className={styles.reviewsTitle}>Reviews</h2>
                        <span className={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                    </div>
                    {username && !showReviewForm && (
                        <button className={styles.writeReviewHeaderBtn} onClick={() => setShowReviewForm(true)}>
                            {userRating > 0 ? "Edit Review" : "Write a Review"}
                        </button>
                    )}
                </div>

                {/* Rating summary */}
                <div className={styles.ratingSummary}>
                    <div className={styles.ratingBig}>
                        <span className={styles.ratingBigNumber}>{avgRating.toFixed(1)}</span>
                        <span className={styles.ratingBigStars}>
                            {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                        </span>
                        <span className={styles.ratingBigCount}>{reviews.length} rating{reviews.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className={styles.ratingBars}>
                        {ratingDist.map((d) => (
                            <div key={d.star} className={styles.ratingBarRow}>
                                <span className={styles.ratingBarLabel}>{d.star}★</span>
                                <div className={styles.ratingBarBg}>
                                    <div className={styles.ratingBarFill} style={{ width: `${d.pct}%` }} />
                                </div>
                                <span className={styles.ratingBarCount}>{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Your rating */}
                {username && (
                    <div className={styles.yourRating}>
                        <span className={styles.yourRatingLabel}>Your rating:</span>
                        <div className={styles.starPicker}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`${styles.starBtn} ${star <= (hoverRating || userRating) ? styles.starFilled : ""}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => {
                                        setUserRating(star);
                                        setShowReviewForm(true);
                                    }}
                                >
                                    {star <= (hoverRating || userRating) ? "★" : "☆"}
                                </button>
                            ))}
                        </div>
                        {!showReviewForm && userRating > 0 && (
                            <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(true)}>
                                Edit review
                            </button>
                        )}
                        {!showReviewForm && userRating === 0 && (
                            <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(true)}>
                                Write a review
                            </button>
                        )}
                    </div>
                )}

                {/* Review form */}
                {showReviewForm && username && (
                    <div className={styles.reviewForm}>
                        <textarea
                            className={styles.reviewTextarea}
                            placeholder="Share your thoughts about this book..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                        />
                        <div className={styles.reviewFormActions}>
                            <button className={styles.reviewSubmitBtn} onClick={submitReview} disabled={userRating === 0}>
                                Submit Review
                            </button>
                            <button className={styles.reviewCancelBtn} onClick={() => setShowReviewForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Sort */}
                {reviews.length > 1 && (
                    <div className={styles.reviewSort}>
                        <select
                            className={styles.reviewSortSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortKey)}
                        >
                            <option value="newest">Newest</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                    </div>
                )}

                {/* Review list */}
                {sortedReviews.length > 0 ? (
                    <div className={styles.reviewList}>
                        {sortedReviews.slice(0, visibleCount).map((review) => (
                            <div key={review.id} className={`${styles.reviewCard} ${review.user.username === username ? styles.reviewOwn : ""}`}>
                                <div className={styles.reviewTop}>
                                    <div className={styles.reviewUser}>
                                        <span className={styles.reviewAvatar}>
                                            {review.user.fullName.charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <span className={styles.reviewName}>{review.user.fullName}</span>
                                            {review.user.username === username && (
                                                <span className={styles.reviewYou}>You</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.reviewMeta}>
                                        <span className={styles.reviewStars}>
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </span>
                                        <span className={styles.reviewDate}>
                                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                                {review.text && (
                                    <p className={styles.reviewText}>{review.text}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noReviews}>No reviews yet. Be the first to share your thoughts!</p>
                )}
                {sortedReviews.length > visibleCount && (
                    <button className={styles.showMoreBtn} onClick={() => setVisibleCount((c) => c + 5)}>
                        Show more reviews ({sortedReviews.length - visibleCount} remaining)
                    </button>
                )}
            </div>
        </div>
    );
}
