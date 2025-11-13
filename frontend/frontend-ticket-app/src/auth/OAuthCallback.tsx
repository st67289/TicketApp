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

        const existingToken = localStorage.getItem("token");
        if (existingToken) {
            navigate("/user", { replace: true });
            return;
        }

        if (!code || sentRef.current) return;

        if (sessionStorage.getItem(`oauth_used_${code}`) === "1") {
            navigate("/user", { replace: true });
            return;
        }

        sentRef.current = true;

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
                sessionStorage.setItem(`oauth_used_${code}`, "1");

                navigate("/user", { replace: true });
            } catch {
                setError("Nepodařilo se dokončit OAuth přihlášení.");
            }
        };

        exchangeCode();
    }, [location.search, navigate]);
    window.history.replaceState({}, "", "/oauth2/callback");




    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>OAuth přihlášení</h2>
            {error ? <p style={{ color: "red" }}>{error}</p> : <p>Probíhá přihlášení...</p>}
        </div>
    );
}
