import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// =================================================================
// STYLY
// =================================================================
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 16, tableLayout: 'fixed' };
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.18)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 14, verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
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

// Styly pro modální okno
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', zIndex: 100 };
const modalContent: React.CSSProperties = { background: "#181d2f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, width: 'min(700px, 90vw)', boxShadow: "0 10px 30px rgba(0,0,0,.35)", maxHeight: '90vh', overflowY: 'auto' };
const formGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const formField: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const formLabel: React.CSSProperties = { fontSize: 13, color: "#a7b0c0" };
const formInput: React.CSSProperties = { appearance: "none", width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#e6e9ef", outline: "none" };
const formTextarea: React.CSSProperties = { ...formInput, minHeight: '100px', fontFamily: 'sans-serif' };
const fullWidthField: React.CSSProperties = { ...formField, gridColumn: '1 / -1' };

const BACKEND_URL = "http://localhost:8080";

type VenueShortDto = { id: number; name: string; };

// Použijeme EventListDto pro seznam (to vrací endpoint /api/events)
type EventListDto = {
    id: number;
    name: string;
    venue: VenueShortDto;
    startTime: string;
    // další pole...
};

type EventDetailDto = {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string | null;
    venue: VenueShortDto;
    standingPrice: number | null;
    seatingPrice: number | null;
};

type EventFormData = {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    venueId: number | string;
    standingPrice: number | null;
    seatingPrice: number | null;
};

const initialFormData: EventFormData = { name: '', description: '', startTime: '', endTime: '', venueId: '', standingPrice: null, seatingPrice: null };

type PageResponse<T> = {
    content: T[];
    last: boolean;
    number: number;
};

const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });
};
const toDateTimeLocal = (isoString: string | null) => {
    if (!isoString) return '';
    return isoString.slice(0, 16);
};

