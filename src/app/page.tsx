"use client"

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import styles from "./page.module.css";
import EyeOpen from "../components/icons/EyeOpen";
import EyeClosed from "../components/icons/EyeClosed";

export default function Login() {

    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);

    const initialUsers = [
        { username: "admin", password: "Admin123!", fullName: "Aleksandra Milosevic", phone: "0612345678", email: "admin@gmail.com" },
        { username: "isidora", password: "Pass123!", fullName: "Isidora Obradovic", phone: "0612345678", email: "isidora@gmail.com" },
        { username: "jelica", password: "Pass123!", fullName: "Jelica Cincovic", phone: "0612345679", email: "jelica@gmail.com" },
        { username: "drazen", password: "Pass123!", fullName: "Drazen Draskovic", phone: "0612345680", email: "drazen@gmail.com" },
        { username: "milica", password: "Pass123!", fullName: "Milica Milosevic", phone: "0612345681", email: "milica@gmail.com" },
        { username: "vojin", password: "Pass123!", fullName: "Vojin Vojnovic", phone: "0612345682", email: "vojin@gmail.com" }
    ]

    useEffect(() => {
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(initialUsers));
        }
    }, [])

    function login(e: React.FormEvent<HTMLFormElement>) {
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

        const usersStr = localStorage.getItem("users");
        if (!usersStr) {
            toast.error("There are no users", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const users = JSON.parse(usersStr);
        const found = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase() && u.password === password);

        if (found) {
            localStorage.setItem("loggedUser", JSON.stringify(found));
            toast.success("Login successful — redirecting...", { position: "top-right", autoClose: 800 });
            setTimeout(() => router.push("/bicycles"), 900);
        } else {
            toast.error("User does not exist or wrong credentials", {
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
