import styles from "./AdminMoviesPage.module.css";

function MoviesTable({
  movies,
  onEditMovie,
  onToggleMovieStatus,
  onDeleteMovie,
}) {
  if (movies.length === 0) {
    return (
      <p className={styles.message}>
        Фильмы не добавлены.
      </p>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Длительность</th>
            <th>Возрастной рейтинг</th>
            <th>Дата релиза</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.id}</td>
              <td>{movie.title}</td>
              <td>{movie.duration_min} мин.</td>
              <td>{movie.age_rating || "—"}</td>
              <td>{movie.release_date || "—"}</td>

              <td>
                <span
                  className={
                    movie.is_active
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {movie.is_active ? "Активен" : "Скрыт"}
                </span>
              </td>

              <td>
                <button
                  className={styles.editButton}
                  type="button"
                  onClick={() => onEditMovie(movie)}
                >
                  Редактировать
                </button>

                <button
                  className={styles.statusButton}
                  type="button"
                  onClick={() => onToggleMovieStatus(movie)}
                >
                  {movie.is_active ? "Скрыть" : "Активировать"}
                </button>

                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={() => onDeleteMovie(movie)}
                >
                  Удалить
                </button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MoviesTable;