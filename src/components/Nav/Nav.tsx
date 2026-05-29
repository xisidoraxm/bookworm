"use client"

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./Nav.module.css";
import { toast, ToastContainer } from "react-toastify";

export default function Nav() {
    const router = useRouter();
    const { totalItems, clearCart } = useCart();
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<{ id: number; title: string; quantity: number }[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const alertsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (stored) {
            setLoggedIn(true);
            try {
                const user = JSON.parse(stored);
                setUsername(user.username || "");
                setIsAdmin(user.role === "ADMIN");
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
            if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
                setAlertsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!loggedIn || !isAdmin) return;

        let mounted = true;

        async function loadAlerts() {
            try {
                const res = await fetch("/api/admin/inventory/alerts");
                if (!res.ok) return;
                const data = await res.json();
                if (!mounted) return;
                setLowStockCount(data.count ?? 0);
                setLowStockItems(data.items ?? []);
            } catch {
                // ignore notification fetch errors
            }
        }

        loadAlerts();
        const timer = window.setInterval(loadAlerts, 60000);

        return () => {
            mounted = false;
            window.clearInterval(timer);
        };
    }, [loggedIn, isAdmin]);

    function handleLogout() {
        toast.info(
            <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Are you sure you want to log out?</div>
                <div>Your session will end.</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                        style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => {
                            toast.dismiss();
                            localStorage.removeItem("loggedUser");
                            clearCart();
                            setLoggedIn(false);
                            setUsername("");
                            setIsAdmin(false);
                            setProfileOpen(false);
                            router.push("/");
                        }}
                    >
                        Log Out
                    </button>
                    <button
                        style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                toastId: "logout-confirm"
            }
        );
    }

    return (
        <>
            <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
                <div className="container-fluid">
                    <Link className={styles.navbarBrand} href="/">
                        <span className={styles.brandText}>
                            <span className={styles.brandName}>Bookworm</span>
                            <span className={styles.brandTagline}>Your Literary Haven</span>
                        </span>
                    </Link>
                    <button 
                        className={`navbar-toggler ${styles.navbarToggler}`} 
                        type="button" 
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarColor02" 
                        aria-controls="navbarColor02" 
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarColor02">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className={`nav-link ${styles.navLink}`} href="/">
                                    Discover
                                </Link>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${styles.navLink}`} href="/browse">
                                    Browse Books
                                </a>
                            </li>
                            {loggedIn ? (
                                <>
                                    {!isAdmin && (
                                        <>
                                            <li className="nav-item">
                                                <a className={`nav-link ${styles.navLink}`} href="/my-books">
                                                    My Books
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${styles.navLink}`} href="/purchases">
                                                    Purchases
                                                </a>
                                            </li>
                                        </>
                                    )}
                                    <li className="nav-item">
                                        <a className={`nav-link ${styles.navLink}`} href="/dashboard">
                                            Dashboard
                                        </a>
                                    </li>
                                    {isAdmin && (
                                        <>
                                            <li className="nav-item">
                                                <a className={`nav-link ${styles.navLink}`} href="/admin/inventory">
                                                    Inventory
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${styles.navLink}`} href="/admin/orders">
                                                    Manage Orders
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${styles.navLink}`} href="/admin/users">
                                                    Manage Users
                                                </a>
                                            </li>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <a className={`nav-link ${styles.navLink}`} href="/newsletter">
                                            Newsletter
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${styles.navLink}`} href="/contact">
                                            Contact
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>
                        <div className="d-flex align-items-center gap-2">
                            {isAdmin && (
                                <div className={styles.alertsDropdown} ref={alertsRef}>
                                    <button
                                        className={styles.alertsBtn}
                                        onClick={() => setAlertsOpen((prev) => !prev)}
                                        title="Low-stock alerts"
                                    >
                                        🔔
                                        {lowStockCount > 0 && <span className={styles.alertsBadge}>{lowStockCount}</span>}
                                    </button>
                                    {alertsOpen && (
                                        <div className={styles.alertsMenu}>
                                            <div className={styles.alertsHeader}>Low-Stock Alerts</div>
                                            {lowStockItems.length === 0 ? (
                                                <div className={styles.alertsEmpty}>No low-stock books.</div>
                                            ) : (
                                                lowStockItems.map((item) => (
                                                    <div key={item.id} className={styles.alertRow}>
                                                        <div className={styles.alertText}>
                                                            <span className={styles.alertTitle}>{item.title}</span>
                                                            <span className={styles.alertQty}>Qty: {item.quantity}</span>
                                                        </div>
                                                        <a
                                                            className={styles.alertUpdateBtn}
                                                            href={`/admin/inventory?updateStock=${item.id}`}
                                                            onClick={() => setAlertsOpen(false)}
                                                        >
                                                            Update Stock
                                                        </a>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {!isAdmin && (
                                <a className={`${styles.navIconLink}`} href="/cart" title="Shopping Cart">
                                    🛒
                                    {totalItems > 0 && (
                                        <span className={styles.cartBadge}>{totalItems}</span>
                                    )}
                                </a>
                            )}
                            {loggedIn ? (
                                <>
                                    <div className={styles.profileDropdown} ref={dropdownRef}>
                                        <button
                                            className={styles.profileBtn}
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            aria-expanded={profileOpen}
                                        >
                                            👤 {username && <span className={styles.username}>{username}</span>}
                                            <span className={`${styles.dropdownChevron} ${profileOpen ? styles.chevronOpen : ""}`}>▾</span>
                                        </button>
                                        {profileOpen && (
                                            <div className={styles.dropdownMenu}>
                                                <a href="/profile" className={styles.dropdownItem}>
                                                    👤 Profile
                                                </a>
                                                <a href="/newsletter" className={styles.dropdownItem}>
                                                    📰 Newsletter
                                                </a>
                                                <a href="/contact" className={styles.dropdownItem}>
                                                    ✉️ Contact
                                                </a>
                                                <div className={styles.dropdownDivider} />
                                                <button className={styles.dropdownItem} onClick={handleLogout}>
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button
                                    className={styles.logoutBtn}
                                    type="button"
                                    onClick={() => router.push("/login")}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <ToastContainer />
        </>
    );
}
