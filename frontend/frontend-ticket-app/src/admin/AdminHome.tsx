import { useState } from "react";
import Navbar from "../components/Navbar";
import AdminUsers from "./AdminUsers";
import AdminVenues from "./AdminVenues";
import AdminEvents from "./AdminEvents"; // Tady už máme hotovou .tsx verzi
import AdminStats from "./AdminStats";
import styles from "./styles/AdminHome.module.css"; // Import stylů

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
        <div className={styles.wrap}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Administrace</h1>
                    <p className={styles.subtitle}>{getTabTitle()}</p>

                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Uživatelé
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'venues' ? styles.active : ''}`}
                            onClick={() => setActiveTab('venues')}
                        >
                            Místa konání
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'events' ? styles.active : ''}`}
                            onClick={() => setActiveTab('events')}
                        >
                            Akce
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'stats' ? styles.active : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
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