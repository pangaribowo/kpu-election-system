// Mapping warna kandidat ke hex dan gradient
export const COLOR_MAP = {
  blue:   { hex: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb 60%, #60a5fa 100%)', text: '#fff' },
  green:  { hex: '#059669', gradient: 'linear-gradient(135deg, #059669 60%, #34d399 100%)', text: '#fff' },
  orange: { hex: '#d97706', gradient: 'linear-gradient(135deg, #d97706 60%, #fbbf24 100%)', text: '#fff' },
  purple: { hex: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed 60%, #a78bfa 100%)', text: '#fff' },
  red:    { hex: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626 60%, #f87171 100%)', text: '#fff' },
  indigo: { hex: '#4f46e5', gradient: 'linear-gradient(135deg, #4f46e5 60%, #818cf8 100%)', text: '#fff' },
};
export const SUPPORTED_COLORS = Object.keys(COLOR_MAP);
export function getValidColor(color) {
  return SUPPORTED_COLORS.includes((color || '').toLowerCase()) ? color.toLowerCase() : 'blue';
}
export function getCandidateBg(color) {
  const c = COLOR_MAP[getValidColor(color)];
  return c.gradient;
}
export function getCandidateTextColor(color) {
  const c = COLOR_MAP[getValidColor(color)];
  return c.text;
} 