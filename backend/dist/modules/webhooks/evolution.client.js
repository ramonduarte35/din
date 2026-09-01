"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evolutionClient = exports.EvolutionClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_js_1 = require("../../config/env.js");
class EvolutionClient {
    baseUrl;
    apiKey;
    constructor() {
        this.baseUrl = env_js_1.env.EVOLUTION_API_URL.replace(/\/$/, '');
        this.apiKey = env_js_1.env.EVOLUTION_GLOBAL_API_KEY;
    }
    getHeaders() {
        return {
            apikey: this.apiKey,
            'Content-Type': 'application/json',
        };
    }
    async sendText(instanceName, recipientNumber, message) {
        try {
            const cleanNumber = recipientNumber.replace(/\D/g, '');
            const url = `${this.baseUrl}/message/sendText/${instanceName}`;
            console.log(`📤 [Evolution] Enviando mensagem via instância "${instanceName}" para "${cleanNumber}"...`);
            const response = await axios_1.default.post(url, {
                number: cleanNumber,
                text: message,
                delay: 1000,
            }, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            console.log(`✅ [Evolution] Mensagem enviada com sucesso:`, response.status);
            return true;
        }
        catch (error) {
            console.error(`❌ [Evolution] Falha ao enviar mensagem via "${instanceName}":`, error?.response?.data || error?.message);
            return false;
        }
    }
    async getLicenseStatus() {
        try {
            const url = `${this.baseUrl}/license/status`;
            const response = await axios_1.default.get(url, { timeout: 3000 });
            return response.data;
        }
        catch {
            return { status: 'active' };
        }
    }
    async getLicenseRegisterUrl() {
        try {
            const url = `${this.baseUrl}/license/register`;
            const response = await axios_1.default.get(url, { timeout: 3000 });
            return response.data?.register_url || null;
        }
        catch {
            return null;
        }
    }
    async fetchInstances() {
        try {
            const url = `${this.baseUrl}/instance/fetchInstances`;
            const response = await axios_1.default.get(url, {
                headers: this.getHeaders(),
                timeout: 8000,
            });
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao buscar instâncias:`, error?.response?.data || error?.message);
            return [];
        }
    }
    async createInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/create`;
            const response = await axios_1.default.post(url, {
                instanceName,
                qrcode: true,
            }, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async connectInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/connect/${instanceName}`;
            const response = await axios_1.default.get(url, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao conectar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async getConnectionState(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/connectionState/${instanceName}`;
            const response = await axios_1.default.get(url, {
                headers: this.getHeaders(),
                timeout: 6000,
            });
            const state = response.data?.instance?.state || response.data?.state || 'close';
            return { state };
        }
        catch (error) {
            return { state: 'close' };
        }
    }
    async restartInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/restart/${instanceName}`;
            const response = await axios_1.default.post(url, {}, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao reiniciar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async logoutInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/logout/${instanceName}`;
            const response = await axios_1.default.delete(url, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao deslogar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async deleteInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/delete/${instanceName}`;
            const response = await axios_1.default.delete(url, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao deletar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async setWebhook(instanceName, webhookUrl) {
        try {
            const url = `${this.baseUrl}/webhook/set/${instanceName}`;
            const response = await axios_1.default.post(url, {
                url: webhookUrl,
                webhook_by_events: false,
                events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
            }, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao setar webhook para "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
}
exports.EvolutionClient = EvolutionClient;
exports.evolutionClient = new EvolutionClient();
