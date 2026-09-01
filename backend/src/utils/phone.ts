/**
 * Utilitários para normalização e formatação de números de telefone/WhatsApp.
 */

export function normalizePhoneNumber(raw: string | null | undefined): string {
  if (!raw) return '';

  // Remove sufixos do WhatsApp como @s.whatsapp.net ou @c.us
  let cleaned = raw.replace(/@.*$/, '');

  // Mantém apenas dígitos
  cleaned = cleaned.replace(/\D/g, '');

  if (!cleaned) return '';

  // Se tem 10 ou 11 dígitos (ex: 86999998888 ou 8688881111), adiciona DDI 55 do Brasil
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }

  // Se o número começa com 55 e tem 12 dígitos (falta o nono dígito em celular brasileiro antigo)
  // Ex: 55 86 8888-1111 -> mantemos como está ou 55 + DDD + 9 + 8 dígitos
  return cleaned;
}

export function formatPhoneNumberDisplay(raw: string | null | undefined): string {
  const normalized = normalizePhoneNumber(raw);
  if (!normalized) return '';

  // Formato Brasil com DDI 55: 55 86 98888 1111 (13 dígitos) ou 12 dígitos
  if (normalized.startsWith('55') && normalized.length === 13) {
    const ddd = normalized.slice(2, 4);
    const part1 = normalized.slice(4, 9);
    const part2 = normalized.slice(9, 13);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  if (normalized.startsWith('55') && normalized.length === 12) {
    const ddd = normalized.slice(2, 4);
    const part1 = normalized.slice(4, 8);
    const part2 = normalized.slice(8, 12);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  return `+${normalized}`;
}
