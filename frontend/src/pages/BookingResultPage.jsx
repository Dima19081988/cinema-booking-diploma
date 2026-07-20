import { Link, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./BookingResultPage.module.css";

function BookingResultPage() {
  const location = useLocation();
  const { code } = useParams();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [session, setSession] = useState(location.state?.session || null);
  const [seat, setSeat] = useState(location.state?.seat || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/bookings/code/${code}?format=json`
        );

        if (!response.ok) {
          throw new Error("Не удалось загрузить бронь");
        }

        const data = await response.json();

        setBooking(data.data);
        setSession(data.data.session || null);
        setSeat(data.data.seat || null);
      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить бронь");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [code]);

  if (loading) {
    return <p>Загрузка брони...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!booking) {
    return <h2>Нет данных о бронировании</h2>;
  }

  const qrUrl = booking.qr_url || `http://127.0.0.1:8000/api/v1/bookings/${booking.id}/qr`;

  const statusMap = {
    RESERVED: "Забронировано",
    CONFIRMED: "Подтверждено",
    CANCELED: "Отменено",
  };

  const statusClassMap = {
    RESERVED: styles.statusReserved,
    CONFIRMED: styles.statusConfirmed,
    CANCELED: styles.statusCanceled,
  };

  const seatTypeMap = {
    STANDARD: "Стандартное",
    VIP: "VIP",
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formattedExpiresAt = booking.expires_at
    ? new Date(booking.expires_at).toLocaleString("ru-RU")
    : "";

  const sessionStartDate = session?.start_at ? new Date(session.start_at) : null;

  const formattedSessionDate = sessionStartDate
    ? sessionStartDate.toLocaleDateString("ru-RU")
    : "";

  const formattedSessionTime = sessionStartDate
    ? sessionStartDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Бронирование создано</h1>

        <div className={styles.contentGrid}>
          <div className={styles.infoColumn}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Информация о брони</h2>

              <p className={styles.row}>
                <span className={styles.label}>Код брони:</span> {booking.booking_code}
              </p>

              <p className={styles.row}>
                <span className={styles.label}>Статус:</span>{" "}
                <span className={`${styles.statusBadge} ${statusClassMap[booking.status] || ""}`}>
                  {statusMap[booking.status] || booking.status}
                </span>
              </p>

              <p className={styles.row}>
                <span className={styles.label}>Имя:</span> {booking.guest_name}
              </p>

              <p className={styles.row}>
                <span className={styles.label}>Email:</span> {booking.guest_email || "—"}
              </p>

              <p className={styles.row}>
                <span className={styles.label}>Телефон:</span> {booking.guest_phone || "—"}
              </p>

              <p className={styles.row}>
                <span className={styles.label}>Действует до:</span> {formattedExpiresAt}
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Информация о сеансе и месте</h2>

              {session && (
                <>
                  <p className={styles.row}>
                    <span className={styles.label}>Фильм:</span> {session.movie_title}
                  </p>

                  <p className={styles.row}>
                    <span className={styles.label}>Зал:</span> {session.hall_name}
                  </p>

                  <p className={styles.row}>
                    <span className={styles.label}>Дата и время сеанса:</span>{" "}
                    {formattedSessionDate}, {formattedSessionTime}
                  </p>
                </>
              )}

              {seat && (
                <>
                  <p className={styles.row}>
                    <span className={styles.label}>Ряд:</span> {seat.row_number}
                  </p>

                  <p className={styles.row}>
                    <span className={styles.label}>Место:</span> {seat.seat_number}
                  </p>

                  <p className={styles.row}>
                    <span className={styles.label}>Тип места:</span> {seatTypeMap[seat.seat_type] || seat.seat_type}
                  </p>

                  <p className={styles.row}>
                    <span className={styles.label}>Цена:</span> {formatPrice(seat.price)} ₽
                  </p>
                </>
              )}
            </section>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.qrBlock}>
              <img src={qrUrl} alt="QR-код бронирования" width="220" />
            </div>

            <Link to="/" className={styles.homeLink}>
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingResultPage;