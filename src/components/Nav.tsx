"use client"

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "./Nav.module.css";

export default function Nav() {
    const router = useRouter();
    const { totalItems } = useCart();
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("loggedUser");
        if (stored) {
            setLoggedIn(true);
            try {
                const user = JSON.parse(stored);
                setUsername(user.username || "");
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        if (window.confirm("Are you sure you want to log out? Your session will end.")) {
            localStorage.removeItem("loggedUser");
            setLoggedIn(false);
            setUsername("");
            setProfileOpen(false);
        }
    }

    return (
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <div className="container-fluid">
                <a className={styles.navbarBrand} href="/">
                    <span className={styles.brandText}>
                        <span className={styles.brandName}>Bookworm</span>
                        <span className={styles.brandTagline}>Your Literary Haven</span>
                    </span>
                </a>
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
                            <a className={`nav-link ${styles.navLink}`} href="/">
                                Discover
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.navLink}`} href="/browse">
                                Browse Books
                            </a>
                        </li>
                        {loggedIn ? (
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
                                <li className="nav-item">
                                    <a className={`nav-link ${styles.navLink}`} href="/dashboard">
                                        Dashboard
                                    </a>
                                </li>
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
                        {loggedIn ? (
                            <>
                                <a className={`${styles.navIconLink}`} href="/cart" title="Shopping Cart">
                                    🛒
                                    {totalItems > 0 && (
                                        <span className={styles.cartBadge}>{totalItems}</span>
                                    )}
                                </a>
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
    );
}
