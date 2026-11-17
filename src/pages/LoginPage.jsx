import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next");

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setSending(true);
    const res = await login(form.username, form.password);
    setSending(false);
    // Після успіху нікуди не переходимо самі: GuestRoute побачить user і поверне на next.
    if (!res.ok) setErrors(res.data || { detail: "Не вдалося увійти" });
  }

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  return (
    <section className="narrow">
      <h2>Вхід</h2>
      {next && <p className="muted">Увійдіть, щоб відкрити цю сторінку.</p>}

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Ім'я користувача</span>
          <input value={form.username} onChange={set("username")} autoComplete="username" />
          {errors.username && <small className="error">{[].concat(errors.username).join(" ")}</small>}
        </label>
        <label className="field">
          <span>Пароль</span>
          <input type="password" value={form.password} onChange={set("password")} autoComplete="current-password" />
          {errors.password && <small className="error">{[].concat(errors.password).join(" ")}</small>}
        </label>

        {errors.detail && <p className="error">Невірне ім'я користувача або пароль.</p>}

        <div className="buttons">
          <button type="submit" disabled={sending}>
            {sending ? "Входимо…" : "Увійти"}
          </button>
          <Link to={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}>Немає акаунта? Зареєструватися</Link>
        </div>
      </form>
    </section>
  );
}
