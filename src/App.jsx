import { useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ResourcePage from "./ResourcePage.jsx";
import ResponsePanel from "./ResponsePanel.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import GuestRoute from "./auth/GuestRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const RESOURCES = {
  operators: {
    title: "Туроператори",
    path: "/operators/",
    fields: [
      { name: "name", label: "Назва", type: "text" },
      { name: "description", label: "Опис", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Телефон", type: "text" },
    ],
    columns: [
      { key: "name", label: "Назва" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Телефон" },
    ],
  },
  destinations: {
    title: "Напрямки",
    path: "/destinations/",
    fields: [
      { name: "name", label: "Назва", type: "text" },
      { name: "country", label: "Країна", type: "text" },
    ],
    columns: [
      { key: "name", label: "Назва" },
      { key: "country", label: "Країна" },
    ],
  },
  tours: {
    title: "Тури",
    path: "/tours/",
    fields: [
      { name: "title", label: "Назва", type: "text" },
      { name: "description", label: "Опис", type: "text" },
      { name: "price", label: "Ціна, грн", type: "number" },
      { name: "duration_days", label: "Тривалість, днів", type: "number" },
      { name: "departure_date", label: "Дата виїзду", type: "datetime-local" },
      { name: "seats_available", label: "Вільних місць", type: "number" },
      { name: "operator", label: "Туроператор", type: "select", source: "/operators/", labelKey: "name" },
      { name: "destination", label: "Напрямок", type: "select", source: "/destinations/", labelKey: "name" },
      { name: "categories", label: "Категорії", type: "multiselect", source: "/categories/", labelKey: "name" },
    ],
    columns: [
      { key: "title", label: "Назва" },
      { key: "price", label: "Ціна" },
      { key: "duration_days", label: "Днів" },
      { key: "departure_date", label: "Виїзд" },
      { key: "seats_available", label: "Місць" },
      { key: "operator", label: "Туроператор" },
      { key: "destination", label: "Напрямок" },
      { key: "categories", label: "Категорії" },
    ],
  },
};

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header>
      <h1>TourHub</h1>
      <nav>
        <NavLink to="/" end>Головна</NavLink>
        <NavLink to="/catalog">Каталог турів</NavLink>
        {user && <NavLink to="/manage/tours">Керування турами</NavLink>}
        {user?.is_staff && <NavLink to="/manage/operators">Туроператори</NavLink>}
        {user?.is_staff && <NavLink to="/manage/destinations">Напрямки</NavLink>}
      </nav>
      <div className="user-area">
        {user ? (
          <>
            <NavLink to="/profile" className="user-name">
              {user.first_name || user.username}
            </NavLink>
            <button className="secondary" onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Увійти</NavLink>
            <NavLink to="/register">Реєстрація</NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const { user } = useAuth();
  const [lastResponse, setLastResponse] = useState(null);

  return (
    <div className="app">
      <Header />

      <main>
        <Routes>
          {/* Доступно всім */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/catalog"
            element={
              <ResourcePage key="catalog" title="Каталог турів" config={RESOURCES.tours} readOnly onResponse={setLastResponse} />
            }
          />

          {/* Лише для неавторизованих */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Лише для авторизованих */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route
            path="/manage/tours"
            element={
              <ProtectedRoute>
                <ResourcePage
                  key="tours"
                  title="Керування турами"
                  config={RESOURCES.tours}
                  canDelete={Boolean(user?.is_staff)}
                  onResponse={setLastResponse}
                />
              </ProtectedRoute>
            }
          />

          {/* Лише для адміністраторів */}
          <Route
            path="/manage/operators"
            element={
              <ProtectedRoute adminOnly>
                <ResourcePage key="operators" config={RESOURCES.operators} onResponse={setLastResponse} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/destinations"
            element={
              <ProtectedRoute adminOnly>
                <ResourcePage key="destinations" config={RESOURCES.destinations} onResponse={setLastResponse} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ResponsePanel info={lastResponse} />
    </div>
  );
}
