import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const FIELDS = [
  { name: "username", label: "Ім'я користувача *", type: "text", autoComplete: "username" },
  { name: "first_name", label: "Ім'я", type: "text", autoComplete: "given-name" },
  { name: "last_name", label: "Прізвище", type: "text", autoComplete: "family-name" },
  { name: "email", label: "Email *", type: "email", autoComplete: "email" },
  { name: "password", label: "Пароль * (мінімум 8 символів)", type: "password", autoComplete: "new-password" },
  { name: "password_confirm", label: "Повторіть пароль *", type: "password", autoComplete: "new-password" },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

export default function RegisterPage() {
  const { register, login } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setSending(true);
    const res = await register(form);
    if (res.ok) {
      // Одразу входимо; GuestRoute далі перенаправить користувача.
      await login(form.username, form.password);
    } else {
      setErrors(res.data || { detail: "Не вдалося зареєструватися" });
    }
    setSending(false);
  }

  return (
    <section className="narrow">
      <h2>Реєстрація</h2>
      <form className="form" onSubmit={submit} noValidate>
        {FIELDS.map((f) => (
          <label key={f.name} className="field">
            <span>{f.label}</span>
            <input
              type={f.type}
              value={form[f.name]}
              autoComplete={f.autoComplete}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
            {errors[f.name] && <small className="error">{[].concat(errors[f.name]).join(" ")}</small>}
          </label>
        ))}

        {errors.detail && <p className="error">{errors.detail}</p>}

        <div className="buttons">
          <button type="submit" disabled={sending}>
            {sending ? "Реєструємо…" : "Зареєструватися"}
          </button>
          <Link to="/login">Вже є акаунт? Увійти</Link>
        </div>
      </form>
    </section>
  );
}
