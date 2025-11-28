import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import AuthImage from "../components/AuthImage";

// Styly (konzistentní)
const wrap: React.CSSProperties = { minHeight: "100dvh", paddingTop: "130px", padding: "100px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(900px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { marginTop: 0, fontSize: 28, fontWeight: 800 };

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 20 };
const card: React.CSSProperties = { background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 8 };

const label: React.CSSProperties = { fontSize: 12, color: "#a7b0c0", textTransform: "uppercase", letterSpacing: 0.5 };
const value: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "#fff" };

// Styl pro tlačítko stažení PDF
const pdfBtn: React.CSSProperties = {
    marginTop: 8,
    width: "100%",
    padding: "8px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#e6e9ef",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "background 0.2s"
};

const modalOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.85)", // Tmavé pozadí
    backdropFilter: "blur(5px)",
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    cursor: "zoom-out"
};

const modalContent: React.CSSProperties = {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    maxWidth: "90vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    cursor: "default"
};

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
    const [zoomedTicket, setZoomedTicket] = useState<TicketDto | null>(null);

    //Uzavření rozkliklého qr kodu přes Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomedTicket(null); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

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

    const handleDownloadPdf = (ticketId: number) => {
        //TODO ZATÍM JEN ALERT - Backend ještě nemáme
        alert("Stažení PDF pro ticket " + ticketId + " (Backend TODO)");

        // Až bude backend:
        // window.open(`${BACKEND_URL}/api/tickets/${ticketId}/pdf?token=${localStorage.getItem("token")}`, "_blank");
    };

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

                                    <div
                                        style={{ marginTop: 12, display: "flex", justifyContent: "center", cursor: "zoom-in" }}
                                        onClick={() => setZoomedTicket(t)} // <--- TADY JE AKCE
                                        title="Zvětšit QR kód"
                                    >
                                        <div style={{ padding: 8, background: "white", borderRadius: 8 }}>
                                            <AuthImage
                                                url={`/api/tickets/${t.id}/qr`}
                                                alt={`QR ${t.ticketCode}`}
                                                style={{ width: 120, height: 120, display: "block" }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{textAlign: "center", fontSize: 11, color: "#a7b0c0", marginTop: 4}}>
                                        {t.ticketCode}
                                    </div>
                                    {/* Tlačítko PDF */}
                                    <button
                                        style={pdfBtn}
                                        onClick={() => handleDownloadPdf(t.id)}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                                        Stáhnout PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {zoomedTicket && (
                <div style={modalOverlay} onClick={() => setZoomedTicket(null)}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={{margin: "0 0 10px 0", color: "#333", fontSize: 18}}>{zoomedTicket.eventName}</h3>

                        <AuthImage
                            url={`/api/tickets/${zoomedTicket.id}/qr`}
                            alt={`QR Full`}
                            style={{ width: "min(80vw, 400px)", height: "auto", display: "block" }}
                        />

                        <p style={{margin: "10px 0 0", color: "#666", fontWeight: "bold"}}>{zoomedTicket.ticketCode}</p>
                        <div style={{color: "#888", fontSize: 12, marginTop: 5}}>Kliknutím vedle zavřete</div>
                    </div>
                </div>
            )}
        </div>
    );
}