import styles from "./AdminSessionsPage.module.css";

const statusLabels = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  CANCELED: "Отменён",
};

const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateTime));
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(price);
};

function SessionsTable({
    sessions,
    movies,
    halls,
    onEditSession,
    onDeleteSession,
}) {
    const moviesById = Object.fromEntries(
        movies.map((movie) => [movie.id, movie])
    );

    const hallsById = Object.fromEntries(
        halls.map((hall) => [hall.id, hall])
    );

    if (!sessions.length === 0) {
        return (
            <p className={styles.message}>
                Сеансы пока не добавлены.
            </p>
        )
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Фильм</th>
                        <th>Зал</th>
                        <th>Начало</th>
                        <th>Окончание</th>
                        <th>Стандарт</th>
                        <th>VIP</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {sessions.map((session) => {
                        const movie = moviesById[session.movie_id];
                        const hall = hallsById[session.hall_id];

                        return (
                            <tr key={session.id}>
                                <td>{session.id}</td>
                                <td>{movie?.title || `Фильм #${session.movie_id}`}</td>
                                <td>{hall?.name || `Зал #${session.hall_id}`}</td>
                                <td>{formatDateTime(session.start_at)}</td>
                                <td>{formatDateTime(session.end_at)}</td>
                                <td>{formatPrice(session.base_price)}</td>
                                <td>{formatPrice(session.vip_price)}</td>

                                <td>
                                    <span
                                        className={
                                            session.status === "PUBLISHED"
                                                ? styles.publishedStatus
                                                : session.status === "CANCELED"
                                                    ? styles.canceledStatus
                                                    : styles.draftStatus
                                        }
                                    >
                                        {statusLabels[session.status] || session.status}        
                                    </span>
                                </td>

                                <td className={styles.actions}>
                                    <button
                                        className={styles.editButton}
                                        type="button"
                                        onClick={() => onEditSession(session)}
                                    >
                                        Редактировать
                                    </button>

                                    <button
                                        className={styles.deleteButton}
                                        type="button"
                                        onClick={() => onDeleteSession(session)}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SessionsTable;