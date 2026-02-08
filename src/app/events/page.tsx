'use client'

import styles from "./page.module.css";
import Map from "./Map";

export default function Events() {

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5">Events Page</h1>
                    <p className="text-center">Welcome to the Events page!</p>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Map className={styles.mapContainer} />
                </div>
            </div>
        </div>
    )
}