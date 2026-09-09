/**
 * Utilitários de manipulação e formatação de datas consistentes (Timezone-safe para PT-BR).
 */

export function formatDateBR(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
  }
  if (dateInput instanceof Date) {
    const iso = dateInput.toISOString();
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
  }
  return '';
}

export function parseDateSafe(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0));
    }
  }
  if (dateInput instanceof Date) {
    return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate(), 12, 0, 0, 0));
  }
  return null;
}

export function getDiffDays(dateInput: Date | string | null | undefined): number {
  const targetDate = parseDateSafe(dateInput);
  if (!targetDate) return 0;
  const today = new Date();
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 0, 0, 0);
  return Math.round((targetDate.getTime() - todayUTC) / (1000 * 60 * 60 * 24));
}
