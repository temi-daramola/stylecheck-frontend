// The only file that reads import.meta.env. Everything else consumes the resolved values.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL. Copy .env.example to .env.development and set it.');
}

export const EnvConfig = Object.freeze({
  BASE_URL,
  IS_PRODUCTION: import.meta.env.PROD,
});
