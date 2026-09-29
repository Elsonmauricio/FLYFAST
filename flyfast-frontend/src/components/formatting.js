export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export const parsePrice = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (value === null || value === undefined || value === '') return NaN;

  // Remove moeda, espaços e qualquer caractere não numérico, preservando separadores
  const cleaned = String(value).replace(/\s/g, '').replace(/[^\d.,-]/g, '');
  if (!/\d/.test(cleaned)) return NaN;

  const lastSep = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  let normalized = cleaned;

  if (lastSep !== -1) {
    const decimals = cleaned.length - lastSep - 1;
    // Grupo de exatamente 3 dígitos = separador de milhares (ex: 1.299,00)
    if (decimals > 0 && decimals !== 3) {
      normalized = cleaned.slice(0, lastSep).replace(/[.,]/g, '') + '.' + cleaned.slice(lastSep + 1);
    } else {
      normalized = cleaned.replace(/[.,]/g, '');
    }
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const getFlag = (country) => {
  // Assumindo que 'Luanda' é em Angola e o resto em Portugal.
  // Isto pode ser expandido para mais países se necessário.
  return country === 'Luanda' ? '🇦🇴' : '🇵🇹';
};