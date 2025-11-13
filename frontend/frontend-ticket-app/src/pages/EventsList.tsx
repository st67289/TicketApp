import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    padding: "80px 24px 40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial",
};

const container: React.CSSProperties = { width: "min(1100px, 94vw)", margin: "0 auto" };

const h1: React.CSSProperties = { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: .2 };
const sub: React.CSSProperties = { margin: "6px 0 18px", color: "#a7b0c0", fontSize: 14 };

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
    gridTemplateColumns: "1.6fr 1fr 1fr 1fr auto",
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

const checkboxRow: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 };
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

const card: React.CSSProperties = { ...panel, padding: 16 };
const rowTop: React.CSSProperties = { display: "grid", gap: 6 };
const evName: React.CSSProperties = { fontWeight: 800, fontSize: 18, margin: 0 };
const evTime: React.CSSProperties = { fontWeight: 200, fontSize: 14, margin: 0 };
const meta: React.CSSProperties = { color: "#a7b0c0", fontSize: 13 };

const tagRow: React.CSSProperties = { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" };
const tag: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(255,255,255,.05)",
    fontSize: 12,
    color: "#cfd6e4",
};

const actions: React.CSSProperties = { display: "flex", gap: 10, marginTop: 12 };
const footerRow: React.CSSProperties = { marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#a7b0c0", fontSize: 12 };
const pagerRow: React.CSSProperties = { marginTop: 14, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" };

const BACKEND_URL = "http://localhost:8080";

// ===== typy podle backendu =====
type VenueShort = { id: number; name: string; address?: string | null };
type EventListDto = {
    id: number;
    name: string;
    startTime: string;
    venue?: VenueShort | null;
    hasStanding: boolean;
    hasSeating: boolean;
    fromPrice?: number | null; // BigDecimal -> number
    available: number;
    total: number;
};
type PageResp<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // 0-based
    size: number;
    first: boolean;
    last: boolean;
};

type SortKey = "dateAsc" | "dateDesc" | "priceAscFE" | "priceDescFE";

function dayStartISO(d: string) { return d ? `${d}T00:00:00` : ""; }
function dayEndISO(d: string)   { return d ? `${d}T23:59:59` : ""; }

export default function EventsList() {
    const nav = useNavigate();

    // filtry
    const [q, setQ] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [priceMax, setPriceMax] = useState<string>("");
    const [onlySeating, setOnlySeating] = useState(false);
    const [onlyStanding, setOnlyStanding] = useState(false);
    const [sort, setSort] = useState<SortKey>("dateAsc");

    // stránkování (backend)
    const [page, setPage] = useState(1);       // UI 1-based
    const [pageSize, setPageSize] = useState(12);

    // data
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState<PageResp<EventListDto> | null>(null);
    const [error, setError] = useState<string>("");

    const backendSort = useMemo(() => {
        // FE price sort = jen lokální v rámci aktuální stránky
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
            if (dateFrom) params.set("from", dayStartISO(dateFrom));
            if (dateTo) params.set("to", dayEndISO(dateTo));
            if (priceMax) params.set("priceMax", priceMax);
            if (onlySeating) params.set("hasSeating", "true");
            if (onlyStanding) params.set("hasStanding", "true");
            params.set("page", String(page - 1)); // backend 0-based
            params.set("size", String(pageSize));
            params.set("sort", backendSort);

            const res = await fetch(`${BACKEND_URL}/api/events?` + params.toString());
            if (!res.ok) throw new Error("Nelze načíst akce");
            const data: PageResp<EventListDto> = await res.json();
            setPageData(data);
            // pokud by UI page přestřelila, uprav
            if (data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
        } catch (e: any) {
            setError(e?.message || "Chyba při načítání");
            setPageData(null);
        } finally {
            setLoading(false);
        }
    };

    // načítání při změně filtrů/stránky/sortování
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, dateFrom, dateTo, priceMax, onlySeating, onlyStanding, page, pageSize, backendSort]);

    // při změně filtrů resetuj na 1. stránku
    useEffect(() => { setPage(1); }, [q, dateFrom, dateTo, priceMax, onlySeating, onlyStanding, sort]);

    // FE price řazení jen v rámci aktuální stránky:
    const contentSorted = useMemo(() => {
        const c = pageData?.content ?? [];
        if (sort === "priceAscFE" || sort === "priceDescFE") {
            return [...c].sort((a, b) => {
                const aa = a.fromPrice ?? Number.POSITIVE_INFINITY;
                const bb = b.fromPrice ?? Number.POSITIVE_INFINITY;
                return sort === "priceAscFE" ? aa - bb : bb - aa;
            });
        }
        return c;
    }, [pageData, sort]);

    function resetFilters() {
        setQ("");
        setDateFrom("");
        setDateTo("");
        setPriceMax("");
        setOnlySeating(false);
        setOnlyStanding(false);
        setSort("dateAsc");
    }

    return (
        <div style={wrap}>
            <Navbar />

            <div style={container}>
                <div style={{ ...panel, marginBottom: 14 }}>
                    <h1 style={h1}>Akce a koncerty</h1>

                    <div style={filtersGrid}>
                        <div>
                            <label style={label}>Hledat</label>
                            <input style={input} placeholder="např. Imagine Dragons…" value={q} onChange={e => setQ(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Datum od</label>
                            <input style={input} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Datum do</label>
                            <input style={input} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Cena do</label>
                            <input style={input} type="number" placeholder="Kč" min={0} value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                        </div>

                        <div>
                            <label style={label}>Řazení</label>
                            <select style={select} value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                                <option value="dateAsc">Datum ↑ (BE)</option>
                                <option value="dateDesc">Datum ↓ (BE)</option>
                                <option value="priceAscFE">Cena ↑ (FE)</option>
                                <option value="priceDescFE">Cena ↓ (FE)</option>
                            </select>
                        </div>
                    </div>

                    <div style={checkboxRow}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <input type="checkbox" checked={onlySeating} onChange={e => setOnlySeating(e.target.checked)} />
                            Jen sezení
                        </label>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <input type="checkbox" checked={onlyStanding} onChange={e => setOnlyStanding(e.target.checked)} />
                            Jen stání
                        </label>

                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
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

                {loading ? (
                    <div style={{ ...panel, textAlign: "center" }}>Načítám…</div>
                ) : error ? (
                    <div style={{ ...panel, color: "#fca5a5" }}>{error}</div>
                ) : (
                    <div style={{ ...panel }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#a7b0c0", fontSize: 13 }}>
                            <div>
                                Nalezeno celkem: <strong>{pageData?.totalElements ?? 0}</strong>
                            </div>
                            <div>
                                Stránka <strong>{(pageData?.number ?? 0) + 1}</strong> / {pageData?.totalPages ?? 1}
                            </div>
                        </div>

                        <div style={listGrid}>
                            {contentSorted.length === 0 && (
                                <div style={{ gridColumn: "1 / -1", color: "#a7b0c0" }}>Nic nenalezeno.</div>
                            )}

                            {contentSorted.map(e => (
                                <article key={e.id} style={card}>
                                    <div style={rowTop}>
                                        <h2 style={evName}>{e.name}</h2>
                                        <h3 style={evTime}>{formatDateRange(e.startTime)}</h3>
                                        <div style={meta}>
                                             {e.venue?.name ?? "—"}{e.venue?.address ? `, ${e.venue.address}` : ""}
                                        </div>
                                    </div>

                                    <div style={tagRow}>
                                        {typeof e.fromPrice === "number" && <span style={tag}>od {e.fromPrice.toFixed(0)} Kč</span>}
                                        {e.hasSeating && <span style={tag}>Sezení</span>}
                                        {e.hasStanding && <span style={tag}>Stání</span>}
                                        <span style={tag}>{e.available}/{e.total} dostupných</span>
                                    </div>

                                    <div style={actions}>
                                        <Link to={`/events/${e.id}`} style={{ ...ghostBtn, textDecoration: "none" }}>Detail</Link>
                                        <button style={primaryBtn} onClick={() => nav(`/events/${e.id}`)}>Koupit vstupenky</button>
                                    </div>

                                    <div style={footerRow}>
                                        <span>ID: {e.id} (dev)</span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pager */}
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

function formatDateRange(startIso?: string) {
    if (!startIso) return "—";
    try {
        const s = new Date(startIso);
        const intl = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
        return intl.format(s);
    } catch {
        return startIso;
    }
}
