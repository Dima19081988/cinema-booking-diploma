import styles from "./BookingForm.module.css";

function BookingForm({ bookingForm, onChange, onSubmit }) {
    return (
        <form className={styles.bookingForm} onSubmit={onSubmit}>
            <h3 className={styles.title}>Данные для бронирования</h3>

            <input 
                type="text"
                name="guest_name"
                placeholder="Ваше имя"
                value={bookingForm.guest_name}
                onChange={onChange}
                className={styles.input}
            />

            <input 
                type="text"
                name="guest_email"
                placeholder="Ваша электронная почта"
                value={bookingForm.guest_email}
                onChange={onChange}
                className={styles.input}
            />

            <input 
                type="text"
                name="guest_phone"
                placeholder="Ваш номер телефона"
                value={bookingForm.guest_phone}
                onChange={onChange}
                className={styles.input}
            />

            <button type="submit" className={styles.submitButton}>
                Забронировать
            </button>
        </form>
    );
}

export default BookingForm;