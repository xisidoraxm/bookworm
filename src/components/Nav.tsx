"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Nav.module.css";

export default function Nav() {
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

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

    function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (
            window.confirm(
                "Are you sure you want to log out? Your session will end."
            )
        ) {
            localStorage.removeItem("loggedUser");
            setLoggedIn(false);
            setUsername("");
        }
    }

    return (
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
            <div className="container-fluid">
                <a className={styles.navbarBrand} href="/home">
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
                            <a className={`nav-link ${styles.navLink}`} href="/home">
                                🏠 Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.navLink}`} href="/newsletter">
                                📰 Newsletter
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.navLink}`} href="/contact">
                                ✉️ Contact
                            </a>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center gap-2">
                        {loggedIn && (
                            <>
                                <a className={`${styles.navIconLink}`} href="/cart" title="Shopping Cart">
                                    🛒
                                </a>
                                <a className={`${styles.navIconLink}`} href="/profile" title="Profile">
                                    👤 {username && <span className={styles.username}>{username}</span>}
                                </a>
                            </>
                        )}
                        {loggedIn ? (
                            <button
                                className={styles.logoutBtn}
                                type="button"
                                onClick={handleLogout}
                            >
                                <span className={styles.logoutIcon}>🚪</span>
                                Logout
                            </button>
                        ) : (
                            <button
                                className={styles.logoutBtn}
                                type="button"
                                onClick={() => router.push("/")}
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
