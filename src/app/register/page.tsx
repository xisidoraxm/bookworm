"use client"

import { useRouter } from "next/navigation";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import styles from "./page.module.css";
import EyeOpen from "../../components/icons/EyeOpen";
import EyeClosed from "../../components/icons/EyeClosed";

export default function Register() {

    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    function register(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = (formData.get("username")?.toString() ?? "").trim();
        const password = (formData.get("password")?.toString() ?? "").trim();
        const fullName = (formData.get("fullName")?.toString() ?? "").trim();
        const phone = (formData.get("phone")?.toString() ?? "").trim();
        const email = (formData.get("email")?.toString() ?? "").trim();

        if (!username || !password || !phone || !email || !fullName) {
            toast.error("All fields are required", { position: "top-right", autoClose: 5000 });
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 8 characters and include an uppercase letter, a number, and a special character", { position: "top-right", autoClose: 6000 });
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.find((u: any) => u.username === username)) {
            toast.error("Username already exists", { position: "top-right", autoClose: 5000 });
            return;
        }

        users.push({ username, password, fullName, phone, email });
        localStorage.setItem("users", JSON.stringify(users));
        toast.success("Registered successfully", { position: "top-right", autoClose: 2000 });
        router.push("/");
    }

    return (
        <div className={styles.registerPage}>
            <div className={styles.registerCard}>
                <div className={styles.registerHeader}>
                    <h1 className={styles.registerTitle}>Join Bookworm</h1>
                    <p className={styles.registerSubtitle}>Start your reading journey today</p>
                </div>

                <form onSubmit={register} className={styles.registerForm}>

                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingName" className={styles.inputLabel}>Full Name</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            id="floatingName"
                            name="fullName"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingUsername" className={styles.inputLabel}>Username</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            id="floatingUsername"
                            name="username"
                            placeholder="Choose a username"
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
                                placeholder="Create a strong password"
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
                        <small className={styles.passwordHint}>Min 8 chars with uppercase, number & special character</small>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingEmail" className={styles.inputLabel}>Email</label>
                        <input
                            type="email"
                            className={styles.inputField}
                            id="floatingEmail"
                            name="email"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="floatingPhone" className={styles.inputLabel}>Phone Number</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            id="floatingPhone"
                            name="phone"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <button className={styles.registerButton} type="submit">
                        <span>Create Account</span>
                        <span className={styles.buttonIcon}>✨</span>
                    </button>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <p className={styles.loginPrompt}>
                        Already a member? <Link href="/" className={styles.loginLink}>Sign in</Link>
                    </p>
                </form>
            </div>
            <ToastContainer position="top-right" />
        </div>
    );
}
