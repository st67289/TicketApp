import { useState } from "react";
import { Link } from "react-router-dom";

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial",
};

const card: React.CSSProperties = {
    width: "min(560px, 92vw)",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 28,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
};

const title: React.CSSProperties = {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: .2,
};

const subtitle: React.CSSProperties = {
    marginTop: 6,
    marginBottom: 18,
    color: "#a7b0c0",
    fontSize: 14,
};

const form: React.CSSProperties = {
    display: "grid",
    gap: 14,
};

const label: React.CSSProperties = {
    fontSize: 13,
    color: "#a7b0c0",
};

const input: React.CSSProperties = {
    appearance: "none",
    width: "100%",
    padding: "14px 16px",
    lineHeight: 1.25,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
    color: "#e6e9ef",
    outline: "none",
} as const;

const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
};

const button: React.CSSProperties = {
    marginTop: 4,
    padding: "14px 18px",
    border: 0,
    borderRadius: 14,
    cursor: "pointer",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: .2,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    boxShadow: "0 10px 24px rgba(124,58,237,.35)",
};

const link: React.CSSProperties = {
    color: "#22d3ee",
    textDecoration: "none",
    borderBottom: "1px dashed transparent",
};

const note: React.CSSProperties = {
    marginTop: 8,
    fontSize: 13,
    color: "#a7b0c0",
};

const errorBox: React.CSSProperties = {
    marginTop: 4,
    background: "rgba(255,107,107,.12)",
    border: "1px solid rgba(255,107,107,.35)",
    color: "#e6e9ef",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 14,
};

const okBox: React.CSSProperties = {
    marginTop: 4,
    background: "rgba(34,211,238,.10)",
    border: "1px solid rgba(34,211,238,.35)",
    color: "#e6e9ef",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 14,
};

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
        <div style={wrap}>
            <div style={card}>
                {step === "request" ? (
                    <>
                        <h1 style={title}>Zapomenuté heslo</h1>
                        <p style={subtitle}>Zadej svůj e-mail a pošleme ti ověřovací kód.</p>

                        {err && <div style={errorBox}>{err}</div>}
                        {ok && <div style={okBox}>{ok}</div>}

                        <form style={form} onSubmit={handleRequest} noValidate>
                            <div>
                                <div style={label}>E-mail</div>
                                <input
                                    style={input}
                                    type="email"
                                    placeholder="jan.novak@email.cz"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <button style={button} disabled={loading}>
                                {loading ? "Odesílám…" : "Poslat kód"}
                            </button>
                        </form>

                        <p style={note}>
                            Pamatuješ si heslo?{" "}
                            <Link to="/auth/login" style={link}>Zpět na přihlášení</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={title}>Obnovit heslo</h1>
                        <p style={subtitle}>Zadej kód z e-mailu a nové heslo pro účet <strong>{email}</strong>.</p>

                        {err && <div style={errorBox}>{err}</div>}
                        {ok && <div style={okBox}>{ok}</div>}

                        <form style={form} onSubmit={handleReset} noValidate>
                            <div>
                                <div style={label}>Ověřovací kód</div>
                                <input
                                    style={input}
                                    placeholder="Zadej kód"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    required
                                    inputMode="numeric"
                                />
                            </div>

                            <div style={row2}>
                                <div>
                                    <div style={label}>Nové heslo</div>
                                    <input
                                        style={input}
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
                                    <div style={label}>Potvrzení hesla</div>
                                    <input
                                        style={input}
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

                            <button style={button} disabled={loading}>
                                {loading ? "Ukládám…" : "Změnit heslo"}
                            </button>
                        </form>

                        <p style={note}>
                            Kód nedorazil? Zkontroluj spam nebo{" "}
                            <button
                                onClick={() => { setStep("request"); setOk(""); setErr(""); }}
                                style={{ ...link, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                            >
                                požádej znovu
                            </button>.
                        </p>

                        <p style={note}>
                            <Link to="/auth/login" style={link}>Zpět na přihlášení</Link>
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
