"use client";

import Image from "next/image";
import styles from "./page.module.css";

const news = [
    {
        id: 1,
        date: "March 25, 2026",
        title: "Spring 2026 Reading List: 10 Books Everyone Is Talking About",
        description: "From debut literary fiction to gripping thrillers, these are the titles flying off the shelves this spring. Our staff picks include the latest from Brandon Sanderson, a stunning memoir by a former war correspondent, and a genre-bending mystery set in 1920s Istanbul. Whether you're looking for a beach read or something to challenge your worldview, this list has you covered.",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop",
    },
    {
        id: 2,
        date: "March 20, 2026",
        title: "Readers' Choice Awards 2026: Your Favorites Revealed",
        description: "Over 5,000 readers voted, and the results are in! This year's top-rated book is a sweeping historical romance set during World War II, followed closely by a dystopian thriller that has drawn comparisons to 1984. We break down the winners across all categories — from Best Debut Novel to Best Children's Book — and share what readers loved most about each pick.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
    },
    {
        id: 3,
        date: "March 15, 2026",
        title: "Bookworm Author Night: Meet Margaret Atwood — Live in Belgrade!",
        description: "We're thrilled to announce that Margaret Atwood will be visiting Bookworm for an exclusive evening of readings, conversation, and book signings on April 12th. The evening will feature a discussion of her latest work, audience Q&A, and a chance to get your copies signed. Space is limited — reserve your free ticket at our store or by calling us directly.",
        image: "https://images.unsplash.com/photo-1529158062015-cad636e205a0?w=600&h=400&fit=crop",
    },
    {
        id: 4,
        date: "March 10, 2026",
        title: "The Rise of Dark Academia: Why This Genre Is Dominating 2026",
        description: "From secret societies to ivy-covered campuses hiding dangerous secrets, dark academia has evolved from a niche aesthetic into one of the most popular genres in fiction. We explore why readers are drawn to its blend of intellectual atmosphere, moral ambiguity, and gothic mystery — and recommend six titles that define the movement, from Donna Tartt's classic to this year's breakout debut.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    },
    {
        id: 5,
        date: "March 5, 2026",
        title: "Children's Book Week: Events, Workshops & Storytelling Sessions",
        description: "Bookworm is celebrating Children's Book Week from March 22nd to 28th with a packed schedule of events for young readers and their families. Highlights include daily storytelling sessions, an illustration workshop with local artist Milica Petrović, a costume parade inspired by favorite book characters, and a 20% discount on all children's titles. Bring the whole family!",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
    },
    {
        id: 6,
        date: "February 28, 2026",
        title: "Staff Picks: What the Bookworm Team Is Reading This Month",
        description: "Every month, our staff shares the books they can't put down. This month's picks range from a haunting Icelandic noir thriller to a laugh-out-loud essay collection about modern parenthood. Store manager Jelica recommends a powerful debut novel about immigration, while our fantasy specialist Vojin is deep into a 1,200-page epic that he calls 'the best worldbuilding since Tolkien.'",
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop",
    },
];

export default function Newsletter() {
    return (
        <div className={styles.newsletterPage}>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className={`text-center mt-5 ${styles.heading}`}>Newsletter</h1>
                        <p className={`text-center ${styles.subtitle}`}>
                            Stay tuned for the latest book news, events, and reading recommendations.
                        </p>
                    </div>
                </div>

                <div className={styles.newsList}>
                    {news.map((item) => (
                        <article key={item.id} className={styles.newsCard}>
                            <div className={styles.newsImageWrapper}>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={600}
                                    height={400}
                                    className={styles.newsImage}
                                />
                            </div>
                            <div className={styles.newsContent}>
                                <span className={styles.newsDate}>{item.date}</span>
                                <h2 className={styles.newsTitle}>{item.title}</h2>
                                <p className={styles.newsDescription}>{item.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