export default function AdminEvents() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const [events, setEvents] = useState<EventListDto[]>([]); // Seznam používá ListDto
    const [venues, setVenues] = useState<VenueShortDto[]>([]);

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // Trigger pro refresh dat (použijeme po uložení)
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null); // Ukládáme jen ID pro editaci
    const [formData, setFormData] = useState<EventFormData>(initialFormData);

    // 1. Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== debouncedTerm) {
                setDebouncedTerm(searchTerm);
                setPage(0);
                setEvents([]);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, debouncedTerm]);

    // 2. Fetch Events
    useEffect(() => {
        const fetchEvents = async () => {
            if (page === 0) setLoading(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/auth/login", { replace: true }); return; }

                // Parametr 'q' se mapuje na EventFilter.q v backendu
                const query = new URLSearchParams({
                    page: page.toString(),
                    size: "20",
                    sort: "id,asc",
                    q: debouncedTerm
                });

                const res = await fetch(`${BACKEND_URL}/api/events?${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Nepodařilo se načíst akce.");
                const data: PageResponse<EventListDto> = await res.json();

                if (page === 0) {
                    setEvents(data.content);
                } else {
                    setEvents(prev => [...prev, ...data.content]);
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

        fetchEvents();
    }, [debouncedTerm, page, lastUpdate, navigate]); // Přidáno lastUpdate do závislostí

    // 3. Fetch Venues (pro dropdown v modálu) - stačí jednou
    useEffect(() => {
        const fetchVenues = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await fetch(`${BACKEND_URL}/api/admin/venues?size=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Admin endpoint vrací Page, takže data.content
                    setVenues(data.content || []);
                }
            } catch (e) {
                console.error("Failed to load venues", e);
            }
        };
        fetchVenues();
    }, []);

    const handleLoadMore = () => {
        setLoadingMore(true);
        setPage(prev => prev + 1);
    };

    // --- Modal Logic ---

    const openModalForNew = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openModalForEdit = async (eventId: number) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const detail: EventDetailDto = await res.json();
                setEditingId(detail.id);
                setFormData({
                    name: detail.name,
                    description: detail.description,
                    startTime: toDateTimeLocal(detail.startTime),
                    endTime: toDateTimeLocal(detail.endTime),
                    venueId: detail.venue.id,
                    standingPrice: detail.standingPrice,
                    seatingPrice: detail.seatingPrice,
                });
                setIsModalOpen(true);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert("Nepodařilo se načíst detail akce.");
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumberInput = type === 'number' && name.toLowerCase().includes('price');
        setFormData(prev => ({
            ...prev,
            [name]: isNumberInput ? (value === '' ? null : parseFloat(value)) : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const method = editingId ? 'PATCH' : 'POST';
        const url = editingId ? `${BACKEND_URL}/api/events/${editingId}` : `${BACKEND_URL}/api/events`;

        const body = {
            ...formData,
            venueId: Number(formData.venueId),
            startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
            endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: "Neznámá chyba" }));
                throw new Error(errData.message || "Uložení se nezdařilo.");
            }

            // Po uložení zavřeme modál a obnovíme data
            setIsModalOpen(false);
            setPage(0);
            setEvents([]); // Vyčistit seznam pro nové načtení
            setLastUpdate(Date.now()); // Spustí useEffect

        } catch (err: unknown) {
            if (err instanceof Error) alert(`Chyba: ${err.message}`);
            else alert("Došlo k neznámé chybě.");
        }
    };

    const handleDelete = async (eventId: number) => {
        if (window.confirm("Opravdu chcete smazat tuto akci? Budou smazány i všechny související vstupenky.")) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ message: "Neznámá chyba" }));
                    throw new Error(errData.message || "Smazání se nezdařilo.");
                }
                // Odstranit lokálně
                setEvents(prev => prev.filter(e => e.id !== eventId));
            } catch (err: unknown) {
                if (err instanceof Error) alert(`Chyba: ${err.message}`);
                else alert("Došlo k neznámé chybě.");
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button style={primaryBtn} onClick={openModalForNew}>+ Přidat novou akci</button>
            </div>

            <input
                type="text"
                placeholder="Hledat akci (název, místo, ID)..."
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
                            <th style={{...th, width: 60}}>ID</th>
                            <th style={th}>Název</th>
                            <th style={th}>Místo konání</th>
                            <th style={th}>Začátek</th>
                            <th style={{...th, width: 180}}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.length > 0 ? (
                            events.map(event => (
                                <tr key={event.id}>
                                    <td style={td}>{event.id}</td>
                                    <td style={td}>{event.name}</td>
                                    <td style={td}>{event.venue?.name || '-'}</td>
                                    <td style={td}>{formatDateTime(event.startTime)}</td>
                                    <td style={td}>
                                        <div style={buttonBar}>
                                            <button style={actionBtn} onClick={() => openModalForEdit(event.id)}>Upravit</button>
                                            <button style={dangerBtn} onClick={() => handleDelete(event.id)}>Smazat</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{...td, textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádná akce neodpovídá "${searchTerm}"` : "Žádná data."}
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
                            {loadingMore ? "Načítám..." : "Načíst další akce"}
                        </button>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>{editingId ? 'Upravit akci' : 'Nová akci'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={formGrid}>
                                <div style={fullWidthField}>
                                    <label style={formLabel}>Název akce</label>
                                    <input style={formInput} name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div style={fullWidthField}>
                                    <label style={formLabel}>Popis</label>
                                    <textarea style={formTextarea} name="description" value={formData.description} onChange={handleFormChange} />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Začátek</label>
                                    <input style={formInput} type="datetime-local" name="startTime" value={formData.startTime} onChange={handleFormChange} required />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Konec (volitelné)</label>
                                    <input style={formInput} type="datetime-local" name="endTime" value={formData.endTime} onChange={handleFormChange} />
                                </div>
                                <div style={fullWidthField}>
                                    <label style={formLabel}>Místo konání</label>
                                    <select style={formInput} name="venueId" value={formData.venueId} onChange={handleFormChange} required>
                                        <option value="" disabled>-- Vyberte místo --</option>
                                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Cena stání (Kč)</label>
                                    <input style={formInput} type="number" name="standingPrice" value={formData.standingPrice ?? ''} onChange={handleFormChange} min="0" placeholder="např. 590" />
                                </div>
                                <div style={formField}>
                                    <label style={formLabel}>Cena sezení (Kč)</label>
                                    <input style={formInput} type="number" name="seatingPrice" value={formData.seatingPrice ?? ''} onChange={handleFormChange} min="0" placeholder="např. 890" />
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