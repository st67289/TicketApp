import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

// STYLY (zůstávají stejné)
const wrap: React.CSSProperties = { minHeight: "100dvh", paddingTop:"100px", padding: "100px 24px 40px", background: "linear-gradient(160deg,#0b0f1a,#181d2f)", color: "#e6e9ef", fontFamily: "Inter, sans-serif" };
const container: React.CSSProperties = { width: "min(900px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 24, backdropFilter: "blur(10px)" };
const h1: React.CSSProperties = { marginTop: 0, fontSize: 28, fontWeight: 800 };

const searchInput: React.CSSProperties = {
    width: "100%", padding: "12px 16px", marginBottom: 24, background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
};

const orderCard: React.CSSProperties = { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 16 };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 };
const statusBadge: React.CSSProperties = { background: "#10b981", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold" };
const itemList: React.CSSProperties = { display: "grid", gap: 8 };
const itemRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#cbd5e1" };

// Styl pro tlačítko "Načíst další"
const loadMoreBtn: React.CSSProperties = {
    display: "block", width: "100%", padding: "12px", marginTop: 20,
    background: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)",
    borderRadius: 12, color: "#22d3ee", fontWeight: "bold", cursor: "pointer", fontSize: 15
};

const BACKEND_URL = "http://localhost:8080";

// TYPY
type OrderItemDto = { eventName: string; venueName: string; price: number; type: string; };

type OrderDto = {
    id: number; createdAt: string; totalPrice: number; status: string; ticketCount: number; items: OrderItemDto[];
};

// Typ pro odpověď ze Spring Page objektu
type PageResponse<T> = {
    content: T[];
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    number: number; // aktuální číslo stránky
};

export default function MyOrders() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // Stav pro načítání dalších
    const [searchTerm, setSearchTerm] = useState("");

    // Stavy pro stránkování
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    const navigate = useNavigate();

    // Funkce pro načtení dat (univerzální)
    const fetchOrders = async (pageNumber: number) => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/auth/login"); return; }

        try {
            // Přidáme parametry page a size
            const res = await fetch(`${BACKEND_URL}/api/orders/me?page=${pageNumber}&size=10`, { // size=10 pro testování, pak dej třeba 20
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: PageResponse<OrderDto> = await res.json();

                if (pageNumber === 0) {
                    setOrders(data.content); // První načtení přepíše seznam
                } else {
                    setOrders(prev => [...prev, ...data.content]); // Další načtení přidá na konec
                }

                setIsLastPage(data.last);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 1. Prvotní načtení
    useEffect(() => {
        fetchOrders(0);
    }, [navigate]);

    // Handler pro tlačítko "Načíst další"
    const handleLoadMore = () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage);
    };

    // Logika filtrování (POZOR: filtruje jen načtené položky)
    const filteredOrders = orders.filter((order) => {
        if (!searchTerm) return true;

        const lowerTerm = searchTerm.toLowerCase();
        const dateStr = new Date(order.createdAt).toLocaleString("cs-CZ");

        if (order.id.toString().includes(lowerTerm)) return true;
        if (order.status.toLowerCase().includes(lowerTerm)) return true;
        if (dateStr.toLowerCase().includes(lowerTerm)) return true;

        return order.items.some(item =>
            item.eventName.toLowerCase().includes(lowerTerm) ||
            item.venueName.toLowerCase().includes(lowerTerm) ||
            item.type.toLowerCase().includes(lowerTerm)
        );
    });

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

                    <input
                        type="text"
                        placeholder="Hledat v načtených objednávkách..."
                        style={searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {orders.length === 0 ? (
                        <div style={{color: "#a7b0c0", textAlign: "center", padding: 40}}>
                            Nemáte žádné objednávky.
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={{color: "#a7b0c0", textAlign: "center", padding: 40}}>
                            Žádná objednávka neodpovídá hledání "{searchTerm}".
                        </div>
                    ) : (
                        <div>
                            {filteredOrders.map(order => (
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

                            {/* Tlačítko pro načtení dalších */}
                            {!isLastPage && !searchTerm && (
                                <button
                                    onClick={handleLoadMore}
                                    style={loadMoreBtn}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Načítám..." : "Načíst starší objednávky"}
                                </button>
                            )}

                            {/* Upozornění pokud uživatel vyhledává */}
                            {searchTerm && !isLastPage && (
                                <div style={{textAlign: "center", color: "#a7b0c0", marginTop: 20, fontSize: 13}}>
                                    Vyhledávání probíhá pouze v načtených položkách. Pro prohledání starších objednávek zrušte filtr a načtěte je.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}