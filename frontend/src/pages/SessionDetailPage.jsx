import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import apiClient from "../api/client";
import styles from "./SessionDetailPage.module.css";

function SessionDetailPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [hallSchema, setHallSchema] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionResponse = await apiClient.get(`/sessions/${id}`);
        // console.log('SESSION_RESPONSE:', sessionResponse.data);
        setSession(sessionResponse.data.data);

        const hallSchemaResponse = await apiClient.get(`/sessions/${id}/hall-schema`);
        // console.log("HALL_SCHEMA_RESPONSE:", hallSchemaResponse.data);
        // console.log("FIRST SEAT:", hallSchemaResponse.data.data.rows[0].seats[0]);
        setHallSchema(hallSchemaResponse.data.data);

        // console.log(
        //   "ALL SEATS:",
        //   hallSchemaResponse.data.data.rows.flatMap((row) =>
        //     row.seats.map((seat) => ({
        //       row: row.row_number,
        //       seat_number: seat.seat_number,
        //       status: seat.status,
        //     }))
        //   )
        // );
      } catch (err) {
        setError('Не удалось загрузить сеанс');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession()
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      session_id: session.id,
      seat_id: selectedSeat.seat_id,
      guest_name: bookingForm.guest_name,
      guest_email: bookingForm.guest_email,
      guest_phone: bookingForm.guest_phone,
    };
    // console.log("BOOKING DATA:", bookingData);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/bookings", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData)
      });

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      console.log("RESPONSE STATUS:", response.status);
      console.log("RESPONSE OK:", response.ok);
      console.log("RESPONSE DATA:", data);

      if (response.ok) {
        setBookingForm({
          guest_name: "",
          guest_email: "",
          guest_phone: "",
        });

        setSelectedSeat(null);

        navigate(`/booking/${data.data.booking_code}`, {
            state: {
              booking: data.data,
              session: session,
              seat: selectedSeat,
            },
        });
      }
    } catch (error) {
      console.error("BOOKING ERROR:", error);
    }
  };

  if (loading) {
    return <p>Загрузка сеанса...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!session) {
    return <p>Сеанс не найден</p>;
  }

  const startDate = new Date(session.start_at);
  const endDate = new Date(session.end_at);

  const formattedDate = startDate.toLocaleDateString("ru-RU");
  const formattedStartTime = startDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedEndTime = endDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Сеанс #{session.id}</h1>

      <div className={styles.infoCard}>
        <p><span className={styles.label}>Фильм:</span> {session.movie_title}</p>
        <p><span className={styles.label}>Зал:</span> {session.hall?.name}</p>
        <p><span className={styles.label}>Дата:</span> {formattedDate}</p>
        <p>
          <span className={styles.label}>Время:</span> {formattedStartTime} - {formattedEndTime}
        </p>
        <p><span className={styles.label}>Цена обычного места:</span> {session.base_price} ₽</p>
        <p><span className={styles.label}>Цена VIP места:</span> {session.vip_price} ₽</p>
      </div>

      <h2 className={styles.subtitle}>Схема зала</h2>

      {!hallSchema ? (
        <p>Схема зала не загружена.</p>
      ) : (
        <div className={styles.schemaWrapper}>
          <p className={styles.hallName}>Зал: {hallSchema.hall?.name}</p>

          {hallSchema.rows?.map((row) => (
            <div key={row.row_number} className={styles.rowBlock}>
              <p className={styles.rowTitle}>Ряд {row.row_number}</p>

              <div className={styles.seatsRow}>
                {row.seats?.map((seat) => (
                  <div
                    key={seat.seat_id}
                    onClick={() => {
                      if (seat.status !== 'AVAILABLE') return;
                      setSelectedSeat({
                        seat_id: seat.seat_id,
                        row_number: row.row_number,
                        seat_number: seat.seat_number,
                        seat_type: seat.seat_type,
                        price: seat.price,
                      })
                    }}
                    className={`${styles.seat} ${
                      seat.status === "AVAILABLE" ? styles.available : styles.unavailable
                    } ${
                      selectedSeat?.seat_id === seat.seat_id ? styles.selected : ""
                    }`}
                  >
                    <div>Место {seat.seat_number}</div>
                    <div>{seat.seat_type}</div>
                    <div>{seat.status === "AVAILABLE" ? "Свободно" : "Занято"}</div>
                  </div>
                ))}
              </div>
              {selectedSeat && (
                <div className={styles.selectedInfo}>
                  <p>Выбрано место:</p>
                  <p>Ряд {selectedSeat.row_number}, место {selectedSeat.seat_number}</p>
                  <p>Тип: {selectedSeat.seat_type}</p>
                  <p>Цена: {selectedSeat.price} ₽</p>
                </div>
              )}
              {selectedSeat && (
                <BookingForm
                  bookingForm={bookingForm}
                  onChange={handleInputChange}
                  onSubmit={handleBookingSubmit}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionDetailPage;