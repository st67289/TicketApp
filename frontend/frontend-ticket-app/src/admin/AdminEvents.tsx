import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/AdminEvents.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

type VenueShortDto = { id: number; name: string; };

type EventListDto = {
    id: number;
    name: string;
    venue: VenueShortDto;
    startTime: string;
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

    const [events, setEvents] = useState<EventListDto[]>([]);
    const [venues, setVenues] = useState<VenueShortDto[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<EventFormData>(initialFormData);

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

    useEffect(() => {
        const fetchEvents = async () => {
            if (page === 0) setLoading(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/auth/login", { replace: true }); return; }

                const query = new URLSearchParams({
                    page: page.toString(),
                    size: "10",
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
    }, [debouncedTerm, page, lastUpdate, navigate]);

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

            setIsModalOpen(false);
            setPage(0);
            setEvents([]);
            setLastUpdate(Date.now());

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
                setEvents(prev => prev.filter(e => e.id !== eventId));
            } catch (err: unknown) {
                if (err instanceof Error) alert(`Chyba: ${err.message}`);
                else alert("Došlo k neznámé chybě.");
            }
        }
    };

    return (
        <div>
            <div className={styles.headerActions}>
                <button className={styles.primaryBtn} onClick={openModalForNew}>+ Přidat novou akci</button>
            </div>

            <input
                type="text"
                placeholder="Hledat akci (název, místo, ID)..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && page === 0 ? (
                <div style={{textAlign: 'center', padding: 20}}>Načítám data...</div>
            ) : error ? (
                <div style={{ color: "#fca5a5" }}>{error}</div>
            ) : (
                <>
                    {/* --- TABLE FOR DESKTOP --- */}
                    <table className={styles.desktopTable}>
                        <thead>
                        <tr>
                            <th className={styles.th} style={{width: 60}}>ID</th>
                            <th className={styles.th}>Název</th>
                            <th className={styles.th}>Místo konání</th>
                            <th className={styles.th}>Začátek</th>
                            <th className={styles.th} style={{width: 180}}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.length > 0 ? (
                            events.map(event => (
                                <tr key={event.id}>
                                    <td className={styles.td}>{event.id}</td>
                                    <td className={styles.td}>{event.name}</td>
                                    <td className={styles.td}>{event.venue?.name || '-'}</td>
                                    <td className={styles.td}>{formatDateTime(event.startTime)}</td>
                                    <td className={styles.td}>
                                        <div className={styles.buttonBar}>
                                            <button className={styles.actionBtn} onClick={() => openModalForEdit(event.id)}>Upravit</button>
                                            <button className={styles.dangerBtn} onClick={() => handleDelete(event.id)}>Smazat</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.td} style={{textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádná akce neodpovídá "${searchTerm}"` : "Žádná data."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* --- LIST FOR MOBILE --- */}
                    <div className={styles.mobileList}>
                        {events.length > 0 ? (
                            events.map(event => (
                                <div key={event.id} className={styles.mobileCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{event.name}</div>
                                        <div style={{fontSize: 12, color: "#a7b0c0"}}>#{event.id}</div>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        📍 {event.venue?.name || '-'}<br/>
                                        🗓 {formatDateTime(event.startTime)}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.actionBtn} onClick={() => openModalForEdit(event.id)}>Upravit</button>
                                        <button className={styles.dangerBtn} onClick={() => handleDelete(event.id)}>Smazat</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: "center", color: "#a7b0c0", padding: 20}}>
                                {searchTerm ? `Žádná akce neodpovídá "${searchTerm}"` : "Žádná data."}
                            </div>
                        )}
                    </div>

                    {!isLastPage && (
                        <button
                            onClick={handleLoadMore}
                            className={styles.loadMoreBtn}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Načítám..." : "Načíst další akce"}
                        </button>
                    )}
                </>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>{editingId ? 'Upravit akci' : 'Nová akce'}</h3>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Název akce</label>
                                    <input className={styles.formInput} name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Popis</label>
                                    <textarea className={styles.formTextarea} name="description" value={formData.description} onChange={handleFormChange} />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Začátek</label>
                                    <input className={styles.formInput} type="datetime-local" name="startTime" value={formData.startTime} onChange={handleFormChange} required />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Konec (volitelné)</label>
                                    <input className={styles.formInput} type="datetime-local" name="endTime" value={formData.endTime} onChange={handleFormChange} />
                                </div>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Místo konání</label>
                                    <select className={styles.formInput} name="venueId" value={formData.venueId} onChange={handleFormChange} required>
                                        <option value="" disabled>-- Vyberte místo --</option>
                                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Cena stání (Kč)</label>
                                    <input className={styles.formInput} type="number" name="standingPrice" value={formData.standingPrice ?? ''} onChange={handleFormChange} min="0" placeholder="např. 590" />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Cena sezení (Kč)</label>
                                    <input className={styles.formInput} type="number" name="seatingPrice" value={formData.seatingPrice ?? ''} onChange={handleFormChange} min="0" placeholder="např. 890" />
                                </div>
                            </div>
                            <div className={styles.buttonBar} style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button type="button" className={styles.actionBtn} onClick={() => setIsModalOpen(false)}>Zrušit</button>
                                <button type="submit" className={styles.primaryBtn}>Uložit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}