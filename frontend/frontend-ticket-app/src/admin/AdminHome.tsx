// src/admin/AdminHome.tsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import AdminUsers from "./AdminUsers";
import AdminVenues from "./AdminVenues";
import AdminEvents from "./AdminEvents.tsx";
import AdminStats from "./AdminStats";

// Styly
const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    padding: "80px 24px 40px",
    background: "linear-gradient(160deg, #0b0f1a, #181d2f)",
    color: "#e6e9ef",
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, Arial",
};
const container: React.CSSProperties = { width: "min(1200px, 94vw)", margin: "0 auto" };
const card: React.CSSProperties = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 22,
    backdropFilter: "saturate(140%) blur(10px)",
    WebkitBackdropFilter: "saturate(140%) blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
};
const title: React.CSSProperties = { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: .2 };
const subtitle: React.CSSProperties = { margin: '4px 0 16px', color: "#a7b0c0", fontSize: 14 };

const tabs: React.CSSProperties = { display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,.12)', marginBottom: '16px' };
const tabButton: React.CSSProperties = {
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    color: '#a7b0c0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    borderBottom: '2px solid transparent'
};
const activeTabButton: React.CSSProperties = {
    ...tabButton,
    color: '#e6e9ef',
    borderBottom: '2px solid #22d3ee'
};


type AdminTab = 'users' | 'venues' | 'events' | 'stats';

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <AdminUsers />;
            case 'venues':
                return <AdminVenues />;
            case 'events':
                return <AdminEvents />;
            case 'stats':
                return <AdminStats />;
            default:
                return null;
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'users': return "Správa uživatelů";
            case 'venues': return "Správa míst konání";
            case 'events': return "Správa kulturních akcí";
            case 'stats': return "Sledování prodejů";
            default: return "Administrace";
        }
    }

    return (
        <div style={wrap}>
            <Navbar />
            <div style={container}>
                <div style={card}>
                    <h1 style={title}>Administrace</h1>
                    <p style={subtitle}>{getTabTitle()}</p>

                    <div style={tabs}>
                        <button style={activeTab === 'users' ? activeTabButton : tabButton} onClick={() => setActiveTab('users')}>
                            Uživatelé
                        </button>
                        <button style={activeTab === 'venues' ? activeTabButton : tabButton} onClick={() => setActiveTab('venues')}>
                            Místa konání
                        </button>
                        <button style={activeTab === 'events' ? activeTabButton : tabButton} onClick={() => setActiveTab('events')}>
                            Akce
                        </button>
                        <button style={activeTab === 'stats' ? activeTabButton : tabButton} onClick={() => setActiveTab('stats')}>
                            📊 Prodeje
                        </button>
                    </div>

                    <div className="tab-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}