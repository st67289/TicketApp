import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Slide = {
    image: string;
    title: string;
    subtitle?: string;
    ctaText?: string;
    to?: string;
};

const wrap: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    height: 220,
};

const track: React.CSSProperties = {
    display: "flex",
    width: "100%",
    height: "100%",
    transition: "transform .5s ease",
};

const slideCss: React.CSSProperties = {
    minWidth: "100%",
    height: "100%",
    position: "relative",
    display: "grid",
    placeItems: "end start",
    color: "#e6e9ef",
};

const imgCss: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "brightness(.75)",
};

const content: React.CSSProperties = {
    position: "relative",
    padding: 18,
};

const titleCss: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: .2 };
const subCss: React.CSSProperties = { margin: "6px 0 10px", color: "#cfd6e4", fontSize: 13 };

const ctaBtn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: 0,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: .2,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block"
};

const arrowsWrap: React.CSSProperties = {
    position: "absolute",
    inset: "0 0 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: "none"
};

const arrowBtn: React.CSSProperties = {
    pointerEvents: "all",
    margin: "0 8px",
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(0,0,0,.25)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer"
};

const dots: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    display: "flex",
    gap: 6,
    justifyContent: "center"
};

const dot: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,.35)"
};

const dotActive: React.CSSProperties = { ...dot, background: "#22d3ee" };

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
        <div style={wrap}>
            <div style={{ ...track, transform: `translateX(-${i * 100}%)` }}>
                {slides.map((s, idx) => (
                    <div key={idx} style={slideCss}>
                        <img src={s.image} alt="" style={imgCss} />
                        <div style={content}>
                            <h3 style={titleCss}>{s.title}</h3>
                            {s.subtitle && <p style={subCss}>{s.subtitle}</p>}
                            {s.to && <Link to={s.to} style={ctaBtn}>{s.ctaText ?? "Zobrazit"}</Link>}
                        </div>
                    </div>
                ))}
            </div>

            <div style={arrowsWrap} aria-hidden>
                <button style={arrowBtn} onClick={prev} title="Předchozí">
                    ‹
                </button>
                <button style={arrowBtn} onClick={next} title="Další">
                    ›
                </button>
            </div>

            <div style={dots}>
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        style={idx === i ? dotActive : dot}
                        onClick={() => go(idx)}
                        role="button"
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
