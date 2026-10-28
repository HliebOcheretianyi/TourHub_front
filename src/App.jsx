import { useState } from "react";
import ResourcePage from "./ResourcePage.jsx";
import ResponsePanel from "./ResponsePanel.jsx";

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

function Home() {
  return (
    <section>
      <h2>Ласкаво просимо до TourHub</h2>
      <p>
        TourHub — каталог турів від різних туроператорів. Тут можна переглядати, додавати, редагувати й видаляти
        туроператорів, напрямки та тури.
      </p>
      <p className="muted">Це навчальний фронтенд до REST API (Django REST Framework).</p>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [lastResponse, setLastResponse] = useState(null);

  return (
    <div className="app">
      <header>
        <h1>TourHub</h1>
        <nav>
          <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
            Головна
          </button>
          {Object.entries(RESOURCES).map(([key, r]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => setPage(key)}>
              {r.title}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === "home" ? <Home /> : <ResourcePage key={page} config={RESOURCES[page]} onResponse={setLastResponse} />}
      </main>

      <ResponsePanel info={lastResponse} />
    </div>
  );
}
