const BASE64_FIXES = [/-/g, '+', /_/g, '/'];

/** Reads the `exp` claim (ms since epoch) from a JWT without verifying it. Returns null if unreadable. */
export const getTokenExpiry = (token) => {
  try {
    const payload = token.split('.')[1].replace(BASE64_FIXES[0], BASE64_FIXES[1]).replace(BASE64_FIXES[2], BASE64_FIXES[3]);
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};
