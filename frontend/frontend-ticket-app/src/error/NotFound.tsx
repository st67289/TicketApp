import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div style={wrap}>
            <div style={card}>
                <h1 style={{ margin: 0 }}>404 – Stránka nenalezena</h1>
                <p style={{ opacity: .8 }}>Tuhle show jsme v programu nenašli. 😅</p>
                <Link to="/auth/login" style={link}>Zpět na přihlášení</Link>
            </div>
        </div>
    );
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
