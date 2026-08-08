import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Сайт-агрегатор фильмов</h1>
        <p className={styles.subtitle}>
          Выбирайте фильм, сеанс и место — онлайн бронирование билетов в кино.
        </p>
        <div className={styles.actions}>
          <Link to="/movies" className={styles.primaryButton}>
            К списку фильмов
          </Link>
          <Link to="/sessions" className={styles.secondaryButton}>
            К списку сеансов
          </Link>
        </div>
      </div>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Как это работает?</h2>
        <ol className={styles.steps}>
          <li>Выбираете фильм и подходящий сеанс.</li>
          <li>Выбираете место на схеме зала.</li>
          <li>Заполняете данные и получаете QR-код бронирования.</li>
        </ol>
      </section>
    </div>
  );
}

export default HomePage;