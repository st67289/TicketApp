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
    // Barvy: Taken = tmavá šedá, Selected = tyrkysová, Free = průhledná s rámečkem
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
// Fyzické sedadlo z DB
type SeatDto = { id: number; seatRow: string; seatNumber: string };
// Řada z JSON plánku
type PlanRow = { label: string; count: number };

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data
    const [event, setEvent] = useState<EventDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stav pro mapu sezení
    const [venueSeats, setVenueSeats] = useState<SeatDto[]>([]); // Všechna sedadla
    const [occupiedIds, setOccupiedIds] = useState<number[]>([]); // Obsazená ID
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

            // A) Načíst detail eventu
            const resEv = await fetch(`${BACKEND_URL}/api/events/${id}`);
            if (!resEv.ok) throw new Error("Akce nenalezena nebo nelze načíst.");
            const evData: EventDetailDto = await resEv.json();
            setEvent(evData);

            // B) Pokud je to akce na SEZENÍ, načíst mapu a obsazenost
            if (evData.seatingPrice) {
                // 1. Stáhnout seznam fyzických sedadel pro Venue (z VenueControlleru)
                const resSeats = await fetch(`${BACKEND_URL}/api/venues/${evData.venue.id}/seats`);

                // 2. Stáhnout seznam ID obsazených sedadel (z EventControlleru)
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

    // 2. Přidání do košíku
    const handleAddToCart = async (type: "STANDING" | "SEATING") => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth/login", { state: { from: `/events/${id}` } });
            return;
        }

        // Validace před odesláním
        if (type === "SEATING" && selectedSeatIds.length === 0) return;

        setAdding(true);
        try {
            if (type === "STANDING") {
                // Stání pošleme jednou (tam je quantity)
                const res = await fetch(`${BACKEND_URL}/api/carts/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ type: "STANDING", eventId: event?.id, quantity: standingQty })
                });
                if (!res.ok) throw new Error("Chyba při stání");

            } else {
                // Sezení: Musíme poslat request pro každé vybrané sedadlo zvlášť
                // Použijeme Promise.all, aby se to poslalo paralelně (rychleji)
                const requests = selectedSeatIds.map(seatId =>
                    fetch(`${BACKEND_URL}/api/carts/items`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ type: "SEATING", eventId: event?.id, seatId: seatId })
                    })
                );

                const responses = await Promise.all(requests);

                // Zkontrolujeme, jestli všechny prošly
                const failed = responses.some(r => !r.ok);
                if (failed) {
                    alert("Některá sedadla se nepodařilo přidat (možná je někdo právě vyfoukl).");
                    loadData(); // Přenačteme mapu
                    // I tak ale přesměrujeme do košíku s tím, co se povedlo
                }
            }

            navigate("/cart");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert("Chyba komunikace se serverem.");
        } finally {
            setAdding(false);
        }
    };

    // funkce pro přidání označené sedačky do pole (kde jsou místa ke koupi - vybrat jich můžu i víc)
    const toggleSeat = (seatId: number) => {
        setSelectedSeatIds(prev => {
            if (prev.includes(seatId)) {
                // Pokud už je vybrané, odebereme ho
                return prev.filter(id => id !== seatId);
            } else {
                // Jinak ho přidáme (můžeš zde dát limit, např. max 6 lístků)
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
                {/* Podium */}
                <div style={{width: "60%", height: 30, background: "#333", borderRadius: "0 0 30px 30px", marginBottom: 20, textAlign: "center", lineHeight: "30px", fontSize: 11, color: "#666", letterSpacing: 2}}>PODIUM</div>

                {rowsDef.map((rowDef, i) => {
                    // Najdeme fyzická sedadla pro tuto řadu "A", "B"...
                    const rowSeats = venueSeats
                        .filter(s => s.seatRow === rowDef.label)
                        // Seřadíme je podle čísla (seatNumber může být string, tak parsujeme na int)
                        .sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));

                    if (rowSeats.length === 0) return null; // Pokud řada v DB neexistuje, přeskočit

                    return (
                        <div key={i} style={rowFlex}>
                            {/* Label řady */}
                            <div style={{width: 20, textAlign: "center", lineHeight: "32px", fontSize: 12, color: "#666"}}>{rowDef.label}</div>

                            {/* Sedadla */}
                            {rowSeats.map(seat => {
                                const isTaken = occupiedIds.includes(seat.id);
                                const isSelected = selectedSeatIds.includes(seat.id);
                                const status = isTaken ? "taken" : (isSelected ? "selected" : "free");

                                return (
                                    <div
                                        key={seat.id}
                                        style={seatBox(status)}
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

                {/* Legenda */}
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
                {/* 1. HLAVIČKA */}
                <div style={panel}>
                    <h1 style={h1}>{event.name}</h1>
                    <div style={meta}>
                        <span>🗓 {new Date(event.startTime).toLocaleString("cs-CZ")}</span>
                        <span>📍 {event.venue.name}, {event.venue.address}</span>
                    </div>
                    <p style={{lineHeight: 1.6, color: "#cfd6e4"}}>{event.description || "Bez popisu"}</p>
                </div>

                {/* 2. VSTUPENKY NA STÁNÍ (pokud existují) */}
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
                                />
                            </div>

                            <button
                                style={{...btnPrimary, marginTop: 0}}
                                onClick={() => handleAddToCart("STANDING")}
                                disabled={adding}
                            >
                                {adding ? "Čekejte..." : "Do košíku"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. VSTUPENKY NA SEZENÍ (pokud existují) */}
                {event.seatingPrice && (
                    <div style={panel}>
                        <h2 style={{marginTop: 0, fontSize: 20}}>Vstupenky na sezení</h2>
                        <p style={{color: "#a7b0c0", marginBottom: 20}}>
                            Vyberte místo na plánku sálu. Cena: <strong style={{color: "#fff"}}>{event.seatingPrice} Kč</strong>
                        </p>

                        {/* MAPA */}
                        {renderMap()}

                        {/* TLAČÍTKO AKCE */}
                        <div style={{textAlign: "right", marginTop: 20}}>
                            <button
                                style={{
                                    ...btnPrimary,
                                    opacity: selectedSeatIds.length > 0 ? 1 : 0.5,
                                    cursor: selectedSeatIds.length > 0 ? "pointer" : "not-allowed"
                                }}
                                disabled={selectedSeatIds.length === 0 || adding}
                                onClick={() => handleAddToCart("SEATING")}
                            >
                                {adding
                                    ? "Zpracovávám..."
                                    : (selectedSeatIds.length > 0
                                        ? `Koupit ${selectedSeatIds.length} vybraná místa`
                                        : "Vyberte místa na mapě")
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}