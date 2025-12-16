import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import styles from "./styles/EventsList.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

// typy
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
type PageResp<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
};

type SortKey = "dateAsc" | "dateDesc" | "priceAsc" | "priceDesc";
type QuickRange = "none" | "week" | "month";

function toIsoDayStart(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString(); }
function toIsoDayEnd(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x.toISOString(); }

// CZ: týden = pondělí–neděle
function thisWeekRange(): { from: string; to: string } {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Po=0 … Ne=6
    const mon = new Date(now); mon.setDate(now.getDate() - day);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { from: toIsoDayStart(mon), to: toIsoDayEnd(sun) };
}

function thisMonthRange(): { from: string; to: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toIsoDayStart(start), to: toIsoDayEnd(end) };
}

function formatDate(startIso?: string) {
    if (!startIso) return "—";
    try {
        const s = new Date(startIso);
        const intl = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
        return intl.format(s);
    } catch { return startIso; }
}

export default function EventsList() {
    const nav = useNavigate();

    // filtry
    const [q, setQ] = useState("");
    const [venueId, setVenueId] = useState<string>("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [priceMax, setPriceMax] = useState<string>("");
    const [quick, setQuick] = useState<QuickRange>("none");

    const [sort, setSort] = useState<SortKey>("dateAsc");

    // stránkování (backend)
    const [page, setPage] = useState(1); // UI 1-based
    const [pageSize, setPageSize] = useState(12);

    // data
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState<PageResp<EventListDto> | null>(null);
    const [error, setError] = useState<string>("");

    // seznam míst
    const [venues, setVenues] = useState<VenueShort[]>([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/venues`)
            .then(res => {
                if (!res.ok) throw new Error("Chyba načítání venues");
                return res.json();
            })
            .then(data => setVenues(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (quick === "week") {
            const r = thisWeekRange();
            setDateFrom(r.from.slice(0, 10));
            setDateTo(r.to.slice(0, 10));
        } else if (quick === "month") {
            const r = thisMonthRange();
            setDateFrom(r.from.slice(0, 10));
            setDateTo(r.to.slice(0, 10));
        } else {
            setDateFrom("");
            setDateTo("");
        }
        setPage(1);
    }, [quick]);

    const backendSort = useMemo(() => {
        if (sort === "dateAsc") return "startTime,asc";
        if (sort === "dateDesc") return "startTime,desc";
        return "startTime,asc";
    }, [sort]);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (q.trim()) params.set("q", q.trim());

            if (venueId) params.set("venueId", venueId);

            // LOGIKA PRO DATUM OD (FROM)
            // 1. Získáme dnešní půlnoc (lokální čas)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let effectiveFromDate = today;

            // 2. Pokud uživatel vyplnil filtr
            if (dateFrom) {
                // Převedeme string "YYYY-MM-DD" na Date objekt (lokální půlnoc)
                // Poznámka: new Date("YYYY-MM-DD") by bralo UTC, proto raději parsujeme ručně pro lokální čas
                const [y, m, d] = dateFrom.split("-").map(Number);
                const userDate = new Date(y, m - 1, d);
                userDate.setHours(0, 0, 0, 0);

                // 3. Podmínka: Použít uživatelovo datum jen pokud je dnes nebo později
                // Pokud uživatel zadal minulost, effectiveFromDate zůstane 'today'
                if (userDate >= today) {
                    effectiveFromDate = userDate;
                }
            }

            // Odeslání do API (pomocí helperu toIsoDayStart, který převede na ISO string)
            params.set("from", toIsoDayStart(effectiveFromDate));


            // LOGIKA PRO DATUM DO (TO)
            if (dateTo) {
                params.set("to", `${dateTo}T23:59:59Z`);
            }

            if (priceMax) params.set("priceMax", priceMax);
            params.set("page", String(page - 1));
            params.set("size", String(pageSize));
            params.set("sort", backendSort);

            const res = await fetch(`${BACKEND_URL}/api/events?` + params.toString());
            if (!res.ok) throw new Error("Nelze načíst akce");
            const data: PageResp<EventListDto> = await res.json();
            setPageData(data);
            if (data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Chyba při načítání");
            }
            setPageData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, dateFrom, dateTo, priceMax, venueId, page, pageSize, backendSort]);

    useEffect(() => { setPage(1); }, [q, dateFrom, dateTo, priceMax, venueId, sort]);

    // FE price sort uvnitř stránky:
    const contentSorted = useMemo(() => {
        const c = pageData?.content ?? [];
        if (sort === "priceAsc" || sort === "priceDesc") {
            return [...c].sort((a, b) => {
                const aa = a.fromPrice ?? Number.POSITIVE_INFINITY;
                const bb = b.fromPrice ?? Number.POSITIVE_INFINITY;
                return sort === "priceAsc" ? aa - bb : bb - aa;
            });
        }
        return c;
    }, [pageData, sort]);

    function resetFilters() {
        setQ("");
        setDateFrom("");
        setDateTo("");
        setPriceMax("");
        setVenueId("");
        setQuick("none");
        setSort("dateAsc");
    }

    const disableDateInputs = quick !== "none";

    return (
        <div className={styles.wrap}>
            <Navbar />

            <div className={styles.container}>
                {/* HERO SLIDER */}
                <div className={`${styles.panel} ${styles.heroPanel}`}>
                    <HeroSlider
                        slides={[
                            { image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop", title: "Top koncerty", subtitle: "Projeď si, co se chystá", ctaText: "Prohlédnout", to: "#seznam-akci" },
                            { image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop", title: "Jedinečné premiéry", subtitle: "Nové kusy tento měsíc", ctaText: "Mrkni", to: "#seznam-akci" },
                            { image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop", title: "Nezapomenutelné akce", subtitle: "Co se stane na akci, zůstane na akci 😉", ctaText: "Přehled", to: "#seznam-akci" },
                        ]}
                    />
                </div>

                {/* FILTRY */}
                <div className={styles.panel}>
                    <h1 className={styles.h1}>Akce a koncerty</h1>

                    <div className={styles.filtersGrid}>
                        <div>
                            <label className={styles.label}>Hledat</label>
                            <input
                                className={styles.input}
                                placeholder="např. Imagine Dragons…"
                                value={q}
                                onChange={e => setQ(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Místo konání</label>
                            <select
                                className={styles.input}
                                value={venueId}
                                onChange={e => setVenueId(e.target.value)}
                            >
                                <option className={styles.option} value="">Všechna místa</option>
                                {venues.map(v => (
                                    <option key={v.id} className={styles.option} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={styles.label}>Datum od</label>
                            <input
                                className={styles.input}
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                disabled={disableDateInputs}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Datum do</label>
                            <input
                                className={styles.input}
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                disabled={disableDateInputs}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Cena do</label>
                            <input
                                className={styles.input}
                                type="number"
                                placeholder="Kč"
                                min={0}
                                value={priceMax}
                                onChange={e => setPriceMax(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Řazení</label>
                            <select
                                className={styles.input}
                                value={sort}
                                onChange={e => setSort(e.target.value as SortKey)}
                            >
                                <option className={styles.option} value="dateAsc">Datum ↑ </option>
                                <option className={styles.option} value="dateDesc">Datum ↓ </option>
                                <option className={styles.option} value="priceAsc">Cena ↑ </option>
                                <option className={styles.option} value="priceDesc">Cena ↓ </option>
                            </select>
                        </div>
                    </div>

                    {/* RYCHLÉ OBDOBÍ & AKCE */}
                    <div className={styles.filterBottomRow}>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="quickRange" checked={quick === "none"} onChange={() => setQuick("none")} />
                                Žádný
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="quickRange" checked={quick === "week"} onChange={() => setQuick("week")} />
                                Tento týden
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="quickRange" checked={quick === "month"} onChange={() => setQuick("month")} />
                                Tento měsíc
                            </label>
                        </div>

                        <div className={styles.bottomActions}>
                            <button className={`${styles.btn} ${styles.ghostBtn}`} onClick={resetFilters}>Vymazat filtry</button>
                            <select
                                className={styles.input}
                                style={{ width: "auto" }} // Override full width
                                value={pageSize}
                                onChange={e => setPageSize(Number(e.target.value))}
                                aria-label="Počet na stránku"
                            >
                                <option className={styles.option} value={8}>8 / stránka</option>
                                <option className={styles.option} value={12}>12 / stránka</option>
                                <option className={styles.option} value={24}>24 / stránka</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* LIST */}
                {loading ? (
                    <div className={`${styles.panel} ${styles.loadingText}`}>Načítám…</div>
                ) : error ? (
                    <div className={`${styles.panel} ${styles.errorText}`}>{error}</div>
                ) : (
                    <div className={styles.panel}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#a7b0c0", fontSize: 13 }}>
                            <div>Nalezeno celkem: <strong>{pageData?.totalElements ?? 0}</strong></div>
                            <div>Stránka <strong>{(pageData?.number ?? 0) + 1}</strong> / {pageData?.totalPages ?? 1}</div>
                        </div>

                        <div id="seznam-akci" className={styles.listGrid}>
                            {(pageData?.content?.length ?? 0) === 0 && (
                                <div style={{ gridColumn: "1 / -1", color: "#a7b0c0", textAlign: "center", padding: 20 }}>
                                    Nic nenalezeno.
                                </div>
                            )}

                            {contentSorted.map(e => (
                                <article key={e.id} className={`${styles.panel} ${styles.card}`}>
                                    <div>
                                        <h2 className={styles.evName}>{e.name}</h2>
                                        <h3 className={styles.evTime}>{formatDate(e.startTime)}</h3>
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
                                            <span className={styles.tag}>{e.available}/{e.total} dostupných</span>
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <Link to={`/events/${e.id}`} className={`${styles.btn} ${styles.ghostBtn}`}>Detail</Link>
                                        <button
                                            className={`${styles.btn} ${styles.primaryBtn}`}
                                            onClick={() => nav(`/events/${e.id}`)}
                                        >
                                            Koupit vstupenky
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {(pageData?.totalPages ?? 1) > 1 && (
                            <div className={styles.pagerRow}>
                                <button
                                    className={`${styles.btn} ${styles.ghostBtn}`}
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Předchozí
                                </button>
                                <div style={{ color: "#a7b0c0", fontSize: 13 }}>
                                    Stránka <strong>{page}</strong> / {pageData?.totalPages ?? 1}
                                </div>
                                <button
                                    className={`${styles.btn} ${styles.ghostBtn}`}
                                    disabled={page >= (pageData?.totalPages ?? 1)}
                                    onClick={() => setPage(p => Math.min((pageData?.totalPages ?? 1), p + 1))}
                                >
                                    Další
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}