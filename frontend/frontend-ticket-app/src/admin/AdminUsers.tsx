import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/AdminUsers.module.css"; // Import stylů

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
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // 1. Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== debouncedTerm) {
                setDebouncedTerm(searchTerm);
                setPage(0);
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, debouncedTerm]);

    // 2. Načítání dat
    useEffect(() => {
        const fetchUsers = async () => {
            if (page === 0) setLoading(true);

            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/auth/login", { replace: true }); return; }

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
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && page === 0 ? (
                <div style={{textAlign: 'center', padding: 20}}>Načítám data...</div>
            ) : error ? (
                <div style={{ color: "#fca5a5" }}>{error}</div>
            ) : (
                <>
                    {/* --- TABLE FOR DESKTOP --- */}
                    <table className={styles.desktopTable}>
                        <thead>
                        <tr>
                            <th className={styles.th}>ID</th>
                            <th className={styles.th}>Jméno</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Role</th>
                            <th className={styles.th}>Stav</th>
                            <th className={styles.th}>Zdroj</th>
                            <th className={styles.th}>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td className={styles.td}>{user.id}</td>
                                    <td className={styles.td}>{user.firstName} {user.secondName}</td>
                                    <td className={styles.td}>{user.email}</td>
                                    <td className={styles.td}>{user.role}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.pill} ${user.enabled ? styles.pillActive : styles.pillBlocked}`}>
                                            {user.enabled ? 'Aktivní' : 'Blokován'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{user.oauthProvider || 'Heslo'}</td>
                                    <td className={styles.td}>
                                        <button
                                            className={user.enabled ? styles.dangerBtn : styles.actionBtn}
                                            onClick={() => handleToggleBlock(user.id, user.enabled)}
                                        >
                                            {user.enabled ? 'Zablokovat' : 'Odblokovat'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.td} style={{textAlign: "center", color: "#a7b0c0", padding: 30}}>
                                    {searchTerm ? `Žádný uživatel neodpovídá "${searchTerm}"` : "Žádní uživatelé."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* --- LIST FOR MOBILE --- */}
                    <div className={styles.mobileList}>
                        {users.length > 0 ? (
                            users.map(user => (
                                <div key={user.id} className={styles.mobileCard}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <div className={styles.cardName}>{user.firstName} {user.secondName}</div>
                                            <div className={styles.cardEmail}>{user.email}</div>
                                        </div>
                                        <span className={`${styles.pill} ${user.enabled ? styles.pillActive : styles.pillBlocked}`}>
                                            {user.enabled ? 'Aktivní' : 'Blokován'}
                                        </span>
                                    </div>

                                    <div className={styles.cardDetails}>
                                        <div>
                                            <span className={styles.detailLabel}>Role</span>
                                            {user.role}
                                        </div>
                                        <div>
                                            <span className={styles.detailLabel}>Zdroj</span>
                                            {user.oauthProvider || 'Heslo'}
                                        </div>
                                        <div>
                                            <span className={styles.detailLabel}>ID</span>
                                            #{user.id}
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button
                                            className={user.enabled ? styles.dangerBtn : styles.actionBtn}
                                            onClick={() => handleToggleBlock(user.id, user.enabled)}
                                        >
                                            {user.enabled ? 'Zablokovat' : 'Odblokovat'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: "center", color: "#a7b0c0", padding: 20}}>
                                {searchTerm ? `Žádný uživatel neodpovídá "${searchTerm}"` : "Žádní uživatelé."}
                            </div>
                        )}
                    </div>

                    {/* Tlačítko Načíst další */}
                    {!isLastPage && (
                        <button
                            onClick={handleLoadMore}
                            className={styles.loadMoreBtn}
                            disabled={loadingMore}
                        >
                            {loadingMore ? "Načítám..." : "Načíst další uživatele"}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}