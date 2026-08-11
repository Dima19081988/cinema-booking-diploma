import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AdminLoginPage.module.css";

function AdminLoginPage() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            await login(formData);
            navigate("/admin");
        } catch (err) {
            console.error("ADMIN LOGIN ERROR:", err);

            const errorData = err.response?.data;
            const message =
                errorData?.detail ||
                "Не удалось войти. Проверьте логин и пароль.";

            setError(Array.isArray(message) ? message.join(" ") : message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Вход для администратора</h1>

                <p className={styles.description}>
                    Введите данные учётной записи администратора.
                </p>

                {error && <p className={styles.error}>{error}</p>}

                <label className={styles.label} htmlFor="username">
                    Логин
                </label>
                <input
                    className={styles.input}
                    id="username" 
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username" 
                />

                <label className={styles.label} htmlFor="username">
                    Пароль
                </label>
                <input
                    className={styles.input}
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                />

                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? "Выполняется вход..." : "Войти"}
                </button>
            </form>
        </div>
    );
}

export default AdminLoginPage;