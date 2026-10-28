const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/v1";

export async function api(method, path, body) {
  const url = BASE + path;
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
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
