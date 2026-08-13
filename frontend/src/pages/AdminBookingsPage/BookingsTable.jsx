import styles from "./AdminBookingsPage.module.css";

const statusLabels = {
  RESERVED: "Забронировано",
  CONFIRMED: "Подтверждено",
  CANCELED: "Отменено",
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

const isExpiredReservation = (booking) => {
    if (
        booking.status !== "RESERVED",
        !booking.expires_at
    ) {
        return false;
    }

    return new Date(booking.expires_at) <= new Date();
}

function BookingsTable({
    bookings,
    onConfirmBooking,
    onCancelBooking,
}) {
    if (bookings.length === 0) {
        return (
            <p className={styles.message}>
                Бронирований пока что нет
            </p>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Код</th>
                        <th>Фильм и сеанс</th>
                        <th>Зал и место</th>
                        <th>Гость</th>
                        <th>Контакты</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings.map((booking) => {
                        const isExpired = isExpiredReservation(booking)

                        return (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>

                                <td>
                                    <code className={styles.bookingCode}>
                                        {booking.booking_code || "-"}
                                    </code>
                                </td>

                                <td>
                                    <div className={styles.primaryText}>
                                        {booking.movie_title}
                                    </div>
                                    <div className={styles.secondaryText}>
                                        {formatDateTime(booking.session_start_at)}
                                    </div>
                                </td>

                                <td>
                                    <div className={styles.primaryText}>
                                        {booking.hall_name || "Зал не указан"}
                                    </div>

                                    <div className={styles.secondaryText}>
                                        Ряд {booking.row_number}, место{" "}
                                        {booking.seat_number} ·{" "}
                                        {booking.seat_type === "VIP"
                                        ? "VIP"
                                        : "Стандарт"}
                                    </div>
                                </td>

                                <td>booking.guest_name</td>

                                <td>
                                    <div>{booking.guest_phone || "—"}</div>

                                    <div className={styles.secondaryText}>
                                        {booking.guest_email || "—"}
                                    </div>
                                </td>

                                <td>
                                    {isExpired ? (
                                        <span className={styles.expiredStatus}>
                                        Просрочено
                                        </span>
                                    ) : (
                                        <span
                                        className={
                                            booking.status === "CONFIRMED"
                                            ? styles.confirmedStatus
                                            : booking.status === "CANCELED"
                                                ? styles.canceledStatus
                                                : styles.reservedStatus
                                        }
                                        >
                                        {statusLabels[booking.status] ||
                                            booking.status}
                                        </span>
                                    )}
                                </td>

                                <td className={styles.actions}>
                                    {booking.status === "RESERVED" && !isExpired && (
                                        <button
                                            className={styles.confirmButton}
                                            type="button"
                                            onClick={() => onConfirmBooking(booking)}
                                        >
                                            Подтвердить
                                        </button>
                                    )}

                                    {booking.status !== "CANCELED" && (
                                        <button
                                            className={styles.cancelButton}
                                            type="button"
                                            onClick={() => onCancelBooking(booking)}
                                        >
                                            Отменить
                                        </button>
                                    )}

                                    {booking.status === "CANCELED" && (
                                        <span className={styles.noActions}>
                                        Нет действий
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default BookingsTable;