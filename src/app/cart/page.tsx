"use client";

import styles from "./page.module.css";

export default function Cart() {
    return (
        <div className={styles.cartPage}>
            <h1>Shopping Cart</h1>
            <p>Your cart is empty.</p>
        </div>
    );
}
