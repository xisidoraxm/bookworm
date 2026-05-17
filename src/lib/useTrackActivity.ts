"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to track user activity by updating lastActive timestamp
 * Call this in a client component that wraps your app (like layout or a wrapper)
 */
export function useTrackActivity() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const trackActivity = async () => {
            try {
                const stored = localStorage.getItem("loggedUser");
                if (stored) {
                    const user = JSON.parse(stored);
                    // Update user's lastActive every 5 minutes while they're active
                    await fetch("/api/user-activity", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id }),
                    });
                }
            } catch (error) {
                // Silently fail - activity tracking is not critical
                console.debug("Activity tracking failed:", error);
            }
        };

        // Track activity on mount
        trackActivity();

        // Set up periodic tracking every 5 minutes
        timeoutRef.current = setInterval(trackActivity, 5 * 60 * 1000);

        // Also track on user interactions (mouse move, key press)
        let activityTimeout: NodeJS.Timeout | null = null;

        const resetActivityTimer = () => {
            if (activityTimeout) clearTimeout(activityTimeout);
            // Update lastActive on user interaction, but throttle to every 5 minutes max
            activityTimeout = setTimeout(() => {
                trackActivity();
            }, 5 * 60 * 1000);
        };

        window.addEventListener("mousemove", resetActivityTimer);
        window.addEventListener("keypress", resetActivityTimer);
        window.addEventListener("click", resetActivityTimer);
        window.addEventListener("scroll", resetActivityTimer);
        window.addEventListener("touchstart", resetActivityTimer);

        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
            if (activityTimeout) clearTimeout(activityTimeout);
            window.removeEventListener("mousemove", resetActivityTimer);
            window.removeEventListener("keypress", resetActivityTimer);
            window.removeEventListener("click", resetActivityTimer);
            window.removeEventListener("scroll", resetActivityTimer);
            window.removeEventListener("touchstart", resetActivityTimer);
        };
    }, []);
}
