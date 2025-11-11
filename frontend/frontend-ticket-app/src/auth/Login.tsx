import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data?.message || "Chyba při přihlášení");
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);

            // přesměrování podle role
            if (data.role === "ADMIN") navigate("/admin");
            else navigate("/user");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Nepodařilo se přihlásit.");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>Přihlášení</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                </div>
                <div>
                    <label>Heslo:</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
                </div>
                <button type="submit">Přihlásit</button>
            </form>

            <button
                style={{ marginTop: 20 }}
                onClick={() => window.location.href = `${BACKEND_URL}/oauth2/authorization/google`}
            >
                Přihlásit přes Google
            </button>

            <div style={{ marginTop: 20 }}>
                <Link to="/auth/register">Registrace</Link> | <Link to="/auth/forgot">Zapomněli jste heslo?</Link>
            </div>
        </div>
    );
}
