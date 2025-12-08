import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styles from "./styles/AdminStats.module.css"; // Import stylů

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
            try {
                const res = await fetch(`${BACKEND_URL}/api/events?size=100&sort=startTime,desc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.content);
                }
            } catch (e) {
                console.error(e);
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
            <div className={styles.formField}>
                <label className={styles.formLabel}>Vyberte akci pro zobrazení prodejů</label>
                <select
                    className={styles.select}
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                >
                    <option className={styles.option} value="">-- Vyberte akci --</option>
                    {events.map(e => (
                        <option key={e.id} className={styles.option} value={e.id}>
                            {new Date(e.startTime).toLocaleDateString()} - {e.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEventId && (
                <div className={styles.chartContainer}>
                    {loading ? (
                        <div className={styles.messageCenter}>Načítám data...</div>
                    ) : stats.length === 0 ? (
                        <div className={styles.messageCenter}>Zatím žádné prodeje.</div>
                    ) : (
                        <>
                            <h3 className={styles.chartTitle}>Vývoj prodeje vstupenek</h3>
                            {/* ResponsiveContainer se přizpůsobí výšce rodiče (.chartContainer) */}
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={stats} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#a7b0c0"
                                        tickFormatter={formatDate}
                                        tick={{fontSize: 12}}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="#a7b0c0"
                                        allowDecimals={false}
                                        tick={{fontSize: 12}}
                                        width={30}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#181d2f', border: '1px solid #444', borderRadius: 8, color: '#fff' }}
                                        labelStyle={{ color: '#a7b0c0', marginBottom: 5 }}
                                        itemStyle={{ fontSize: 13 }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="seatingCount"
                                        name="Sezení"
                                        stroke="#22d3ee"
                                        strokeWidth={3}
                                        dot={{r: 4, fill: "#22d3ee"}}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="standingCount"
                                        name="Stání"
                                        stroke="#7c3aed"
                                        strokeWidth={3}
                                        dot={{r: 4, fill: "#7c3aed"}}
                                        activeDot={{ r: 6 }}
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