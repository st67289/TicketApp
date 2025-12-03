import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

// STYLY
const wrap: React.CSSProperties = { minHeight: "100dvh", padding: "100px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(900px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { marginTop: 0, fontSize: 28, fontWeight: 800 };

// Styl karty objednávky
const orderCard: React.CSSProperties = {
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
};

const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 };
const statusBadge: React.CSSProperties = { background: "#10b981", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold" };
const itemList: React.CSSProperties = { display: "grid", gap: 8 };
const itemRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#cbd5e1" };

const BACKEND_URL = "http://localhost:8080";

// TYPY
type OrderItemDto = {
    eventName: string;
    venueName: string;
    price: number;
    type: string;
};

type OrderDto = {
    id: number;
    createdAt: string;
    totalPrice: number;
    status: string;
    ticketCount: number;
    items: OrderItemDto[];
};

export default function MyOrders() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/auth/login"); return; }

            try {
                const res = await fetch(`${BACKEND_URL}/api/orders/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setOrders(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    if (loading) return <div style={{...wrap, textAlign: "center", paddingTop: 150}}>Načítám objednávky...</div>;

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                <div style={panel}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
                        <h1 style={h1}>Moje objednávky</h1>
                        <Link to="/user/tickets" style={{color: "#22d3ee", textDecoration: "none"}}>
                            Přejít na vstupenky →
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{color: "#a7b0c0", textAlign: "center", padding: 40}}>
                            Nemáte žádné objednávky.
                        </div>
                    ) : (
                        <div>
                            {orders.map(order => (
                                <div key={order.id} style={orderCard}>
                                    <div style={headerRow}>
                                        <div>
                                            <span style={{color: "#a7b0c0", fontSize: 13}}>Objednávka #{order.id}</span>
                                            <div style={{fontWeight: "bold", fontSize: 16}}>
                                                {new Date(order.createdAt).toLocaleString("cs-CZ")}
                                            </div>
                                        </div>
                                        <div style={{textAlign: "right"}}>
                                            <div style={statusBadge}>{order.status}</div>
                                            <div style={{marginTop: 4, fontWeight: "bold"}}>{order.totalPrice} Kč</div>
                                        </div>
                                    </div>

                                    <div style={itemList}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={itemRow}>
                                                <span>
                                                    <strong>{item.eventName}</strong> <span style={{color: "#64748b"}}>({item.type})</span>
                                                </span>
                                                <span>{item.price} Kč</span>
                                            </div>
                                        ))}
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