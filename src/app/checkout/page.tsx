"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import styles from "./page.module.css";

type FormData = {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    paymentMethod: string;
    saveAddress: boolean;
};

type FormErrors = {
    [key in keyof FormData]?: string;
};

type LoggedUser = {
    id?: number;
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart, totalItems } = useCart();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<LoggedUser | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        paymentMethod: "CREDIT_CARD",
        saveAddress: false,
    });

    // Load user data from localStorage
    useEffect(() => {
        const loggedUserRaw = localStorage.getItem("loggedUser");
        if (!loggedUserRaw) {
            router.push("/login");
            return;
        }
        let userData: LoggedUser;
        try {
            userData = JSON.parse(loggedUserRaw) as LoggedUser;
        } catch {
            localStorage.removeItem("loggedUser");
            router.push("/login");
            return;
        }
        setUser(userData);

        // Pre-fill form with user data if available
        setFormData((prev) => ({
            ...prev,
            fullName: userData.fullName || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            postalCode: userData.postalCode || "",
        }));
    }, [router]);

    // Redirect to cart if empty
    useEffect(() => {
        if (items.length === 0 && !orderPlaced) {
            router.push("/cart");
        }
    }, [items, orderPlaced, router]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!/^\d{3,}[-.\s]?\d{3,}[-.\s]?\d{3,}/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user?.id || typeof user.id !== "number") {
            toast.error("Your session is invalid. Please log in again.", {
                position: "top-right",
                autoClose: 4000,
            });
            localStorage.removeItem("loggedUser");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            // Prepare cart items in the format expected by the API
            const cartItems = items.map((item) => ({
                bookId: item.id,
                quantity: item.quantity,
                price: item.price,
            }));

            const shippingCost = totalPrice >= 35 ? 0 : 4.99;
            const finalTotal = totalPrice + shippingCost;

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    cartItems,
                    total: finalTotal,
                    shippingAddress: formData.address,
                    shippingCity: formData.city,
                    shippingPostalCode: formData.postalCode,
                    paymentMethod: formData.paymentMethod,
                }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to place order";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.error || errorMessage;
                } catch {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(errorMessage);
            }

            const order = await response.json();

            // Update user profile if they checked "save address"
            if (formData.saveAddress && user) {
                localStorage.setItem(
                    "loggedUser",
                    JSON.stringify({
                        ...user,
                        fullName: formData.fullName,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                    })
                );
            }

            // Clear cart and redirect to order confirmation
            clearCart();
            setOrderPlaced(true);
            router.push(`/order-confirmation/${order.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
            toast.error(message, {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    if (items.length === 0) {
        return (
            <div className={styles.checkoutPage}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <Link href="/cart" className={styles.backLink}>
                                ← Back to Cart
                            </Link>
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🛒</span>
                                <p>Your cart is empty. Please add items before checking out.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.checkoutPage}>
                <div className="container">
                <div className="row">
                    <div className="col-12">
                        <Link href="/cart" className={styles.backLink}>
                            ← Back to Cart
                        </Link>
                        <h1 className={styles.heading}>Checkout</h1>
                        <p className={styles.subtitle}>Complete your purchase in three simple steps</p>
                    </div>
                </div>

                <div className={styles.checkoutLayout}>
                    <div className={styles.checkoutMain}>
                        {/* Shipping Information Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🚚</span>
                                Shipping Address
                            </h2>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                    />
                                    {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+123 456 789"
                                    />
                                    {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                                </div>
                            </div>

                            <div className={styles.formRow + " " + styles.full}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="address">Street Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Main Street"
                                    />
                                    {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Belgrade"
                                    />
                                    {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="postalCode">Postal Code</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="11000"
                                    />
                                    {errors.postalCode && <span className={styles.errorMessage}>{errors.postalCode}</span>}
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    name="saveAddress"
                                    checked={formData.saveAddress}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="saveAddress">Save this address for future purchases</label>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>💳</span>
                                Payment Method
                            </h2>

                            <div className={styles.paymentOptions}>
                                <label
                                    className={`${styles.paymentOption} ${
                                        formData.paymentMethod === "CREDIT_CARD" ? styles.selected : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CREDIT_CARD"
                                        checked={formData.paymentMethod === "CREDIT_CARD"}
                                        onChange={handleInputChange}
                                    />
                                    <div className={styles.paymentLabel}>
                                        <span className={styles.paymentName}>💳 Credit/Debit Card</span>
                                        <span className={styles.paymentDescription}>Visa, Mastercard, American Express</span>
                                    </div>
                                </label>

                                <label
                                    className={`${styles.paymentOption} ${
                                        formData.paymentMethod === "CASH_ON_DELIVERY" ? styles.selected : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CASH_ON_DELIVERY"
                                        checked={formData.paymentMethod === "CASH_ON_DELIVERY"}
                                        onChange={handleInputChange}
                                    />
                                    <div className={styles.paymentLabel}>
                                        <span className={styles.paymentName}>💵 Cash on Delivery</span>
                                        <span className={styles.paymentDescription}>Pay when your order arrives</span>
                                    </div>
                                </label>

                                <label
                                    className={`${styles.paymentOption} ${
                                        formData.paymentMethod === "BANK_TRANSFER" ? styles.selected : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANK_TRANSFER"
                                        checked={formData.paymentMethod === "BANK_TRANSFER"}
                                        onChange={handleInputChange}
                                    />
                                    <div className={styles.paymentLabel}>
                                        <span className={styles.paymentName}>🏦 Bank Transfer</span>
                                        <span className={styles.paymentDescription}>Direct bank transfer (SEPA available)</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className={styles.checkoutSidebar}>
                        <div className={styles.orderSummary}>
                            <h2 className={styles.summaryTitle}>📋 Order Summary</h2>

                            <div className={styles.summaryItems}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.summaryItem}>
                                        <div className={styles.summaryItemDetails}>
                                            <div className={styles.summaryItemName}>{item.title}</div>
                                            <div className={styles.summaryItemQty}>Qty: {item.quantity}</div>
                                        </div>
                                        <div className={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

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

                            <button
                                className={styles.placeOrderBtn}
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className={styles.loadingSpinner} /> Placing Order...
                                    </>
                                ) : (
                                    "🎉 Place Order"
                                )}
                            </button>

                            <div className={styles.paymentInfo}>
                                <p>🔒 Secure checkout</p>
                                <p>💳 We accept all major payment methods</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <ToastContainer position="top-right" />
        </>
    );
}
