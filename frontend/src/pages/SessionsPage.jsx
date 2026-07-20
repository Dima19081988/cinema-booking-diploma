import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiClient.get('/sessions');
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
  }, []);

  if (loading) {
    return <p>Загрузка сеансов...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Сеансы</h1>

      {sessions.length === 0 ? (
        <p>Сеансы пока не найдены.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              <Link to={`/sessions/${session.id}`}>
                {session.movie_title} - {session.hall_name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionsPage;