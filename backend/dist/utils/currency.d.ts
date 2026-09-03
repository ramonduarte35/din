/**
 * Utilitários de formatação e conversão de moeda (BRL).
 */
export declare function formatBRL(value: number | string | null | undefined): string;
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
export declare function parseCurrencyInput(value: string | number): number;
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
export declare function extractAmountFromText(text: string): number;
