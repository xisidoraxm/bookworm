"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

type User = {
    username?: string;
    password?: string;
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
};

export default function Profile() {
    const [user, setUser] = useState<User>({});
    const [showPassword, setShowPassword] = useState(false);
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
                setForm({ ...parsed, confirmPassword: parsed.password });
            } else {
                router.push("/");
            }
        } catch (e) {
            router.push("/");
        }
    }, [router]);

    return (
        <div className={`container ${styles.profileContainer}`}>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5 mb-4">Profile</h1>
                </div>
                <div className="col-md-6 offset-md-3">
                    <div className={`card my-4 ${styles.profileCard}`}>
                        <div className={`card-body ${styles.profileCardBody}`}>
                            {Object.keys(user).length === 0 ? (
                                <div className={`text-center text-muted ${styles.profileEmpty}`}>No user logged in.</div>
                            ) : (
                                <>
                                    {message && <div className={`alert alert-success ${styles.profileAlert}`}>{message}</div>}
                                    {error && <div className={`alert alert-danger ${styles.profileAlert}`}>{error}</div>}

                                    {!editMode ? (
                                        <>
                                            <div className={`mb-3 ${styles.profileField}`}><strong>Username:</strong> {user.username ?? "-"}</div>
                                            <div className={`mb-3 ${styles.profileField}`}><strong>Name:</strong> {user.name ?? "-"}</div>
                                            <div className={`mb-3 ${styles.profileField}`}><strong>Surname:</strong> {user.surname ?? "-"}</div>
                                            <div className={`mb-3 ${styles.profileField}`}><strong>Phone:</strong> {user.phone ?? "-"}</div>
                                            <div className={`mb-3 ${styles.profileField}`}><strong>Email:</strong> {user.email ?? "-"}</div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <strong>Password:</strong>{' '}
                                                <span>{showPassword ? (user.password ?? "-") : '•'.repeat(8)}</span>
                                            </div>
                                            <button className={`btn btn-sm btn-outline-secondary me-2 ${styles.profileBtn}`} onClick={() => setShowPassword(s => !s)}>
                                                {showPassword ? 'Hide' : 'Show'} Password
                                            </button>
                                            <button className={`btn btn-primary btn-sm ${styles.profileBtn}`} onClick={() => { setEditMode(true); setMessage(null); setError(null); setForm({ ...user, confirmPassword: user.password }); }}>
                                                Edit Profile
                                            </button>
                                        </>
                                    ) : (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            setError(null);
                                            setMessage(null);
                                            const errs: string[] = [];
                                            const username = (form.username ?? "").toString().trim();
                                            const name = (form.name ?? "").toString().trim();
                                            const surname = (form.surname ?? "").toString().trim();
                                            const phone = (form.phone ?? "").toString().trim();
                                            const email = (form.email ?? "").toString().trim();
                                            const password = (form.password ?? "").toString();
                                            const confirm = (form.confirmPassword ?? "").toString();

                                            if (!username) errs.push("Username is required.");
                                            if (username.length < 3) errs.push("Username must be at least 3 characters.");
                                            if (!name) errs.push("Name is required.");
                                            if (!surname) errs.push("Surname is required.");
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

                                            const toSave: User = {
                                                username: username,
                                                password: password.length > 0 ? password : user.password,
                                                name: name,
                                                surname: surname,
                                                phone: phone,
                                                email: email,
                                            };
                                            try {
                                                localStorage.setItem("loggedUser", JSON.stringify(toSave));
                                                setUser(toSave);
                                                setEditMode(false);
                                                setMessage("Profile saved.");
                                            } catch (err) {
                                                setError("Failed to save profile.");
                                            }
                                        }}>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Username</label>
                                                <input className="form-control" value={form.username ?? ""} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Name</label>
                                                <input className="form-control" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Surname</label>
                                                <input className="form-control" value={form.surname ?? ""} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Phone</label>
                                                <input className="form-control" value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Password</label>
                                                <input type="password" className="form-control" value={form.password ?? ""} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                                            </div>
                                            <div className={`mb-3 ${styles.profileField}`}>
                                                <label className="form-label">Confirm Password</label>
                                                <input type="password" className="form-control" value={form.confirmPassword ?? ""} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                                            </div>
                                            <div className={`d-flex ${styles.profileActions}`}>
                                                <button type="submit" className={`btn btn-success me-2 ${styles.profileBtn}`}>Save</button>
                                                <button type="button" className={`btn btn-secondary ${styles.profileBtn}`} onClick={() => { setEditMode(false); setForm({ ...user, confirmPassword: user.password }); setError(null); setMessage(null); }}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}