import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Navbar from "../components/Navbar";

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    padding: "80px 24px 40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial",
};

const container: React.CSSProperties = { width: "min(700px, 94vw)", margin: "0 auto" };
const panel: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 24,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
};
const h1: React.CSSProperties = { margin: "0 0 20px", fontSize: 30, fontWeight: 900 };
const label: React.CSSProperties = { fontSize: 12, color: "#a7b0c0", marginBottom: 4, display: "block" };
const input: React.CSSProperties = {
    appearance: "none",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
    color: "#e6e9ef",
    marginBottom: 14,
    outline: "none",
};
const primaryBtn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: 0,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(124,58,237,.35)",
    marginTop: 10,
    width: "100%",
};
const ghostText: React.CSSProperties = { color: "#a7b0c0", fontSize: 14, marginTop: 6 };

const BACKEND_URL = "http://localhost:8080";

type UserDto = {
    firstName: string;
    secondName: string;
    birthDate: string;
    email: string;
    role: string;
    createdAt: string;
};

export default function Profile() {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${BACKEND_URL}/api/user/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Nelze načíst profil");

                const data: UserDto = await res.json();
                setUser(data);
            } catch (err) {
                if (err instanceof Error) setMsg(err.message);
                else setMsg("Neznámá chyba");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function daysSince(d: string) {
        const created = new Date(d);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }

    async function save() {
        if (!user) return;
        setMsg("");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${BACKEND_URL}/api/user/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: user.firstName,
                    secondName: user.secondName,
                    birthDate: user.birthDate,
                }),
            });

            if (!res.ok) throw new Error("Nepodařilo se uložit");

            setMsg("Uloženo ✔");

        } catch (err) {
            if (err instanceof Error) setMsg(err.message);
            else setMsg("Neznámá chyba");
        }
    }

    if (loading)
        return (
            <div style={wrap}>
                <Navbar />
                <div style={container}>
                    <div style={panel}>Načítám profil...</div>
                </div>
            </div>
        );

    if (!user)
        return (
            <div style={wrap}>
                <Navbar />
                <div style={container}>
                    <div style={panel}>{msg || "Chyba načítání"}</div>
                </div>
            </div>
        );

    const days = daysSince(user.createdAt);

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                <div style={panel}>
                    <h1 style={h1}>Můj profil</h1>

                    <label style={label}>Jméno</label>
                    <input
                        style={input}
                        value={user.firstName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, firstName: e.target.value })
                        }
                    />

                    <label style={label}>Příjmení</label>
                    <input
                        style={input}
                        value={user.secondName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, secondName: e.target.value })
                        }
                    />

                    <label style={label}>Datum narození</label>
                    <input
                        type="date"
                        style={input}
                        value={user.birthDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, birthDate: e.target.value })
                        }
                    />

                    <label style={label}>Email (nelze změnit)</label>
                    <input style={{ ...input, opacity: 0.6 }} value={user.email} disabled />

                    <div style={ghostText}>Role: <strong>{user.role}</strong></div>

                    <div style={{ ...ghostText, marginTop: 12, fontSize: 16 }}>
                        Jsi s námi už <strong style={{ color: "#fff" }}>{days}</strong> dní 🎉
                    </div>

                    {msg && (
                        <div
                            style={{
                                ...ghostText,
                                color: msg === "Uloženo ✔" ? "#4ade80" : "#fca5a5"
                            }}
                        >
                            {msg}
                        </div>
                    )}

                    <button style={primaryBtn} onClick={save}>Uložit změny</button>
                </div>
            </div>
        </div>
    );
}
