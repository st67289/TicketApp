import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    padding: "80px 24px 40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial",
};

const container: React.CSSProperties = { width: "min(1100px, 94vw)", margin: "0 auto" };

const h1: React.CSSProperties = { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: .2 };
const panel: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 18,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
};

const filtersGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.4fr 1.2fr 1fr 1fr 1fr auto",
    gap: 12,
    alignItems: "end",
};

const label: React.CSSProperties = { fontSize: 12, color: "#a7b0c0", marginBottom: 6, display: "block" };
const input: React.CSSProperties = {
    appearance: "none",
    width: "100%",
    padding: "10px 12px",
    lineHeight: 1.25,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
    color: "#e6e9ef",
    outline: "none",
} as const;
const select = input;

const rowBetween: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 };
const radioRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

const ghostBtn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.04)",
    color: "#e6e9ef",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
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
};

const listGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: 16,
    marginTop: 16,
};

const card: React.CSSProperties = {
    ...panel,
    padding: 16,
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 12,
    height: "100%",
};

const optionStyle: React.CSSProperties = {
    background: "#181d2f",
    color: "#e6e9ef",
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

const pagerRow: React.CSSProperties = { marginTop: 14, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" };

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

            if (dateFrom) params.set("from", `${dateFrom}T00:00:00Z`);
            if (dateTo)   params.set("to",   `${dateTo}T23:59:59Z`);

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
            // OPRAVA: Odstraněno :any, přidána typová kontrola
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
        <div style={wrap}>
            <Navbar />

            <div style={container}>
                {/* HERO SLIDER */}
                <div style={{ ...panel, padding: 0, marginBottom: 14 }}>
                    <HeroSlider
                        slides={[
                            { image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop", title: "Top koncerty", subtitle: "Projeď si, co se chystá", ctaText: "Prohlédnout", to: "#seznam-akci" },
                            { image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop", title: "Jedinečné premiéry", subtitle: "Nové kusy tento měsíc", ctaText: "Mrkni", to: "#seznam-akci" },
                            { image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop", title: "Nezapomenutelné akce", subtitle: "Co se stane na akci, zůstane na akci 😉", ctaText: "Přehled", to: "#seznam-akci" },
                        ]}
                    />
                </div>

                {/* FILTRY */}
                <div style={{ ...panel, marginBottom: 14 }}>
                    <h1 style={h1}>Akce a koncerty</h1>

                    <div style={filtersGrid}>
                        <div>
                            <label style={label}>Hledat</label>
                            <input style={input} placeholder="např. Imagine Dragons…" value={q} onChange={e => setQ(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Místo konání</label>
                            <select style={select} value={venueId} onChange={e => setVenueId(e.target.value)}>
                                <option style={optionStyle} value="">Všechna místa</option>
                                {venues.map(v => (
                                    <option key={v.id} style={optionStyle} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={label}>Datum od</label>
                            <input style={{ ...input, opacity: disableDateInputs ? .6 : 1 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} disabled={disableDateInputs} />
                        </div>

                        <div>
                            <label style={label}>Datum do</label>
                            <input style={{ ...input, opacity: disableDateInputs ? .6 : 1 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} disabled={disableDateInputs} />
                        </div>

                        <div>
                            <label style={label}>Cena do</label>
                            <input style={input} type="number" placeholder="Kč" min={0} value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Řazení</label>
                            <select style={select} value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                                <option style={optionStyle} value="dateAsc">Datum ↑ </option>
                                <option style={optionStyle} value="dateDesc">Datum ↓ </option>
                                <option style={optionStyle} value="priceAsc">Cena ↑ </option>
                                <option style={optionStyle} value="priceDesc">Cena ↓ </option>
                            </select>
                        </div>
                    </div>

                    {/* RYCHLÉ OBDOBÍ */}
                    <div style={rowBetween}>
                        <div style={radioRow}>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <input type="radio" name="quickRange" checked={quick === "none"} onChange={() => setQuick("none")} />
                                Žádný
                            </label>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <input type="radio" name="quickRange" checked={quick === "week"} onChange={() => setQuick("week")} />
                                Tento týden
                            </label>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <input type="radio" name="quickRange" checked={quick === "month"} onChange={() => setQuick("month")} />
                                Tento měsíc
                            </label>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button style={ghostBtn} onClick={resetFilters}>Vymazat filtry</button>
                            <select
                                style={select}
                                value={pageSize}
                                onChange={e => setPageSize(Number(e.target.value))}
                                aria-label="Počet na stránku"
                            >
                                <option value={8}>8 / stránka</option>
                                <option value={12}>12 / stránka</option>
                                <option value={24}>24 / stránka</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* LIST */}
                {loading ? (
                    <div style={{ ...panel, textAlign: "center" }}>Načítám…</div>
                ) : error ? (
                    <div style={{ ...panel, color: "#fca5a5" }}>{error}</div>
                ) : (
                    <div style={{ ...panel }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#a7b0c0", fontSize: 13 }}>
                            <div>Nalezeno celkem: <strong>{pageData?.totalElements ?? 0}</strong></div>
                            <div>Stránka <strong>{(pageData?.number ?? 0) + 1}</strong> / {pageData?.totalPages ?? 1}</div>
                        </div>

                        <div id="seznam-akci" style={{...listGrid, scrollMarginTop: "100px"}}>
                            {(pageData?.content?.length ?? 0) === 0 && (
                                <div style={{ gridColumn: "1 / -1", color: "#a7b0c0" }}>Nic nenalezeno.</div>
                            )}

                            {contentSorted.map(e => (
                                <article key={e.id} style={card}>
                                    <div style={rowTop}>
                                        <h2 style={evName}>{e.name}</h2>
                                        <h3 style={evTime}>{formatDate(e.startTime)}</h3>
                                        <div style={meta}>{e.venue?.name ?? "—"}{e.venue?.address ? `, ${e.venue.address}` : ""}</div>
                                    </div>

                                    <div>
                                        <div style={tagRow}>
                                            {typeof e.fromPrice === "number" && <span style={tag}>od {e.fromPrice.toFixed(0)} Kč</span>}
                                            {e.hasSeating && <span style={tag}>Sezení</span>}
                                            {e.hasStanding && <span style={tag}>Stání</span>}
                                            <span style={tag}>{e.available}/{e.total} dostupných</span>
                                        </div>
                                    </div>

                                    <div style={actions}>
                                        <Link to={`/events/${e.id}`} style={{ ...ghostBtn, textDecoration: "none" }}>Detail</Link>
                                        <button style={primaryBtn} onClick={() => nav(`/events/${e.id}`)}>Koupit vstupenky</button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {(pageData?.totalPages ?? 1) > 1 && (
                            <div style={pagerRow}>
                                <button style={ghostBtn} disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Předchozí</button>
                                <div style={{ color: "#a7b0c0", fontSize: 13 }}>
                                    Stránka <strong>{page}</strong> / {pageData?.totalPages ?? 1}
                                </div>
                                <button style={ghostBtn} disabled={page >= (pageData?.totalPages ?? 1)} onClick={() => setPage(p => Math.min((pageData?.totalPages ?? 1), p + 1))}>Další</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}