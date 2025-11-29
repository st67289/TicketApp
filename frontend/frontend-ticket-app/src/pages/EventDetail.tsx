import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// =================================================================
// STYLY
// =================================================================
const wrap: React.CSSProperties = { minHeight: "100dvh", padding: "80px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(1000px, 94vw)", margin: "0 auto", display: "grid", gap: 24 };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { margin: "0 0 10px 0", fontSize: 28, fontWeight: 800 };
const meta: React.CSSProperties = { color: "#a7b0c0", marginBottom: 20, fontSize: 14, display: "flex", gap: 12, alignItems: "center" };

const notificationBase: React.CSSProperties = { padding: "16px 20px", borderRadius: 12, marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid transparent", animation: "fadeIn 0.3s ease-in-out" };
const errorStyle: React.CSSProperties = { ...notificationBase, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" };
const successStyle: React.CSSProperties = { ...notificationBase, background: "rgba(34, 211, 238, 0.15)", border: "1px solid rgba(34, 211, 238, 0.3)", color: "#22d3ee" };
const closeBtn: React.CSSProperties = { background: "transparent", border: 0, color: "inherit", fontSize: 20, cursor: "pointer", padding: "0 0 0 16px", fontWeight: "bold" };

const mapWrapper: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: 16, overflowX: "auto" };
const rowFlex: React.CSSProperties = { display: "flex", gap: 6, justifyContent: "center" };

const seatBox = (status: "free" | "taken" | "selected"): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700,
    cursor: status === "taken" ? "not-allowed" : "pointer",
    background: status === "taken" ? "#333" : (status === "selected" ? "#22d3ee" : "rgba(255,255,255,0.05)"),
    color: status === "selected" ? "#000" : (status === "taken" ? "#555" : "#fff"),
    border: status === "selected" ? "0" : (status === "taken" ? "1px solid #333" : "1px solid rgba(255,255,255,0.2)"),
    boxShadow: status === "selected" ? "0 0 15px rgba(34,211,238,0.4)" : "none",
    transition: "all 0.2s"
});

const loadingStyle: React.CSSProperties = { ...wrap, padding: "100px 24px 40px", textAlign: "center" };
const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16, marginTop: 16 };
const inputQty: React.CSSProperties = { padding: "10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)", color: "white", width: 60, textAlign: "center", fontSize: 16, fontWeight: "bold" };

const BACKEND_URL = "http://localhost:8080";

