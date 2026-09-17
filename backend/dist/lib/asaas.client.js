"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asaasClient = exports.AsaasClient = void 0;
const env_js_1 = require("../config/env.js");
class AsaasClient {
    baseUrl;
    apiKey;
    constructor() {
        const rawKey = (env_js_1.env.ASAAS_API_KEY || '').trim();
        // Normaliza eventual escape de $$ vindo do docker-compose para um $ literal
        this.apiKey = rawKey.replace(/^\$\$+/, '$').replace(/\$\$/g, '$');
        const isSandbox = this.apiKey.startsWith('$aact_hmlg_') || env_js_1.env.ASAAS_ENVIRONMENT === 'sandbox';
        this.baseUrl = isSandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
    }
    isConfigured() {
        return Boolean(this.apiKey && this.apiKey.length > 5);
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'access_token': this.apiKey,
            'User-Agent': 'MeuDino-Financial-SaaS/1.0',
        };
    }
    /**
     * Localiza cliente por email ou cria um novo cadastro no Asaas
     */
    async findOrCreateCustomer(data) {
        if (!this.isConfigured()) {
            console.log(`ℹ️ [Asaas Mock] API Key não configurada. Simulando cliente Asaas para: ${data.email}`);
            return { id: `cus_mock_${Buffer.from(data.email).toString('hex').slice(0, 14)}` };
        }
        const cleanCpf = data.cpfCnpj?.replace(/\D/g, '') || undefined;
        const cleanPhone = (data.mobilePhone || data.phone || '').replace(/\D/g, '') || undefined;
        try {
            let customerId = null;
            // 1. Tentar buscar por e-mail
            if (data.email && data.email.trim().length > 0) {
                const searchRes = await fetch(`${this.baseUrl}/customers?email=${encodeURIComponent(data.email.trim())}`, {
                    method: 'GET',
                    headers: this.getHeaders(),
                });
                if (searchRes.ok) {
                    const searchData = (await searchRes.json());
                    if (searchData.data && searchData.data.length > 0) {
                        customerId = searchData.data[0].id;
                    }
                }
            }
            // 1.1 Se não encontrou por e-mail, buscar por CPF/CNPJ (se fornecido)
            if (!customerId && cleanCpf) {
                const searchCpfRes = await fetch(`${this.baseUrl}/customers?cpfCnpj=${encodeURIComponent(cleanCpf)}`, {
                    method: 'GET',
                    headers: this.getHeaders(),
                });
                if (searchCpfRes.ok) {
                    const searchCpfData = (await searchCpfRes.json());
                    if (searchCpfData.data && searchCpfData.data.length > 0) {
                        customerId = searchCpfData.data[0].id;
                    }
                }
            }
            // Se encontrou cliente existente, atualiza dados se necessário e retorna
            if (customerId) {
                if (cleanCpf || cleanPhone) {
                    await this.updateCustomer(customerId, {
                        cpfCnpj: cleanCpf,
                        phone: cleanPhone,
                    }).catch((err) => {
                        console.warn('⚠️ [Asaas Client] Aviso ao atualizar dados do cliente existente:', err.message);
                    });
                }
                return { id: customerId };
            }
            // 2. Se não existir no Asaas, criar novo cliente
            const createRes = await fetch(`${this.baseUrl}/customers`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    cpfCnpj: cleanCpf,
                    mobilePhone: cleanPhone,
                }),
            });
            const createData = (await createRes.json());
            if (!createRes.ok || !createData.id) {
                // Se a criação falhou por duplicidade de CPF ou e-mail, tenta recuperar o ID via busca
                if (cleanCpf) {
                    const fallbackRes = await fetch(`${this.baseUrl}/customers?cpfCnpj=${encodeURIComponent(cleanCpf)}`, {
                        method: 'GET',
                        headers: this.getHeaders(),
                    });
                    if (fallbackRes.ok) {
                        const fallbackData = (await fallbackRes.json());
                        if (fallbackData.data && fallbackData.data.length > 0) {
                            return { id: fallbackData.data[0].id };
                        }
                    }
                }
                const errorMsg = createData.errors?.map((e) => e.description).join(', ') || 'Erro desconhecido ao criar cliente Asaas';
                throw new Error(`Falha no Asaas: ${errorMsg}`);
            }
            return { id: createData.id };
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em findOrCreateCustomer:', err.message);
            throw err;
        }
    }
    /**
     * Atualiza dados de um cliente existente no Asaas (ex: CPF/CNPJ ou telefone)
     */
    async updateCustomer(customerId, data) {
        if (!this.isConfigured() || customerId.startsWith('cus_mock_')) {
            return { id: customerId };
        }
        try {
            const payload = {};
            if (data.name)
                payload.name = data.name;
            if (data.email)
                payload.email = data.email;
            if (data.cpfCnpj)
                payload.cpfCnpj = data.cpfCnpj.replace(/\D/g, '');
            const cleanPhone = (data.mobilePhone || data.phone || '').replace(/\D/g, '');
            if (cleanPhone)
                payload.mobilePhone = cleanPhone;
            const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            const resData = (await response.json());
            if (!response.ok || !resData.id) {
                const errorMsg = resData.errors?.map((e) => e.description).join(', ') || 'Erro ao atualizar cliente Asaas';
                throw new Error(`Falha no Asaas: ${errorMsg}`);
            }
            return { id: resData.id };
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em updateCustomer:', err.message);
            throw err;
        }
    }
    /**
     * Cria cobrança no Asaas (PIX, Cartão ou Boleto)
     */
    async createPayment(data) {
        if (!this.isConfigured()) {
            console.log(`ℹ️ [Asaas Mock] API Key não configurada. Simulando cobrança no valor de R$ ${data.value}`);
            const mockId = `pay_mock_${Date.now()}`;
            return {
                id: mockId,
                customer: data.customerId,
                value: data.value,
                netValue: data.value * 0.98,
                billingType: data.billingType,
                status: 'PENDING',
                dueDate: data.dueDate,
                invoiceUrl: `https://sandbox.asaas.com/i/${mockId}`,
            };
        }
        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    customer: data.customerId,
                    billingType: data.billingType,
                    value: data.value,
                    dueDate: data.dueDate,
                    description: data.description || 'Assinatura Meu Dino PRO',
                    postalService: false,
                }),
            });
            const resData = (await response.json());
            if (!response.ok || !resData.id) {
                const errorMsg = resData.errors?.map((e) => e.description).join(', ') || 'Erro ao criar cobrança no Asaas';
                throw new Error(`Falha no Asaas: ${errorMsg}`);
            }
            return {
                id: resData.id,
                customer: resData.customer,
                value: resData.value,
                netValue: resData.netValue,
                billingType: resData.billingType,
                status: resData.status,
                dueDate: resData.dueDate,
                invoiceUrl: resData.invoiceUrl,
                bankSlipUrl: resData.bankSlipUrl,
            };
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em createPayment:', err.message);
            throw err;
        }
    }
    /**
     * Obtém QR Code PIX e chave Copia e Cola de um pagamento
     */
    async getPixQrCode(paymentId) {
        if (!this.isConfigured() || paymentId.startsWith('pay_mock_')) {
            const mockPayload = `00020126580014br.gov.bcb.pix0136mock-din-pro-${paymentId}520400005303986540519.905802BR5909DIN_PRO6008BRASILIA62070503***6304ABCD`;
            const expDate = new Date();
            expDate.setHours(expDate.getHours() + 24);
            return {
                encodedImage: '', // Não envia imagem verde fake em dev/mock
                payload: mockPayload,
                expirationDate: expDate.toISOString(),
            };
        }
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            const resData = (await response.json());
            if (!response.ok || !resData.payload) {
                const errorMsg = resData.errors?.map((e) => e.description).join(', ') || 'Erro ao obter PIX no Asaas';
                throw new Error(`Falha no Asaas PIX: ${errorMsg}`);
            }
            return {
                encodedImage: resData.encodedImage,
                payload: resData.payload,
                expirationDate: resData.expirationDate,
            };
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em getPixQrCode:', err.message);
            throw err;
        }
    }
    /**
     * Consulta status de um pagamento específico
     */
    async getPayment(paymentId) {
        if (!this.isConfigured() || paymentId.startsWith('pay_mock_')) {
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            if (!response.ok)
                return null;
            return (await response.json());
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em getPayment:', err.message);
            return null;
        }
    }
    /**
     * Cria um Link de Pagamento (Checkout Asaas)
     */
    async createPaymentLink(data) {
        if (!this.isConfigured()) {
            console.warn(`⚠️ [Asaas Client] ASAAS_API_KEY não configurada no servidor.`);
            throw new Error('Integração com gateway Asaas não configurada: adicione sua ASAAS_API_KEY no arquivo .env para gerar links de checkout oficiais.');
        }
        try {
            const response = await fetch(`${this.baseUrl}/paymentLinks`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name: data.name,
                    description: data.description || 'Assinatura Meu Dino PRO',
                    billingType: data.billingType || 'UNDEFINED',
                    chargeType: data.chargeType || 'RECURRENT',
                    subscriptionCycle: data.subscriptionCycle || 'MONTHLY',
                    value: data.value,
                    dueDateLimitDays: data.dueDateLimitDays ?? 3,
                    externalReference: data.externalReference,
                    notificationEnabled: data.notificationEnabled ?? true,
                }),
            });
            const resData = (await response.json());
            if (!response.ok || !resData.url) {
                const errorMsg = resData.errors?.map((e) => e.description).join(', ') || 'Erro ao criar link de pagamento no Asaas';
                throw new Error(`Falha no Asaas: ${errorMsg}`);
            }
            return resData;
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em createPaymentLink:', err.message);
            throw err;
        }
    }
    /**
     * Obtém detalhes de um Link de Pagamento no Asaas
     */
    async getPaymentLink(paymentLinkId) {
        if (!this.isConfigured() || paymentLinkId.startsWith('link_mock_')) {
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/paymentLinks/${paymentLinkId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em getPaymentLink:', err.message);
            return null;
        }
    }
    /**
     * Exclui um Link de Pagamento no Asaas
     */
    async deletePaymentLink(paymentLinkId) {
        if (!this.isConfigured() || paymentLinkId.startsWith('link_mock_')) {
            return { deleted: true, id: paymentLinkId };
        }
        try {
            const response = await fetch(`${this.baseUrl}/paymentLinks/${paymentLinkId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em deletePaymentLink:', err.message);
            return null;
        }
    }
    /**
     * Obtém detalhes de uma Assinatura no Asaas
     */
    async getSubscription(subscriptionId) {
        if (!this.isConfigured() || subscriptionId.startsWith('sub_mock_')) {
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em getSubscription:', err.message);
            return null;
        }
    }
    /**
     * Cancela uma Assinatura no Asaas
     */
    async deleteSubscription(subscriptionId) {
        if (!this.isConfigured() || subscriptionId.startsWith('sub_mock_')) {
            return { deleted: true, id: subscriptionId };
        }
        try {
            const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (err) {
            console.error('❌ [Asaas Client] Erro em deleteSubscription:', err.message);
            return null;
        }
    }
}
exports.AsaasClient = AsaasClient;
exports.asaasClient = new AsaasClient();
