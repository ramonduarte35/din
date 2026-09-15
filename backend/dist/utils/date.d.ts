/**
 * Utilitários de manipulação e formatação de datas consistentes (Timezone-safe para PT-BR).
 */
export declare function formatDateBR(dateInput: Date | string | null | undefined): string;
export declare function parseDateSafe(dateInput: Date | string | null | undefined): Date | null;
export declare function getDiffDays(dateInput: Date | string | null | undefined): number;
