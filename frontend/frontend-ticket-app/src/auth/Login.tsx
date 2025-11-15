import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";

const BACKEND_URL = "http://localhost:8080";

export default function Login() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            setIsSubmitting(true);
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                let msg = "Chyba při přihlášení";
                try {
                    const data = await res.json();
                    msg = data?.message || msg;
                } catch { /* empty */ }
                setError(msg);
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);

            if (data.role === "ADMINISTRATOR") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/user";
            }
        } catch {
            setError("Nepodařilo se přihlásit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.hero}>
            <div className={styles.card} style={{ position: "relative" }}>
                <Link
                    to="/events"
                    style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        padding: "6px 10px",
                        fontSize: 12,
                        background: "rgba(124,58,237,0.85)",
                        color: "#fff",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontWeight: 600,
                        zIndex: 10
                    }}
                >
                    Procházet akce
                </Link>

                <header className={styles.header}>
                    <span className={styles.logo} aria-hidden="true">
                        <svg viewBox="0 0 64 64" className={styles.logoIcon} role="img" aria-label="Ticket icon">
                            <path d="M8 20a4 4 0 0 1 4-4h22a4 4 0 0 0 4-4h6a4 4 0 0 1 4 4v8a4 4 0 0 0 0 8v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z" />
                            <circle cx="28" cy="22" r="2" />
                            <circle cx="34" cy="22" r="2" />
                            <circle cx="40" cy="22" r="2" />
                        </svg>
                    </span>
                    <h1 className={styles.title}>Přihlášení</h1>
                    <p className={styles.subtitle}>Vrať se k lovu těch nejlepších míst.</p>
                </header>

                {error && <p className={`${styles.error} ${styles.shake}`} role="alert">{error}</p>}

                <form onSubmit={handleLogin} className={styles.form} noValidate>
                    <label className={styles.field}>
                        <span className={styles.label}>Email</span>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="jan.novak@email.cz"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Heslo</span>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            minLength={6}
                        />
                    </label>

                    <button className={styles.button} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <span className={styles.spinner} aria-hidden="true" /> : "Přihlásit"}
                    </button>
                </form>

                <div className={styles.divider}><span>nebo</span></div>

                <button
                    type="button"
                    className={styles.oauthBtn}
                    onClick={() => (window.location.href = `${BACKEND_URL}/oauth2/authorization/google`)}
                >
                    <svg className={styles.oauthIcon} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.33-1.59 3.9-5.27 3.9-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.03.77 3.73 1.43l2.55-2.46C17.58 3.6 15.67 2.7 13.17 2.7 7.99 2.7 3.8 6.9 3.8 12s4.19 9.3 9.37 9.3c5.4 0 8.96-3.79 8.96-9.13 0-.61-.07-1.07-.18-1.47z" />
                    </svg>
                    Přihlásit přes Google
                </button>

                <div className={styles.footer}>
                    <Link className={styles.link} to="/auth/register">Nemáš účet? Registrace</Link>
                    <span className={styles.muted}> · </span>
                    <Link className={styles.link} to="/auth/forgot">Zapomněli jste heslo?</Link>
                </div>
            </div>
        </div>
    );
}
