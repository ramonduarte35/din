"use strict";
/**
 * Utilitários de formatação e conversão de moeda (BRL).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBRL = formatBRL;
exports.parseCurrencyInput = parseCurrencyInput;
exports.extractAmountFromText = extractAmountFromText;
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
/**
 * Converte strings em formatos numéricos brasileiros (PT-BR) e internacionais para float.
 * Suporta:
 * - "6.000" -> 6000 (ponto como separador de milhar)
 * - "6.000,50" -> 6000.50
 * - "6,000.50" -> 6000.50
 * - "6,50" / "6.50" -> 6.50
 * - "6k" / "6 mil" / "1,5 mil" / "1.5k" -> 6000 / 1500
 * - "2 barões" / "2 milão" -> 2000
 * - "cinquentão" -> 50, "vintão" -> 20, "cem conto" -> 100
 */
function parseCurrencyInput(value) {
    if (typeof value === 'number')
        return Math.abs(value);
    if (!value || typeof value !== 'string')
        return 0;
    const raw = value.trim().toLowerCase();
    // Tratamento de gírias populares brasileiras diretas
    if (raw === 'cinquentão' || raw === 'cinquentao')
        return 50;
    if (raw === 'vintão' || raw === 'vintao')
        return 20;
    if (raw === 'dezão' || raw === 'dezao')
        return 10;
    if (raw === 'cem conto' || raw === 'cem pila')
        return 100;
    // Tratar multiplicadores expressos em texto (ex: "6 mil", "6k", "1,5 mil", "2 barões", "2 milão")
    const multiplierMatch = raw.match(/^(\d+(?:[.,]\d+)?)\s*(?:k|mil|milhao|milhão|milhoes|milhões|barao|barão|baroes|barões|milao|milão|mi)$/i);
    if (multiplierMatch) {
        const baseStr = multiplierMatch[1].replace(',', '.');
        const baseNum = parseFloat(baseStr);
        if (!isNaN(baseNum)) {
            const unit = raw.slice(multiplierMatch[1].length).trim().toLowerCase();
            if (unit.startsWith('milh') ||
                unit.startsWith('mi')) {
                return Math.abs(baseNum * 1000000);
            }
            return Math.abs(baseNum * 1000);
        }
    }
    // Extrair a parte numérica
    const match = raw.match(/(\d+(?:[.,]\d+)*)/);
    if (!match)
        return 0;
    let numStr = match[1];
    // Caso 1: Possui tanto ponto quanto vírgula (ex: "1.250,50" ou "1,250.50")
    if (numStr.includes('.') && numStr.includes(',')) {
        const lastDotIndex = numStr.lastIndexOf('.');
        const lastCommaIndex = numStr.lastIndexOf(',');
        if (lastCommaIndex > lastDotIndex) {
            // Padrão brasileiro: 1.250,50 -> remove '.', substitui ',' por '.'
            numStr = numStr.replace(/\./g, '').replace(',', '.');
        }
        else {
            // Padrão americano: 1,250.50 -> remove ','
            numStr = numStr.replace(/,/g, '');
        }
        const parsed = parseFloat(numStr);
        return isNaN(parsed) ? 0 : Math.abs(parsed);
    }
    // Caso 2: Possui apenas pontos (ex: "6.000", "1.500", "1.000.000", "6.50", "6.5")
    if (numStr.includes('.')) {
        const parts = numStr.split('.');
        const lastPart = parts[parts.length - 1];
        // Se o último bloco tiver exatamente 3 dígitos (ex: 6.000, 1.500, 10.000, 1.000.000), é separador de milhar
        if (lastPart.length === 3 && parts.every((p, idx) => (idx === 0 ? p.length >= 1 && p.length <= 3 : p.length === 3))) {
            numStr = numStr.replace(/\./g, '');
        }
        else if (parts.length > 2) {
            numStr = numStr.replace(/\./g, '');
        }
        // Caso contrário (ex: 6.50 ou 6.5), é decimal float padrão
        const parsed = parseFloat(numStr);
        return isNaN(parsed) ? 0 : Math.abs(parsed);
    }
    // Caso 3: Possui apenas vírgula (ex: "6,00", "6,50", "1500,50")
    if (numStr.includes(',')) {
        const parts = numStr.split(',');
        if (parts.length > 2) {
            numStr = numStr.replace(/,/g, '');
        }
        else {
            // Em pt-BR, vírgula isolada é decimal: "6,00" -> 6.00, "6,50" -> 6.50
            numStr = numStr.replace(',', '.');
        }
        const parsed = parseFloat(numStr);
        return isNaN(parsed) ? 0 : Math.abs(parsed);
    }
    // Caso 4: Inteiro puro (ex: "6000", "50")
    const parsed = parseFloat(numStr);
    return isNaN(parsed) ? 0 : Math.abs(parsed);
}
/**
 * Extrai o valor monetário de uma frase em português brasileiro.
 * Trata casos como:
 * - "recebi o salario de 6.000" -> 6000
 * - "recebi o salario de 6000" -> 6000
 * - "gastei 50 no almoco" -> 50
 * - "comprei lanche por 6.50" -> 6.50
 * - "agendar conta de luz 150 vencimento dia 10" -> 150 (não confunde com o dia 10)
 * - "recebi 1,5 mil de freela" -> 1500
 * - "salario de 6k no bb" -> 6000
 */
