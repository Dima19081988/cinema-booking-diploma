import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AdminGuard({ children }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated || user?.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />
    }

    return children;
}

export default AdminGuard;