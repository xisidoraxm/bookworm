"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

type OrderData = {
    id: number;
    userId: number;
    total: number;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    paymentMethod: string;
    createdAt: string;
    items: Array<{
        id: number;
        quantity: number;
        price: number;
        book: {
            id: number;
            title: string;
            author: string;
            coverImage: string | null;
        };
    }>;
};

export default function OrderConfirmationPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is logged in
        const loggedUser = localStorage.getItem("loggedUser");
        if (!loggedUser) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(loggedUser));

        // Fetch order details
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error("Order not found");
                }
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load order");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: { [key: string]: string } = {
            CREDIT_CARD: "Credit/Debit Card",
            CASH_ON_DELIVERY: "Cash on Delivery",
            BANK_TRANSFER: "Bank Transfer",
        };
        return methods[method] || method;
    };

    if (loading) {
        return (
            <div className={styles.confirmationPage}>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className={styles.confirmationPage}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className={styles.errorBox}>
                                <div className={styles.errorIcon}>❌</div>
                                <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
                                <p className={styles.errorMessage}>{error || "We couldn't find your order."}</p>
                                <Link href="/home" className={styles.primaryBtn}>
                                    Return to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = order.total - itemsSubtotal;

    return (
        <div className={styles.confirmationPage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className={styles.successBox}>
                            <div className={styles.successIcon}>✓</div>
                            <h1 className={styles.successTitle}>Order Confirmed!</h1>
                            <div className={styles.orderReference}>Order #{order.id} — Placed successfully</div>
                            <p className={styles.successMessage}>Thank you for your purchase. Your order has been successfully placed.</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        {/* Order Details */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>📦 Order Details</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsItemLabel}>Order Date</div>
                                    <div className={styles.detailsItemValue}>{formatDate(order.createdAt)}</div>
                                </div>
                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsItemLabel}>Payment Method</div>
                                    <div className={styles.detailsItemValue}>{getPaymentMethodLabel(order.paymentMethod || "CREDIT_CARD")}</div>
                                </div>
                                <div className={styles.detailsItem}>
                                    <div className={styles.detailsItemLabel}>Total Items</div>
                                    <div className={styles.detailsItemValue}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>🚚 Shipping Address</h2>
                            <p className={styles.sectionContent} style={{ whiteSpace: "pre-line" }}>
                                {order.shippingAddress}
                                <br />
                                {order.shippingCity}, {order.shippingPostalCode}
                            </p>
                        </div>

                        {/* Estimated Delivery */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>📅 Estimated Delivery</h2>
                            <div className={styles.detailsItem}>
                                <div className={styles.detailsItemLabel}>Expected Arrival</div>
                                <div className={styles.detailsItemValue}>3–5 business days</div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>📋 What's Next?</h2>
                            <div className={styles.stepsList}>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>1</div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepTitle}>Order Confirmation</div>
                                        <p className={styles.stepDescription}>You'll receive a confirmation email shortly.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>2</div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepTitle}>Processing</div>
                                        <p className={styles.stepDescription}>We'll process and prepare your books for shipment.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>3</div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepTitle}>Shipment</div>
                                        <p className={styles.stepDescription}>Tracking info will be sent to your email.</p>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>4</div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepTitle}>Delivery</div>
                                        <p className={styles.stepDescription}>Receive your books and start reading!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        {/* Order Summary */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>💰 Order Summary</h2>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryRowLabel}>Subtotal</span>
                                <span className={styles.summaryRowValue}>${itemsSubtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryRowLabel}>Shipping</span>
                                <span className={styles.summaryRowValue}>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <span className={styles.summaryRowLabel}>Total</span>
                                <span className={styles.summaryRowValue}>${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Your Books */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>📚 Your Books</h2>
                            <div className={styles.itemsList}>
                                {order.items.map((item) => (
                                    <div key={item.id} className={styles.orderItem}>
                                        {item.book.coverImage ? (
                                            <Image
                                                src={item.book.coverImage}
                                                alt={item.book.title}
                                                width={60}
                                                height={90}
                                                className={styles.itemImage}
                                            />
                                        ) : (
                                            <div className={styles.itemPlaceholder}>📖</div>
                                        )}
                                        <div className={styles.itemInfo}>
                                            <Link href={`/book/${item.book.id}`} className={styles.itemTitle}>
                                                {item.book.title}
                                            </Link>
                                            <p className={styles.itemAuthor}>by {item.book.author}</p>
                                            <p className={styles.itemQty}>Qty: {item.quantity}</p>
                                        </div>
                                        <div className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="row">
                    <div className="col-12">
                        <div className={styles.actions}>
                            <Link href="/browse" className={styles.primaryBtn}>
                                Continue Shopping
                            </Link>
                            <Link href="/purchases" className={styles.secondaryBtn}>
                                View All Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
