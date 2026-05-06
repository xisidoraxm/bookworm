"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function Cart() {
    const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

    return (
        <div className={styles.cartPage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Shopping Cart</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            {totalItems > 0
                                ? `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
                                : "Review your selected books"}
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="row mt-4">
                        <div className="col-12 text-center">
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🛒</span>
                                <p>Your cart is empty. Start browsing and add some books!</p>
                                <Link href="/home" className={styles.browseBtn}>
                                    Browse Books
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`row mt-4 ${styles.cartLayout}`}>
                        <div className="col-lg-8">
                            <div className={styles.cartItems}>
                                <div className={styles.cartHeader}>
                                    <span>Product</span>
                                    <span>Quantity</span>
                                    <span>Total</span>
                                    <span></span>
                                </div>

                                {items.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemInfo}>
                                            <Link href={`/book/${item.id}`} className={styles.itemImageLink}>
                                                {item.coverImage ? (
                                                    <Image
                                                        src={item.coverImage}
                                                        alt={item.title}
                                                        width={70}
                                                        height={100}
                                                        className={styles.itemImage}
                                                    />
                                                ) : (
                                                    <div className={styles.itemImagePlaceholder}>📖</div>
                                                )}
                                            </Link>
                                            <div className={styles.itemDetails}>
                                                <Link href={`/book/${item.id}`} className={styles.itemTitle}>
                                                    {item.title}
                                                </Link>
                                                <p className={styles.itemAuthor}>by {item.author}</p>
                                                <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className={styles.quantityControl}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span className={styles.qtyValue}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className={styles.itemTotal}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>

                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id)}
                                            title="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.cartActions}>
                                <Link href="/home" className={styles.continueShopping}>
                                    ← Continue Shopping
                                </Link>
                                <button className={styles.clearCartBtn} onClick={clearCart}>
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className={styles.orderSummary}>
                                <h2 className={styles.summaryTitle}>Order Summary</h2>

                                <div className={styles.summaryRow}>
                                    <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span className={styles.freeShipping}>
                                        {totalPrice >= 35 ? "Free" : "$4.99"}
                                    </span>
                                </div>
                                {totalPrice < 35 && (
                                    <p className={styles.shippingNote}>
                                        Add ${(35 - totalPrice).toFixed(2)} more for free shipping!
                                    </p>
                                )}

                                <div className={styles.summaryDivider} />

                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span>Total</span>
                                    <span>${(totalPrice + (totalPrice >= 35 ? 0 : 4.99)).toFixed(2)}</span>
                                </div>

                                <button className={styles.checkoutBtn}>
                                    Proceed to Checkout
                                </button>

                                <div className={styles.paymentInfo}>
                                    <p>🔒 Secure checkout</p>
                                    <p>💳 We accept all major cards</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
