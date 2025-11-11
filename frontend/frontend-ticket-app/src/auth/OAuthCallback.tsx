import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    const sentRef = useRef(false); // místo useState

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get("code");

        // spustí se jen jednou
        if (!code || sentRef.current) return;
        sentRef.current = true;

        console.log("Exchanging code:", code);

        const exchangeCode = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/auth/oauth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data?.error || "Chyba při výměně kódu.");
                    return;
                }

                localStorage.setItem("token", data.token);

                if (data.role === "ADMIN") navigate("/admin");
                else navigate("/user");
            } catch {
                setError("Nepodařilo se dokončit OAuth přihlášení.");
            }
        };

        exchangeCode();
    }, [location.search, navigate]); // odstraněn `sent` z dependency listu

    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>OAuth přihlášení</h2>
            {error ? <p style={{ color: "red" }}>{error}</p> : <p>Probíhá přihlášení...</p>}
        </div>
    );
}
