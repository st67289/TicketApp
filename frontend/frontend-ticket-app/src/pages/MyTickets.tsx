import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import AuthImage from "../components/AuthImage";
import styles from "./styles/MyTickets.module.css"; // Import stylů

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

// Typ pro Spring Page
type PageResponse<T> = {
    content: T[];
    last: boolean;
    totalPages: number;
    totalElements: number;
    number: number;
};

export default function MyTickets() {
    const [tickets, setTickets] = useState<TicketDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [zoomedTicket, setZoomedTicket] = useState<TicketDto | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Stavy pro stránkování
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    const navigate = useNavigate();

    // Uzavření rozkliklého qr kodu přes Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomedTicket(null); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const fetchTickets = async (pageNumber: number) => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/auth/login"); return; }

        try {
            // Přidáme parametry page a size
            const res = await fetch(`${BACKEND_URL}/api/tickets/me?page=${pageNumber}&size=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data: PageResponse<TicketDto> = await res.json();

                if (pageNumber === 0) {
                    setTickets(data.content);
                } else {
                    setTickets(prev => [...prev, ...data.content]);
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

    // Prvotní načtení
    useEffect(() => {
        fetchTickets(0);
    }, [navigate]);

    const handleLoadMore = () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTickets(nextPage);
    };

    // Logika filtrování (POZOR: filtruje jen načtené)
    const filteredTickets = tickets.filter(t => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const dateStr = new Date(t.eventStart).toLocaleString("cs-CZ").toLowerCase();
        const seatInfo = t.type === "STANDING" ? "na stání" : `řada ${t.seatRow} místo ${t.seatNumber}`;

        return (
            t.eventName.toLowerCase().includes(lowerTerm) ||
            t.venue.name.toLowerCase().includes(lowerTerm) ||
            t.ticketCode.toLowerCase().includes(lowerTerm) ||
            dateStr.includes(lowerTerm) ||
            seatInfo.includes(lowerTerm)
        );
    });

    const handleDownloadPdf = async (ticketId: number) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}/pdf`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Chyba stahování");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `vstupenka_${ticketId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (e) {
            console.error(e);
            alert("Nepodařilo se stáhnout PDF.");
        }
    };

    if (loading) return <div className={styles.loadingWrapper}>Načítám vstupenky...</div>;

    return (
        <div className={styles.wrap}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.panel}>
                    <h1 className={styles.h1}>Moje vstupenky</h1>

                    <input
                        type="text"
                        placeholder="Hledat v načtených (akce, kód, místo)..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {tickets.length === 0 ? (
                        <div className={styles.emptyState}>
                            Zatím nemáte žádné vstupenky. <br/>
                            <Link to="/events" className={styles.linkAccent}>Jít nakupovat</Link>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className={styles.emptyState}>
                            Žádná vstupenka neodpovídá hledání "{searchTerm}".
                        </div>
                    ) : (
                        <div>
                            <div className={styles.grid}>
                                {filteredTickets.map(t => (
                                    <div key={t.id} className={styles.card}>
                                        <div>
                                            <div className={styles.label}>Akce</div>
                                            <div className={styles.value}>{t.eventName}</div>
                                        </div>
                                        <div>
                                            <div className={styles.label}>Datum</div>
                                            <div className={styles.value}>{new Date(t.eventStart).toLocaleString("cs-CZ")}</div>
                                        </div>
                                        <div>
                                            <div className={styles.label}>Místo</div>
                                            <div className={styles.value}>{t.venue.name}</div>
                                        </div>
                                        <div style={{display: "flex", justifyContent: "space-between"}}>
                                            <div>
                                                <div className={styles.label}>Typ</div>
                                                <div className={styles.value}>
                                                    {t.type === "STANDING" ? "Na stání" : `Řada ${t.seatRow}, Místo ${t.seatNumber}`}
                                                </div>
                                            </div>
                                            <div style={{textAlign: "right"}}>
                                                <div className={styles.label}>Cena</div>
                                                <div className={`${styles.value} ${styles.priceValue}`}>{t.price} Kč</div>
                                            </div>
                                        </div>

                                        <div
                                            className={styles.qrContainer}
                                            onClick={() => setZoomedTicket(t)}
                                            title="Zvětšit QR kód"
                                        >
                                            <div className={styles.qrBackground}>
                                                <AuthImage
                                                    url={`/api/tickets/${t.id}/qr`}
                                                    alt={`QR ${t.ticketCode}`}
                                                    style={{ width: 120, height: 120, display: "block" }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.ticketCode}>
                                            {t.ticketCode}
                                        </div>

                                        <button
                                            className={styles.pdfBtn}
                                            onClick={() => handleDownloadPdf(t.id)}
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                                            Stáhnout PDF
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Tlačítko Načíst další */}
                            {!isLastPage && !searchTerm && (
                                <button
                                    onClick={handleLoadMore}
                                    className={styles.loadMoreBtn}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Načítám..." : "Načíst další vstupenky"}
                                </button>
                            )}

                            {/* Upozornění pro vyhledávání */}
                            {searchTerm && !isLastPage && (
                                <div className={styles.warningText}>
                                    Vyhledávání probíhá pouze v načtených vstupenkách. Pro prohledání starších zrušte filtr a načtěte je.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL OKNO */}
            {zoomedTicket && (
                <div className={styles.modalOverlay} onClick={() => setZoomedTicket(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>{zoomedTicket.eventName}</h3>

                        <AuthImage
                            url={`/api/tickets/${zoomedTicket.id}/qr`}
                            alt={`QR Full`}
                            style={{ width: "min(80vw, 400px)", height: "auto", display: "block" }}
                        />

                        <p className={styles.modalCode}>{zoomedTicket.ticketCode}</p>
                        <div className={styles.modalHint}>Kliknutím vedle zavřete</div>
                    </div>
                </div>
            )}
        </div>
    );
}