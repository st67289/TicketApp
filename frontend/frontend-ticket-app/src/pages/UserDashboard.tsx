import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// =================================================================
// STYLY
// =================================================================
const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    padding: "100px 24px 40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial"
};

const container: React.CSSProperties = { width: "min(1100px, 94vw)", margin: "0 auto" };
const headerRow: React.CSSProperties = { display: "grid", gap: 16, marginBottom: 30 };

const panel: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 22,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)"
};

const title: React.CSSProperties = { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: .2 };
const subtitle: React.CSSProperties = { margin: "8px 0 20px", color: "#a7b0c0", fontSize: 14 };

const statsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
    marginTop: 16
};

const statCard: React.CSSProperties = {
    ...panel,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textDecoration: "none",
    color: "#e6e9ef",
    transition: "transform 0.2s, background 0.2s"
};

const statNum: React.CSSProperties = { fontSize: 28, fontWeight: 800 };
const statLabel: React.CSSProperties = { color: "#a7b0c0", fontSize: 13, marginTop: 4 };

const listGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: 16,
    marginTop: 16,
};

const eventCard: React.CSSProperties = {
    ...panel,
    padding: 16,
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 12,
    height: "100%",
};

const rowTop: React.CSSProperties = { display: "grid", gap: 6 };
const evName: React.CSSProperties = { fontWeight: 800, fontSize: 18, margin: 0 };
const evTime: React.CSSProperties = { fontWeight: 200, fontSize: 14, margin: 0 };
const meta: React.CSSProperties = { color: "#a7b0c0", fontSize: 13 };

const tagRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start" };
const tag: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.05)",
    fontSize: 12,
    color: "#cfd6e4",
};

const actions: React.CSSProperties = { display: "flex", gap: 10, marginTop: 0 };

const ghostBtn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.04)",
    color: "#e6e9ef",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    textAlign: "center",
    flex: 1
};
const primaryBtn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: 0,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: .2,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(124,58,237,.35)",
    whiteSpace: "nowrap",
    textDecoration: "none",
    textAlign: "center",
    display: "inline-block",
    flex: 1
};

const BACKEND_URL = "http://localhost:8080";

type Me = { email: string | null; role: "USER" | "ADMINISTRATOR" | null };
type VenueShort = { id: number; name: string; address?: string | null };

type EventListDto = {
    id: number;
    name: string;
    startTime: string;
    venue?: VenueShort | null;
    hasStanding: boolean;
    hasSeating: boolean;
    fromPrice?: number | null;
    available: number;
    total: number;
};

// DTO z backendu
type DashboardData = {
    upcomingEvents: EventListDto[];
    totalUpcomingCount: number;
    cheapestTicketPrice: number | null;
};

function formatDate(startIso?: string) {
    if (!startIso) return "—";
    try {
        const s = new Date(startIso);
        const intl = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
        return intl.format(s);
    } catch { return startIso; }
}

export default function UserDashboard() {
    const nav = useNavigate();
    const [me, setMe] = useState<Me | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { nav("/auth/login", { replace: true }); return; }

        const fetchAll = async () => {
            try {
                // 1) Info o userovi
                const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (meRes.ok) {
                    setMe(await meRes.json());
                } else {
                    localStorage.removeItem("token");
                    nav("/auth/login", { replace: true });
                    return;
                }

                // 2) Data pro dashboard (Top 3 akce + statistiky)
                const dashRes = await fetch(`${BACKEND_URL}/api/dashboard/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (dashRes.ok) {
                    setData(await dashRes.json());
                }

            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [nav]);

    const events = data?.upcomingEvents || [];

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>

                {/* HLAVIČKA */}
                <div style={headerRow}>
                    <div style={panel}>
                        <h1 style={title}>{loading ? "Načítám…" : "Vítej zpět 👋"}</h1>
                        <p style={subtitle}>
                            {me?.email ? <>Přihlášen jako <strong>{me.email}</strong>.</> : "—"}
                        </p>
                        <div style={{display: 'flex', gap: 10}}>
                            <Link to="/events" style={primaryBtn}>Procházet akce</Link>
                            <Link to="/user/tickets" style={ghostBtn}>Moje vstupenky</Link>
                        </div>
                    </div>

                    <div style={statsGrid}>
                        <div style={statCard}>
                            <div style={statNum}>{data?.totalUpcomingCount ?? 0}</div>
                            <div style={statLabel}>Nadcházející akce</div>
                        </div>

                        <div style={statCard}>
                            <div style={statNum}>
                                {data?.cheapestTicketPrice ? `${data.cheapestTicketPrice} Kč` : "—"}
                            </div>
                            <div style={statLabel}>Od nejlevnější vstupenky</div>
                        </div>

                        <Link to="/user/account" style={{...statCard, cursor: "pointer", borderColor: "rgba(34, 211, 238, 0.3)", background: "rgba(34, 211, 238, 0.05)"}}>
                            <div style={statNum}>⚙️</div>
                            <div style={{...statLabel, color: "#22d3ee", fontWeight: "bold"}}>Nastavení účtu</div>
                        </Link>
                    </div>
                </div>

                {/* SEZNAM AKCÍ */}
                <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                        <h2 style={{ ...title, fontSize: 22 }}>Doporučené / nadcházející</h2>
                        <Link to="/events" style={{color: "#22d3ee", textDecoration: "none", fontSize: 14, fontWeight: 700}}>Zobrazit vše →</Link>
                    </div>

                    <div style={listGrid}>
                        {!loading && events.length === 0 && (
                            <div style={{ gridColumn: "1 / -1", color: "#a7b0c0", padding: 20, textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                                Žádné nadcházející akce.
                            </div>
                        )}

                        {events.map(e => (
                            <article key={e.id} style={eventCard}>
                                <div style={rowTop}>
                                    <h2 style={evName}>{e.name}</h2>
                                    <h3 style={evTime}>{formatDate(e.startTime)}</h3>
                                    <div style={meta}>
                                        {e.venue?.name ?? "—"}
                                        {e.venue?.address ? `, ${e.venue.address}` : ""}
                                    </div>
                                </div>

                                <div>
                                    <div style={tagRow}>
                                        {typeof e.fromPrice === "number" && <span style={tag}>od {e.fromPrice.toFixed(0)} Kč</span>}
                                        {e.hasSeating && <span style={tag}>Sezení</span>}
                                        {e.hasStanding && <span style={tag}>Stání</span>}
                                        <span style={tag}>{e.available} volných</span>
                                    </div>
                                </div>

                                <div style={actions}>
                                    <Link to={`/events/${e.id}`} style={ghostBtn}>Detail</Link>
                                    <button style={primaryBtn} onClick={() => nav(`/events/${e.id}`)}>Koupit</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}