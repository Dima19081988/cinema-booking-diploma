import { useEffect, useState } from "react";
import { getAdminBookings, updateBookingStatus } from "../../api/bookingsApi";
import BookingsTable from "./BookingsTable";
import styles from "./AdminBookingsPage.module.css";

const getErrorMessage = (errorData, fallbackMessage) => {
    if (!errorData) {
        return fallbackMessage;
    }

    return (
        errorData.status?.[0] ||
        errorData.detail ||
        fallbackMessage
    );
};

function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoading(true);
                setPageError("");

                const response = await getAdminBookings();

                setBookings(response.data.data || []);
            } catch (err) {
                console.error("ADMIN BOOKINGS LOAD ERROR:", err);

                setPageError(
                    getErrorMessage(
                        err.response?.data,
                        "Не удалось загрузить список бронирований"
                    )
                );
            } finally {
                setLoading(false);
            }
        };
        loadBookings();
    }, []);

    const handleUpdateBookingStatus = async (
        booking,
        nextStatus
    ) => {
        const isConfirmAction = nextStatus === "CONFIRMED";

        const question = isConfirmAction
            ? `Подтвердить бронирование ${booking.booking_code}?`
            : (
                `Отменить бронирование ${booking.booking_code}?\n\n` +
                "Место снова станет доступным для бронирования."
              );
        
        const isConfirmed = window.confirm(question);

        if (!isConfirmed) {
            return;
        }

        try {
            setPageError("");

            const response = await updateBookingStatus(
                booking.id,
                nextStatus
            );

            const updatedBooking = response.data.data;
            
            setBookings((previousBookings) =>
                previousBookings.map((item) =>
                item.id === updatedBooking.id
                    ? { ...item, ...updatedBooking }
                    : item
                )
            );
        } catch (err) {
            console.error("BOOKING STATUS UPDATE ERROR:", err);

            setPageError(
                getErrorMessage(
                err.response?.data,
                "Не удалось изменить статус бронирования"
                )
            );
        }
    };

    const handleConfirmBooking = (booking) => {
        handleUpdateBookingStatus(booking, "CONFIRMED");
    };

    const handleCancelBooking = (booking) => {
        handleUpdateBookingStatus(booking, "CANCELED");
    };

    if (loading) {
        return (
        <p className={styles.message}>
            Загрузка бронирований...
        </p>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        Управление бронированиями
                    </h1>

                    <p className={styles.description}>
                        Всего бронирований: {bookings.length}
                    </p>
                </div>
            </div>

            {pageError && (
                <p className={styles.error}>{pageError}</p>
            )}

            {<BookingsTable
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onCancelBooking={handleCancelBooking}
            />}
        </div>
    );
}

export default AdminBookingsPage;