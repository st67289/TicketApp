import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "80px 24px 40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial"
};

const container: React.CSSProperties = { width: "min(1100px, 94vw)" };

const headerRow: React.CSSProperties = {
    display: "grid",
    gap: 16,
    marginBottom: 16
};

const card: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 22,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)"
};

const title: React.CSSProperties = { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: .2 };
const subtitle: React.CSSProperties = { margin: 0, color: "#a7b0c0", fontSize: 14 };

const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
    marginTop: 16
};

const statCard: React.CSSProperties = {
    ...card,
    padding: 18
};

const statNum: React.CSSProperties = { fontSize: 28, fontWeight: 800 };
const statLabel: React.CSSProperties = { color: "#a7b0c0", fontSize: 13, marginTop: 4 };

const listCard: React.CSSProperties = {
    ...card,
    marginTop: 16
};

const list: React.CSSProperties = { display: "grid", gap: 10 };
const row: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)"
};

const actionLink: React.CSSProperties = {
    color: "#22d3ee",
    textDecoration: "none",
    fontWeight: 700
};

const buttonBar: React.CSSProperties = { display: "flex", gap: 10, marginTop: 16 };

const primaryBtn: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: 0,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: .2,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(124,58,237,.35)"
};

const ghostBtn: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.04)",
    color: "#e6e9ef",
    fontWeight: 700,
    cursor: "pointer"
};

const BACKEND_URL = "http://localhost:8080";

type Me = { email: string | null; role: "USER" | "ADMIN" | null };
type EventDto = {
    eventId: number;
    name: string;
    description?: string;
    startTime: string; // ISO
    endTime?: string;
    venueId?: number;
    seatingPrice?: number | null;
    standingPrice?: number | null;
};

export default function UserDashboard() {
    const nav = useNavigate();
    const [me, setMe] = useState<Me | null>(null);
    const [events, setEvents] = useState<EventDto[]>([]);
    const [loading, setLoading] = useState(true);

    // pokud není token → na login
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { nav("/auth/login", { replace: true }); return; }

        const fetchAll = async () => {
            try {
                // 1) kdo jsem
                const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (meRes.ok) {
                    const m = await meRes.json();
                    setMe({ email: m.email, role: m.role });
                } else {
                    // token neplatný → logout
                    localStorage.removeItem("token");
                    nav("/auth/login", { replace: true });
                    return;
                }

                // 2) akce (veřejný endpoint dle tvé konfigurace)
                const evRes = await fetch(`${BACKEND_URL}/api/events`);
                if (evRes.ok) {
                    const data = await evRes.json();
                    setEvents(Array.isArray(data) ? data.slice(0, 6) : []);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [nav]);

    const upcomingCount = useMemo(() => events.length, [events]);
    const cheapFrom = useMemo(() => {
        const prices = events
            .flatMap(e => [e.standingPrice ?? undefined, e.seatingPrice ?? undefined])
            .filter((n): n is number => typeof n === "number");
        return prices.length ? Math.min(...prices) : null;
    }, [events]);

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                <div style={headerRow}>
                    <div style={card}>
                        <h1 style={title}>{loading ? "Načítám…" : "Vítej zpět 👋"}</h1>
                        <p style={subtitle}>
                            {me?.email ? <>Přihlášen jako <strong>{me.email}</strong> ({me.role}).</> : "—"}
                        </p>

                        <div style={buttonBar}>
                            <Link to="/events" style={{ ...primaryBtn, textDecoration: "none" }}>Procházet akce</Link>
                            <Link to="/user/tickets" style={{ ...ghostBtn, textDecoration: "none" }}>Moje vstupenky</Link>
                            <Link to="/user/account" style={{ ...ghostBtn, textDecoration: "none" }}>Nastavení účtu</Link>
                        </div>
                    </div>

                    <div style={grid}>
                        <div style={statCard}>
                            <div style={statNum}>{upcomingCount}</div>
                            <div style={statLabel}>Nadcházející akce</div>
                        </div>
                        <div style={statCard}>
                            <div style={statNum}>{cheapFrom !== null ? `${cheapFrom.toFixed(0)} Kč` : "—"}</div>
                            <div style={statLabel}>Od nejlevnější vstupenky</div>
                        </div>
                        <div style={statCard}>
                            <div style={statNum}>{me?.role === "ADMIN" ? "✅" : "👤"}</div>
                            <div style={statLabel}>{me?.role === "ADMIN" ? "Admin přístup" : "Uživatelský účet"}</div>
                        </div>
                    </div>
                </div>

                <div style={listCard}>
                    <h2 style={{ ...title, fontSize: 20, marginBottom: 10 }}>Doporučené / nadcházející</h2>
                    <div style={list}>
                        {events.length === 0 && (
                            <div style={{ ...row, justifyItems: "start" }}>Zatím tu nic není – mrkni na <Link to="/events" style={actionLink}>všechny akce</Link>.</div>
                        )}
                        {events.map(e => (
                            <div key={e.eventId} style={row}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{e.name}</div>
                                    <div style={{ color: "#a7b0c0", fontSize: 13 }}>
                                        {formatDateRange(e.startTime, e.endTime)}
                                        {typeof e.seatingPrice === "number" || typeof e.standingPrice === "number" ? (
                                            <> · od {minNonNull(e.seatingPrice, e.standingPrice)} Kč</>
                                        ) : null}
                                    </div>
                                </div>
                                <Link to={`/events/${e.eventId}`} style={actionLink}>Detail</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function minNonNull(a?: number | null, b?: number | null) {
    const arr = [a, b].filter((n): n is number => typeof n === "number");
    return arr.length ? Math.min(...arr).toFixed(0) : "—";
}

function formatDateRange(startIso?: string, endIso?: string) {
    if (!startIso) return "—";
    try {
        const s = new Date(startIso);
        const e = endIso ? new Date(endIso) : null;
        const intl = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
        return e ? `${intl.format(s)} – ${intl.format(e)}` : intl.format(s);
    } catch {
        return startIso;
    }
}
