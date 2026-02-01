'use client'

import {useRouter} from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import React from "react";

export default function Register() {

    const router = useRouter();

    function register(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = (formData.get("username")?.toString() ?? "").trim();
        const password = (formData.get("password")?.toString() ?? "").trim();
        const name = (formData.get("name")?.toString() ?? "").trim();
        const lastName = (formData.get("lastName")?.toString() ?? "").trim();
        const phone = (formData.get("phone")?.toString() ?? "").trim();
        const email = (formData.get("email")?.toString() ?? "").trim();

        if (!username || !password || !phone || !email || !name || !lastName) {
            toast.error("All fields are required", { position: "top-right", autoClose: 5000 });
            return;
        }

        // password must be at least 8 chars, contain an uppercase letter, a number and a special character
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

        users.push({ username, password, name, lastName, phone, email });
        localStorage.setItem("users", JSON.stringify(users));
        toast.success("Registered successfully", { position: "top-right", autoClose: 2000 });
        router.push("/");
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-3"></div>
                <div className="col-6 justify-content-center">
                    <br/>
                    <form onSubmit={register}>
                        <div className="text-center align-items-center">
                            <br/>
                            <h2>REGISTER</h2>
                            <br/>
                            <br/>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingUsername"
                                           placeholder="Enter username" name="username"/>
                                    <label htmlFor="floatingUsername">Username</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="password" className="form-control" id="floatingPassword"
                                           placeholder="Enter password" name="password"/>
                                    <label htmlFor="floatingPassword">Password</label>
                                    <small id="passwordHelp" className="form-text text-muted">Password must be ≥8 chars, include an uppercase letter, a number, and a special character.</small>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingName"
                                           placeholder="Enter name" name="name"/>
                                    <label htmlFor="floatingName">Name</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingLastName"
                                           placeholder="Enter last name" name="lastName"/>
                                    <label htmlFor="floatingLastName">Last Name</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="floatingPhone"
                                           placeholder="Enter phone number" name="phone"/>
                                    <label htmlFor="floatingPhone">Phone number</label>
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="form-floating mb-3">
                                    <input type="email" className="form-control" id="floatingEmail"
                                           placeholder="Enter email" name="email"/>
                                    <label htmlFor="floatingEmail">Email</label>
                                </div>
                            </div>
                            <button className="btn btn-success" type="submit">Register</button>
                        </div>
                    </form>
                     <ToastContainer/>
                </div>
                <div className="col-3"></div>
            </div>
        </div>
    );
}
