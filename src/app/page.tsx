"use client"

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import styles from "./page.module.css";
import EyeOpen from "../components/icons/EyeOpen";
import EyeClosed from "../components/icons/EyeClosed";

export default function Login() {

    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);

    async function login(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = (formData.get("username")?.toString() ?? "").trim();
        const password = (formData.get("password")?.toString() ?? "").trim();

        if (!username || !password) {
            toast.error("Please fill in both username and password", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Invalid credentials", {
                    position: "top-right",
                    autoClose: 5000,
                });
                return;
            }

            const user = await res.json();
            localStorage.setItem("loggedUser", JSON.stringify(user));
            toast.success("Login successful — redirecting...", { position: "top-right", autoClose: 800 });
            setTimeout(() => router.push("/home"), 900);
        } catch {
            toast.error("Something went wrong. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <h1 className={styles.loginTitle}>Welcome to Bookworm</h1>
                    <p className={styles.loginSubtitle}>Your next great read awaits</p>
                </div>
                
                <form onSubmit={login} role="form" noValidate className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingUsername" className={styles.inputLabel}>Username</label>
                        <input 
                            type="text" 
                            className={styles.inputField} 
                            id="floatingUsername"
                            name="username" 
                            placeholder="Enter your username" 
                            aria-label="Username" 
                            autoFocus 
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingPassword" className={styles.inputLabel}>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`${styles.inputField} ${styles.passwordInput}`}
                                id="floatingPassword"
                                name="password"
                                placeholder="Enter your password"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-pressed={showPassword}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className={styles.passwordToggle}
                            >
                                {showPassword ? <EyeOpen width={20} height={20} aria-hidden="true" /> : <EyeClosed width={20} height={20} aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                    
                    <button className={styles.loginButton} type="submit">
                        <span>Sign In</span>
                        <span className={styles.buttonIcon}>→</span>
                    </button>
                    
                    <div className={styles.divider}>
                        <span>or</span>
                    </div>
                    
                    <p className={styles.registerPrompt}>
                        New to Bookworm? <Link href="/register" className={styles.registerLink}>Create an account</Link>
                    </p>
                </form>
            </div>
            <ToastContainer position="top-right" />
        </div>
    )
}
