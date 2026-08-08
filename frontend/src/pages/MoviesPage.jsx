import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMovies } from "../api/moviesApi";
import styles from "./MoviesPage.module.css";

function MoviesPage () {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
        try {
            const response = await getMovies();
            setMovies(response.data.data || []);
        } catch (err) {
            console.error("MOVIES ERROR:", err);
            setError("Не удалось загрузить список фильмов");
        } finally {
            setLoading(false);
        }
    }
    fetchMovies();
  }, []);

  if (loading) {
    return <p className={styles.message}>Загрузка фильмов...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.page}>
        <h1 className={styles.title}>Фильмы</h1>

        {movies.length === 0 ? (
            <p className={styles.message}>Сейчас нет доступных фильмов.</p>
        ) : (
            <div className={styles.moviesGrid}>
                {movies.map((movie) => (
                    <article key={movie.id} className={styles.card}>
                        {movie.poster_url ? (
                            <img
                                className={styles.poster}
                                src={movie.poster_url} 
                                alt={`Постер фильма «${movie.title}»`} 
                            />
                        ) : (
                            <div className={styles.posterPlaceholder}>
                                Нет постера
                            </div>
                        )}

                        <div className={styles.content}>
                            <h2 className={styles.movieTitle}>{movie.title}</h2>
                            <p className={styles.meta}>
                                {movie.duration_min} мин.
                                {movie.age_rating ? ` · ${movie.age_rating}` : ""}    
                            </p>
                            <Link
                                to={`/sessions?movie_id=${movie.id}`}
                                className={styles.sessionsLink}
                            >
                                Смотреть сеансы
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        )}
    </div>
  );
}

export default MoviesPage;