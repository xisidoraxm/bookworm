"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type User = {
    id?: number;
    username?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    email?: string;
};

export default function Profile() {
    const [user, setUser] = useState<User>({});
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<User & { confirmPassword?: string }>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                setForm({ ...parsed, password: "", confirmPassword: "" });
            } else {
                router.push("/");
            }
        } catch (e) {
            router.push("/");
        }
    }, [router]);

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <h1 className={styles.profileTitle}>Reader Profile</h1>
                    <p className={styles.profileSubtitle}>Your personal reading journey</p>
                </div>

                {Object.keys(user).length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📚</span>
                        No user logged in.
                    </div>
                ) : (
                    <>
                        {message && (
                            <div className={`${styles.alert} ${styles.alertSuccess}`}>
                                ✅ {message}
                            </div>
                        )}
                        {error && (
                            <div className={`${styles.alert} ${styles.alertError}`}>
                                ⚠️ {error}
                            </div>
                        )}

                        {!editMode ? (
                            <>
                                <div className={styles.profileInfo}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoIcon}>👤</span>
                                        <span className={styles.infoLabel}>Username</span>
                                        <span className={styles.infoValue}>{user.username ?? "-"}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoIcon}>📝</span>
                                        <span className={styles.infoLabel}>Full Name</span>
                                        <span className={styles.infoValue}>{user.fullName ?? "-"}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoIcon}>📧</span>
                                        <span className={styles.infoLabel}>Email</span>
                                        <span className={styles.infoValue}>{user.email ?? "-"}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoIcon}>📱</span>
                                        <span className={styles.infoLabel}>Phone</span>
                                        <span className={styles.infoValue}>{user.phone ?? "-"}</span>
                                    </div>
                                </div>
                                <div className={styles.buttonGroup}>
                                    <button 
                                        className={styles.btnPrimary} 
                                        onClick={() => { 
                                            setEditMode(true); 
                                            setMessage(null); 
                                            setError(null); 
                                            setForm({ ...user, password: "", confirmPassword: "" }); 
                                        }}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form className={styles.editForm} onSubmit={async (e) => {
                                e.preventDefault();
                                setError(null);
                                setMessage(null);
                                const errs: string[] = [];
                                const username = (form.username ?? "").toString().trim();
                                const fullName = (form.fullName ?? "").toString().trim();
                                const phone = (form.phone ?? "").toString().trim();
                                const email = (form.email ?? "").toString().trim();
                                const password = (form.password ?? "").toString();
                                const confirm = (form.confirmPassword ?? "").toString();

                                if (!username) errs.push("Username is required.");
                                if (username.length < 3) errs.push("Username must be at least 3 characters.");
                                if (!fullName) errs.push("Full Name is required.");
                                if (email) {
                                    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRe.test(email)) errs.push("Email address is invalid.");
                                } else {
                                    errs.push("Email is required.");
                                }
                                if (phone) {
                                    const phoneRe = /^\+?[0-9\-\s]{7,20}$/;
                                    if (!phoneRe.test(phone)) errs.push("Phone number looks invalid.");
                                }
                                if (password.length > 0) {
                                    if (password.length < 8) errs.push("Password must be at least 8 characters.");
                                    if (password !== confirm) errs.push("Passwords do not match.");
                                }

                                if (errs.length > 0) {
                                    setError(errs.join(" "));
                                    return;
                                }

                                try {
                                    const res = await fetch("/api/profile", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            id: user.id,
                                            username,
                                            password: password.length > 0 ? password : undefined,
                                            fullName,
                                            phone,
                                            email,
                                        }),
                                    });

                                    if (!res.ok) {
                                        const data = await res.json();
                                        setError(data.error || "Failed to save profile.");
                                        return;
                                    }

                                    const updated = await res.json();
                                    localStorage.setItem("loggedUser", JSON.stringify(updated));
                                    setUser(updated);
                                    setEditMode(false);
                                    setMessage("Profile saved.");
                                } catch {
                                    setError("Failed to save profile.");
                                }
                            }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>👤 Username</label>
                                    <input 
                                        className={styles.formInput} 
                                        value={form.username ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>📝 Full Name</label>
                                    <input 
                                        className={styles.formInput} 
                                        value={form.fullName ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>📧 Email</label>
                                    <input 
                                        type="email" 
                                        className={styles.formInput} 
                                        value={form.email ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>📱 Phone</label>
                                    <input 
                                        className={styles.formInput} 
                                        value={form.phone ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>🔐 New Password (optional)</label>
                                    <input 
                                        type="password" 
                                        className={styles.formInput} 
                                        value={form.password ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>🔐 Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className={styles.formInput} 
                                        value={form.confirmPassword ?? ""} 
                                        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} 
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className={styles.buttonGroup}>
                                    <button type="submit" className={styles.btnSuccess}>
                                        💾 Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        className={styles.btnCancel} 
                                        onClick={() => { 
                                            setEditMode(false); 
                                            setForm({ ...user, confirmPassword: user.password }); 
                                            setError(null); 
                                            setMessage(null); 
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}