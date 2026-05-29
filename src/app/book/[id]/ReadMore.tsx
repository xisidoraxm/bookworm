"use client";

import { useState } from "react";
import styles from "./page.module.css";

const LINE_LIMIT = 5;
const CHAR_ESTIMATE = 350;

export default function ReadMore({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    const needsTruncate = text.length > CHAR_ESTIMATE;

    return (
        <div>
            <p className={`${styles.description} ${!expanded && needsTruncate ? styles.descriptionClamped : ""}`}>
                {text}
            </p>
            {needsTruncate && (
                <button className={styles.readMoreBtn} onClick={() => setExpanded(!expanded)}>
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
}
