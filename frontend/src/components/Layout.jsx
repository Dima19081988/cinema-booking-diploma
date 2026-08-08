import { Link } from "react-router-dom";

function Layout({ children }) {
    return (
        <div>
            <header>
                <h1>Аггрегатор фильмов</h1>
                <nav>
                    <Link to="/">Главная</Link> |{' '}
                    <Link to="/sessions">Сеансы</Link> |{' '}
                </nav>

                <hr />
            </header>

            <main>{children}</main>
        </div>
    )
}

export default Layout