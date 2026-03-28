"use client";

import styles from "./page.module.css";

export default function Newsletter() {
    return (
        <div className={styles.newsletterPage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Newsletter</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Stay tuned for the latest book reviews and reading recommendations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
