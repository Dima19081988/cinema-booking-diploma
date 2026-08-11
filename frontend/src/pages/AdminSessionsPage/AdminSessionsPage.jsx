import { useEffect, useState } from "react";
import { getAdminMovies } from "../../api/moviesApi";
import {
  createSession,
  deleteSession,
  getAdminHalls,
  getAdminSessions,
  updateSession,
} from "../../api/sessionsApi";
import SessionForm from "./SessionForm";
import SessionsTable from "./SessionsTable";
import styles from "./AdminSessionsPage.module.css";

const getErrorMessage = (errorData, fallbackMessage) => {
    if (!errorData) {
        return fallbackMessage;
    }

    return (
        errorData.movie_id?.[0] ||
        errorData.hall_id?.[0] ||
        errorData.start_at?.[0] ||
        errorData.end_at?.[0] ||
        errorData.base_price?.[0] ||
        errorData.vip_price?.[0] ||
        errorData.status?.[0] ||
        errorData.non_field_errors?.[0] ||
        errorData.detail ||
        fallbackMessage
    );
};

function AdminSessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                setPageError("");

                const [
                    sessionsResponse,
                    moviesResponse,
                    hallsResponse,
                ] = await Promise.all([
                    getAdminSessions(),
                    getAdminMovies(),
                    getAdminHalls(),
                ]);

                setSessions(sessionsResponse.data.data || []);
                setMovies(moviesResponse.data.data || []);
                setHalls(hallsResponse.data.data || []);
            } catch (err) {
                console.error("ADMIN SESSIONS LOAD ERROR:", err);

                setPageError(
                    getErrorMessage(
                        err.response?.data,
                        "Не удалось загрузить данные для управления сеансами"
                    )
                );
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    const handleOpenCreateForm = () => {
        setFormError("");
        setSelectedSession(null);
        setIsFormOpen(true);
    }

    const handleOpenEditForm = (session) => {
        setFormError("");
        setSelectedSession(session);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormError("");
        setSelectedSession(null);
        setIsFormOpen(false);
    };

    const handleSaveSession = async (payload) => {
        try {
            setIsSubmitting(true);
            setFormError("");
            setPageError("");

            if (selectedSession) {
                const response = await updateSession(
                    selectedSession.id,
                    payload
                );

                const updatedSession = response.data.data;

                setSessions((previousSessions) =>
                    previousSessions.map((session) =>
                        session.id === updatedSession.id
                        ? updatedSession
                        : session
                    )
                );
            } else {
                const response = await createSession(payload);
                const newSession = response.data.data;

                setSessions((previousSessions) => [
                    ...previousSessions,
                    newSession,
                ]);
            }

            handleCloseForm();

            return true;
        } catch (err) {
            console.error("ADMIN SESSION SAVE ERROR:", err);

            setFormError(
                getErrorMessage(
                err.response?.data,
                "Не удалось сохранить сеанс"
                )
            );

            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSession = async (session) => {
        const isConfirmed = window.confirm(
            `Удалить сеанс #${session.id}?\n\n` +
                "Удаление доступно только для сеанса без активных бронирований."
        );

        if (!isConfirmed) {
            return;
        }

        try {
            setPageError("");

            await deleteSession(session.id);
            setSessions((previousSessions) =>
                previousSessions.filter(
                (item) => item.id !== session.id
                )
            );
        } catch (err) {
            console.error("ADMIN SESSION DELETE ERROR:", err);

            setPageError(
                getErrorMessage(
                err.response?.data,
                "Не удалось удалить сеанс"
                )
            );
        }
    };

    if (loading) {
        return (
            <p className={styles.message}>
                Загрузка сеансов, фильмов и залов...
            </p>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Управление сеансами</h1>
                    <p className={styles.description}>
                        Всего сеансов: {sessions.length}
                    </p>
                </div>

                <button 
                    className={styles.createButton}
                    type="button"
                    onClick={handleOpenCreateForm}
                >
                    Добавить сеанс
                </button>
            </div>

            {pageError && (
                <p className={styles.error}>{pageError}</p>
            )}

            {isFormOpen && (
                <SessionForm
                    key={selectedSession?.id || "create"}
                    session={selectedSession}
                    movies={movies}
                    halls={halls}
                    error={formError}
                    isSubmitting={isSubmitting}
                    onCancel={handleCloseForm}
                    onSaveSession={handleSaveSession}
                />
            )}

            <SessionsTable
                sessions={sessions}
                movies={movies}
                halls={halls}
                onEditSession={handleOpenEditForm}
                onDeleteSession={handleDeleteSession}
            />
        </div>
    );
}

export default AdminSessionsPage;