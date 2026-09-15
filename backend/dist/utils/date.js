"use strict";
/**
 * Utilitários de manipulação e formatação de datas consistentes (Timezone-safe para PT-BR).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateBR = formatDateBR;
exports.parseDateSafe = parseDateSafe;
exports.getDiffDays = getDiffDays;
function formatDateBR(dateInput) {
    if (!dateInput)
        return '';
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
function parseDateSafe(dateInput) {
    if (!dateInput)
        return null;
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
function getDiffDays(dateInput) {
    const targetDate = parseDateSafe(dateInput);
    if (!targetDate)
        return 0;
    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 0, 0, 0);
    return Math.round((targetDate.getTime() - todayUTC) / (1000 * 60 * 60 * 24));
}
