"use client"

import { useRouter } from "next/navigation";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import styles from "../page.module.css";
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
        const name = (formData.get("name")?.toString() ?? "").trim();
        const surname = (formData.get("surname")?.toString() ?? "").trim();
        const phone = (formData.get("phone")?.toString() ?? "").trim();
        const email = (formData.get("email")?.toString() ?? "").trim();

        if (!username || !password || !phone || !email || !name || !surname) {
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

        users.push({ username, password, name, surname, phone, email });
        localStorage.setItem("users", JSON.stringify(users));
        toast.success("Registered successfully", { position: "top-right", autoClose: 2000 });
        router.push("/");
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-3"></div>
                <div className="col-6 justify-content-center">
                    <br />
                    <form onSubmit={register}>
                        <div className="text-center align-items-center">
                            <br />
                            <h2>REGISTER</h2>
                            <br />
                            <br />
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingUsername"
                                        placeholder="Enter username" name="username" />
                                    <label htmlFor="floatingUsername">Username</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className={`form-floating mb-3 ${styles.passwordWrapper}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${styles.passwordInput}`}
                                        id="floatingPassword"
                                        placeholder="Enter password"
                                        name="password"
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
                                    <label htmlFor="floatingPassword">Password</label>
                                    <small id="passwordHelp" className="form-text text-muted">Password must be ≥8 chars, include an uppercase letter, a number, and a special character.</small>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingName"
                                        placeholder="Enter name" name="name" />
                                    <label htmlFor="floatingName">Name</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingSurname"
                                        placeholder="Enter surname" name="surname" />
                                    <label htmlFor="floatingSurname">Surname</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingPhone"
                                        placeholder="Enter phone number" name="phone" />
                                    <label htmlFor="floatingPhone">Phone number</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="email" className="form-control" id="floatingEmail"
                                        placeholder="Enter email" name="email" />
                                    <label htmlFor="floatingEmail">Email</label>
                                </div>
                            </div>
                            <button className="btn btn-success" type="submit">Register</button>
                        </div>
                    </form>
                    <p className={styles.registerPrompt}>
                        Already have an account? <Link href="/">Login</Link>.
                    </p>
                    <ToastContainer />
                </div>
                <div className="col-3"></div>
            </div>
        </div>
    );
}
