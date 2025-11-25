import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// --- STYLY (Konzistentní s EventsList) ---
const wrap: React.CSSProperties = { minHeight: "100dvh", padding: "100px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(900px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { marginTop: 0, fontSize: 28, fontWeight: 800 };

const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 20 };
const th: React.CSSProperties = { textAlign: "left", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.2)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", verticalAlign: "middle" };

const btnRemove: React.CSSProperties = { background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const btnPay: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", color: "#fff", fontWeight: 800, fontSize: 18, cursor: "pointer", marginTop: 24, boxShadow: "0 10px 30px rgba(124, 58, 237, 0.3)" };

const BACKEND_URL = "http://localhost:8080";

// --- TYPY (odpovídají CartDto z Java backendu) ---
interface VenueShort { id: number; name: string; address?: string; }
interface CartItem {
    ticketId: number;
    eventId: number;
    eventName: string;
    eventStartTime: string;
    venue: VenueShort;
    ticketType: "STANDING" | "SEATING";
    seatId?: number;
    seatRow?: string;
    seatNumber?: string;
    price: number;
    status: string;
}

interface CartDto {
    id: number;
    items: CartItem[];
    itemsCount: number;
    total: number;
}

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Načtení košíku
    const loadCart = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { navigate("/auth/login"); return; }

        try {
            const res = await fetch(`${BACKEND_URL}/api/carts/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            } else {
                // Pokud token vypršel nebo je chyba
                console.error("Chyba načítání košíku");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Odstranění položky
    const removeItem = async (ticketId: number) => {
        if (!confirm("Opravdu odebrat položku?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/carts/items/${ticketId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                // Backend vrací aktualizovaný košík, můžeme ho rovnou nastavit
                const updatedCart = await res.json();
                setCart(updatedCart);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            alert("Chyba při mazání položky");
        }
    };

    // Mock platba
    const handlePay = async () => {
        if (!cart || cart.items.length === 0) return;
        setProcessing(true);

        // Simulace prodlevy
        setTimeout(async () => {
            const token = localStorage.getItem("token");
            try {
                // VOLÁNÍ BACKENDU PRO VYTVOŘENÍ OBJEDNÁVKY
                const res = await fetch(`${BACKEND_URL}/api/orders`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    alert("Platba proběhla úspěšně!");
                    navigate("/user/tickets"); // Přesměrování na Moje vstupenky
                } else {
                    alert("Chyba při zpracování platby.");
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                alert("Chyba komunikace.");
            } finally {
                setProcessing(false);
            }
        }, 1500);
    };

    if (loading) return <div style={{...wrap, paddingTop: 120, textAlign: "center"}}>Načítám košík...</div>;

    return (
        <div style={wrap}>
            <Navbar />

            <div style={container}>
                <div style={panel}>
                    <h1 style={h1}>Nákupní košík</h1>

                    {!cart || cart.items.length === 0 ? (
                        <div style={{textAlign: "center", padding: "40px 0", color: "#a7b0c0"}}>
                            <p>Váš košík je prázdný.</p>
                            <Link to="/events" style={{color: "#22d3ee", fontWeight: "bold", textDecoration: "none"}}>
                                ← Přejít k výběru akcí
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div style={{overflowX: "auto"}}>
                                <table style={table}>
                                    <thead>
                                    <tr>
                                        <th style={th}>Akce</th>
                                        <th style={th}>Místo / Typ</th>
                                        <th style={th}>Cena</th>
                                        <th style={th}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cart.items.map(item => (
                                        <tr key={item.ticketId}>
                                            <td style={td}>
                                                <div style={{fontWeight: 700, fontSize: 16}}>{item.eventName}</div>
                                                <div style={{fontSize: 13, color: "#a7b0c0", marginTop: 4}}>
                                                    {new Date(item.eventStartTime).toLocaleString("cs-CZ")}
                                                </div>
                                                <div style={{fontSize: 13, color: "#a7b0c0"}}>
                                                    {item.venue.name}
                                                </div>
                                            </td>
                                            <td style={td}>
                                                {item.ticketType === "STANDING" ? (
                                                    <span style={{padding: "4px 8px", background: "rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12}}>
                                                        Na stání
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <div style={{color: "#22d3ee", fontWeight: "bold"}}>
                                                            Řada {item.seatRow}, Sedadlo {item.seatNumber}
                                                        </div>
                                                        <span style={{fontSize: 12, color: "#a7b0c0"}}>Na sezení</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={td}>
                                                {item.price} Kč
                                            </td>
                                            <td style={{...td, textAlign: "right"}}>
                                                <button style={btnRemove} onClick={() => removeItem(item.ticketId)}>
                                                    Odebrat
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan={2} style={{...td, textAlign: "right", color: "#a7b0c0", fontSize: 14}}>
                                            Celkem ({cart.itemsCount} ks):
                                        </td>
                                        <td style={{...td, fontSize: 20, fontWeight: 900, color: "#fff"}}>
                                            {cart.total} Kč
                                        </td>
                                        <td></td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <button style={btnPay} onClick={handlePay} disabled={processing}>
                                {processing ? "Zpracovávám platbu..." : "Zaplatit objednávku"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}