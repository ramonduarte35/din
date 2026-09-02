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
            const url = `${this.baseUrl}/send/text`;
            console.log(`📤 [Evolution] Enviando mensagem via instância "${instanceName}" para "${cleanNumber}"...`);
            const response = await axios_1.default.post(url, {
                number: cleanNumber,
                text: message,
                delay: 1000,
            }, {
                headers: {
                    apikey: instanceName,
                    'Content-Type': 'application/json',
                },
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
            const response = await axios_1.default.get(url, { timeout: 4000 });
            return response.data;
        }
        catch (err) {
            if (err?.response?.data) {
                return err.response.data;
            }
            return { status: 'offline', error: err?.message || 'Evolution Go inacessível' };
        }
    }
    async getLicenseRegisterUrl() {
        try {
            const url = `${this.baseUrl}/license/register`;
            const response = await axios_1.default.get(url, { timeout: 4000 });
            return {
                register_url: response.data?.register_url || null,
                status: response.data?.status || 'unknown',
                instance_id: response.data?.instance_id,
            };
        }
        catch (err) {
            return {
                register_url: null,
                status: 'error',
            };
        }
    }
    async activateLicense(code) {
        try {
            const url = `${this.baseUrl}/license/activate`;
            const response = await axios_1.default.get(url, {
                params: { code: code.trim() },
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return { success: true, message: 'Licença ativada com sucesso!', details: response.data };
        }
        catch (err) {
            const errorMsg = err?.response?.data?.details || err?.response?.data?.error || err?.message || 'Falha ao ativar a licença.';
            return { success: false, error: errorMsg };
        }
    }
    async testConnection() {
        const startTime = Date.now();
        try {
            const [licenseRes, registerRes, instances] = await Promise.all([
                this.getLicenseStatus(),
                this.getLicenseRegisterUrl(),
                this.fetchInstances(),
            ]);
            const latency_ms = Date.now() - startTime;
            const is_online = licenseRes.status !== 'offline';
            return {
                is_online,
                base_url: this.baseUrl,
                api_key_configured: Boolean(this.apiKey && this.apiKey.length > 0),
                license: {
                    status: licenseRes.status || 'unknown',
                    instance_id: licenseRes.instance_id || registerRes.instance_id,
                    register_url: registerRes.register_url,
                },
                instances_count: instances.length,
                latency_ms,
            };
        }
        catch (err) {
            return {
                is_online: false,
                base_url: this.baseUrl,
                api_key_configured: Boolean(this.apiKey && this.apiKey.length > 0),
                license: {
                    status: 'offline',
                },
                instances_count: 0,
                latency_ms: Date.now() - startTime,
                error: err?.message || 'Falha ao conectar ao gateway Evolution Go',
            };
        }
    }
    async fetchInstances() {
        try {
            const url = `${this.baseUrl}/instance/all`;
            const response = await axios_1.default.get(url, {
                headers: this.getHeaders(),
                timeout: 8000,
            });
            return Array.isArray(response.data?.data) ? response.data.data : [];
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
                name: instanceName,
                token: instanceName,
                client_name: 'Din',
                alwaysOnline: true,
            }, {
                headers: this.getHeaders(),
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            if (error?.response?.data?.message?.includes('already exists') || error?.response?.data?.error?.includes('already')) {
                return { status: 'EXISTS' };
            }
            console.warn(`[Evolution] Erro/Aviso ao criar instância "${instanceName}":`, error?.response?.data || error?.message);
            return { status: 'EXISTS' };
        }
    }
    async connectInstance(instanceName) {
        try {
            // 1. Garantir que a instância existe no Evolution Go
            await this.createInstance(instanceName);
            // 2. Iniciar conexão com webhook e eventos
            const connectUrl = `${this.baseUrl}/instance/connect`;
            const webhookUrl = 'http://api:3000/api/v1/webhooks/evolution';
            try {
                await axios_1.default.post(connectUrl, {
                    webhookUrl,
                    subscribe: [
                        'MESSAGES_UPSERT',
                        'CONNECTION_UPDATE',
                        'QRCODE_UPDATED',
                    ],
                }, {
                    headers: { apikey: instanceName },
                    timeout: 10000,
                });
            }
            catch (connErr) {
                // Pode já estar conectando
            }
            // 3. Obter QR Code
            const qrUrl = `${this.baseUrl}/instance/qr`;
            const qrRes = await axios_1.default.get(qrUrl, {
                headers: { apikey: instanceName },
                timeout: 10000,
            });
            const qrcode = qrRes.data?.data?.qrcode || qrRes.data?.qrcode;
            const code = qrRes.data?.data?.code || qrRes.data?.code;
            return {
                base64: qrcode,
                code,
                qrcode: { base64: qrcode },
            };
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao conectar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async getConnectionState(instanceName) {
        try {
            const instances = await this.fetchInstances();
            const target = instances.find((inst) => inst.name === instanceName ||
                inst.token === instanceName ||
                inst.id === instanceName);
            if (target && (target.connected === true || target.status === 'open')) {
                return { state: 'open' };
            }
            return { state: 'close' };
        }
        catch (error) {
            return { state: 'close' };
        }
    }
    async restartInstance(instanceName) {
        try {
            // No Evolution Go reconectar chama connect
            return await this.connectInstance(instanceName);
        }
        catch (error) {
            console.error(`❌ [Evolution] Erro ao reiniciar instância "${instanceName}":`, error?.response?.data || error?.message);
            throw error;
        }
    }
    async logoutInstance(instanceName) {
        try {
            const url = `${this.baseUrl}/instance/logout`;
            const response = await axios_1.default.delete(url, {
                headers: { apikey: instanceName },
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
            const url = `${this.baseUrl}/instance/delete/${encodeURIComponent(instanceName)}`;
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
            const url = `${this.baseUrl}/instance/connect`;
            const response = await axios_1.default.post(url, {
                webhookUrl,
                subscribe: [
                    'MESSAGES_UPSERT',
                    'CONNECTION_UPDATE',
                    'QRCODE_UPDATED',
                ],
            }, {
                headers: { apikey: instanceName },
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
