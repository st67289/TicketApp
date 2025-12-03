import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Styly (recyklujeme z AdminVenues)
const formField: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 20 };
const formLabel: React.CSSProperties = { fontSize: 13, color: "#a7b0c0" };
const select: React.CSSProperties = {
    appearance: "none", width: "100%", padding: "10px 12px", borderRadius: 12,
    border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)",
    color: "#e6e9ef", outline: "none", cursor: "pointer"
};
const optionStyle: React.CSSProperties = { background: "#181d2f", color: "#e6e9ef" };

const chartContainer: React.CSSProperties = {
    marginTop: 30,
    background: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    padding: 20,
    height: 400
};

const BACKEND_URL = "http://localhost:8080";

type EventShortDto = { id: number; name: string; startTime: string; };
type SalesStatsDto = { date: string; seatingCount: number; standingCount: number; };

export default function AdminStats() {
    const [events, setEvents] = useState<EventShortDto[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [stats, setStats] = useState<SalesStatsDto[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Načíst seznam akcí pro výběr
    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token");
            // Použijeme existující endpoint, jen si vyfiltrujeme/seřadíme co potřebujeme
            const res = await fetch(`${BACKEND_URL}/api/events?size=100&sort=startTime,desc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.content);
            }
        };
        fetchEvents();
    }, []);

    // 2. Načíst statistiky při změně výběru
    useEffect(() => {
        if (!selectedEventId) return;

        const fetchStats = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BACKEND_URL}/api/admin/stats/event/${selectedEventId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedEventId]);

    // Formátování data pro osu X
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'numeric' });
    };

    return (
        <div>
            <div style={formField}>
                <label style={formLabel}>Vyberte akci pro zobrazení prodejů</label>
                <select
                    style={select}
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                >
                    <option style={optionStyle} value="">-- Vyberte akci --</option>
                    {events.map(e => (
                        <option key={e.id} style={optionStyle} value={e.id}>
                            {new Date(e.startTime).toLocaleDateString()} - {e.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEventId && (
                <div style={chartContainer}>
                    {loading ? (
                        <div style={{textAlign: "center", color: "#a7b0c0", paddingTop: 150}}>Načítám data...</div>
                    ) : stats.length === 0 ? (
                        <div style={{textAlign: "center", color: "#a7b0c0", paddingTop: 150}}>Zatím žádné prodeje.</div>
                    ) : (
                        <>
                            <h3 style={{marginTop: 0, marginBottom: 20, textAlign: "center", color: "#e6e9ef"}}>Vývoj prodeje vstupenek</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={stats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#a7b0c0"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis stroke="#a7b0c0" allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#181d2f', border: '1px solid #444', borderRadius: 8 }}
                                        labelStyle={{ color: '#e6e9ef' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="seatingCount"
                                        name="Sezení"
                                        stroke="#22d3ee"
                                        strokeWidth={3}
                                        dot={{r: 4}}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="standingCount"
                                        name="Stání"
                                        stroke="#7c3aed"
                                        strokeWidth={3}
                                        dot={{r: 4}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}