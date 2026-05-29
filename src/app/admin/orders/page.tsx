"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { printInvoice } from "./printInvoice";
import OrderDetailsModal from "./OrderDetailsModal";
import styles from "./page.module.css";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
type DeliveryMethod = "STANDARD" | "EXPRESS" | "PICKUP";

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    book: {
        id: number;
        title: string;
        author: string;
        quantity: number;
    };
};

type AdminOrder = {
    id: number;
    total: number;
    createdAt: string;
    updatedAt: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
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
    cancelReason: string | null;
    refundAmount: number | null;
    refundMethod: string | null;
    user: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
    };
    items: OrderItem[];
};

type OrdersResponse = {
    orders: AdminOrder[];
    summary: {
        totalOrdersToday: number;
        pendingOrders: number;
        processingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrRefunded: number;
    };
};

type OrderRow = AdminOrder;

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

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

function statusLabel(status: OrderStatus) {
    const map: Record<OrderStatus, string> = {
        PENDING: "Pending",
        PROCESSING: "Processing",
        SHIPPED: "Shipped",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
        REFUNDED: "Refunded",
    };
    return map[status];
}

function paymentLabel(status: PaymentStatus) {
    const map: Record<PaymentStatus, string> = {
        PAID: "Paid",
        PENDING: "Pending",
        FAILED: "Failed",
        REFUNDED: "Refunded",
    };
    return map[status];
}

function deliveryLabel(method: DeliveryMethod) {
    const map: Record<DeliveryMethod, string> = {
        STANDARD: "Standard",
        EXPRESS: "Express",
        PICKUP: "Pickup",
    };
    return map[method];
}

