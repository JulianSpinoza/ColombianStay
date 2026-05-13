export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const normalizeText = (str) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^\w\s]/gi, "")
        .trim();
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("es-CO");
};

export const parseNumber = (value) => {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
};

export const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};