import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import AdminHome from "./admin/AdminHome";
import UserHome from "./user/UserHome";
import OAuthCallback from "./auth/OAuthCallback";
import type { JSX } from "react";

function App() {
    const token = localStorage.getItem("token");
    let role: string | null = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch { /* empty */ }
    }

    const RequireRole = ({ children, allowed }: { children: JSX.Element, allowed: string }) => {
        if (!token || role !== allowed) return <Navigate to="/auth/login" replace />;
        return children;
    };

    return (
        <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/admin" element={<RequireRole allowed="ADMIN"><AdminHome /></RequireRole>} />
            <Route path="/user" element={<RequireRole allowed="USER"><UserHome /></RequireRole>} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
    );
}

export default App;
