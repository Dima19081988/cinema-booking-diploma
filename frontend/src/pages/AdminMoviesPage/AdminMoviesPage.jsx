import { useEffect, useState } from "react";
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from "../../api/moviesApi";
import MovieForm from "./MovieForm";
import MoviesTable from "./MoviesTable";
import styles from "./AdminMoviesPage.module.css";

function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setPageError("");

        const response = await getAdminMovies();
        setMovies(response.data.data || []);
      } catch (err) {
        console.error("ADMIN MOVIES ERROR:", err);

        setPageError(
          err.response?.data?.detail ||
            "Не удалось загрузить список фильмов"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSaveMovie = async (payload) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      if (selectedMovie) {
        const response = await updateMovie(selectedMovie.id, payload);
        const updatedMovie = response.data.data;

        setMovies((previousMovies) => 
          previousMovies.map((movie) =>
            movie.id === updatedMovie.id ? updatedMovie : movie 
          )
        );
      } else {
        const response = await createMovie(payload);
        const newMovie = response.data.data;

        setMovies((previousMovies) => [
          ...previousMovies,
          newMovie,
        ]);
      }

      setSelectedMovie(null);
      setIsFormOpen(false);

      return true;
    } catch (err) {
        console.error("SAVE MOVIE ERROR:", err);

        const errorData = err.response?.data;

        setFormError(
          errorData?.title?.[0] ||
            errorData?.duration_min?.[0] ||
            errorData?.poster_url?.[0] ||
            errorData?.release_date?.[0] ||
            errorData?.detail ||
            "Не удалось сохранить фильм"
        );

        return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMovieStatus = async (movie) => {
    try {
      setPageError("");

      const response = await updateMovie(movie.id, {
        is_active: !movie.is_active,
      });

      const updatedMovie = response.data.data;

      setMovies((previousMovies) =>
        previousMovies.map((item) =>
          item.id === updatedMovie.id ? updatedMovie : item
        )
      );
    } catch (err) {
      console.error("TOGGLE MOVIE STATUS ERROR:", err);

      setPageError(
        err.response?.data?.detail ||
          "Не удалось изменить статус фильма"
      );
    }
  };

  const handleDeleteMovie = async (movie) => {
    const isConfirmed = window.confirm(
      `Удалить фильм «${movie.title}»?\n\nЭто действие нельзя отменить.`
    )

    if (!isConfirmed) {
      return;
    }

    try {
      setPageError("");

      await deleteMovie(movie.id);

      setMovies((previousMovies) => 
        previousMovies.filter((item) => item.id !== movie.id)
      );
    } catch (err) {
      console.error("DELETE MOVIE ERROR:", err);

      setPageError(
        err.response?.data?.detail ||
          "Не удалось удалить фильм"
      );
    }
  };

  const handleOpenCreateForm = () => {
    setFormError("");
    setSelectedMovie(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (movie) => {
    setFormError("");
    setSelectedMovie(movie);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormError("");
    setSelectedMovie(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return <p className={styles.message}>Загрузка фильмов...</p>;
  }

  if (pageError) {
    return <p className={styles.error}>{pageError}</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Управление фильмами</h1>
          <p className={styles.description}>
            Всего фильмов: {movies.length}
          </p>
        </div>

        <button
          className={styles.createButton}
          type="button"
          onClick={handleOpenCreateForm}
        >
          Добавить фильм
        </button>
      </div>

      {isFormOpen && (
        <MovieForm
          key={selectedMovie?.id || "create"}
          movie={selectedMovie}
          error={formError}
          isSubmitting={isSubmitting}
          onCancel={handleCloseForm}
          onSaveMovie={handleSaveMovie}
        />
      )}

      <MoviesTable
        movies={movies}
        onEditMovie={handleOpenEditForm}
        onToggleMovieStatus={handleToggleMovieStatus}
        onDeleteMovie={handleDeleteMovie}
      />
    </div>
  );
}

export default AdminMoviesPage;