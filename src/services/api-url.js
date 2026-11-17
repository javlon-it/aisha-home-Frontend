// API bazasi /api bilan tugaydi. So‘rov yo‘llari /health kabi yoziladi.
export function normalizeApiBase(value) {
  const base = String(value || '').trim().replace(/\/+$/, '');
  if (base === '/api') return base;
  let parsed;
  try { parsed = new URL(base); } catch { throw new Error('VITE_API_URL /api bilan tugaydigan URL bo‘lishi kerak'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password ||
      parsed.pathname !== '/api' || parsed.search || parsed.hash) {
    throw new Error('VITE_API_URL faqat http(s) origin va bitta /api dan iborat bo‘lishi kerak');
  }
  return parsed.origin + '/api';
}
