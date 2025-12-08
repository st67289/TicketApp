// src/admin/AdminUsers.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Styly (beze změny)
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 16 };
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.18)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 14 };
const statusPill: React.CSSProperties = { padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#fff" };
const activePill: React.CSSProperties = { ...statusPill, background: "rgba(34, 211, 238, .25)" };
const blockedPill: React.CSSProperties = { ...statusPill, background: "rgba(255, 107, 107, .25)" };
const actionBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.04)", color: "#e6e9ef", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const dangerBtn: React.CSSProperties = { ...actionBtn, borderColor: "rgba(255, 107, 107, .35)", color: "#fca5a5" };

const searchInput: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: 20,
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
};

const loadMoreBtn: React.CSSProperties = {
    display: "block", width: "100%", padding: "12px", marginTop: 20,
    background: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)",
    borderRadius: 12, color: "#22d3ee", fontWeight: "bold", cursor: "pointer", fontSize: 15
};

const BACKEND_URL = "http://localhost:8080";

type UserAdminViewDto = {
    id: number;
    firstName: string;
    secondName: string;
    email: string;
    role: 'ADMINISTRATOR' | 'USER';
    enabled: boolean;
    createdAt: string;
    oauthProvider: string | null;
};

// Typ pro stránkovanou odpověď
type PageResponse<T> = {
    content: T[];
    last: boolean;
    number: number;
};

export default function AdminUsers() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    // Data
    const [users, setUsers] = useState<UserAdminViewDto[]>([]);

    // Stav vyhledávání a stránkování
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(""); // Reálný termín pro API po prodlevě
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // 1. Debounce logic - čeká 500ms po dopsání, než aktualizuje debouncedTerm
    useEffect(() => {
        const handler = setTimeout(() => {
            // DŮLEŽITÁ ZMĚNA: Kontrola, zda se hodnota opravdu změnila
            if (searchTerm !== debouncedTerm) {
                setDebouncedTerm(searchTerm);
                setPage(0);
                setUsers([]); // Vyčistit jen pokud se změnilo hledání
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, debouncedTerm]);

    // 2. Načítání dat - reaguje na změnu stránky nebo změnu vyhledávaného výrazu
    useEffect(() => {
        const fetchUsers = async () => {
            if (page === 0) setLoading(true); // Jen při prvním načtení/hledání

            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/auth/login", { replace: true }); return; }

                // Posíláme search parametr na backend
                const query = new URLSearchParams({
                    page: page.toString(),
                    size: "20",
                    sort: "id,asc",
                    search: debouncedTerm
                });

                const res = await fetch(`${BACKEND_URL}/api/admin/users?${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 403) throw new Error("Přístup odepřen.");
                if (!res.ok) throw new Error("Nepodařilo se načíst data uživatelů.");

                const data: PageResponse<UserAdminViewDto> = await res.json();

                // Pokud je page 0, přepíšeme data. Jinak je připojíme (append).
                if (page === 0) {
                    setUsers(data.content);
                } else {
                    setUsers(prev => [...prev, ...data.content]);
                }

                setIsLastPage(data.last);
            } catch (e: unknown) {
                if (e instanceof Error) setError(e.message);
                else setError("Došlo k neznámé chybě.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchUsers();
    }, [debouncedTerm, page, navigate]);

    const handleLoadMore = () => {
        setLoadingMore(true);
        setPage(prev => prev + 1);
    };

    const handleToggleBlock = async (userId: number, isCurrentlyEnabled: boolean) => {
        const action = isCurrentlyEnabled ? "block" : "unblock";
        if (window.confirm(`Opravdu chcete tohoto uživatele ${action === 'block' ? 'zablokovat' : 'odblokovat'}?`)) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/${action}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.message || 'Akce se nezdařila.');
                }

                // Aktualizujeme lokální stav bez nutnosti znovu načítat vše
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, enabled: !isCurrentlyEnabled } : u
                ));

            } catch (e: unknown) {
                if (e instanceof Error) alert(`Chyba: ${e.message}`);
                else alert('Došlo k neznámé chybě.');
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Hledat uživatele (jméno, email, ID, role)..."
                style={searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && page === 0 ? (
                <div style={{textAlign: 'center', padding: 20}}>Načítám data...</div>
            ) : error ? (
                <div style={{ color: "#fca5a5" }}>{error}</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={table}>
                        <thead>
                        <tr>
                            <th style={th}>ID</th>
                            <th style={th}>Jméno</th>
                            <th style={th}>Email</th>
                            <th style={th}>Role</th>
                            <th style={th}>Stav</th>
                            <th style={th}>Zdroj</th>
                            <th style={th}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td style={td}>{user.id}</td>
                                    <td style={td}>{user.firstName} {user.secondName}</td>
                                    <td style={td}>{user.email}</td>
                                    <td style={td}>{user.role}</td>
                                    <td style={td}><span style={user.enabled ? activePill : blockedPill}>{user.enabled ? 'Aktivní' : 'Blokován'}</span></td>
                                    <td style={td}>{user.oauthProvider || 'Heslo'}</td>
                                    <td style={td}>
                                        <button style={user.enabled ? dangerBtn : actionBtn} onClick={() => handleToggleBlock(user.id, user.enabled)}>
                                            {user.enabled ? 'Zablokovat' : 'Odblokovat'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{...td, textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádný uživatel neodpovídá "${searchTerm}"` : "Žádní uživatelé."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Tlačítko Načíst další */}
                    {!isLastPage && (
                        <button
                            onClick={handleLoadMore}
                            style={loadMoreBtn}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Načítám..." : "Načíst další uživatele"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}