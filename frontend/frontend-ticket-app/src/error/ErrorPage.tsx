import { Link, useParams, useLocation } from "react-router-dom";

export default function ErrorPage() {
    const { code } = useParams();
    const location = useLocation() as { state?: { message?: string } };

    const title = mapTitle(code);
    const message =
        location.state?.message ??
        mapMessage(code) ??
        "Došlo k chybě. Zkuste to prosím znovu.";

    return (
        <div style={wrap}>
            <div style={card}>
                <h1 style={{ margin: 0 }}>{title} <span style={pill}>{code}</span></h1>
                <p style={{ opacity: .85 }}>{message}</p>
                <div style={{ marginTop: 12 }}>
                    <Link to="/auth/login" style={link}>Zpět na přihlášení</Link>
                </div>
            </div>
        </div>
    );
}

function mapTitle(code?: string) {
    switch (code) {
        case "400": return "Neplatná žádost";
        case "401": return "Neautorizováno";
        case "403": return "Přístup odepřen";
        case "404": return "Nenalezeno";
        case "500": return "Interní chyba serveru";
        default:    return "Chyba";
    }
}
function mapMessage(code?: string) {
    switch (code) {
        case "400": return "Zkontrolujte zadané údaje a zkuste to znovu.";
        case "401": return "Přihlaste se prosím a pokračujte.";
        case "403": return "Na tuto akci nemáte oprávnění.";
        case "404": return "Hledanou stránku se nepodařilo najít.";
        case "500": return "Něco se pokazilo na naší straně.";
        default:    return undefined;
    }
}

const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "40px",
    background: "linear-gradient(160deg,#0b0f1a,#181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial"
};
const card: React.CSSProperties = {
    width: "min(560px, 92vw)",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 28,
    backdropFilter: "saturate(140%) blur(10px)"
};
const link: React.CSSProperties = {
    color: "#22d3ee",
    textDecoration: "none",
    borderBottom: "1px dashed transparent"
};
const pill: React.CSSProperties = {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: 10,
    fontSize: 14
};
