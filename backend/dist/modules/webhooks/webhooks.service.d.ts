export declare class WebhooksService {
    processEvolutionMessage(payload: any): Promise<{
        status: string;
        account: any;
        balance: number;
        income?: undefined;
        expense?: undefined;
        totalBalance?: undefined;
    } | {
        status: string;
        income: number;
        expense: number;
        totalBalance: number;
        account?: undefined;
        balance?: undefined;
    } | {
        status: string;
        count: number;
    } | {
        status: string;
    }>;
    /**
     * Extração com OpenAI (gpt-4o-mini com Structured Outputs via JSON Schema)
     */
    private extractWithAI;
    /**
     * Helper para localizar conta correspondente por texto
     */
    private findMatchingAccountName;
    /**
     * Parser local inteligente com suporte a gírias brasileiras, bancos e regex (Fallback)
     */
    private fallbackLocalParser;
    /**
     * Responde à consulta de saldo (específico por conta ou geral consolidado)
     */
    private handleBalanceQuery;
    /**
     * Registra uma ou mais transações e responde com confirmação formatada incluindo a conta de destino
     */
    private handleTransactionsRegistration;
    /**
     * Responde com guia de uso amigável
     */
    private handleUnknownMessage;
}
