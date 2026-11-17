// Де зберігаються токени: localStorage браузера.
const ACCESS = "tourhub_access";
const REFRESH = "tourhub_refresh";

export const getAccess = () => localStorage.getItem(ACCESS);
export const getRefresh = () => localStorage.getItem(REFRESH);

export function setTokens(access, refresh) {
  localStorage.setItem(ACCESS, access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
