import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSessions } from '../api/sessionsApi.js';

function SessionsPage() {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movie_id");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSessions(movieId);
        console.log('SESSIONS RESPONSE:', response.data);

        const data = response.data;
        const sessionsArray = Array.isArray(data.data) ? data.data : [];

        setSessions(sessionsArray);
      } catch (err) {
        setError('Не удалось загрузить сеансы');
        console.error(err)
      } finally {
        setLoading(false);
      }
    }

    fetchSessions()
  }, [movieId]);

  if (loading) {
    return <p>Загрузка сеансов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>{movieId ? "Сеансы выбранного фильма" : "Все сеансы"}</h1>

      {movieId && (
        <p>
          <Link to="/sessions">Показать все сеансы</Link>
        </p>
      )}

      {sessions.length === 0 ? (
        <p>Подходящие сеансы пока не найдены.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              <Link to={`/sessions/${session.id}`}>
                {session.movie_title} — {session.hall_name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionsPage;