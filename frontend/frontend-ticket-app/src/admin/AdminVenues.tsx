// src/admin/AdminVenues.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeatingDesigner from "./SeatingDesigner";

// =================================================================
// STYLY
// =================================================================
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 16 };
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.18)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 14, verticalAlign: 'middle' };
const buttonBar: React.CSSProperties = { display: "flex", gap: "10px" };
const primaryBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", color: "#fff", fontWeight: 800, cursor: "pointer" };
const actionBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.04)", color: "#e6e9ef", fontWeight: 700, cursor: "pointer" };
const dangerBtn: React.CSSProperties = { ...actionBtn, borderColor: "rgba(255, 107, 107, .35)", color: "#fca5a5" };

const searchInput: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: 20,
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
};

const loadMoreBtn: React.CSSProperties = {
    display: "block", width: "100%", padding: "12px", marginTop: 20,
    background: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)",
    borderRadius: 12, color: "#22d3ee", fontWeight: "bold", cursor: "pointer", fontSize: 15
};

const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', zIndex: 100 };
const modalContent: React.CSSProperties = { background: "#181d2f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, width: 'min(600px, 90vw)', boxShadow: "0 10px 30px rgba(0,0,0,.35)", maxHeight: '90vh', overflowY: 'auto' };
const formGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const formField: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const formLabel: React.CSSProperties = { fontSize: 13, color: "#a7b0c0" };
const formInput: React.CSSProperties = { appearance: "none", width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#e6e9ef", outline: "none" };
const formTextarea: React.CSSProperties = { ...formInput, minHeight: '120px', fontFamily: 'monospace' };
const fullWidthField: React.CSSProperties = { ...formField, gridColumn: '1 / -1' };

const BACKEND_URL = "http://localhost:8080";

type VenueDto = {
    id: number;
    name: string;
    address: string;
    standingCapacity: number;
    sittingCapacity: number;
    seatingPlanJson: string;
};

// Typ pro stránkovanou odpověď
type PageResponse<T> = {
    content: T[];
    last: boolean;
    number: number;
};

type VenueFormData = Omit<VenueDto, 'id'>;

const initialFormData: VenueFormData = {
    name: '',
    address: '',
    standingCapacity: 0,
    sittingCapacity: 0,
    seatingPlanJson: ''
};

export default function AdminVenues() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    // Data
    const [venues, setVenues] = useState<VenueDto[]>([]);

    // Vyhledávání a stránkování
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState<VenueDto | null>(null);
    const [formData, setFormData] = useState<VenueFormData>(initialFormData);

    // 1. Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== debouncedTerm) {
                setDebouncedTerm(searchTerm);
                setPage(0);
                setVenues([]); // Reset seznamu při novém hledání
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, debouncedTerm]);

    // 2. Načítání dat
    useEffect(() => {
        const fetchVenues = async () => {
            if (page === 0) setLoading(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/auth/login", { replace: true }); return; }

                const query = new URLSearchParams({
                    page: page.toString(),
                    size: "10",
                    sort: "id,asc",
                    search: debouncedTerm
                });

                const res = await fetch(`${BACKEND_URL}/api/admin/venues?${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Nepodařilo se načíst místa konání.");

                const data: PageResponse<VenueDto> = await res.json();

                if (page === 0) {
                    setVenues(data.content);
                } else {
                    setVenues(prev => [...prev, ...data.content]);
                }

                setIsLastPage(data.last);

            } catch (e: unknown) {
                if (e instanceof Error) setError(e.message);
                else setError("Došlo k neznámé chybě.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchVenues();
    }, [debouncedTerm, page, navigate]);

    const handleLoadMore = () => {
        setLoadingMore(true);
        setPage(prev => prev + 1);
    };

    // Modal Actions
    const openModalForNew = () => {
        setEditingVenue(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openModalForEdit = (venue: VenueDto) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            address: venue.address,
            standingCapacity: venue.standingCapacity,
            sittingCapacity: venue.sittingCapacity,
            seatingPlanJson: venue.seatingPlanJson || ''
        });
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const method = editingVenue ? 'PUT' : 'POST';
        const url = editingVenue ? `${BACKEND_URL}/api/admin/venues/${editingVenue.id}` : `${BACKEND_URL}/api/admin/venues`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: "Neznámá chyba serveru" }));
                throw new Error(errData.message || "Uložení se nezdařilo.");
            }

            const savedVenue = await res.json();
            setIsModalOpen(false);

            // Aktualizace lokálního seznamu bez nutnosti reloadu
            if (editingVenue) {
                setVenues(prev => prev.map(v => v.id === savedVenue.id ? savedVenue : v));
            } else {
                setVenues(prev => [savedVenue, ...prev]);
            }

        } catch (err: unknown) {
            if (err instanceof Error) alert(`Chyba: ${err.message}`);
            else alert("Došlo k neznámé chybě.");
        }
    };

    const handleDelete = async (venueId: number) => {
        if (window.confirm("Opravdu chcete smazat toto místo konání? Akci nelze vrátit.")) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BACKEND_URL}/api/admin/venues/${venueId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ message: "Neznámá chyba serveru" }));
                    throw new Error(errData.message || "Smazání se nezdařilo.");
                }

                // Odstranění z lokálního seznamu
                setVenues(prev => prev.filter(v => v.id !== venueId));

            } catch (err: unknown) {
                if (err instanceof Error) alert(`Chyba: ${err.message}`);
                else alert("Došlo k neznámé chybě.");
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button style={primaryBtn} onClick={openModalForNew}>+ Přidat nové místo</button>
            </div>

            <input
                type="text"
                placeholder="Hledat místo podle názvu, adresy nebo ID..."
                style={searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && page === 0 ? (
                <div style={{textAlign: 'center', padding: 20}}>Načítám data...</div>
            ) : error ? (
                <div style={{ color: "#fca5a5" }}>{error}</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={table}>
                        <thead>
                        <tr>
                            <th style={th}>ID</th>
                            <th style={th}>Název</th>
                            <th style={th}>Adresa</th>
                            <th style={th}>Kapacita (Stání/Sezení)</th>
                            <th style={th}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {venues.length > 0 ? (
                            venues.map(venue => (
                                <tr key={venue.id}>
                                    <td style={td}>{venue.id}</td>
                                    <td style={td}>{venue.name}</td>
                                    <td style={td}>{venue.address}</td>
                                    <td style={td}>{venue.standingCapacity} / {venue.sittingCapacity}</td>
                                    <td style={td}>
                                        <div style={buttonBar}>
                                            <button style={actionBtn} onClick={() => openModalForEdit(venue)}>Upravit</button>
                                            <button style={dangerBtn} onClick={() => handleDelete(venue.id)}>Smazat</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{...td, textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádné místo neodpovídá "${searchTerm}"` : "Žádná data."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {!isLastPage && (
                        <button
                            onClick={handleLoadMore}
                            style={loadMoreBtn}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Načítám..." : "Načíst další místa"}
                        </button>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>{editingVenue ? 'Upravit místo konání' : 'Nové místo konání'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={formGrid}>
                                <div style={formField}>
                                    <label style={formLabel}>Název</label>
                                    <input style={formInput} name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Adresa</label>
                                    <input style={formInput} name="address" value={formData.address} onChange={handleFormChange} />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Kapacita stání</label>
                                    <input style={formInput} type="number" name="standingCapacity" value={formData.standingCapacity} onChange={handleFormChange} min="0" />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Kapacita sezení</label>
                                    <input
                                        style={{ ...formInput, opacity: 0.6, cursor: "not-allowed", background: "rgba(0,0,0,0.2)" }}
                                        type="number"
                                        name="sittingCapacity"
                                        value={formData.sittingCapacity}
                                        readOnly
                                    />
                                    <div style={{fontSize: 11, color: "#64748b"}}>Vypočítáno automaticky z plánu.</div>
                                </div>
                                <div style={fullWidthField}>
                                    <label style={formLabel}>Plán sezení (Editor)</label>

                                    <SeatingDesigner
                                        initialJson={formData.seatingPlanJson || '{"rows":[]}'}
                                        onChange={(newJson) => {
                                            let newTotalSeats = 0;
                                            try {
                                                const parsed = JSON.parse(newJson);
                                                if (Array.isArray(parsed.rows)) {
                                                    newTotalSeats = parsed.rows.reduce((sum: number, row: { count: number | string }) => sum + (Number(row.count) || 0), 0);
                                                }
                                            } catch (e) {
                                                console.error("Chyba při výpočtu kapacity", e);
                                            }

                                            setFormData(prev => ({
                                                ...prev,
                                                seatingPlanJson: newJson,
                                                sittingCapacity: newTotalSeats
                                            }));
                                        }}
                                    />
                                    <div style={{ marginTop: 8 }}>
                                        <details>
                                            <summary style={{ fontSize: 12, color: "#a7b0c0", cursor: "pointer" }}>Zobrazit vygenerovaný JSON</summary>
                                            <textarea
                                                style={{ ...formTextarea, minHeight: "80px", fontSize: "12px", marginTop: 5 }}
                                                name="seatingPlanJson"
                                                value={formData.seatingPlanJson}
                                                readOnly
                                            />
                                        </details>
                                    </div>
                                </div>
                            </div>
                            <div style={{ ...buttonBar, marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" style={actionBtn} onClick={() => setIsModalOpen(false)}>Zrušit</button>
                                <button type="submit" style={primaryBtn}>Uložit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}