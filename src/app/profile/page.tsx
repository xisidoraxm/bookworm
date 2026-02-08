'use client'

import React, {useEffect, useState} from "react";
import styles from "./page.module.css";

type User = {
    username?: string;
    password?: string;
    name?: string;
    surname?: string;
    email?: string;
};

export default function Profile() {
    const [user, setUser] = useState<User>({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("loggedUser");
            if (stored) {
                setUser(JSON.parse(stored));
            } else {
                setUser({});
            }
        } catch (e) {
            setUser({});
        }
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5">Profile</h1>
                </div>
                <div className="col-md-6 offset-md-3">
                    <div className="card my-4">
                        <div className="card-body">
                            {Object.keys(user).length === 0 ? (
                                <div className="text-center text-muted">No user logged in.</div>
                            ) : (
                                <>
                                    <div className="mb-3"><strong>Username:</strong> {user.username ?? "-"}</div>
                                    <div className="mb-3"><strong>Name:</strong> {user.name ?? "-"}</div>
                                    <div className="mb-3"><strong>Surname:</strong> {user.surname ?? "-"}</div>
                                    <div className="mb-3"><strong>Email:</strong> {user.email ?? "-"}</div>
                                    <div className="mb-3">
                                        <strong>Password:</strong>{' '}
                                        <span>{showPassword ? (user.password ?? "-") : '•'.repeat(8)}</span>
                                    </div>
                                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setShowPassword(s => !s)}>
                                        {showPassword ? 'Hide' : 'Show'} Password
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}