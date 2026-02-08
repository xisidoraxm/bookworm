'use client'

import styles from "./page.module.css";
import Map from "./Map";

export default function Bicycles() {

    return (
        <div>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mt-5">Bicycles Page</h1>
                    <p className="text-center">Welcome to the Bicycles page!</p>
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