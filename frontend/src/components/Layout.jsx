import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Layout({ children }) {
    const { isAuthenticated } = useAuth();
    return (
        <div>
            <header>
                <h1>Агрегатор фильмов</h1>
                <nav>
                    <Link to="/">Главная</Link> |{' '}
                    <Link to="/movies">Фильмы</Link> |{" "}
                    <Link to="/sessions">Сеансы</Link> |{' '}
                    <Link to={isAuthenticated ? "/admin" : "/admin/login"}>
                        {isAuthenticated ? "Админ-панель" : "Вход для администратора"}
                    </Link>
                </nav>

                <hr />
            </header>

            <main>{children}</main>
        </div>
    );
}

export default Layout