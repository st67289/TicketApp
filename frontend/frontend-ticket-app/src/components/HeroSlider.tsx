import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/HeroSlider.module.css"; // Import stylů

type Slide = {
    image: string;
    title: string;
    subtitle?: string;
    ctaText?: string;
    to?: string;
};

export default function HeroSlider({ slides, intervalMs = 4000 }: { slides: Slide[]; intervalMs?: number }) {
    const [i, setI] = useState(0);
    const timer = useRef<number | null>(null);

    const go = (to: number) => {
        const n = slides.length;
        setI(((to % n) + n) % n);
    };
    const next = () => go(i + 1);
    const prev = () => go(i - 1);

    useEffect(() => {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = window.setInterval(next, intervalMs);
        return () => { if (timer.current) window.clearInterval(timer.current); };
    }, [i, intervalMs, slides.length]);

    return (
        <div className={styles.wrap}>
            {/* Posouvání tracku řešíme inline stylem, protože se hodnota mění dynamicky */}
            <div className={styles.track} style={{ transform: `translateX(-${i * 100}%)` }}>
                {slides.map((s, idx) => (
                    <div key={idx} className={styles.slide}>
                        <img src={s.image} alt={s.title} className={styles.image} />

                        <div className={styles.content}>
                            <h3 className={styles.title}>{s.title}</h3>
                            {s.subtitle && <p className={styles.subtitle}>{s.subtitle}</p>}

                            {s.to && (
                                s.to.startsWith('#') ? (
                                    // Kotva (#) -> klasický <a> tag
                                    <a href={s.to} className={styles.ctaBtn}>
                                        {s.ctaText ?? "Zobrazit"}
                                    </a>
                                ) : (
                                    // Interní link -> React Router
                                    <Link to={s.to} className={styles.ctaBtn}>
                                        {s.ctaText ?? "Zobrazit"}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.arrowsWrap} aria-hidden>
                <button className={styles.arrowBtn} onClick={prev} title="Předchozí">
                    ‹
                </button>
                <button className={styles.arrowBtn} onClick={next} title="Další">
                    ›
                </button>
            </div>

            <div className={styles.dots}>
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        // Podmíněné přidání třídy .active
                        className={`${styles.dot} ${idx === i ? styles.active : ''}`}
                        onClick={() => go(idx)}
                        role="button"
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}