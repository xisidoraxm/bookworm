'use client'

import {useRouter} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import styles from "./page.module.css";
import EyeOpen from "../components/icons/EyeOpen";
import EyeClosed from "../components/icons/EyeClosed";

export default function Login() {

    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);

    const initialUsers = [
        { username: "isidora", password: "Pass123!", name: "Isidora", lastName: "Obradovic", phone: "0612345678", email: "isidora@gmail.com" },
        { username: "jelica", password: "Pass123!", name: "Jelica", lastName: "Cincovic", phone: "0612345679", email: "jelica@gmail.com" },
        { username: "drazen", password: "Pass123!", name: "Drazen", lastName: "Draskovic", phone: "0612345680", email: "drazen@gmail.com" },
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
            setTimeout(() => router.push("/events"), 900);
        } else {
            toast.error("User does not exist or wrong credentials", {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-3"></div>
                <div className="col-6 justify-content-center">
                    <br/>
                    <form onSubmit={login} role="form" noValidate>
                        <div className="text-center align-items-center">
                            <br/>
                            <Image alt="" src="/login.png" width={100} height={100}></Image>
                            <br/>
                            <br/>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingUsername"
                                           name="username" placeholder="Username" aria-label="Username" autoFocus/>
                                    <label htmlFor="floatingUsername">Username</label>
                                </div>
                            </div>
                            <br/>
                            <div className="input-group">
                                <div className={`form-floating mb-3 ${styles.passwordWrapper}`}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${styles.passwordInput}`}
                                        id="floatingPassword"
                                        name="password"
                                        placeholder="Password"
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
                                </div>
                            </div>
                            <br/>
                            <button className="btn btn-success" type="submit">Login</button>
                            <hr/>
                            You don't have an account, <Link href="/register">create new</Link>.
                        </div>
                    </form>
                    <ToastContainer position="top-right" />
                </div>
                <div className="col-3"></div>
            </div>
        </div>
    )
}
