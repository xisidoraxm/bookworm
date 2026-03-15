"use client"

import React from "react";
import { useRouter } from "next/navigation";

export default function Nav() {
    const router = useRouter();

    function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (
            window.confirm(
                "Are you sure you want to log out? Your session will end."
            )
        ) {
            localStorage.removeItem("loggedUser");
            router.push("/");
        }
    }

    return (
        <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="/bicycles">
                    <img src="/road-bicycle.svg" alt="Book shop" height="45" />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarColor02">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link active" href="/bicycles">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/locations">Locations</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/renting">Renting</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/profile">Profile</a>
                        </li>
                    </ul>
                    <form className="d-flex">
                        <button
                            className="btn btn-danger my-2 my-sm-0"
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
