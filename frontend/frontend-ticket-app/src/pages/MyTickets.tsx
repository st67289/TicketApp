import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

// Styly (konzistentní)
const wrap: React.CSSProperties = { minHeight: "100dvh", padding: "80px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(900px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { marginTop: 0, fontSize: 28, fontWeight: 800 };

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 20 };
const card: React.CSSProperties = { background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 8 };

const label: React.CSSProperties = { fontSize: 12, color: "#a7b0c0", textTransform: "uppercase", letterSpacing: 0.5 };
const value: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "#fff" };
const qrPlaceholder: React.CSSProperties = { marginTop: 12, height: 120, background: "white", display: "grid", placeItems: "center", color: "black", borderRadius: 8, fontSize: 12 };

const BACKEND_URL = "http://localhost:8080";

type TicketDto = {
    id: number;
    ticketCode: string;
    price: number;
    type: "STANDING" | "SEATING";
    status: string;
    eventName: string;
    eventStart: string;
    venue: { name: string; address: string };
    seatRow?: string;
    seatNumber?: string;
};

export default function MyTickets() {
    const [tickets, setTickets] = useState<TicketDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BACKEND_URL}/api/tickets/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setTickets(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    if (loading) return <div style={{...wrap, textAlign: "center", paddingTop: 100}}>Načítám vstupenky...</div>;

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                <div style={panel}>
                    <h1 style={h1}>Moje vstupenky</h1>

                    {tickets.length === 0 ? (
                        <div style={{color: "#a7b0c0", padding: 20, textAlign: "center"}}>
                            Zatím nemáte žádné vstupenky. <br/>
                            <Link to="/events" style={{color: "#22d3ee"}}>Jít nakupovat</Link>
                        </div>
                    ) : (
                        <div style={grid}>
                            {tickets.map(t => (
                                <div key={t.id} style={card}>
                                    <div>
                                        <div style={label}>Akce</div>
                                        <div style={value}>{t.eventName}</div>
                                    </div>
                                    <div>
                                        <div style={label}>Datum</div>
                                        <div style={value}>{new Date(t.eventStart).toLocaleString("cs-CZ")}</div>
                                    </div>
                                    <div>
                                        <div style={label}>Místo</div>
                                        <div style={value}>{t.venue.name}</div>
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        <div>
                                            <div style={label}>Typ</div>
                                            <div style={value}>
                                                {t.type === "STANDING" ? "Na stání" : `Řada ${t.seatRow}, Místo ${t.seatNumber}`}
                                            </div>
                                        </div>
                                        <div style={{textAlign: "right"}}>
                                            <div style={label}>Cena</div>
                                            <div style={{...value, color: "#22d3ee"}}>{t.price} Kč</div>
                                        </div>
                                    </div>

                                    {/* Placeholder pro QR kód */}
                                    <div style={qrPlaceholder}>
                                        [QR: {t.ticketCode}]
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}