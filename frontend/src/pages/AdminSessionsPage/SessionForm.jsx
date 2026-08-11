import { useState } from "react";
import styles from "./AdminSessionsPage.module.css";

const formatDateTimeLocal = (dateTime) => {
    if (!dateTime) {
        return "";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number) => String(number).padStart(2, "0");

    return [
        date.getFullYear(),
        "-",
        pad(date.getMonth() + 1),
        "-",
        pad(date.getDate()),
        "T",
        pad(date.getHours()),
        ":",
        pad(date.getMinutes()),
    ].join("");
}

const getInitialFormData = (session = null) => ({
    movie_id: session?.movie_id?.toString() || "",
    hall_id: session?.hall_id?.toString() || "",
    start_at: formatDateTimeLocal(session?.start_at),
    end_at: formatDateTimeLocal(session?.end_at),
    base_price: session?.base_price?.toString() || "",
    vip_price: session?.vip_price?.toString() || "",
    status: session?.status || "DRAFT",
});

function SessionForm ({
    session,
    movies,
    halls,
    error,
    isSubmitting,
    onCancel,
    onSaveSession,
}) {
    const [formData, setFormData] = useState(() =>
        getInitialFormData(session)
    );

    const isEditMode = Boolean(session);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            movie_id: Number(formData.movie_id),
            hall_id: Number(formData.hall_id),
            start_at: new Date(formData.start_at).toISOString(),
            end_at: new Date(formData.end_at).toISOString(),
            base_price: Number(formData.base_price),
            vip_price: Number(formData.vip_price),
            status: formData.status,
        };

        await onSaveSession(payload);
    };

    return (
        <section className={styles.formSection}>
            <h2 className={styles.formTitle}>
                {isEditMode ? "Редактирование сеанса" : "Новый сеанс"}
            </h2>

            {error && <p className={styles.error}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label} htmlFor="movie_id">
                    Фильм *
                </label>
                <select
                    className={styles.input} 
                    id="movie_id"
                    name="movie_id"
                    value={formData.movie_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Выберите фильм</option>
                    {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                            {movie.title}
                            {!movie.is_active ? " — скрыт" : ""}
                        </option>
                    ))}
                </select>

                <label className={styles.label} htmlFor="hall_id">
                    Зал *
                </label>
                <select
                    className={styles.input} 
                    id="hall_id"
                    name="hall_id" 
                    value={formData.hall_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Выберите зал</option>
                    {halls.map((hall) => (
                        <option key={hall.id} value={hall.id}>
                            {hall.name} — {hall.rows_count} рядов ×{" "}
                            {hall.seats_per_row} мест
                            {!hall.is_active ? " — неактивен" : ""}
                        </option>
                    ))}
                </select>

                <label className={styles.label} htmlFor="start_at">
                    Начало сеанса *
                </label>
                <input
                    className={styles.input}
                    id="start_at"
                    name="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={handleChange}
                    required
                />

                <label className={styles.label} htmlFor="end_at">
                    Окончание сеанса *
                </label>
                <input
                    className={styles.input}
                    id="end_at"
                    name="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={handleChange}
                    required
                />

                <label className={styles.label} htmlFor="base_price">
                    Цена стандартного места, ₽ *
                </label>
                <input
                    className={styles.input}
                    id="base_price"
                    name="base_price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.base_price}
                    onChange={handleChange}
                    required
                />

                <label className={styles.label} htmlFor="vip_price">
                    Цена VIP-места, ₽ *
                </label>
                <input
                    className={styles.input}
                    id="vip_price"
                    name="vip_price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.vip_price}
                    onChange={handleChange}
                    required
                />

                <label className={styles.label} htmlFor="status">
                    Статус *
                </label>
                <select
                    className={styles.input}
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="DRAFT">Черновик</option>
                    <option value="PUBLISHED">Опубликован</option>
                    <option value="CANCELED">Отменён</option>
                </select>

                <div className={styles.formActions}>
                    <button 
                        className={styles.saveButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Сохранение..."
                            : isEditMode 
                                ? "Сохранить изменения"
                                : "Создать сеанс"}
                    </button>

                    <button
                        className={styles.cancelButton}
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </section>
    );
}

export default SessionForm;