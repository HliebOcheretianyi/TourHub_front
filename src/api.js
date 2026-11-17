import { getAccess, getRefresh, setTokens, clearTokens } from "./auth/tokens";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/v1";
let refreshPromise = null;

// Один HTTP-запит; якщо є access-токен, додаємо заголовок Authorization.
function send(method, path, body) {
  const options = { method, headers: {} };
  const access = getAccess();
  if (access) options.headers["Authorization"] = `Bearer ${access}`;
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  return fetch(BASE + path, options);
}

// Отримати новий access за refresh-токеном.
// Якщо кілька запитів одночасно отримали 401, refresh виконується лише один раз.
function refreshAccess() {
  const refresh = getRefresh();
  if (!refresh) return Promise.resolve(null);
  if (!refreshPromise) {
    refreshPromise = fetch(BASE + "/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        setTokens(data.access);
        return data.access;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api(method, path, body) {
  const url = BASE + path;
  try {
    let response = await send(method, path, body);

    // access прострочився: оновлюємо його і повторюємо запит
    if (response.status === 401 && getRefresh()) {
      const newAccess = await refreshAccess();
      if (newAccess) {
        response = await send(method, path, body);
      } else {
        // refresh теж недійсний: користувача треба розлогінити
        clearTokens();
        window.dispatchEvent(new Event("auth:logout"));
      }
    }

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      ok: response.ok,
      status: response.status,
      data,
      info: { method, url, status: response.status, statusText: response.statusText, headers, body: data },
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: { detail: "Не вдалося звернутися до сервера. Перевірте, чи запущено бекенд і чи налаштовано CORS." },
      info: { method, url, status: 0, statusText: "Network error", headers: {}, body: null },
    };
  }
}
