"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

/* ─── Types ─── */
type UserRow = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: "USER" | "ADMIN";
    status: "ACTIVE" | "SUSPENDED";
    lastActive: string;
    createdAt: string;
    booksOwned: number;
    currentReads: number;
    totalSpent: number;
    orderCount: number;
    _count: { orders: number; reviews: number; wishlist: number; readingStatus: number };
};

type UserDetail = UserRow & {
    updatedAt: string;
    purchases: {
        id: number;
        total: number;
        createdAt: string;
        items: { quantity: number; price: number; book: { id: number; title: string; author: string; coverImage: string | null } }[];
    }[];
};

type PageData = {
    users: UserRow[];
    total: number;
    page: number;
    totalPages: number;
};

/* ─── Helpers ─── */
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return fmtDate(iso);
}

function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Main Component ─── */
export default function ManageUsers() {
    const [data, setData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    // Drawer state
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [detail, setDetail] = useState<UserDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");
    const [editStatus, setEditStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [saving, setSaving] = useState(false);

    // Confirm modal
    const [confirmAction, setConfirmAction] = useState<"delete" | "suspend" | null>(null);

    // Fetch users list
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        if (registrationDate) params.set("registrationDate", registrationDate);
        if (activityLevel) params.set("activityLevel", activityLevel);
        params.set("sort", sort);
        params.set("page", String(page));

        const res = await fetch(`/api/admin/users?${params}`);
        const json = await res.json();
        setData(json);
        setLoading(false);
    }, [search, statusFilter, registrationDate, activityLevel, sort, page]);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    // Fetch user detail
    async function openDetail(userId: number) {
        setSelectedUserId(userId);
        setDetailLoading(true);
        setDetail(null);
        const res = await fetch(`/api/admin/users/${userId}`);
        const json = await res.json();
        setDetail(json);
        setEditRole(json.role);
        setEditStatus(json.status);
        setEditName(json.fullName);
        setEditEmail(json.email);
        setEditPhone(json.phone);
        setDetailLoading(false);
    }

    function closeDrawer() {
        setSelectedUserId(null);
        setDetail(null);
    }

    async function handleSave() {
        if (!detail) return;
        setSaving(true);
        await fetch(`/api/admin/users/${detail.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: editRole,
                status: editStatus,
                fullName: editName,
                email: editEmail,
                phone: editPhone,
            }),
        });
        setSaving(false);
        // Refresh detail and list
        openDetail(detail.id);
        fetchUsers();
    }

    async function handleSuspendToggle() {
        if (!detail) return;
        const newStatus = detail.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        await fetch(`/api/admin/users/${detail.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        setConfirmAction(null);
        openDetail(detail.id);
        fetchUsers();
    }

    async function handleDelete() {
        if (!detail) return;
        await fetch(`/api/admin/users/${detail.id}`, { method: "DELETE" });
        setConfirmAction(null);
        closeDrawer();
        fetchUsers();
    }

    // Filter out admin users
    const filteredUsers = data?.users.filter((u) => u.role !== "ADMIN") ?? [];

    // Stats from current data
    const totalUsers = filteredUsers.length;
    const suspendedCount = filteredUsers.filter((u) => u.status === "SUSPENDED").length ?? 0;
    const activeCount = filteredUsers.filter((u) => u.status === "ACTIVE").length ?? 0;

    const sortLabels: Record<string, string> = {
        newest: "↓ Newest",
        oldest: "↑ Oldest",
        name: "A→Z Name",
        lastActive: "↓ Last Active",
    };
    const sortKeys = Object.keys(sortLabels);

    function cycleSort() {
        const idx = sortKeys.indexOf(sort);
        setSort(sortKeys[(idx + 1) % sortKeys.length]);
    }

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.heading}>
                            Manage Users
                        </h1>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>👥</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{totalUsers}</span>
                            <span className={styles.statLabel}>Total Users</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}>✅</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{activeCount}</span>
                            <span className={styles.statLabel}>Active</span>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statIcon}></span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{suspendedCount}</span>
                            <span className={styles.statLabel}>Suspended</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    <select
                        className={styles.filterSelect}
                        value={registrationDate}
                        onChange={(e) => { setRegistrationDate(e.target.value); setPage(1); }}
                    >
                        <option value="">All Registration Dates</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="1year">Last Year</option>
                    </select>
                    <select
                        className={styles.filterSelect}
                        value={activityLevel}
                        onChange={(e) => { setActivityLevel(e.target.value); setPage(1); }}
                    >
                        <option value="">All Activity Levels</option>
                        <option value="very-active">Very Active (7 days)</option>
                        <option value="active">Active (30 days)</option>
                        <option value="inactive">Inactive (30-90 days)</option>
                        <option value="dormant">Dormant (90+ days)</option>
                    </select>
                    <button className={styles.sortBtn} onClick={cycleSort}>
                        {sortLabels[sort]}
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className={styles.emptyState}>
                        <p className={styles.loadingText}>Loading users...</p>
                    </div>
                ) : !data || filteredUsers.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>👥</span>
                        <p>No users found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                        <th>Books Owned</th>
                                        <th>Current Reads</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} onClick={() => openDetail(user.id)}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}>{initials(user.fullName)}</div>
                                                    <div className={styles.userInfo}>
                                                        <span className={styles.userName}>{user.fullName}</span>
                                                        <span className={styles.userEmail}>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${user.status === "ACTIVE" ? styles.badgeActive : styles.badgeSuspended}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className={styles.dimText}>{fmtDate(user.createdAt)}</td>
                                            <td>{user.booksOwned}</td>
                                            <td>{user.currentReads}</td>
                                            <td className={styles.dimText}>{timeAgo(user.lastActive)}</td>
                                            <td>
                                                <div className={styles.actionBtns} onClick={(e) => e.stopPropagation()}>
                                                    <button className={styles.actionBtn} onClick={() => openDetail(user.id)}>View</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    ← Prev
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {data.page} of {data.totalPages}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    disabled={page >= data.totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ─── Detail Drawer ─── */}
            {selectedUserId !== null && (
                <>
                    <div className={styles.drawerOverlay} onClick={closeDrawer} />
                    <div className={styles.drawer}>
                        {detailLoading || !detail ? (
                            <div style={{ padding: "3rem", textAlign: "center" }}>
                                <p className={styles.loadingText}>Loading user details...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className={styles.drawerHeader}>
                                    <div className={styles.drawerProfile}>
                                        <div className={styles.drawerAvatar}>{initials(detail.fullName)}</div>
                                        <div>
                                            <h2 className={styles.drawerName}>{detail.fullName}</h2>
                                            <span className={styles.drawerUsername}>@{detail.username}</span>
                                        </div>
                                    </div>
                                    <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
                                </div>

                                <div className={styles.drawerBody}>
                                    {/* Profile Info */}
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.drawerSectionTitle}>Profile</h3>
                                        <div className={styles.detailGrid}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Email</span>
                                                <span className={styles.detailValue}>{detail.email}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Phone</span>
                                                <span className={styles.detailValue}>{detail.phone}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Registered</span>
                                                <span className={styles.detailValue}>{fmtDate(detail.createdAt)}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Last Active</span>
                                                <span className={styles.detailValue}>{timeAgo(detail.lastActive)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Summary */}
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.drawerSectionTitle}>Activity</h3>
                                        <div className={styles.activityGrid}>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>{detail._count.orders}</span>
                                                <span className={styles.activityLabel}>Purchases</span>
                                            </div>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>{detail.booksOwned}</span>
                                                <span className={styles.activityLabel}>Books Owned</span>
                                            </div>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>${detail.totalSpent.toFixed(2)}</span>
                                                <span className={styles.activityLabel}>Total Spent</span>
                                            </div>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>{detail.currentReads}</span>
                                                <span className={styles.activityLabel}>Reading Now</span>
                                            </div>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>{detail._count.wishlist}</span>
                                                <span className={styles.activityLabel}>Wishlist</span>
                                            </div>
                                            <div className={styles.activityStat}>
                                                <span className={styles.activityValue}>{detail._count.reviews}</span>
                                                <span className={styles.activityLabel}>Reviews</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit Role & Status */}
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.drawerSectionTitle}>Edit User</h3>
                                        <div className={styles.editRow}>
                                            <span className={styles.editLabel}>Name</span>
                                            <input
                                                className={styles.editInput}
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.editRow}>
                                            <span className={styles.editLabel}>Email</span>
                                            <input
                                                className={styles.editInput}
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.editRow}>
                                            <span className={styles.editLabel}>Phone</span>
                                            <input
                                                className={styles.editInput}
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.editRow}>
                                            <span className={styles.editLabel}>Role</span>
                                            <select
                                                className={styles.editSelect}
                                                value={editRole}
                                                onChange={(e) => setEditRole(e.target.value as "USER" | "ADMIN")}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                        <div className={styles.editRow}>
                                            <span className={styles.editLabel}>Status</span>
                                            <select
                                                className={styles.editSelect}
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "SUSPENDED")}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="SUSPENDED">Suspended</option>
                                            </select>
                                        </div>
                                        <div style={{ marginTop: "0.75rem" }}>
                                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Purchase History — hidden for admin accounts */}
                                    {detail.role !== "ADMIN" && (
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.drawerSectionTitle}>Purchase History</h3>
                                        {detail.purchases.length === 0 ? (
                                            <p className={styles.dimText}>No purchases yet.</p>
                                        ) : (
                                            <div className={styles.purchaseList}>
                                                {detail.purchases.map((p) => (
                                                    <div key={p.id} className={styles.purchaseItem}>
                                                        <span className={styles.purchaseBooks}>
                                                            {p.items.map((i) => i.book.title).join(", ")}
                                                        </span>
                                                        <span className={styles.purchaseDate}>{fmtDate(p.createdAt)}</span>
                                                        <span className={styles.purchaseTotal}>${p.total.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    )}

                                    {/* Danger Zone — hidden for admin accounts */}
                                    {detail.role !== "ADMIN" && (
                                    <div className={`${styles.drawerSection} ${styles.dangerZone}`}>
                                        <h3 className={styles.drawerSectionTitle}>⚠️ Danger Zone</h3>
                                        <div className={styles.dangerActions}>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => setConfirmAction("suspend")}
                                            >
                                                {detail.status === "ACTIVE" ? "🚫 Suspend Account" : "✅ Reactivate Account"}
                                            </button>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => setConfirmAction("delete")}
                                            >
                                                🗑️ Delete Account
                                            </button>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ─── Confirmation Modal ─── */}
            {confirmAction && detail && (
                <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {confirmAction === "delete"
                                ? "Delete User Account"
                                : detail.status === "ACTIVE"
                                    ? "Suspend User Account"
                                    : "Reactivate User Account"}
                        </h3>
                        <p className={styles.modalText}>
                            {confirmAction === "delete"
                                ? `Are you sure you want to permanently delete ${detail.fullName}'s account? This will remove all their orders, reviews, and data. This action cannot be undone.`
                                : detail.status === "ACTIVE"
                                    ? `Are you sure you want to suspend ${detail.fullName}'s account? They will no longer be able to log in.`
                                    : `Are you sure you want to reactivate ${detail.fullName}'s account?`}
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setConfirmAction(null)}>
                                Cancel
                            </button>
                            <button
                                className={styles.modalConfirm}
                                onClick={confirmAction === "delete" ? handleDelete : handleSuspendToggle}
                            >
                                {confirmAction === "delete"
                                    ? "Delete"
                                    : detail.status === "ACTIVE"
                                        ? "Suspend"
                                        : "Reactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
