import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Navbar from "../components/Navbar";
import styles from "./Profile.module.css"; // Import stylů

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
            <div className={styles.loadingWrapper}>
                <Navbar />
                <div>Načítám profil...</div>
            </div>
        );

    if (!user)
        return (
            <div className={styles.loadingWrapper}>
                <Navbar />
                <div className={styles.msg} style={{ color: "#fca5a5" }}>
                    {msg || "Chyba načítání"}
                </div>
            </div>
        );

    const days = daysSince(user.createdAt);

    return (
        <div className={styles.wrap}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.panel}>
                    <h1 className={styles.h1}>Můj profil</h1>

                    <label className={styles.label}>Jméno</label>
                    <input
                        className={styles.input}
                        value={user.firstName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, firstName: e.target.value })
                        }
                    />

                    <label className={styles.label}>Příjmení</label>
                    <input
                        className={styles.input}
                        value={user.secondName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, secondName: e.target.value })
                        }
                    />

                    <label className={styles.label}>Datum narození</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={user.birthDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUser({ ...user, birthDate: e.target.value })
                        }
                    />

                    <label className={styles.label}>Email (nelze změnit)</label>
                    <input
                        className={styles.input}
                        value={user.email}
                        disabled
                    />

                    <div className={styles.ghostText}>
                        Role: <strong>{user.role}</strong>
                    </div>

                    <div className={styles.daysText}>
                        Jsi s námi už <strong className={styles.highlight}>{days}</strong> dní 🎉
                    </div>

                    {msg && (
                        <div className={`${styles.msg} ${msg === "Uloženo ✔" ? styles.success : styles.error}`}>
                            {msg}
                        </div>
                    )}

                    <button className={styles.primaryBtn} onClick={save}>Uložit změny</button>
                </div>
            </div>
        </div>
    );
}