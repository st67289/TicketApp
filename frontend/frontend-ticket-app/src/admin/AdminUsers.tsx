// src/admin/AdminUsers.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Styly
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 16 };
const th: React.CSSProperties = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.18)", color: "#a7b0c0", fontSize: 13, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 14 };
const statusPill: React.CSSProperties = { padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#fff" };
const activePill: React.CSSProperties = { ...statusPill, background: "rgba(34, 211, 238, .25)" };
const blockedPill: React.CSSProperties = { ...statusPill, background: "rgba(255, 107, 107, .25)" };
const actionBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.04)", color: "#e6e9ef", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const dangerBtn: React.CSSProperties = { ...actionBtn, borderColor: "rgba(255, 107, 107, .35)", color: "#fca5a5" };

// Styl pro vyhledávací pole
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

export default function AdminUsers() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [users, setUsers] = useState<UserAdminViewDto[]>([]);

    // 1. Stav pro vyhledávání
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/auth/login", { replace: true }); return; }

            const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 403) throw new Error("Přístup odepřen.");
            if (!res.ok) throw new Error("Nepodařilo se načíst data uživatelů.");

            const data: UserAdminViewDto[] = await res.json();
            setUsers(data);
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError("Došlo k neznámé chybě.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 2. Logika filtrování
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const fullName = `${user.firstName} ${user.secondName}`.toLowerCase();
        // Pokud je oauthProvider null, zobrazuje se "Heslo", tak do vyhledávání zahrneme i slovo "heslo"
        const providerText = user.oauthProvider ? user.oauthProvider.toLowerCase() : 'heslo';

        return (
            user.id.toString().includes(lowerTerm) ||
            fullName.includes(lowerTerm) ||
            user.email.toLowerCase().includes(lowerTerm) ||
            user.role.toLowerCase().includes(lowerTerm) ||
            providerText.includes(lowerTerm)
        );
    });

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

                await fetchUsers();

            } catch (e: unknown) {
                if (e instanceof Error) alert(`Chyba: ${e.message}`);
                else alert('Došlo k neznámé chybě.');
            }
        }
    };

    if (loading) return <div>Načítám uživatele...</div>;
    if (error) return <div style={{ color: "#fca5a5" }}>{error}</div>;

    return (
        <div>
            {/* 3. Vstupní pole */}
            <input
                type="text"
                placeholder="Hledat uživatele (jméno, email, ID, role)..."
                style={searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

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
                    {/* 4. Renderování filtrovaného seznamu */}
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
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
            </div>
        </div>
    );
}