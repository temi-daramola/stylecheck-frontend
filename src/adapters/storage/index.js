// localStorage, wrapped for consistency. Not used for auth: the session lives in an httpOnly cookie.
const safely = (action, fallback) => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export const getItem = (key) => safely(() => localStorage.getItem(key), null);
export const setItem = (key, value) => safely(() => localStorage.setItem(key, value));
export const removeItem = (key) => safely(() => localStorage.removeItem(key));
