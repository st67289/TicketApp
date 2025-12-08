import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/MyOrders.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

// TYPY
type OrderItemDto = { eventName: string; venueName: string; price: number; type: string; };

type OrderDto = {
    id: number; createdAt: string; totalPrice: number; status: string; ticketCount: number; items: OrderItemDto[];
};

type PageResponse<T> = {
    content: T[];
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    number: number;
};

export default function MyOrders() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Stavy pro stránkování
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    const navigate = useNavigate();

    // Funkce pro načtení dat
    const fetchOrders = async (pageNumber: number) => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/auth/login"); return; }

        try {
            const res = await fetch(`${BACKEND_URL}/api/orders/me?page=${pageNumber}&size=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data: PageResponse<OrderDto> = await res.json();

                if (pageNumber === 0) {
                    setOrders(data.content);
                } else {
                    setOrders(prev => [...prev, ...data.content]);
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

    // Logika filtrování
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

    if (loading) return <div className={styles.loadingWrapper}>Načítám objednávky...</div>;

    return (
        <div className={styles.wrap}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.panel}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.h1}>Moje objednávky</h1>
                        <Link to="/user/tickets" className={styles.linkButton}>
                            Přejít na vstupenky →
                        </Link>
                    </div>

                    <input
                        type="text"
                        placeholder="Hledat v načtených objednávkách..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            Nemáte žádné objednávky.
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            Žádná objednávka neodpovídá hledání "{searchTerm}".
                        </div>
                    ) : (
                        <div>
                            {filteredOrders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.cardHeaderRow}>
                                        <div>
                                            <span className={styles.orderId}>Objednávka #{order.id}</span>
                                            <div className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleString("cs-CZ")}
                                            </div>
                                        </div>
                                        <div style={{textAlign: "right"}}>
                                            <div className={styles.statusBadge}>{order.status}</div>
                                            <div className={styles.totalPrice}>{order.totalPrice} Kč</div>
                                        </div>
                                    </div>

                                    <div className={styles.itemList}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className={styles.itemRow}>
                                                <span>
                                                    <strong>{item.eventName}</strong>
                                                    <span className={styles.itemType}>({item.type})</span>
                                                </span>
                                                <span style={{whiteSpace: "nowrap"}}>{item.price} Kč</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Tlačítko pro načtení dalších */}
                            {!isLastPage && !searchTerm && (
                                <button
                                    onClick={handleLoadMore}
                                    className={styles.loadMoreBtn}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Načítám..." : "Načíst starší objednávky"}
                                </button>
                            )}

                            {/* Upozornění pokud uživatel vyhledává */}
                            {searchTerm && !isLastPage && (
                                <div className={styles.searchWarning}>
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