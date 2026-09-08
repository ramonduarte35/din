import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export const formatBRL = formatCurrency;

/**
 * Formata um valor numérico ou dígitos digitados para o formato monetário BRL (ex: "1.234,56")
 */
export function formatCurrencyInput(value: number | string | null | undefined, allowZero = false): string {
  if (value === '' || value === undefined || value === null) return '';
  if (typeof value === 'number') {
    if (isNaN(value)) return '';
    if (value === 0 && !allowZero) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const str = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(str) && str.includes('.')) {
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      if (parsed === 0 && !allowZero) return '';
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parsed);
    }
  }

  const clean = str.replace(/\D/g, '');
  if (!clean) return '';
  const num = parseInt(clean, 10) / 100;
  if (num === 0 && !allowZero) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Converte a string com máscara monetária (ex: "1.234,56") para número float real
 */
export function parseCurrencyInput(value: string | number | null | undefined): number {
  if (value === '' || value === undefined || value === null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10) / 100;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';

  if (typeof dateString === 'string') {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }

  if (dateString instanceof Date) {
    const d = String(dateString.getDate()).padStart(2, '0');
    const m = String(dateString.getMonth() + 1).padStart(2, '0');
    const y = dateString.getFullYear();
    return `${d}/${m}/${y}`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Converte data para formato YYYY-MM-DD no calendário local para inputs type="date"
 */
export function formatDateToISO(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Faz parse de data retornando um Date local no início do dia (00:00:00)
 */
export function parseDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;

  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    }
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Calcula a diferença em dias entre a data alvo e a data de hoje
 */
export function getDiffDays(dateInput: string | Date | null | undefined): number {
  const targetDate = parseDate(dateInput);
  if (!targetDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'Não cadastrado';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length === 13) {
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 9);
    const p2 = digits.slice(9, 13);
    return `+55 (${ddd}) ${p1}-${p2}`;
  }

  if (digits.startsWith('55') && digits.length === 12) {
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 8);
    const p2 = digits.slice(8, 12);
    return `+55 (${ddd}) ${p1}-${p2}`;
  }

  return phone;
}
