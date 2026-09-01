export declare class WebhooksService {
    processEvolutionMessage(payload: any): Promise<{
        status: string;
        income: number;
        expense: number;
        balance: number;
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
     * Parser local inteligente com suporte a gírias brasileiras e regex (Fallback)
     */
    private fallbackLocalParser;
    /**
     * Responde à consulta de saldo
     */
    private handleBalanceQuery;
    /**
     * Registra uma ou mais transações e responde com confirmação formatada
     */
    private handleTransactionsRegistration;
    /**
     * Responde com guia de uso amigável
     */
    private handleUnknownMessage;
}
