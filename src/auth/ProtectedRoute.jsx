import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Сторінка лише для авторизованих (adminOnly: лише для адміністраторів).
// Анонім перенаправляється на /login?next=<звідки прийшов>.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="muted">Завантаження…</p>;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (adminOnly && !user.is_staff) {
    return (
      <section>
        <h2>Немає доступу</h2>
        <p className="error">Ця сторінка доступна лише адміністраторам.</p>
      </section>
    );
  }

  return children;
}
