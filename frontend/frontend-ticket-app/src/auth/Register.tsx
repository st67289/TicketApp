import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const BACKEND_URL = "http://localhost:8080";

export default function Register() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        secondName: "",
        birthDate: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirmPassword) {
            setError("Hesla se neshodují.");
            return;
        }
        try {
            setIsSubmitting(true);
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                setError("Chyba při registraci. Zkuste to prosím znovu.");
                return;
            }
            navigate("/auth/login");
        } catch {
            setError("Nepodařilo se registrovat. Zkontroluj připojení.");
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
            {/*SVG*/}
              <svg viewBox="0 0 64 64" className={styles.logoIcon} role="img" aria-label="Ticket icon">
              <path d="M8 20a4 4 0 0 1 4-4h22a4 4 0 0 0 4-4h6a4 4 0 0 1 4 4v8a4 4 0 0 0 0 8v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z" />
              <circle cx="28" cy="22" r="2" />
              <circle cx="34" cy="22" r="2" />
              <circle cx="40" cy="22" r="2" />
            </svg>
          </span>
                    <h1 className={styles.title}>TicketPortal</h1>
                    <p className={styles.subtitle}>Vytvoř si účet a ulov nejlepší místa.</p>
                </header>

                {error && (
                    <p className={`${styles.error} ${styles.shake}`} role="alert">
                        {error}
                    </p>
                )}

                <form onSubmit={handleRegister} className={styles.form} noValidate>
                    <label className={styles.field}>
                        <span className={styles.label}>Jméno</span>
                        <input
                            className={styles.input}
                            name="firstName"
                            placeholder="Jan"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            autoComplete="given-name"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Příjmení</span>
                        <input
                            className={styles.input}
                            name="secondName"
                            placeholder="Novák"
                            value={form.secondName}
                            onChange={handleChange}
                            required
                            autoComplete="family-name"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Datum narození</span>
                        <input
                            className={styles.input}
                            name="birthDate"
                            type="date"
                            value={form.birthDate}
                            onChange={handleChange}
                            required
                            autoComplete="bday"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Email</span>
                        <input
                            className={styles.input}
                            name="email"
                            type="email"
                            placeholder="jan.novak@email.cz"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Heslo</span>
                        <input
                            className={styles.input}
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            minLength={6}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Potvrzení hesla</span>
                        <input
                            className={styles.input}
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                            minLength={6}
                        />
                    </label>

                    <button className={styles.button} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className={styles.spinner} aria-hidden="true" />
                        ) : (
                            "Registrovat"
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>Už máš účet?</span>{" "}
                    <Link className={styles.link} to="/auth/login">
                        Přihlášení
                    </Link>
                </div>
            </div>
        </div>
    );
}
