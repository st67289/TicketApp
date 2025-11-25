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
import EventsList from "./pages/EventsList";
import Profile from "./user/Profile.tsx";
import CartPage from "./pages/CartPage.tsx";
import EventDetail from "./pages/EventDetail.tsx";

function EventDetailPlaceholder() { return <div style={{padding:24,color:"#e6e9ef",background:"#0b0f1a",minHeight:"100vh"}}>Detail eventu – bude později 🙂</div> }

function App() {
    const token = localStorage.getItem("token");
    let role: string | null = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch { /* empty */ }
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
            <Route path="/" element={<EventsList />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />

            <Route path="/admin" element={<RequireRole allowed="ADMINISTRATOR"><AdminHome /></RequireRole>}/>
            <Route path="/user" element={<RequireRole allowed="USER"><UserDashboard /></RequireRole>}/>
            <Route path="/cart" element={<RequireRole allowed="USER"><CartPage /></RequireRole>} />
            <Route path="/events/:id" element={<EventDetail />} />

            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<EventDetailPlaceholder />} />

            <Route path="/user/account" element={<Profile />}/>
            <Route path="/error/:code" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}

export default App;
