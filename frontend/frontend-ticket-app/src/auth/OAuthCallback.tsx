import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const processingRef = useRef(false); // Zámek proti dvojímu spuštění

    useEffect(() => {
        // 1. Přečteme kód přímo z URL prohlížeče (ne přes useLocation, pro jistotu)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        // Pokud už máme token, jdeme pryč
        if (localStorage.getItem("token")) {
            navigate("/user", { replace: true });
            return;
        }

        // Pokud není kód, nebo už proces běží/běžel, končíme
        if (!code || processingRef.current) return;

        // 2. Zamkneme proces
        processingRef.current = true;

        const exchangeCode = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/auth/oauth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const data = await res.json();

                if (!res.ok) {
                    // Pokud backend vrátí chybu (např. kód už byl použit), zobrazíme ji
                    // Ale pokud už byl použit námi (race condition), možná už máme token?
                    // Tady to zjednodušíme na výpis chyby.
                    throw new Error(data?.error || "Chyba při výměně kódu.");
                }

                // 3. Uložíme token
                localStorage.setItem("token", data.token);

                // 4. Teprve teď vyčistíme URL (aby to uživatel neviděl/nesdílel)
                window.history.replaceState({}, "", "/user");

                // 5. Přesměrujeme
                // Zjistíme roli a přesměrujeme správně
                if (data.role === "ADMINISTRATOR") {
                    window.location.href = "/admin"; // Force reload pro načtení menu
                } else {
                    window.location.href = "/user";
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Nepodařilo se dokončit OAuth přihlášení.");
                processingRef.current = false; // Uvolníme zámek pro případný retry (i když u OAuth kódu to moc nejde)
            }
        };

        exchangeCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center", color: "#e6e9ef" }}>
            <h2 style={{marginBottom: 20}}>Přihlašování...</h2>
            {error ? (
                <div style={{ color: "#fca5a5", background: "rgba(255,0,0,0.1)", padding: 15, borderRadius: 8 }}>
                    {error} <br/>
                    <button
                        onClick={() => navigate("/auth/login")}
                        style={{marginTop: 15, padding: "8px 16px", cursor: "pointer"}}
                    >
                        Zpět na přihlášení
                    </button>
                </div>
            ) : (
                <div className="spinner">Momentík, ověřujeme Google účet...</div>
            )}
        </div>
    );
}