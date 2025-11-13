import { Link, useNavigate } from "react-router-dom";

const navWrap: React.CSSProperties = {
    position: "fixed",
    inset: "14px 14px auto 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    color: "#e6e9ef",
    zIndex: 50
};

const brand: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    letterSpacing: .3,
    textDecoration: "none",
    color: "#e6e9ef"
};

const navLinks: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center" };

const pill: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.05)",
    color: "#e6e9ef",
    textDecoration: "none",
    fontSize: 14
};

const primary: React.CSSProperties = {
    ...pill,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    border: "0",
    cursor: "pointer",
    fontWeight: 700
};

export default function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/auth/login", { replace: true });
    };

    return (
        <nav style={navWrap} role="navigation" aria-label="Main">
            <Link to="/" style={brand}>
                <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                    <path fill="currentColor" d="M8 20a4 4 0 0 1 4-4h22a4 4 0 0 0 4-4h6a4 4 0 0 1 4 4v8a4 4 0 0 0 0 8v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z"/>
                </svg>
                TicketApp
            </Link>

            <div style={navLinks}>
                <Link to="/events" style={pill}>Procházet akce</Link>
                <Link to="/user/tickets" style={pill}>Moje vstupenky</Link>
                <Link to="/user/account" style={pill}>Účet</Link>
                <button style={primary} onClick={logout} aria-label="Odhlásit se">Odhlásit</button>
            </div>
        </nav>
    );
}
