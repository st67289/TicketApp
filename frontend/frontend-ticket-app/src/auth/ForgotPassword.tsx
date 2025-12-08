import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/ForgotPassword.module.css"; // Import stylů

const BACKEND_URL = "http://localhost:8080";

type Step = "request" | "reset";

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [ok, setOk] = useState("");

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(""); setOk("");
        if (!email.trim()) { setErr("Zadejte e-mail."); return; }
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/auth/password/forgot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await safeJson(res);
                setErr(data?.detail || data?.error || "Nepodařilo se odeslat kód.");
                return;
            }
            setOk("Pokud účet existuje, poslali jsme ti e-mail s kódem.");
            setStep("reset");
        } catch {
            setErr("Chyba sítě. Zkus to prosím znovu.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(""); setOk("");
        if (!code.trim()) { setErr("Zadejte ověřovací kód."); return; }
        if (newPassword.length < 6) { setErr("Heslo musí mít alespoň 6 znaků."); return; }
        if (newPassword !== confirm) { setErr("Hesla se neshodují."); return; }

        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/auth/password/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            if (!res.ok) {
                const data = await safeJson(res);
                setErr(data?.detail || data?.error || "Reset hesla se nepodařil.");
                return;
            }
            setOk("Heslo bylo úspěšně změněno. Můžeš se přihlásit.");
        } catch {
            setErr("Chyba sítě. Zkus to prosím znovu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.card}>
                {step === "request" ? (
                    <>
                        <h1 className={styles.title}>Zapomenuté heslo</h1>
                        <p className={styles.subtitle}>Zadej svůj e-mail a pošleme ti ověřovací kód.</p>

                        {err && <div className={styles.errorBox}>⚠️ {err}</div>}
                        {ok && <div className={styles.okBox}>✅ {ok}</div>}

                        <form className={styles.form} onSubmit={handleRequest} noValidate>
                            <div>
                                <label className={styles.label}>E-mail</label>
                                <input
                                    className={styles.input}
                                    type="email"
                                    placeholder="jan.novak@email.cz"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <button className={styles.button} disabled={loading}>
                                {loading ? "Odesílám…" : "Poslat kód"}
                            </button>
                        </form>

                        <p className={styles.note}>
                            Pamatuješ si heslo?{" "}
                            <Link to="/auth/login" className={styles.link}>Zpět na přihlášení</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className={styles.title}>Obnovit heslo</h1>
                        <p className={styles.subtitle}>
                            Zadej kód z e-mailu a nové heslo pro účet <strong>{email}</strong>.
                        </p>

                        {err && <div className={styles.errorBox}>⚠️ {err}</div>}
                        {ok && <div className={styles.okBox}>✅ {ok}</div>}

                        <form className={styles.form} onSubmit={handleReset} noValidate>
                            <div>
                                <label className={styles.label}>Ověřovací kód</label>
                                <input
                                    className={styles.input}
                                    placeholder="Zadej kód"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    required
                                    inputMode="numeric"
                                />
                            </div>

                            <div className={styles.passwordRow}>
                                <div>
                                    <label className={styles.label}>Nové heslo</label>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        minLength={6}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Potvrzení hesla</label>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        minLength={6}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button className={styles.button} disabled={loading}>
                                {loading ? "Ukládám…" : "Změnit heslo"}
                            </button>
                        </form>

                        <p className={styles.note}>
                            Kód nedorazil? Zkontroluj spam nebo{" "}
                            <button
                                onClick={() => { setStep("request"); setOk(""); setErr(""); }}
                                className={styles.textBtn}
                            >
                                požádej znovu
                            </button>.
                        </p>

                        <p className={styles.note}>
                            <Link to="/auth/login" className={styles.link}>Zpět na přihlášení</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

async function safeJson(res: Response) {
    try { return await res.json(); } catch { return null; }
}