export function formatNumber(value?: number | null): string {
  if (value == null) return '—';
  return Intl.NumberFormat('pt-BR').format(value);
}

export function formatCurrency(value?: number | null): string {
  if (value == null) return '—';
  return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/**
 * Formata competência AAAAMM para MM/AAAA
 * Exemplos: "202401" → "Jan/2024", "202312" → "Dez/2023"
 */
export function formatCompetencia(value?: string | null): string {
  if (!value || value.length < 6) return value ?? '—';
  const year = value.slice(0, 4);
  const month = parseInt(value.slice(4, 6), 10);
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[month - 1] ?? month}/${year}`;
}
