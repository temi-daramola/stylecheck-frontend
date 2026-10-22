// The only place a color value may appear. Everything else references these names.
export const COLORS = Object.freeze({
  primary: { base: '#3B5BDB', hover: '#2F4AB8', subtle: '#E7ECFC' },
  secondary: { base: '#64748B', hover: '#475569', subtle: '#E2E8F0' },
  success: { base: '#16A34A', hover: '#15803D', subtle: '#DCFCE7' },
  error: { base: '#DC2626', hover: '#B91C1C', subtle: '#FEE2E2' },
  info: { base: '#2563EB', hover: '#1D4ED8', subtle: '#DBEAFE' },
  warning: { base: '#D97706', hover: '#B45309', subtle: '#FEF3C7' },
  navy: { base: '#1E3A5F', dark: '#0F2547' },
  body: { base: '#334155', muted: '#64748B', heading: '#1E293B' },
  stage: { base: '#FFFFFF', surface: '#F0F2F5' },
  // Translucent values for depth effects (shadows, dialog backdrops).
  shadow: { soft: 'rgba(15, 37, 71, 0.06)', strong: 'rgba(15, 37, 71, 0.18)' },
  overlay: { base: 'rgba(15, 37, 71, 0.45)', light: 'rgba(255, 255, 255, 0.55)' },
});
