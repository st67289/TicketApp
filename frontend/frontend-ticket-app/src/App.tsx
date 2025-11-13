// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import AdminHome from "./admin/AdminHome";
import OAuthCallback from "./auth/OAuthCallback";
import NotFound from "./error/NotFound";
import ErrorPage from "./error/ErrorPage";
import type { JSX } from "react";
import ForgotPassword from "./auth/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";

function App() {
    const token = localStorage.getItem("token");
    let role: string | null = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch {}
    }

    const RequireRole = ({
                             children,
                             allowed,
                         }: {
        children: JSX.Element;
        allowed: string;
    }) => {
        if (!token || role !== allowed) {
            return (
                <Navigate
                    to="/error/403"
                    replace
                    state={{ message: "Potřebujete oprávnění." }}
                />
            );
        }
        return children;
    };

    return (
        <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />

            <Route
                path="/admin"
                element={
                    <RequireRole allowed="ADMINISTRATOR">
                        <AdminHome />
                    </RequireRole>
                }
            />

            { }
            <Route
                path="/user"
                element={
                    <RequireRole allowed="USER">
                        <UserDashboard />
                    </RequireRole>
                }
            />

            <Route path="/error/:code" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
