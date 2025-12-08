import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./styles/EventDetail.module.css"; // Importujeme styly

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

                    // Deselect all
                    setSelectedSeatIds([]);
                    loadData(); // Refresh mapy
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
            <div className={styles.mapWrapper}>
                <div className={styles.podium}>PODIUM</div>
                <div className={styles.mobileHint}>
                    ↔️ Tažením do stran zobrazíte další místa
                </div>
                {rowsDef.map((rowDef, i) => {
                    const rowSeats = venueSeats
                        .filter(s => s.seatRow === rowDef.label)
                        .sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
                    if (rowSeats.length === 0) return null;
                    return (
                        <div key={i} className={styles.rowFlex}>
                            <div className={styles.rowLabel}>{rowDef.label}</div>
                            {rowSeats.map(seat => {
                                const isTaken = occupiedIds.includes(seat.id);
                                const isSelected = selectedSeatIds.includes(seat.id);

                                // Výběr správné třídy podle stavu
                                let seatClass = styles.seat;
                                if (isTaken) seatClass += ` ${styles.seatTaken}`;
                                else if (isSelected) seatClass += ` ${styles.seatSelected}`;
                                else seatClass += ` ${styles.seatFree}`;

                                return (
                                    <div
                                        key={seat.id}
                                        className={seatClass}
                                        style={{ cursor: (isTaken || isAdmin) ? "not-allowed" : "pointer" }}
                                        onClick={() => !isTaken && toggleSeat(seat.id)}
                                    >
                                        {seat.seatNumber}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.seat} ${styles.seatFree}`}></div> Volné
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.seat} ${styles.seatTaken}`}></div> Obsazené
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.seat} ${styles.seatSelected}`}></div> Vybrané
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className={styles.loadingContainer}>Načítám detail akce...</div>;
    if (error || !event) return <div className={styles.loadingContainer}><span className={styles.errorText}>Chyba: {error}</span></div>;

    // Pomocná třída pro disabled tlačítka
    const getBtnClass = (disabled: boolean) =>
        `${styles.btnPrimary} ${disabled || isAdmin ? styles.btnDisabled : ''}`;

    return (
        <div className={styles.wrap}>
            <Navbar />
            <div className={styles.container}>
                {notification && (
                    <div className={`${styles.notification} ${notification.type === 'error' ? styles.error : styles.success}`}>
                        <span>{notification.type === 'error' ? '⚠️ ' : '✅ '} {notification.message}</span>
                        <button className={styles.closeBtn} onClick={() => setNotification(null)}>×</button>
                    </div>
                )}

                <div className={styles.panel}>
                    <h1 className={styles.h1}>{event.name}</h1>
                    <div className={styles.meta}>
                        <span>🗓 {new Date(event.startTime).toLocaleString("cs-CZ")}</span>
                        <span>📍 {event.venue.name}, {event.venue.address}</span>
                    </div>
                    <p className={styles.description}>{event.description || "Bez popisu"}</p>
                </div>

                {event.standingPrice && (
                    <div className={styles.panel}>
                        <h2 className={styles.sectionTitle}>Vstupenky na stání</h2>
                        <div className={styles.standingRow}>
                            <div className={styles.priceTag}>{event.standingPrice} Kč</div>
                            <div className={styles.qtyWrapper}>
                                <span style={{fontSize: 14, color: "#a7b0c0"}}>Počet:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    className={styles.inputQty}
                                    value={standingQty}
                                    onChange={e => setStandingQty(Number(e.target.value))}
                                    disabled={isAdmin}
                                />
                            </div>
                            <button
                                className={getBtnClass(adding)}
                                onClick={() => handleAddToCart("STANDING")}
                                disabled={adding || isAdmin}
                            >
                                {isAdmin ? "Admin nemůže nakupovat" : (adding ? "Čekejte..." : "Do košíku")}
                            </button>
                        </div>
                    </div>
                )}

                {event.seatingPrice && (
                    <div className={styles.panel}>
                        <h2 className={styles.sectionTitle}>Vstupenky na sezení</h2>
                        <p style={{color: "#a7b0c0", marginBottom: 20}}>
                            Vyberte místo na plánku sálu. Cena: <strong style={{color: "#fff"}}>{event.seatingPrice} Kč</strong>
                        </p>

                        {renderMap()}

                        <div className={styles.btnRight}>
                            <button
                                className={getBtnClass(selectedSeatIds.length === 0 || adding)}
                                disabled={selectedSeatIds.length === 0 || adding || isAdmin}
                                onClick={() => handleAddToCart("SEATING")}
                            >
                                {isAdmin ? "Admin nemůže nakupovat" : (
                                    adding ? "Zpracovávám..." :
                                        (selectedSeatIds.length > 0 ? `Koupit ${selectedSeatIds.length} vybraná místa` : "Vyberte místa na mapě")
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}