type Venue = { id: number; name: string; address: string; seatingPlanJson?: string };
type EventDetailDto = {
    id: number; name: string; startTime: string; venue: Venue; standingPrice?: number; seatingPrice?: number; description?: string;
};
type SeatDto = { id: number; seatRow: string; seatNumber: string };
type PlanRow = { label: string; count: number };
type Notification = { type: "error" | "success"; message: string } | null;

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    let isAdmin = false;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            isAdmin = payload.role === 'ADMINISTRATOR';
        } catch { /* empty */ }
    }

    const [event, setEvent] = useState<EventDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [venueSeats, setVenueSeats] = useState<SeatDto[]>([]);
    const [occupiedIds, setOccupiedIds] = useState<number[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [standingQty, setStandingQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [notification, setNotification] = useState<Notification>(null);

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const resEv = await fetch(`${BACKEND_URL}/api/events/${id}`);
            if (!resEv.ok) throw new Error("Akce nenalezena nebo nelze načíst.");
            const evData: EventDetailDto = await resEv.json();
            setEvent(evData);

            if (evData.seatingPrice) {
                const resSeats = await fetch(`${BACKEND_URL}/api/venues/${evData.venue.id}/seats`);
                const resOcc = await fetch(`${BACKEND_URL}/api/events/${id}/occupied-seats`);
                if (resSeats.ok && resOcc.ok) {
                    setVenueSeats(await resSeats.json());
                    setOccupiedIds(await resOcc.json());
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) setError(error.message);
            else setError("Neznámá chyba při načítání.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (actionType: "STANDING" | "SEATING") => {
        if (isAdmin) return;
        setNotification(null);

        if (!event || !event.id) {
            setNotification({ type: "error", message: "Data o akci nejsou načtena." });
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth/login", { state: { from: `/events/${id}` } });
            return;
        }

        if (actionType === "SEATING" && selectedSeatIds.length === 0) {
            setNotification({ type: "error", message: "Musíte vybrat alespoň jedno místo." });
            return;
        }

        setAdding(true);
        try {
            if (actionType === "STANDING") {
                const res = await fetch(`${BACKEND_URL}/api/carts/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ eventId: event.id, quantity: standingQty })
                });

                if (!res.ok) {
                    const errJson = await res.json();
                    throw new Error(errJson.detail || "Chyba při přidávání lístků na stání.");
                }

            } else {
                // SEATING BATCH
                const res = await fetch(`${BACKEND_URL}/api/carts/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ eventId: event.id, seatIds: selectedSeatIds })
                });

                if (!res.ok) {
                    const json = await res.json();
                    const msg = json.detail || json.title || "Některá sedadla jsou již obsazena.";
                    setNotification({ type: "error", message: msg });

                    // --- ZMĚNA: Deselect all (vymazat výběr) ---
                    setSelectedSeatIds([]);

                    loadData(); // Obnovit mapu (aby se ukázalo, co je nově zabrané)
                    return;
                }
            }

            navigate("/cart");

        } catch (e) {
            if (e instanceof Error) setNotification({ type: "error", message: e.message });
            else setNotification({ type: "error", message: "Chyba komunikace se serverem." });
        } finally {
            setAdding(false);
        }
    };

    const toggleSeat = (seatId: number) => {
        if (isAdmin) return;
        setNotification(null);
        setSelectedSeatIds(prev => {
            if (prev.includes(seatId)) return prev.filter(id => id !== seatId);
            else {
                if (prev.length >= 6) {
                    setNotification({ type: "error", message: "Můžete vybrat maximálně 6 sedadel." });
                    return prev;
                }
                return [...prev, seatId];
            }
        });
    };

    const renderMap = () => {
        if (!event?.venue.seatingPlanJson) return <div style={{color:"#a7b0c0"}}>Chybí data pro mapu (JSON).</div>;
        let rowsDef: PlanRow[] = [];
        try { rowsDef = JSON.parse(event.venue.seatingPlanJson).rows || []; }
        catch { return <div style={{color:"#fca5a5"}}>Chyba v datech mapy (neplatný JSON).</div>; }

        return (
            <div style={mapWrapper}>
                <div style={{width: "60%", height: 30, background: "#333", borderRadius: "0 0 30px 30px", marginBottom: 20, textAlign: "center", lineHeight: "30px", fontSize: 11, color: "#666", letterSpacing: 2}}>PODIUM</div>
                {rowsDef.map((rowDef, i) => {
                    const rowSeats = venueSeats
                        .filter(s => s.seatRow === rowDef.label)
                        .sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
                    if (rowSeats.length === 0) return null;
                    return (
                        <div key={i} style={rowFlex}>
                            <div style={{width: 20, textAlign: "center", lineHeight: "32px", fontSize: 12, color: "#666"}}>{rowDef.label}</div>
                            {rowSeats.map(seat => {
                                const isTaken = occupiedIds.includes(seat.id);
                                const isSelected = selectedSeatIds.includes(seat.id);
                                const status = isTaken ? "taken" : (isSelected ? "selected" : "free");
                                return (
                                    <div key={seat.id} style={{ ...seatBox(status), cursor: (isTaken || isAdmin) ? "not-allowed" : "pointer" }}
                                         onClick={() => !isTaken && toggleSeat(seat.id)}>
                                        {seat.seatNumber}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
                <div style={{display: "flex", gap: 20, marginTop: 20, fontSize: 12, color: "#aaa"}}>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={seatBox("free")}></div> Volné</div>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={seatBox("taken")}></div> Obsazené</div>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={seatBox("selected")}></div> Vybrané</div>
                </div>
            </div>
        );
    };

    if (loading) return <div style={loadingStyle}>Načítám detail akce...</div>;
    if (error || !event) return <div style={{...loadingStyle, color: "#fca5a5"}}>Chyba: {error}</div>;

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                {notification && (
                    <div style={notification.type === 'error' ? errorStyle : successStyle}>
                        <span>{notification.type === 'error' ? '⚠️ ' : '✅ '} {notification.message}</span>
                        <button style={closeBtn} onClick={() => setNotification(null)}>×</button>
                    </div>
                )}
                <div style={panel}>
                    <h1 style={h1}>{event.name}</h1>
                    <div style={meta}>
                        <span>🗓 {new Date(event.startTime).toLocaleString("cs-CZ")}</span>
                        <span>📍 {event.venue.name}, {event.venue.address}</span>
                    </div>
                    <p style={{lineHeight: 1.6, color: "#cfd6e4"}}>{event.description || "Bez popisu"}</p>
                </div>
                {event.standingPrice && (
                    <div style={panel}>
                        <h2 style={{marginTop: 0, fontSize: 20}}>Vstupenky na stání</h2>
                        <div style={{display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 16}}>
                            <div style={{fontSize: 24, fontWeight: 800, color: "#22d3ee"}}>{event.standingPrice} Kč</div>
                            <div style={{display: "flex", alignItems: "center", gap: 10}}>
                                <span style={{fontSize: 14, color: "#a7b0c0"}}>Počet:</span>
                                <input type="number" min={1} max={10} style={inputQty} value={standingQty} onChange={e => setStandingQty(Number(e.target.value))} disabled={isAdmin} />
                            </div>
                            <button style={{ ...btnPrimary, marginTop: 0, opacity: isAdmin ? 0.5 : 1, cursor: isAdmin ? "not-allowed" : "pointer", filter: isAdmin ? "grayscale(100%)" : "none" }}
                                    onClick={() => handleAddToCart("STANDING")} disabled={adding || isAdmin}>
                                {isAdmin ? "Admin nemůže nakupovat" : (adding ? "Čekejte..." : "Do košíku")}
                            </button>
                        </div>
                    </div>
                )}
                {event.seatingPrice && (
                    <div style={panel}>
                        <h2 style={{marginTop: 0, fontSize: 20}}>Vstupenky na sezení</h2>
                        <p style={{color: "#a7b0c0", marginBottom: 20}}>Vyberte místo na plánku sálu. Cena: <strong style={{color: "#fff"}}>{event.seatingPrice} Kč</strong></p>
                        {renderMap()}
                        <div style={{textAlign: "right", marginTop: 20}}>
                            <button style={{ ...btnPrimary, opacity: (selectedSeatIds.length > 0 && !isAdmin) ? 1 : 0.5, cursor: (selectedSeatIds.length > 0 && !isAdmin) ? "pointer" : "not-allowed", filter: isAdmin ? "grayscale(100%)" : "none" }}
                                    disabled={selectedSeatIds.length === 0 || adding || isAdmin} onClick={() => handleAddToCart("SEATING")}>
                                {isAdmin ? "Admin nemůže nakupovat" : (adding ? "Zpracovávám..." : (selectedSeatIds.length > 0 ? `Koupit ${selectedSeatIds.length} vybraná místa` : "Vyberte místa na mapě"))}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}