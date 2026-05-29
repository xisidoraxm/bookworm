import { useMemo } from "react";
import styles from "./page.module.css";

type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
type DeliveryMethod = "STANDARD" | "EXPRESS" | "PICKUP";

type OrderDetail = {
    id: number;
    total: number;
    createdAt: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    deliveryMethod: DeliveryMethod;
    trackingNumber: string | null;
    estimatedDeliveryDate: string | null;
    transactionId: string | null;
    statusNote: string | null;
    shippingAddress: string | null;
    shippingCity: string | null;
    shippingPostalCode: string | null;
    paymentConfirmedAt: string | null;
    processingAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    refundedAt: string | null;
    user: {
        fullName: string;
        email: string;
        phone: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
    };
    items: {
        id: number;
        quantity: number;
        price: number;
        book: { id: number; title: string; author: string; quantity: number };
    }[];
};

type Props = {
    order: OrderDetail | null;
    loading: boolean;
    onClose: () => void;
};

function fmtDateTime(iso: string | null) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function paymentLabel(status: PaymentStatus) {
    const map: Record<PaymentStatus, string> = { PAID: "Paid", PENDING: "Pending", FAILED: "Failed", REFUNDED: "Refunded" };
    return map[status];
}

function deliveryLabel(method: DeliveryMethod) {
    const map: Record<DeliveryMethod, string> = { STANDARD: "Standard", EXPRESS: "Express", PICKUP: "Pickup" };
    return map[method];
}

export default function OrderDetailsModal({ order, loading, onClose }: Props) {
    const stockImpactUnits = useMemo(() => {
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [order]);

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
                {loading || !order ? (
                    <p className={styles.loading}>Loading order details...</p>
                ) : (
                    <>
                        <div className={styles.detailHeader}>
                            <h3 className={styles.modalTitle}>Order #{order.id}</h3>
                            <p className={styles.modalMeta}>{fmtDateTime(order.createdAt)}</p>
                        </div>

                        <div className={styles.detailTopGrid}>
                            <div className={styles.detailColumn}>
                                <section className={styles.detailCard}>
                                    <h4 className={styles.sectionTitle}>Customer Info</h4>
                                    <div className={styles.detailLines}>
                                        <p><span>Name:</span> {order.user.fullName}</p>
                                        <p><span>Email:</span> {order.user.email}</p>
                                        <p><span>Phone:</span> {order.user.phone || "-"}</p>
                                        <p>
                                            <span>Address:</span> {order.user.address || "-"}
                                            {order.user.city ? `, ${order.user.city}` : ""}
                                            {order.user.postalCode ? ` ${order.user.postalCode}` : ""}
                                        </p>
                                    </div>
                                </section>

                                <section className={styles.detailCard}>
                                    <h4 className={styles.sectionTitle}>Delivery Info</h4>
                                    <div className={styles.detailLines}>
                                        <p><span>Method:</span> {deliveryLabel(order.deliveryMethod)}</p>
                                        <p><span>Tracking:</span> {order.trackingNumber || "-"}</p>
                                        <p><span>Estimated:</span> {fmtDateTime(order.estimatedDeliveryDate)}</p>
                                        {order.shippingAddress && (
                                            <p>
                                                <span>Ship to:</span> {order.shippingAddress}
                                                {order.shippingCity ? `, ${order.shippingCity}` : ""}
                                                {order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ""}
                                            </p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className={styles.detailColumn}>
                                <section className={styles.detailCard}>
                                    <h4 className={styles.sectionTitle}>Payment Info</h4>
                                    <div className={styles.detailLines}>
                                        <p><span>Method:</span> {order.paymentMethod}</p>
                                        <p><span>Status:</span> {paymentLabel(order.paymentStatus)}</p>
                                        <p><span>Transaction ID:</span> {order.transactionId || "-"}</p>
                                    </div>
                                </section>

                                <section className={styles.detailCard}>
                                    <h4 className={styles.sectionTitle}>Order Timeline</h4>
                                    <div className={styles.timelineWrap}>
                                        <div className={styles.timelineRail} />
                                        <ul className={styles.timeline}>
                                            {[
                                                { label: "Order placed", time: order.createdAt },
                                                { label: "Payment confirmed", time: order.paymentConfirmedAt },
                                                { label: "Processing started", time: order.processingAt },
                                                { label: "Shipped", time: order.shippedAt },
                                                { label: "Delivered", time: order.deliveredAt },
                                            ].map((step) => {
                                                const active = !!step.time;
                                                return (
                                                    <li key={step.label}>
                                                        <span className={active ? styles.timelineDot : styles.timelineDotInactive} />
                                                        <div>
                                                            <span className={active ? styles.timelineLabel : styles.timelineLabelInactive}>{step.label}</span>
                                                            <span className={styles.timelineTime}>{active ? fmtDateTime(step.time) : "—"}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <hr className={styles.sectionDivider} />

                        <div className={styles.itemsSection}>
                            <h4 className={styles.sectionTitle}>Order Items</h4>
                            <table className={styles.innerTable}>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.book.title}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.price.toFixed(2)}</td>
                                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.totalBox}>
                            <span className={styles.totalBoxLabel}>Order Total</span>
                            <span className={styles.totalBoxValue}>${order.total.toFixed(2)}</span>
                        </div>

                        {(order.cancelledAt || order.refundedAt || order.statusNote) && (
                            <div className={styles.noteRow}>
                                <span className={styles.noteLabel}>Stock Impact</span>
                                <span className={styles.noteText}>If cancelled/refunded: +{stockImpactUnits} units back to inventory</span>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
