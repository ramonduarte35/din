"use strict";
/**
 * Utilitários de formatação e conversão de moeda (BRL).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBRL = formatBRL;
exports.parseCurrencyInput = parseCurrencyInput;
function formatBRL(value) {
    if (value === null || value === undefined)
        return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num))
        return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(num);
}
function parseCurrencyInput(value) {
    if (typeof value === 'number')
        return Math.abs(value);
    const clean = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.abs(num);
}
