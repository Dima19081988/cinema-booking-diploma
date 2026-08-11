import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AdminDashboardPage.module.css";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Панель администратора</h1>
          <p className={styles.description}>
            Вы вошли как: {user?.email || "Администратор"}
          </p>
        </div>

        <button
          className={styles.logoutButton}
          type="button"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Управление системой</h2>
        <div className={styles.cards}>
          <Link to="/admin/movies" className={styles.card}>
            <h3 className={styles.cardTitle}>Фильмы</h3>
            <p className={styles.cardText}>
              Добавление, редактирование, отключение и удаление фильмов.
            </p>
          </Link>

          <Link to="/admin/sessions" className={styles.card}>
            <h3 className={styles.cardTitle}>Сеансы</h3>
            <p className={styles.cardText}>
              Создание и изменение расписания киносеансов.
            </p>
          </Link>

          <Link to="/admin/bookings" className={styles.card}>
            <h3 className={styles.cardTitle}>Бронирования</h3>
            <p className={styles.cardText}>
              Просмотр броней и подтверждение билетов с QR-кодом.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;