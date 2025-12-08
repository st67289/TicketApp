// src/admin/SeatingDesigner.tsx
import React, { useState, useEffect } from "react";

// Styly (zjednodušené pro editor)
const container: React.CSSProperties = { border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, background: "rgba(0,0,0,0.2)", marginTop: 10 };
const rowItem: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" };
const inputSmall: React.CSSProperties = { background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "6px", borderRadius: 6, width: "80px" };
const btnSmall: React.CSSProperties = { padding: "4px 8px", cursor: "pointer", background: "#fca5a5", color: "#7f1d1d", border: "none", borderRadius: 4, fontWeight: "bold" };
const btnAdd: React.CSSProperties = { ...btnSmall, background: "#86efac", color: "#14532d", width: "100%", marginTop: 8 };

const previewContainer: React.CSSProperties = { marginTop: 20, padding: 10, borderTop: "1px solid rgba(255,255,255,0.1)" };
const seatRow: React.CSSProperties = { display: "flex", gap: 4, justifyContent: "center", marginBottom: 4 };
const seatBox: React.CSSProperties = { width: 16, height: 16, background: "#3b82f6", borderRadius: 2, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white" };

type RowDef = { label: string; count: number };

interface Props {
    initialJson: string;
    onChange: (json: string) => void;
}

export default function SeatingDesigner({ initialJson, onChange }: Props) {
    const [rows, setRows] = useState<RowDef[]>([]);

    // Načtení existujícího JSONu při otevření
    useEffect(() => {
        try {
            if (initialJson) {
                const parsed = JSON.parse(initialJson);
                if (parsed.rows && Array.isArray(parsed.rows)) {
                    setRows(parsed.rows);
                }
            }
        } catch (e) {
            console.error("Chyba parsování JSONu plánek", e);
        }
    }, []);

    // Kdykoliv se změní řady, vygeneruj nový JSON a pošli rodiči
    useEffect(() => {
        // Spustí se jen když se změní data v řadách (rows)
        const result = JSON.stringify({ rows });
        onChange(result);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    const addRow = () => {
        const nextLabel = String.fromCharCode(65 + rows.length); // A, B, C...
        setRows([...rows, { label: nextLabel, count: 10 }]);
    };

    const updateRow = (index: number, field: keyof RowDef, value: string | number) => {
        const newRows = [...rows];
        if (field === "count") {
            let numValue = Number(value);
            if (numValue > 25) numValue = 25; // Oříznout na 25
            if (numValue < 1) numValue = 1;   // Minimum 1
            newRows[index] = { ...newRows[index], [field]: numValue };
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            newRows[index] = { ...newRows[index], [field]: value };
        }
        setRows(newRows);
    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    return (
        <div style={container}>
            <h4 style={{ margin: "0 0 10px 0", color: "#a7b0c0" }}>Editor sezení</h4>

            {/* Editor řad */}
            <div>
                {rows.map((r, i) => (
                    <div key={i} style={rowItem}>
                        <span style={{width: 20, color: "#a7b0c0"}}>{i+1}.</span>
                        <input
                            style={inputSmall}
                            value={r.label}
                            placeholder="Řada"
                            onChange={(e) => updateRow(i, "label", e.target.value)}
                        />
                        <input
                            style={inputSmall}
                            type="number"
                            value={r.count}
                            min={1}
                            max={25}
                            onChange={(e) => updateRow(i, "count", Number(e.target.value))}
                        />
                        <button type="button" style={btnSmall} onClick={() => removeRow(i)}>X</button>
                    </div>
                ))}
                <button type="button" style={btnAdd} onClick={addRow}>+ Přidat řadu</button>
            </div>

            {/* Náhled */}
            <div style={previewContainer}>
                <div style={{fontSize: 12, color: "#a7b0c0", marginBottom: 8, textAlign: "center"}}>Náhled sálu (PODIUM)</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {rows.map((r, i) => (
                        <div key={i} style={seatRow}>
                            <span style={{ marginRight: 8, fontSize: 12, color: "#a7b0c0", width: 15 }}>{r.label}</span>
                            {Array.from({ length: r.count }).map((_, s) => (
                                <div key={s} style={seatBox} title={`Řada ${r.label} - Sedadlo ${s+1}`}></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}