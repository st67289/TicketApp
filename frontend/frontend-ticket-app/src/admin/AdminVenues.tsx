// src/admin/AdminVenues.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// =================================================================
// STYLY (půjčené a upravené pro tuto komponentu)
// =================================================================
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 16 };
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.18)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 14, verticalAlign: 'middle' };
const buttonBar: React.CSSProperties = { display: "flex", gap: "10px" };
const primaryBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", color: "#fff", fontWeight: 800, cursor: "pointer" };
const actionBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.04)", color: "#e6e9ef", fontWeight: 700, cursor: "pointer" };
const dangerBtn: React.CSSProperties = { ...actionBtn, borderColor: "rgba(255, 107, 107, .35)", color: "#fca5a5" };

// Styly pro modální okno
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', zIndex: 100 };
const modalContent: React.CSSProperties = { background: "#181d2f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, width: 'min(600px, 90vw)', boxShadow: "0 10px 30px rgba(0,0,0,.35)" };
const formGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const formField: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const formLabel: React.CSSProperties = { fontSize: 13, color: "#a7b0c0" };
const formInput: React.CSSProperties = { appearance: "none", width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#e6e9ef", outline: "none" };
const formTextarea: React.CSSProperties = { ...formInput, minHeight: '120px', fontFamily: 'monospace' };
const fullWidthField: React.CSSProperties = { ...formField, gridColumn: '1 / -1' };

// =================================================================
// TYPY A KONSTANTY
// =================================================================
const BACKEND_URL = "http://localhost:8080";

type VenueDto = {
    id: number;
    name: string;
    address: string;
    standingCapacity: number;
    sittingCapacity: number;
    seatingPlanJson: string;
};

// Vytvoříme typ bez ID pro formulář
type VenueFormData = Omit<VenueDto, 'id'>;

const initialFormData: VenueFormData = {
    name: '',
    address: '',
    standingCapacity: 0,
    sittingCapacity: 0,
    seatingPlanJson: ''
};

// =================================================================
// KOMPONENTA
// =================================================================
export default function AdminVenues() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [venues, setVenues] = useState<VenueDto[]>([]);

    // Stav pro modální okno a formulář
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState<VenueDto | null>(null);
    const [formData, setFormData] = useState<VenueFormData>(initialFormData);

    const fetchVenues = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/auth/login", { replace: true }); return; }

            const res = await fetch(`${BACKEND_URL}/api/admin/venues`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Nepodařilo se načíst místa konání.");
            const data: VenueDto[] = await res.json();
            setVenues(data);
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError("Došlo k neznámé chybě.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            setIsModalOpen(false);
            await fetchVenues();
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
                await fetchVenues();
            } catch (err: unknown) {
                if (err instanceof Error) alert(`Chyba: ${err.message}`);
                else alert("Došlo k neznámé chybě.");
            }
        }
    };


    if (loading) return <div>Načítám data...</div>;
    if (error) return <div style={{ color: "#fca5a5" }}>{error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button style={primaryBtn} onClick={openModalForNew}>+ Přidat nové místo</button>
            </div>

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
                    {venues.map(venue => (
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
                    ))}
                    </tbody>
                </table>
            </div>

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
                                    <input style={formInput} type="number" name="sittingCapacity" value={formData.sittingCapacity} onChange={handleFormChange} min="0" />
                                </div>
                                <div style={fullWidthField}>
                                    <label style={formLabel}>Plán sezení (JSON)</label>
                                    <textarea style={formTextarea} name="seatingPlanJson" value={formData.seatingPlanJson} onChange={handleFormChange} placeholder='{ "rows": [ ... ] }' />
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