function extractAmountFromText(text) {
    if (!text)
        return 0;
    const lower = text.toLowerCase().trim();
    // 1. Gírias com valores fixos
    if (/\b(cinquentão|cinquentao)\b/i.test(lower))
        return 50;
    if (/\b(vintão|vintao)\b/i.test(lower))
        return 20;
    if (/\b(dezão|dezao)\b/i.test(lower))
        return 10;
    if (/\b(cem conto|cem pila|cem reais)\b/i.test(lower))
        return 100;
    // 2. Multiplicadores explícitos: ex: "6k", "6 mil", "1,5 mil", "2 barões", "2 milão", "1.5k"
    const multRegex = /(\d+(?:[.,]\d+)?)\s*(k|mil|milhao|milhão|milhoes|milhões|barao|barão|baroes|barões|milao|milão|mi)\b/i;
    const multMatch = lower.match(multRegex);
    if (multMatch) {
        const base = parseFloat(multMatch[1].replace(',', '.'));
        if (!isNaN(base)) {
            const unit = multMatch[2].toLowerCase();
            if (unit.startsWith('milh') || unit === 'mi')
                return Math.abs(base * 1000000);
            return Math.abs(base * 1000);
        }
    }
    // 3. Padrões explícitos com R$, reais, valor, sal[áa]rio, paguei, recebi, gastei, ganhei, por, de
    const explicitCurrencyRegex = /(?:r\$|r\s*\$|reais|valor(?:\s*de)?|sal[áa]rio(?:\s*de)?|paguei|recebi|gastei|ganhei|por|custou|de)\s*(\d+(?:[.,]\d+)*)/i;
    const explicitMatch = lower.match(explicitCurrencyRegex);
    if (explicitMatch && explicitMatch[1]) {
        return parseCurrencyInput(explicitMatch[1]);
    }
    // 4. Número seguido de "reais", "conto", "pila", "pau", "mangos"
    const suffixCurrencyRegex = /(\d+(?:[.,]\d+)*)\s*(?:reais|conto|pila|pau|mangos)/i;
    const suffixMatch = lower.match(suffixCurrencyRegex);
    if (suffixMatch && suffixMatch[1]) {
        return parseCurrencyInput(suffixMatch[1]);
    }
    // 5. Fallback removendo datas para não capturar "dia 10" como valor
    const textWithoutDates = lower
        .replace(/(?:dia|vence|vencimento|em)\s*\d{1,2}(?:\/\d{1,2}(?:\/\d{2,4})?)?/gi, '')
        .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, '');
    const genericMatch = textWithoutDates.match(/(\d+(?:[.,]\d+)*)/);
    if (genericMatch && genericMatch[1]) {
        return parseCurrencyInput(genericMatch[1]);
    }
    return parseCurrencyInput(lower);
}
