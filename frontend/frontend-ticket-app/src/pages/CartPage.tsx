import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./styles/CartPage.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

interface VenueShort { id: number; name: string; address?: string; }
interface CartItem {
    ticketId: number;
    eventId: number;
    eventName: string;
    eventStartTime: string;
    venue: VenueShort;
    seatId?: number; // seatId null = stání
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
                setCart(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCart(); }, []);

    // Odstranění položky
    const removeItem = async (ticketId: number) => {
        if (!confirm("Opravdu odebrat položku?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/carts/items/${ticketId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setCart(await res.json());
        } catch (e) { alert("Chyba při mazání položky"); }
    };

    // Vyprázdnit košík
    const handleClearCart = async () => {
        if (!confirm("Opravdu chcete vyprázdnit celý košík?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/carts/items`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setCart(await res.json());
        } catch (e) { alert("Chyba při mazání košíku"); }
    };

    // Platba
    const handlePay = async () => {
        if (!cart || cart.items.length === 0) return;
        setProcessing(true);
        setTimeout(async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BACKEND_URL}/api/orders`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    alert("Platba proběhla úspěšně!\nVstupenky byly odeslány na váš email.");
                    navigate("/user/tickets");
                } else {
                    alert("Chyba při zpracování platby.");
                }
            } catch (e) { alert("Chyba komunikace."); } finally { setProcessing(false); }
        }, 1500);
    };

    if (loading) return <div className={`${styles.wrap} ${styles.emptyState}`}>Načítám košík...</div>;

    return (
        <div className={styles.wrap}>
            <Navbar />

            <div className={styles.container}>
                <Link to="/user/orders" className={styles.btnHistory}>
                    📜 Zobrazit historii objednávek
                </Link>
                <div className={styles.panel}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.title}>Nákupní košík</h1>
                        {/* Tlačítko Odebrat vše */}
                        {cart && cart.items.length > 0 && (
                            <button className={styles.btnClear} onClick={handleClearCart}>
                                Vyprázdnit košík
                            </button>
                        )}
                    </div>

                    {!cart || cart.items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Váš košík je prázdný.</p>
                            <Link to="/events" className={styles.backLink}>
                                ← Přejít k výběru akcí
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* --- TABULKA PRO DESKTOP --- */}
                            <table className={styles.desktopTable}>
                                <thead>
                                <tr>
                                    <th className={styles.th}>Akce</th>
                                    <th className={styles.th}>Místo / Typ</th>
                                    <th className={styles.th}>Cena</th>
                                    <th className={styles.th}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {cart.items.map(item => (
                                    <tr key={item.ticketId}>
                                        <td className={styles.td}>
                                            <div style={{fontWeight: 700, fontSize: 16}}>{item.eventName}</div>
                                            <div style={{fontSize: 13, color: "#a7b0c0", marginTop: 4}}>
                                                {new Date(item.eventStartTime).toLocaleString("cs-CZ")}
                                            </div>
                                            <div style={{fontSize: 13, color: "#a7b0c0"}}>
                                                {item.venue.name}
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            {!item.seatId ? (
                                                <span className={styles.tagStanding}>Na stání</span>
                                            ) : (
                                                <div className={styles.seatInfo}>
                                                    <span className={styles.seatHighlight}>
                                                        Řada {item.seatRow}, Sedadlo {item.seatNumber}
                                                    </span>
                                                    <span style={{color: "#a7b0c0"}}>Na sezení</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {item.price} Kč
                                        </td>
                                        <td className={`${styles.td}`} style={{textAlign: "right"}}>
                                            <button className={styles.btnRemove} onClick={() => removeItem(item.ticketId)}>
                                                Odebrat
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* --- SEZNAM KARET PRO MOBIL --- */}
                            <div className={styles.mobileList}>
                                {cart.items.map(item => (
                                    <div key={item.ticketId} className={styles.mobileCard}>
                                        <div className={styles.cardHeader}>
                                            <div>
                                                <div className={styles.cardTitle}>{item.eventName}</div>
                                                <div className={styles.cardTime}>
                                                    {new Date(item.eventStartTime).toLocaleString("cs-CZ")}
                                                </div>
                                                <div className={styles.cardVenue}>{item.venue.name}</div>
                                            </div>
                                            <button className={styles.btnRemove} onClick={() => removeItem(item.ticketId)}>
                                                ✕
                                            </button>
                                        </div>

                                        <div>
                                            {!item.seatId ? (
                                                <span className={styles.tagStanding}>Na stání</span>
                                            ) : (
                                                <div className={styles.seatInfo}>
                                                    <span className={styles.seatHighlight}>
                                                        Řada {item.seatRow}, Sed. {item.seatNumber}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <span style={{fontSize: 12, color: "#a7b0c0"}}>Cena položky</span>
                                            <span className={styles.cardPrice}>{item.price} Kč</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- SOUČTY (SPOLEČNÉ) --- */}
                            <div className={styles.totalRow}>
                                <div className={styles.totalLabel}>
                                    Celkem ({cart.itemsCount} ks):
                                </div>
                                <div className={styles.totalPrice}>
                                    {cart.total} Kč
                                </div>
                            </div>

                            <button className={styles.btnPay} onClick={handlePay} disabled={processing}>
                                {processing ? "Zpracovávám platbu..." : "Zaplatit objednávku"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}