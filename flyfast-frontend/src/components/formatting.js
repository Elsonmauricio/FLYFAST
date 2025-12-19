export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export const getFlag = (country) => {
  // Assumindo que 'Luanda' é em Angola e o resto em Portugal.
  // Isto pode ser expandido para mais países se necessário.
  return country === 'Luanda' ? '🇦🇴' : '🇵🇹';
};