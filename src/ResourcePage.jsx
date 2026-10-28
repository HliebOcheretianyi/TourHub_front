import { useEffect, useState } from "react";
import { api } from "./api";

function emptyForm(fields) {
  const form = {};
  fields.forEach((f) => {
    form[f.name] = f.type === "multiselect" ? [] : "";
  });
  return form;
}

export default function ResourcePage({ config, onResponse }) {
  const { title, path, fields, columns } = config;
  const [items, setItems] = useState([]);
  const [lookups, setLookups] = useState({});
  const [form, setForm] = useState(emptyForm(fields));
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  async function call(method, url, body) {
    const res = await api(method, url, body);
    onResponse(res.info);
    return res;
  }

  async function loadList() {
    const res = await call("GET", path);
    if (res.ok) setItems(res.data);
    else setMessage({ type: "error", text: res.data?.detail || "Не вдалося отримати список" });
  }

  async function loadLookups() {
    const sources = [...new Set(fields.filter((f) => f.source).map((f) => f.source))];
    const result = {};
    for (const source of sources) {
      const res = await api("GET", source);
      if (res.ok) result[source] = res.data;
    }
    setLookups(result);
  }

  useEffect(() => {
    loadLookups();
    loadList();
  }, []);

  function setValue(name, value) {
    setForm({ ...form, [name]: value });
  }

  function resetForm() {
    setForm(emptyForm(fields));
    setEditingId(null);
    setErrors({});
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const body = {};
    fields.forEach((f) => {
      const value = form[f.name];
      if (f.type === "number" || f.type === "select") {
        body[f.name] = value === "" ? null : Number(value);
      } else {
        body[f.name] = value;
      }
    });

    const res = editingId ? await call("PUT", `${path}${editingId}/`, body) : await call("POST", path, body);

    if (res.ok) {
      setMessage({ type: "ok", text: editingId ? "Зміни збережено" : "Створено" });
      resetForm();
      loadList();
    } else if (res.status === 400) {
      setErrors(res.data || {});
    } else {
      setMessage({ type: "error", text: res.data?.detail || "Сталася помилка" });
    }
  }

  function startEdit(item) {
    const next = {};
    fields.forEach((f) => {
      const value = item[f.name];
      next[f.name] = f.type === "datetime-local" ? String(value).slice(0, 16) : value;
    });
    setForm(next);
    setEditingId(item.id);
    setErrors({});
    setMessage(null);
  }

  async function remove(item) {
    if (!window.confirm("Видалити запис?")) return;
    setMessage(null);
    const res = await call("DELETE", `${path}${item.id}/`);
    if (res.ok) {
      setMessage({ type: "ok", text: "Видалено" });
      loadList();
    } else {
      setMessage({ type: "error", text: res.data?.detail || "Не вдалося видалити" });
    }
  }

  function labelOf(field, id) {
    const found = (lookups[field.source] || []).find((o) => o.id === id);
    return found ? found[field.labelKey] : id;
  }

  function cell(item, column) {
    const field = fields.find((f) => f.name === column.key);
    const value = item[column.key];
    if (field && field.type === "select") return labelOf(field, value);
    if (field && field.type === "multiselect") return value.map((id) => labelOf(field, id)).join(", ");
    if (field && field.type === "datetime-local") return new Date(value).toLocaleString("uk-UA");
    return value;
  }

  return (
    <section>
      <h2>{title}</h2>

      <form className="form" onSubmit={submit}>
        <h3>{editingId ? `Редагування (id ${editingId})` : "Створити"}</h3>

        {fields.map((f) => (
          <label key={f.name} className="field">
            <span>{f.label}</span>
            {f.type === "select" ? (
              <select value={form[f.name] ?? ""} onChange={(e) => setValue(f.name, e.target.value)}>
                <option value="">— оберіть —</option>
                {(lookups[f.source] || []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o[f.labelKey]}
                  </option>
                ))}
              </select>
            ) : f.type === "multiselect" ? (
              <select
                multiple
                value={form[f.name].map(String)}
                onChange={(e) =>
                  setValue(
                    f.name,
                    Array.from(e.target.selectedOptions, (o) => Number(o.value))
                  )
                }
              >
                {(lookups[f.source] || []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o[f.labelKey]}
                  </option>
                ))}
              </select>
            ) : (
              <input type={f.type} value={form[f.name] ?? ""} onChange={(e) => setValue(f.name, e.target.value)} />
            )}
            {errors[f.name] && <small className="error">{[].concat(errors[f.name]).join(" ")}</small>}
          </label>
        ))}

        {errors.detail && <p className="error">{errors.detail}</p>}

        <div className="buttons">
          <button type="submit">{editingId ? "Зберегти зміни" : "Створити"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Скасувати
            </button>
          )}
        </div>
      </form>

      {message && <p className={message.type === "ok" ? "ok" : "error"}>{message.text}</p>}

      <div className="toolbar">
        <button onClick={loadList}>Отримати список</button>
        <span className="muted">Записів: {items.length}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              {columns.map((c) => (
                <td key={c.key}>{cell(item, c)}</td>
              ))}
              <td className="actions">
                <button className="secondary" onClick={() => startEdit(item)}>
                  Редагувати
                </button>
                <button className="danger" onClick={() => remove(item)}>
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
