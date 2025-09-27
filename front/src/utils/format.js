// Utils: currency formatting
export const formatCurrencyAOA = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 2,
  }).format(number);
};