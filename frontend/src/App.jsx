import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminGuard from "./components/AdminGuard";
// публичные
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import SessionsPage from "./pages/SessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import BookingResultPage from "./pages/BookingResultPage";

// админские
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminMoviesPage from "./pages/AdminMoviesPage/AdminMoviesPage";
import AdminSessionsPage from "./pages/AdminSessionsPage/AdminSessionsPage";
// import AdminBookingsPage from "./pages/AdminBookingsPage";

function App() {
  return (
    <Layout>
      <Routes>
        {/* публичные */}
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/booking/:code" element={<BookingResultPage />} />

        {/* админские */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboardPage />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/movies"
          element={
            <AdminGuard>
              <AdminMoviesPage />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/sessions"
          element={
            <AdminGuard>
              <AdminSessionsPage />
            </AdminGuard>
          }
        />

        {/* <Route path="/admin/bookings" element={<AdminBookingsPage />} /> */}
      </Routes>
    </Layout>
  );
}

export default App;