export default function AdminOrdersPage() {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [summary, setSummary] = useState<OrdersResponse["summary"]>({
        totalOrdersToday: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrRefunded: 0,
    });

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [cardFilter, setCardFilter] = useState("");

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [statusModalOrder, setStatusModalOrder] = useState<OrderRow | null>(null);
    const [newStatus, setNewStatus] = useState<OrderStatus>("PROCESSING");
    const [statusNote, setStatusNote] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
    const [cancelReasonForStatus, setCancelReasonForStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [cancelModalOrder, setCancelModalOrder] = useState<OrderRow | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundMethod, setRefundMethod] = useState("ORIGINAL_PAYMENT");
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) {
                const user = JSON.parse(stored);
                if (user.role === "ADMIN") {
                    setAuthorized(true);
                    return;
                }
            }
        } catch {
            // ignore
        }
        window.location.href = "/";
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (status) params.set("status", status);
        if (paymentStatus) params.set("paymentStatus", paymentStatus);
        if (deliveryMethod) params.set("deliveryMethod", deliveryMethod);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (cardFilter) params.set("card", cardFilter);

        try {
            const res = await fetch(`/api/admin/orders?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load orders");
            const json: OrdersResponse = await res.json();
            setOrders(json.orders);
            setSummary(json.summary);
        } catch {
            setError("Could not load orders. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    }, [q, status, paymentStatus, deliveryMethod, dateFrom, dateTo, cardFilter]);

    useEffect(() => {
        if (!authorized) return;
        const timer = setTimeout(() => {
            fetchOrders();
        }, 250);
        return () => clearTimeout(timer);
    }, [authorized, fetchOrders]);

    async function openDetails(orderId: number) {
        setSelectedOrderId(orderId);
        setSelectedOrder(null);
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`);
            if (!res.ok) throw new Error("Failed to load order details");
            const json: OrderRow = await res.json();
            setSelectedOrder(json);
        } catch {
            setError("Could not load order details.");
        } finally {
            setDetailsLoading(false);
        }
    }

    function closeDetails() {
        setSelectedOrderId(null);
        setSelectedOrder(null);
    }

    function openStatusModal(order: OrderRow) {
        setStatusModalOrder(order);
        setNewStatus(order.status === "PENDING" ? "PROCESSING" : order.status);
        setStatusNote(order.statusNote || "");
        setTrackingNumber(order.trackingNumber || "");
        setEstimatedDeliveryDate(order.estimatedDeliveryDate ? order.estimatedDeliveryDate.slice(0, 10) : "");
        setCancelReasonForStatus(order.cancelReason || "");
    }

    function closeStatusModal() {
        setStatusModalOrder(null);
        setStatusNote("");
        setTrackingNumber("");
        setEstimatedDeliveryDate("");
        setCancelReasonForStatus("");
    }

    async function submitStatusUpdate() {
        if (!statusModalOrder) return;
        if (statusModalOrder.status === "DELIVERED") return;

        if (newStatus === "SHIPPED" && !trackingNumber.trim()) {
            setError("Tracking number is required when marking as shipped.");
            return;
        }

        if (newStatus === "CANCELLED" && !cancelReasonForStatus.trim()) {
            setError("Cancellation reason is required when marking as cancelled.");
            return;
        }

        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/admin/orders/${statusModalOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateStatus",
                    newStatus,
                    note: statusNote,
                    trackingNumber,
                    estimatedDeliveryDate: estimatedDeliveryDate || undefined,
                    cancelReason: cancelReasonForStatus || undefined,
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update order status");
            }

            closeStatusModal();
            fetchOrders();
            if (selectedOrderId === statusModalOrder.id) {
                openDetails(statusModalOrder.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Status update failed");
        } finally {
            setUpdatingStatus(false);
        }
    }

    function openCancelModal(order: OrderRow) {
        setCancelModalOrder(order);
        setCancelReason("");
        setRefundAmount(order.total);
        setRefundMethod("ORIGINAL_PAYMENT");
        setConfirmCancel(false);
    }

    function closeCancelModal() {
        setCancelModalOrder(null);
        setCancelReason("");
        setRefundAmount(0);
        setRefundMethod("ORIGINAL_PAYMENT");
        setConfirmCancel(false);
    }

    async function submitCancelRefund() {
        if (!cancelModalOrder) return;
        if (!cancelReason.trim()) {
            setError("Cancellation reason is required.");
            return;
        }
        if (!confirmCancel) {
            setError("Please confirm cancellation and refund.");
            return;
        }

        setCancelling(true);
        try {
            const res = await fetch(`/api/admin/orders/${cancelModalOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "cancelRefund",
                    cancelReason,
                    refundAmount,
                    refundMethod,
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to cancel order");
            }

            closeCancelModal();
            fetchOrders();
            if (selectedOrderId === cancelModalOrder.id) {
                openDetails(cancelModalOrder.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cancellation failed");
        } finally {
            setCancelling(false);
        }
    }

    if (!authorized) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.heading}>Orders Command Center</h1>
                    <p className={styles.subheading}>Control every stage of your bookstore order lifecycle.</p>
                </div>

                <div className={styles.cards}>
                    <button className={styles.card} onClick={() => setCardFilter("today")}>
                        <span className={styles.cardLabel}>Total Orders Today</span>
                        <span className={styles.cardValue}>{summary.totalOrdersToday}</span>
                    </button>
                    <button className={styles.card} onClick={() => setCardFilter("pending")}>
                        <span className={styles.cardLabel}>Pending Orders</span>
                        <span className={styles.cardValue}>{summary.pendingOrders}</span>
                    </button>
                    <button className={styles.card} onClick={() => setCardFilter("processing")}>
                        <span className={styles.cardLabel}>Orders Being Prepared</span>
                        <span className={styles.cardValue}>{summary.processingOrders}</span>
                    </button>
                    <button className={styles.card} onClick={() => setCardFilter("shipped")}>
                        <span className={styles.cardLabel}>Shipped Orders</span>
                        <span className={styles.cardValue}>{summary.shippedOrders}</span>
                    </button>
                    <button className={styles.card} onClick={() => setCardFilter("delivered")}>
                        <span className={styles.cardLabel}>Delivered Orders</span>
                        <span className={styles.cardValue}>{summary.deliveredOrders}</span>
                    </button>
                    <button className={styles.card} onClick={() => setCardFilter("cancelled_refunded")}>
                        <span className={styles.cardLabel}>Cancelled / Refunded</span>
                        <span className={styles.cardValue}>{summary.cancelledOrRefunded}</span>
                    </button>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.toolbarRow}>
                        <span className={styles.toolbarLabel}>Search</span>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}>#</span>
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Order ID, customer, or book title"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                    </div>

                    <hr className={styles.toolbarDivider} />

                    <div className={styles.toolbarRow}>
                        <span className={styles.toolbarLabel}>Filters</span>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}>⟳</span>
                            <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">Order Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}>$</span>
                            <select className={styles.select} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                                <option value="">Payment</option>
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}>⇄</span>
                            <select className={styles.select} value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                                <option value="">Delivery</option>
                                <option value="STANDARD">Standard</option>
                                <option value="EXPRESS">Express</option>
                                <option value="PICKUP">Pickup</option>
                            </select>
                        </div>
                        <div className={styles.dateGroup}>
                            <input className={styles.dateInput} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            <span className={styles.dateSeparator}>—</span>
                            <input className={styles.dateInput} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                        <div className={styles.toolbarActions}>
                            <button className={styles.searchBtn} onClick={fetchOrders}>Search</button>
                            <button className={styles.clearBtn} onClick={() => {
                                setCardFilter("");
                                setQ("");
                                setStatus("");
                                setPaymentStatus("");
                                setDeliveryMethod("");
                                setDateFrom("");
                                setDateTo("");
                            }}>
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.tableWrap}>
                    {loading ? (
                        <p className={styles.loading}>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.loading}>No orders match current filters.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total Price</th>
                                    <th>Payment Status</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                                    return (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>
                                                <div className={styles.customerCell}>
                                                    <span className={styles.customerName}>{order.user.fullName}</span>
                                                    <span className={styles.customerEmail}>{order.user.email}</span>
                                                </div>
                                            </td>
                                            <td>{itemsCount} books</td>
                                            <td>${order.total.toFixed(2)}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[`payment${order.paymentStatus}`]}`}>
                                                    {paymentLabel(order.paymentStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[`status${order.status}`]}`}>
                                                    {statusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td>{fmtDateTime(order.createdAt)}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.actionBtn} onClick={() => openDetails(order.id)}>View Details</button>
                                                    {order.status !== "DELIVERED" && (
                                                        <button className={styles.actionBtn} onClick={() => openStatusModal(order)}>Update Status</button>
                                                    )}
                                                    <button className={styles.actionDanger} onClick={() => openCancelModal(order)}>Cancel Order</button>
                                                    <button className={styles.actionBtn} onClick={() => printInvoice(order)}>Print Invoice</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedOrderId !== null && (
                <OrderDetailsModal
                    order={selectedOrder}
                    loading={detailsLoading}
                    onClose={closeDetails}
                />
            )}

            {statusModalOrder && (
                <div className={styles.modalBackdrop} onClick={closeStatusModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Update Order Status</h3>
                        <p className={styles.modalMeta}>Order #{statusModalOrder.id}</p>

                        <label className={styles.modalLabel}>Current status</label>
                        <input className={`${styles.modalInput} ${styles.readOnlyInput}`} value={statusLabel(statusModalOrder.status)} readOnly disabled />

                        <label className={styles.modalLabel}>New status</label>
                        <select
                            className={styles.modalInput}
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            disabled={statusModalOrder.status === "DELIVERED"}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>{statusLabel(option)}</option>
                            ))}
                        </select>

                        {newStatus === "SHIPPED" && (
                            <>
                                <label className={styles.modalLabel}>Tracking number</label>
                                <input
                                    className={styles.modalInput}
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Required for shipped orders"
                                />
                                <label className={styles.modalLabel}>Estimated delivery date</label>
                                <input
                                    className={styles.modalInput}
                                    type="date"
                                    value={estimatedDeliveryDate}
                                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                />
                            </>
                        )}

                        {newStatus === "CANCELLED" && (
                            <>
                                <label className={styles.modalLabel}>Cancellation reason</label>
                                <textarea
                                    className={styles.modalTextarea}
                                    value={cancelReasonForStatus}
                                    onChange={(e) => setCancelReasonForStatus(e.target.value)}
                                    rows={3}
                                    placeholder="Required for cancelled orders"
                                />
                            </>
                        )}

                        <label className={styles.modalLabel}>Optional note</label>
                        <textarea
                            className={styles.modalTextarea}
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            rows={3}
                            placeholder="Shipped via DHL, delayed due to weather, etc."
                        />

                        <div className={styles.modalActions}>
                            <button className={styles.secondaryBtn} onClick={closeStatusModal}>Cancel</button>
                            <button
                                className={styles.primaryBtn}
                                onClick={submitStatusUpdate}
                                disabled={updatingStatus || statusModalOrder.status === "DELIVERED"}
                            >
                                {updatingStatus ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cancelModalOrder && (
                <div className={styles.modalBackdrop} onClick={closeCancelModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Cancel Order / Refund</h3>
                        <p className={styles.modalMeta}>Order #{cancelModalOrder.id}</p>

                        <label className={styles.modalLabel}>Reason for cancellation</label>
                        <textarea
                            className={styles.modalTextarea}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            placeholder="Out of stock, customer request, payment issue, etc."
                        />

                        <label className={styles.modalLabel}>Refund amount</label>
                        <input
                            className={styles.modalInput}
                            type="number"
                            min="0"
                            max={cancelModalOrder.total}
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(Math.max(0, Number(e.target.value) || 0))}
                        />

                        <label className={styles.modalLabel}>Refund method</label>
                        <select className={styles.modalInput} value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
                            <option value="ORIGINAL_PAYMENT">Original Payment Method</option>
                            <option value="STORE_CREDIT">Store Credit</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>

                        <label className={styles.confirmRow}>
                            <input type="checkbox" checked={confirmCancel} onChange={(e) => setConfirmCancel(e.target.checked)} />
                            I confirm this cancellation and refund operation.
                        </label>

                        <div className={styles.modalActions}>
                            <button className={styles.secondaryBtn} onClick={closeCancelModal}>Back</button>
                            <button className={styles.dangerBtn} onClick={submitCancelRefund} disabled={cancelling}>
                                {cancelling ? "Processing..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
