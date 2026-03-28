"use client";

import styles from "./page.module.css";

export default function Cart() {
    return (
        <div className={styles.cartPage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Shopping Cart</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Review your selected books
                        </p>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-12 text-center">
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🛒</span>
                            <p>Your cart is empty. Start browsing and add some books!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
