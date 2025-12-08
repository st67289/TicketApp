import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// Důležité: Importujeme CSS modul jako objekt "styles"
import styles from "./styles/Navbar.module.css";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Stav pro otevření/zavření menu na mobilu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const token = localStorage.getItem("token");

    let role: string | null = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch { /* empty */ }
    }

    const isAdmin = role === 'ADMINISTRATOR';

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/auth/login", { replace: true });
        setIsMenuOpen(false); // Zavřít menu po odhlášení
    };

    // Funkce pro zavření menu po kliknutí na odkaz (lepší UX na mobilu)
    const closeMenu = () => setIsMenuOpen(false);

    const onEventsPage = location.pathname === "/events" || location.pathname === "/";

    return (
        <nav className={styles.navContainer} role="navigation" aria-label="Main">
            <Link to="/" className={styles.brand} onClick={closeMenu}>
                <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                    <path fill="currentColor" d="M8 20a4 4 0 0 1 4-4h22a4 4 0 0 0 4-4h6a4 4 0 0 1 4 4v8a4 4 0 0 0 0 8v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z"/>
                </svg>
                TicketApp
            </Link>

            {/* Hamburger tlačítko (zobrazí se jen na mobilu díky CSS) */}
            <button
                className={styles.hamburger}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
            >
                {isMenuOpen ? "✕" : "☰"}
            </button>

            {/*
               Kombinace tříd:
               Vždy má 'styles.navLinks'.
               Pokud je 'isMenuOpen' true, přidáme 'styles.open'.
            */}
            <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>

                {!onEventsPage && (
                    <Link to="/events" className={styles.pill} onClick={closeMenu}>
                        Procházet akce
                    </Link>
                )}

                {/* Sekce pro ADMINA */}
                {token && isAdmin && (
                    <Link to="/admin" className={`${styles.pill} ${styles.admin}`} onClick={closeMenu}>
                        ⚙️ Administrace
                    </Link>
                )}

                {/* Sekce pro USERA */}
                {token && !isAdmin && (
                    <Link to="/user/tickets" className={styles.pill} onClick={closeMenu}>
                        Moje vstupenky
                    </Link>
                )}

                {token && (
                    <Link to="/user/account" className={styles.pill} onClick={closeMenu}>
                        Účet
                    </Link>
                )}

                {token && !isAdmin && (
                    <Link to="/cart" className={`${styles.pill} ${styles.cart}`} onClick={closeMenu}>
                        🛒 Košík
                    </Link>
                )}

                {token ? (
                    // Button nemá "to", ale onClick. Kombinujeme styles.pill a styles.primary
                    <button
                        className={`${styles.pill} ${styles.primary}`}
                        onClick={logout}
                    >
                        Odhlásit
                    </button>
                ) : (
                    <Link
                        to="/auth/login"
                        className={`${styles.pill} ${styles.primary}`}
                        onClick={closeMenu}
                    >
                        Přihlásit
                    </Link>
                )}
            </div>
        </nav>
    );
}