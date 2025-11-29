import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// =================================================================
// STYLY (Dark Theme / Glassmorphism)
// =================================================================
const wrap: React.CSSProperties = { minHeight: "100dvh", padding: "80px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(1000px, 94vw)", margin: "0 auto", display: "grid", gap: 24 };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { margin: "0 0 10px 0", fontSize: 28, fontWeight: 800 };
const meta: React.CSSProperties = { color: "#a7b0c0", marginBottom: 20, fontSize: 14, display: "flex", gap: 12, alignItems: "center" };

// Styly pro mapu
const mapWrapper: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: 16, overflowX: "auto" };
const rowFlex: React.CSSProperties = { display: "flex", gap: 6, justifyContent: "center" };

// Funkce pro styl sedadla podle stavu
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

// =================================================================
// TYPY DAT
// =================================================================
type Venue = { id: number; name: string; address: string; seatingPlanJson?: string };
type EventDetailDto = {
    id: number;
    name: string;
    startTime: string;
    venue: Venue;
    standingPrice?: number;
    seatingPrice?: number;
    description?: string;
};
type SeatDto = { id: number; seatRow: string; seatNumber: string };
type PlanRow = { label: string; count: number };

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

    // Data
    const [event, setEvent] = useState<EventDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stav pro mapu sezení
    const [venueSeats, setVenueSeats] = useState<SeatDto[]>([]);
    const [occupiedIds, setOccupiedIds] = useState<number[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

    // Stav pro stání
    const [standingQty, setStandingQty] = useState(1);

    // UI stavy
    const [adding, setAdding] = useState(false);

    // 1. Načtení dat po startu
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
                    const seatsData: SeatDto[] = await resSeats.json();
                    const occData: number[] = await resOcc.json();
                    setVenueSeats(seatsData);
                    setOccupiedIds(occData);
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Neznámá chyba při načítání.");
            }
        } finally {
            setLoading(false);
        }
    };

    // 2. Přidání do košíku (UPRAVENO PRO NOVÉ DTO)
    const handleAddToCart = async (actionType: "STANDING" | "SEATING") => {
        if (isAdmin) return;
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth/login", { state: { from: `/events/${id}` } });
            return;
        }

        if (actionType === "SEATING" && selectedSeatIds.length === 0) return;

        setAdding(true);
        try {
            if (actionType === "STANDING") {
                // === STÁNÍ ===
                // Posíláme: eventId + quantity
                // seatId neposíláme (nebo null), backend to podle toho pozná
                const res = await fetch(`${BACKEND_URL}/api/carts/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        eventId: event?.id,
                        quantity: standingQty
                    })
                });

                if (!res.ok) {
                    const errJson = await res.json();
                    throw new Error(errJson.detail || "Chyba při přidávání lístků na stání.");
                }

            } else {
                // === SEZENÍ ===
                // Musíme poslat request pro každé sedadlo zvlášť.
                // Posíláme: eventId + seatId
                // quantity vynecháme (backend si defaultne na 1, ale u sezení je to jedno)

                const requests = selectedSeatIds.map(seatId =>
                    fetch(`${BACKEND_URL}/api/carts/items`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            eventId: event?.id,
                            seatId: seatId
                            // type: "SEATING" už neposíláme
                        })
                    })
                );

                const responses = await Promise.all(requests);

                const failed = responses.some(r => !r.ok);
                if (failed) {
                    const firstError = responses.find(r => !r.ok);
                    let msg = "Některá sedadla se nepodařilo přidat.";
                    if(firstError) {
                        try {
                            const json = await firstError.json();
                            if(json.detail) msg = json.detail;
                        } catch {}
                    }
                    alert(msg);
                    loadData();
                }
            }

            navigate("/cart");

        } catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            } else {
                alert("Chyba komunikace se serverem.");
            }
        } finally {
            setAdding(false);
        }
    };

    const toggleSeat = (seatId: number) => {
        if (isAdmin) return;
        setSelectedSeatIds(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                if (prev.length >= 6) {
                    alert("Můžete vybrat maximálně 6 sedadel.");
                    return prev;
                }
                return [...prev, seatId];
            }
        });
    };

    // 3. Vykreslení mapy
    const renderMap = () => {
        if (!event?.venue.seatingPlanJson) return <div style={{color:"#a7b0c0"}}>Chybí data pro mapu (JSON).</div>;

        let rowsDef: PlanRow[] = [];
        try {
            const parsed = JSON.parse(event.venue.seatingPlanJson);
            rowsDef = parsed.rows || [];
        } catch {
            return <div style={{color:"#fca5a5"}}>Chyba v datech mapy (neplatný JSON).</div>;
        }

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
                                    <div
                                        key={seat.id}
                                        style={{
                                            ...seatBox(status),
                                            cursor: (isTaken || isAdmin) ? "not-allowed" : "pointer"
                                        }}
                                        onClick={() => !isTaken && toggleSeat(seat.id)}
                                        title={`Řada ${seat.seatRow}, Místo ${seat.seatNumber}`}
                                    >
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
                                <input
                                    type="number" min={1} max={10}
                                    style={inputQty}
                                    value={standingQty} onChange={e => setStandingQty(Number(e.target.value))}
                                    disabled={isAdmin}
                                />
                            </div>

                            <button
                                style={{
                                    ...btnPrimary,
                                    marginTop: 0,
                                    opacity: isAdmin ? 0.5 : 1,
                                    cursor: isAdmin ? "not-allowed" : "pointer",
                                    filter: isAdmin ? "grayscale(100%)" : "none"
                                }}
                                onClick={() => handleAddToCart("STANDING")}
                                disabled={adding || isAdmin}
                            >
                                {isAdmin ? "Admin nemůže nakupovat" : (adding ? "Čekejte..." : "Do košíku")}
                            </button>
                        </div>
                    </div>
                )}

                {event.seatingPrice && (
                    <div style={panel}>
                        <h2 style={{marginTop: 0, fontSize: 20}}>Vstupenky na sezení</h2>
                        <p style={{color: "#a7b0c0", marginBottom: 20}}>
                            Vyberte místo na plánku sálu. Cena: <strong style={{color: "#fff"}}>{event.seatingPrice} Kč</strong>
                        </p>

                        {renderMap()}

                        <div style={{textAlign: "right", marginTop: 20}}>
                            <button
                                style={{
                                    ...btnPrimary,
                                    opacity: (selectedSeatIds.length > 0 && !isAdmin) ? 1 : 0.5,
                                    cursor: (selectedSeatIds.length > 0 && !isAdmin) ? "pointer" : "not-allowed",
                                    filter: isAdmin ? "grayscale(100%)" : "none"
                                }}
                                disabled={selectedSeatIds.length === 0 || adding || isAdmin}
                                onClick={() => handleAddToCart("SEATING")}
                            >
                                {isAdmin
                                    ? "Admin nemůže nakupovat"
                                    : (adding
                                            ? "Zpracovávám..."
                                            : (selectedSeatIds.length > 0
                                                ? `Koupit ${selectedSeatIds.length} vybraná místa`
                                                : "Vyberte místa na mapě")
                                    )
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}