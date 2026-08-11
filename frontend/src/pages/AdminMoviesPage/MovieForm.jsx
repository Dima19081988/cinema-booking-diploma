import { useState } from "react";
import styles from "./AdminMoviesPage.module.css";

const getInitialFormData = (movie = null) => ({
  title: movie?.title || "",
  description: movie?.description || "",
  duration_min: movie?.duration_min?.toString() || "",
  age_rating: movie?.age_rating || "",
  poster_url: movie?.poster_url || "",
  country: movie?.country || "",
  release_date: movie?.release_date || "",
  is_active: movie?.is_active ?? true,
});

function MovieForm({
  movie,
  onSaveMovie,
  onCancel,
  isSubmitting,
  error,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(movie));

  const isEditMode = Boolean(movie);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSaveMovie({
      ...formData,
      duration_min: Number(formData.duration_min),
      release_date: formData.release_date || null,
    });
  };

  return (
    <section className={styles.formSection}>
      <h2 className={styles.formTitle}>
        {isEditMode ? "Редактирование фильма" : "Новый фильм"}
      </h2>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="title">
          Название *
        </label>
        <input
          className={styles.input}
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label className={styles.label} htmlFor="description">
          Описание
        </label>
        <textarea
          className={styles.textarea}
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />

        <label className={styles.label} htmlFor="duration_min">
          Длительность, минут *
        </label>
        <input
          className={styles.input}
          id="duration_min"
          name="duration_min"
          type="number"
          min="1"
          value={formData.duration_min}
          onChange={handleChange}
          required
        />

        <label className={styles.label} htmlFor="age_rating">
          Возрастной рейтинг
        </label>
        <input
          className={styles.input}
          id="age_rating"
          name="age_rating"
          type="text"
          placeholder="Например: 12+"
          value={formData.age_rating}
          onChange={handleChange}
        />

        <label className={styles.label} htmlFor="poster_url">
          URL постера
        </label>
        <input
          className={styles.input}
          id="poster_url"
          name="poster_url"
          type="url"
          placeholder="https://example.com/poster.jpg"
          value={formData.poster_url}
          onChange={handleChange}
        />

        <label className={styles.label} htmlFor="country">
          Страна
        </label>
        <input
          className={styles.input}
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={handleChange}
        />

        <label className={styles.label} htmlFor="release_date">
          Дата релиза
        </label>
        <input
          className={styles.input}
          id="release_date"
          name="release_date"
          type="date"
          value={formData.release_date}
          onChange={handleChange}
        />

        <label className={styles.checkboxLabel} htmlFor="is_active">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
          />
          Фильм активен и виден пользователям
        </label>

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
                : "Сохранить фильм"}
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

export default MovieForm;