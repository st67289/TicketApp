import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:8080";

type Props = {
    url: string;
    alt: string;
    style?: React.CSSProperties;
};

export default function AuthImage({ url, alt, style }: Props) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        const fetchImage = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BACKEND_URL}${url}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const blob = await res.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setImageSrc(objectUrl);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            }
        };

        fetchImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [url]);

    if (error) return <div style={{...style, background: "#eee", color: "#333", display: "grid", placeItems: "center", fontSize: 10}}>Chyba QR</div>;
    if (!imageSrc) return <div style={{...style, background: "#f0f0f0"}} />; // Loading...

    return <img src={imageSrc} alt={alt} style={style} />;
}