import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeatingDesigner from "./SeatingDesigner";
import styles from "./styles/AdminVenues.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

type VenueDto = {
    id: number;
    name: string;
    address: string;
    standingCapacity: number;
    sittingCapacity: number;
    seatingPlanJson: string;
};

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
                setVenues([]);
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

                setVenues(prev => prev.filter(v => v.id !== venueId));

            } catch (err: unknown) {
                if (err instanceof Error) alert(`Chyba: ${err.message}`);
                else alert("Došlo k neznámé chybě.");
            }
        }
    };

    return (
        <div>
            <div className={styles.headerActions}>
                <button className={styles.primaryBtn} onClick={openModalForNew}>+ Přidat nové místo</button>
            </div>

            <input
                type="text"
                placeholder="Hledat místo podle názvu, adresy nebo ID..."
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
                            <th className={styles.th}>ID</th>
                            <th className={styles.th}>Název</th>
                            <th className={styles.th}>Adresa</th>
                            <th className={styles.th}>Kapacita (Stání/Sezení)</th>
                            <th className={styles.th}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {venues.length > 0 ? (
                            venues.map(venue => (
                                <tr key={venue.id}>
                                    <td className={styles.td}>{venue.id}</td>
                                    <td className={styles.td}>{venue.name}</td>
                                    <td className={styles.td}>{venue.address}</td>
                                    <td className={styles.td}>{venue.standingCapacity} / {venue.sittingCapacity}</td>
                                    <td className={styles.td}>
                                        <div className={styles.buttonBar}>
                                            <button className={styles.actionBtn} onClick={() => openModalForEdit(venue)}>Upravit</button>
                                            <button className={styles.dangerBtn} onClick={() => handleDelete(venue.id)}>Smazat</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.td} style={{textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádné místo neodpovídá "${searchTerm}"` : "Žádná data."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* --- LIST FOR MOBILE --- */}
                    <div className={styles.mobileList}>
                        {venues.length > 0 ? (
                            venues.map(venue => (
                                <div key={venue.id} className={styles.mobileCard}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <div className={styles.cardName}>{venue.name}</div>
                                            <div className={styles.cardAddress}>{venue.address}</div>
                                        </div>
                                        <div style={{fontSize: 12, color: "#a7b0c0"}}>#{venue.id}</div>
                                    </div>

                                    <div className={styles.cardStats}>
                                        <div>
                                            <span className={styles.statLabel}>Stání</span>
                                            {venue.standingCapacity}
                                        </div>
                                        <div>
                                            <span className={styles.statLabel}>Sezení</span>
                                            {venue.sittingCapacity}
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button className={styles.actionBtn} onClick={() => openModalForEdit(venue)}>Upravit</button>
                                        <button className={styles.dangerBtn} onClick={() => handleDelete(venue.id)}>Smazat</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: "center", color: "#a7b0c0", padding: 20}}>
                                {searchTerm ? `Žádné místo neodpovídá "${searchTerm}"` : "Žádná data."}
                            </div>
                        )}
                    </div>

                    {!isLastPage && (
                        <button
                            onClick={handleLoadMore}
                            className={styles.loadMoreBtn}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Načítám..." : "Načíst další místa"}
                        </button>
                    )}
                </>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>{editingVenue ? 'Upravit místo konání' : 'Nové místo konání'}</h3>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Název</label>
                                    <input className={styles.formInput} name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Adresa</label>
                                    <input className={styles.formInput} name="address" value={formData.address} onChange={handleFormChange} />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Kapacita stání</label>
                                    <input className={styles.formInput} type="number" name="standingCapacity" value={formData.standingCapacity} onChange={handleFormChange} min="0" />
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Kapacita sezení</label>
                                    <input
                                        className={`${styles.formInput} ${styles.formInputReadOnly}`}
                                        type="number"
                                        name="sittingCapacity"
                                        value={formData.sittingCapacity}
                                        readOnly
                                    />
                                    <div style={{fontSize: 11, color: "#64748b"}}>Vypočítáno automaticky z plánu.</div>
                                </div>
                                <div className={styles.fullWidth}>
                                    <label className={styles.formLabel}>Plán sezení (Editor)</label>

                                    <div className={styles.designerWrapper}>
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
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <details>
                                            <summary style={{ fontSize: 12, color: "#a7b0c0", cursor: "pointer" }}>Zobrazit vygenerovaný JSON</summary>
                                            <textarea
                                                className={styles.formTextarea}
                                                style={{ marginTop: 5, minHeight: 80 }}
                                                name="seatingPlanJson"
                                                value={formData.seatingPlanJson}
                                                readOnly
                                            />
                                        </details>
                                    </div>
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