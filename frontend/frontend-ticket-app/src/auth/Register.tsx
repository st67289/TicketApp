import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:8080";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        secondName: "",
        birthDate: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                setError("Chyba při registraci");
                return;
            }

            navigate("/auth/login");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Nepodařilo se registrovat.");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>Registrace</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <input name="firstName" placeholder="Jméno" value={form.firstName} onChange={handleChange} required />
                <input name="secondName" placeholder="Příjmení" value={form.secondName} onChange={handleChange} required />
                <input name="birthDate" type="date" placeholder="Datum narození" value={form.birthDate} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Heslo" value={form.password} onChange={handleChange} required />
                <input name="confirmPassword" type="password" placeholder="Potvrzení hesla" value={form.confirmPassword} onChange={handleChange} required />
                <button type="submit">Registrovat</button>
            </form>
            <div style={{ marginTop: 20 }}>
                <Link to="/auth/login">Přihlášení</Link>
            </div>
        </div>
    );
}
