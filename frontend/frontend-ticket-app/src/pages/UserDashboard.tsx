import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./styles/UserDashboard.module.css"; // Import stylů

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

                // 2) Data pro dashboard
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
        <div className={styles.wrapper}>
            <Navbar />
            <div className={styles.container}>

                {/* HLAVIČKA */}
                <div className={styles.headerRow}>
                    {/* Uvítací panel */}
                    <div className={`${styles.panel} ${styles.welcomePanel}`}>
                        <h1 className={styles.title}>{loading ? "Načítám…" : "Vítej zpět 👋"}</h1>
                        <p className={styles.subtitle}>
                            {me?.email ? <>Přihlášen jako <strong>{me.email}</strong>.</> : "—"}
                        </p>
                        <div className={styles.buttonGroup}>
                            <Link to="/events" className={`${styles.btn} ${styles.primaryBtn}`}>Procházet akce</Link>
                            <Link to="/user/tickets" className={`${styles.btn} ${styles.ghostBtn}`}>Moje vstupenky</Link>
                        </div>
                    </div>

                    {/* Statistiky */}
                    <div className={styles.statsGrid}>
                        <div className={`${styles.panel} ${styles.statCard}`}>
                            <div className={styles.statNum}>{data?.totalUpcomingCount ?? 0}</div>
                            <div className={styles.statLabel}>Nadcházející akce</div>
                        </div>

                        <div className={`${styles.panel} ${styles.statCard}`}>
                            <div className={styles.statNum}>
                                {data?.cheapestTicketPrice ? `${data.cheapestTicketPrice} Kč` : "—"}
                            </div>
                            <div className={styles.statLabel}>Od nejlevnější vstupenky</div>
                        </div>

                        <Link
                            to="/user/account"
                            className={`${styles.panel} ${styles.statCard} ${styles.settingsCard}`}
                        >
                            <div className={styles.statNum}>⚙️</div>
                            <div className={styles.statLabel} style={{color: "#22d3ee", fontWeight: "bold"}}>
                                Nastavení účtu
                            </div>
                        </Link>
                    </div>
                </div>

                {/* SEZNAM AKCÍ */}
                <div>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Doporučené / nadcházející</h2>
                        <Link to="/events" className={styles.viewAllLink}>Zobrazit vše →</Link>
                    </div>

                    <div className={styles.listGrid}>
                        {!loading && events.length === 0 && (
                            <div className={styles.emptyState}>
                                Žádné nadcházející akce.
                            </div>
                        )}

                        {events.map(e => (
                            <article key={e.id} className={`${styles.panel} ${styles.eventCard}`}>
                                <div>
                                    <h2 className={styles.eventName}>{e.name}</h2>
                                    <h3 className={styles.eventTime}>{formatDate(e.startTime)}</h3>
                                    <div className={styles.meta}>
                                        {e.venue?.name ?? "—"}
                                        {e.venue?.address ? `, ${e.venue.address}` : ""}
                                    </div>
                                </div>

                                <div>
                                    <div className={styles.tagRow}>
                                        {typeof e.fromPrice === "number" && <span className={styles.tag}>od {e.fromPrice.toFixed(0)} Kč</span>}
                                        {e.hasSeating && <span className={styles.tag}>Sezení</span>}
                                        {e.hasStanding && <span className={styles.tag}>Stání</span>}
                                        <span className={styles.tag}>{e.available} volných</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <Link to={`/events/${e.id}`} className={`${styles.btn} ${styles.ghostBtn}`}>Detail</Link>
                                    <button
                                        className={`${styles.btn} ${styles.primaryBtn}`}
                                        onClick={() => nav(`/events/${e.id}`)}
                                    >
                                        Koupit
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}