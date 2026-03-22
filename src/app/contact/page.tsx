"use client";

import { useCallback } from "react";
import styles from "./page.module.css";
import Map from "../../components/Map";

const SHOP_CENTER = { lat: 44.8176, lng: 20.4633 };

export default function Contact() {
    const handleMapReady = useCallback(async (mapInstance: any, infoWindow: any) => {
        const hasMapId = !!process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

        if (hasMapId) {
            const markerLib = await (window as any).google.maps.importLibrary("marker");
            const { AdvancedMarkerElement, PinElement } = markerLib;

            const pin = new PinElement({
                background: "#8B4513",
                borderColor: "#FFFFFF",
                glyphColor: "#FFFFFF",
            });

            const marker = new AdvancedMarkerElement({
                position: SHOP_CENTER,
                map: mapInstance,
                title: "Bookworm — Knez Mihailova 12",
                content: pin.element,
            });

            marker.addListener("click", () => {
                infoWindow.setContent(
                    `<div style="padding:6px"><strong>Bookworm</strong><br/>Knez Mihailova 12, Belgrade</div>`
                );
                infoWindow.open(mapInstance, marker);
            });
        } else {
            const MarkerClass = (window as any).google.maps.Marker;
            const marker = new MarkerClass({
                position: SHOP_CENTER,
                map: mapInstance,
                title: "Bookworm — Knez Mihailova 12",
            });

            marker.addListener("click", () => {
                infoWindow.setContent(
                    `<div style="padding:6px"><strong>Bookworm</strong><br/>Knez Mihailova 12, Belgrade</div>`
                );
                infoWindow.open(mapInstance, marker);
            });
        }
    }, []);

    return (
        <div className={styles.contactPage}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Visit Bookworm</h1>
                <p className={styles.heroSubtitle}>
                    We&apos;d love to hear from you — whether you&apos;re looking for your
                    next favourite read or just want to say hello.
                </p>
            </div>

            <div className={styles.content}>
                {/* Info + Map row */}
                <div className={styles.row}>
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionTitle}>Get in Touch</h2>

                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>📍</span>
                            <div>
                                <strong>Address</strong>
                                <p>Knez Mihailova 12, 11000 Belgrade, Serbia</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>📞</span>
                            <div>
                                <strong>Phone</strong>
                                <p>+381 11 123 4567</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>✉️</span>
                            <div>
                                <strong>Email</strong>
                                <p>hello@bookworm.rs</p>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>🕐</span>
                            <div>
                                <strong>Working Hours</strong>
                                <p>Mon – Fri: 09:00 – 20:00</p>
                                <p>Sat: 10:00 – 18:00</p>
                                <p>Sun: Closed</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.mapCard}>
                        <h2 className={styles.sectionTitle}>Our Location</h2>
                        <Map
                            center={SHOP_CENTER}
                            zoom={15}
                            className={styles.map}
                            onMapReady={handleMapReady}
                        />
                    </div>
                </div>

                {/* About blurb */}
                <div className={styles.aboutCard}>
                    <h2 className={styles.sectionTitle}>About Bookworm</h2>
                    <p>
                        Nestled in the heart of Belgrade&apos;s pedestrian zone, Bookworm has
                        been a haven for readers since 2012. We carry a curated selection
                        of fiction, non‑fiction, children&apos;s books, and rare editions —
                        plus a cosy reading nook with complimentary coffee.
                    </p>
                    <p>
                        Whether you&apos;re a local bibliophile or a traveller searching for
                        the perfect souvenir, our friendly staff is always happy to help
                        you find your next great read.
                    </p>
                </div>

                {/* Social links */}
                <div className={styles.socialCard}>
                    <h2 className={styles.sectionTitle}>Follow Us</h2>
                    <p className={styles.socialText}>
                        Stay up to date with new arrivals, author events, and reading
                        recommendations — connect with us on your favourite platform.
                    </p>
                    <div className={styles.socialLinks}>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialLink} ${styles.facebook}`}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialLink} ${styles.instagram}`}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                            Instagram
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialLink} ${styles.twitter}`}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            X (Twitter)
                        </a>
                        <a
                            href="https://goodreads.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialLink} ${styles.goodreads}`}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M11.43 23.995c-3.608-.208-6.274-2.077-6.448-5.078.695.007 1.375-.013 2.07-.006.224 1.342 1.065 2.43 2.683 3.026 1.583.496 3.737.46 5.082-.174 1.351-.636 2.145-1.822 2.503-3.577.212-1.042.236-1.734.238-2.858-.004-.319.01-.642-.005-.953-.046.494-.144.96-.315 1.394-.848 2.157-2.91 3.136-5.265 3.105-3.215-.04-5.674-2.052-6.503-5.031-.488-1.754-.565-3.655-.34-5.46.308-2.472 1.252-4.516 3.425-5.709 1.541-.845 3.27-1.098 5.015-.839 1.498.222 2.762.89 3.621 2.086.016.023.036.04.063.07V.924h2.031v16.235c-.039 2.1-.353 3.903-1.602 5.399-1.3 1.555-3.2 1.517-5.206 1.477-.263-.005-.527.003-.79-.006l-.256-.034zm6.142-13.021c-.065-1.186-.195-2.403-.718-3.469-.856-1.746-2.424-2.607-4.37-2.576-1.94.031-3.418.905-4.258 2.631-.648 1.331-.845 2.788-.84 4.277.003.88.08 1.768.318 2.622.478 1.72 1.466 3.034 3.297 3.517 1.69.446 3.32.297 4.665-.79 1.186-.96 1.72-2.266 1.855-3.735.076-.668.078-1.347.051-2.477z" />
                            </svg>
                            Goodreads
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}