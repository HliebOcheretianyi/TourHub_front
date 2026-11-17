import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Сторінка лише для неавторизованих (логін, реєстрація).
// Авторизованого перенаправляє на ?next=... (повернення після логіну) або на каталог.
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="muted">Завантаження…</p>;

  if (user) {
    const next = new URLSearchParams(location.search).get("next");
    const safe = next && next.startsWith("/") && !next.startsWith("//");
    return <Navigate to={safe ? next : "/catalog"} replace />;
  }

  return children;
}
