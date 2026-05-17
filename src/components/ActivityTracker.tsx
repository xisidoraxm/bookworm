"use client";

import { useTrackActivity } from "@/lib/useTrackActivity";

export function ActivityTracker({ children }: { children: React.ReactNode }) {
    useTrackActivity();
    return <>{children}</>;
}
