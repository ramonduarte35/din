"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWhatsAppService = exports.AdminWhatsAppService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const redis_js_1 = require("../../lib/redis.js");
const evolution_client_js_1 = require("../webhooks/evolution.client.js");
const meta_client_js_1 = require("../meta-whatsapp/meta.client.js");
const phone_js_1 = require("../../utils/phone.js");
class AdminWhatsAppService {
    async getSettings() {
        let replyOnlyRegistered = false;
        try {
            const cached = await redis_js_1.redis.get('system_setting:reply_only_registered');
            if (cached !== null) {
                replyOnlyRegistered = cached === 'true' || cached === '1';
            }
            else {
                const setting = await prisma_js_1.prisma.systemSetting.findUnique({
                    where: { key: 'reply_only_registered' },
                });
                replyOnlyRegistered = setting ? setting.value === 'true' : false;
                await redis_js_1.redis.set('system_setting:reply_only_registered', replyOnlyRegistered ? 'true' : 'false', 'EX', 3600);
            }
        }
        catch (e) {
            const setting = await prisma_js_1.prisma.systemSetting.findUnique({
                where: { key: 'reply_only_registered' },
            });
            replyOnlyRegistered = setting ? setting.value === 'true' : false;
        }
        return {
            reply_only_registered: replyOnlyRegistered,
        };
    }
    async updateSettings(data) {
        if (data.reply_only_registered !== undefined) {
            const valStr = data.reply_only_registered ? 'true' : 'false';
            await prisma_js_1.prisma.systemSetting.upsert({
                where: { key: 'reply_only_registered' },
                create: {
                    key: 'reply_only_registered',
                    value: valStr,
                    description: 'Quando ativado, o sistema não responde a remetentes desconhecidos que não possuem conta cadastrada.',
                },
                update: {
                    value: valStr,
                },
            });
            try {
                await redis_js_1.redis.set('system_setting:reply_only_registered', valStr, 'EX', 86400);
            }
            catch (e) {
                // ignore redis error
            }
        }
        return this.getSettings();
    }
    async listInstances() {
        const dbNumbers = await prisma_js_1.prisma.systemWhatsAppNumber.findMany({
            orderBy: { created_at: 'desc' },
        });
        // Enriquecer cada registro com o status de conexão em tempo real do Evolution Go
        const enriched = await Promise.all(dbNumbers.map(async (item) => {
            try {
                const stateRes = await evolution_client_js_1.evolutionClient.getConnectionState(item.instance_name);
                return {
                    ...item,
                    connection_status: stateRes.state, // 'open' | 'close' | 'connecting'
                    is_connected: stateRes.state === 'open',
                };
            }
            catch (error) {
                return {
                    ...item,
                    connection_status: 'close',
                    is_connected: false,
                };
            }
        }));
        return enriched;
    }
    async createInstance(data) {
        const normalizedPhone = (0, phone_js_1.normalizePhoneNumber)(data.phone_number);
        const existing = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { instance_name: data.instance_name },
        });
        if (existing) {
            throw { statusCode: 409, message: `Uma instância com o nome "${data.instance_name}" já existe.` };
        }
        // 1. Criar no gateway Evolution Go
        try {
            await evolution_client_js_1.evolutionClient.createInstance(data.instance_name);
        }
        catch (err) {
            console.warn(`[Admin] Aviso ao criar instância no Evolution Go (pode já existir no gateway):`, err?.message);
        }
        // 2. Configurar o Webhook
        try {
            const webhookUrl = 'http://api:3000/api/v1/webhooks/evolution';
            await evolution_client_js_1.evolutionClient.setWebhook(data.instance_name, webhookUrl);
        }
        catch (err) {
            console.warn(`[Admin] Aviso ao configurar webhook:`, err?.message);
        }
        // 3. Salvar no banco de dados local
        const newNumber = await prisma_js_1.prisma.systemWhatsAppNumber.create({
            data: {
                instance_name: data.instance_name,
                phone_number: normalizedPhone,
                label: data.label,
                is_active: data.is_active ?? true,
            },
        });
        return newNumber;
    }
    async getQrCode(id) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        try {
            let connectData = null;
            try {
                connectData = await evolution_client_js_1.evolutionClient.connectInstance(instance.instance_name);
            }
            catch (connErr) {
                // Se a instância não existe ainda no gateway, cria agora
                const createRes = await evolution_client_js_1.evolutionClient.createInstance(instance.instance_name);
                connectData = createRes?.qrcode || createRes;
            }
            if (!connectData || (!connectData.base64 && !connectData.code && !connectData.qrcode)) {
                try {
                    const createRes = await evolution_client_js_1.evolutionClient.createInstance(instance.instance_name);
                    connectData = createRes?.qrcode || createRes;
                }
                catch (createErr) {
                    // pode já existir
                }
            }
            let base64 = connectData?.base64 || connectData?.qrcode?.base64 || connectData?.code;
            const pairingCode = connectData?.pairingCode || connectData?.pairing_code;
            const count = connectData?.count;
            // Se não veio no retorno imediato, verifica no Redis se o webhook recebeu o evento qrcode.updated
            if (!base64) {
                base64 = await redis_js_1.redis.get(`qrcode:${instance.instance_name}`);
            }
            // Se ainda não, aguarda 1 segundo e tenta no Redis novamente
            if (!base64) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                base64 = await redis_js_1.redis.get(`qrcode:${instance.instance_name}`);
            }
            return {
                instance_name: instance.instance_name,
                base64: base64 || null,
                code: connectData?.code || null,
                pairingCode: pairingCode || null,
                count: count || 0,
            };
        }
        catch (error) {
            console.error(`[Admin] Erro ao obter QR Code para "${instance.instance_name}":`, error?.message);
            if (error?.response?.data?.code === 'LICENSE_REQUIRED' ||
                error?.response?.data?.error === 'service not activated') {
                throw {
                    statusCode: 402,
                    message: 'A licença do Evolution Go ainda não foi ativada. Acesse http://<ip-do-servidor>:4000/manager para ativar a licença gratuita em 1 clique.',
                };
            }
            throw { statusCode: 502, message: 'Não foi possível gerar o QR Code no gateway Evolution Go.' };
        }
    }
    async getInstanceStatus(id) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        const stateRes = await evolution_client_js_1.evolutionClient.getConnectionState(instance.instance_name);
        return {
            id: instance.id,
            instance_name: instance.instance_name,
            connection_status: stateRes.state,
            is_connected: stateRes.state === 'open',
        };
    }
    async restartInstance(id) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        await evolution_client_js_1.evolutionClient.restartInstance(instance.instance_name);
        return { message: `Instância "${instance.instance_name}" reiniciada com sucesso.` };
    }
    async logoutInstance(id) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        await evolution_client_js_1.evolutionClient.logoutInstance(instance.instance_name);
        return { message: `Sessão do WhatsApp deslogada com sucesso para "${instance.instance_name}".` };
    }
    async updateInstance(id, data) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        let normalizedPhone = undefined;
        if (data.phone_number) {
            normalizedPhone = (0, phone_js_1.normalizePhoneNumber)(data.phone_number);
        }
        const updated = await prisma_js_1.prisma.systemWhatsAppNumber.update({
            where: { id },
            data: {
                label: data.label,
                phone_number: normalizedPhone,
                is_active: data.is_active,
            },
        });
        return updated;
    }
    async deleteInstance(id) {
        const instance = await prisma_js_1.prisma.systemWhatsAppNumber.findUnique({
            where: { id },
        });
        if (!instance) {
            throw { statusCode: 404, message: 'Instância não encontrada.' };
        }
        try {
            await evolution_client_js_1.evolutionClient.deleteInstance(instance.instance_name);
        }
        catch (err) {
            console.warn(`[Admin] Aviso ao remover instância do Evolution Go:`, err?.message);
        }
        await prisma_js_1.prisma.systemWhatsAppNumber.delete({
            where: { id },
        });
        return { message: `Instância "${instance.instance_name}" removida com sucesso.` };
    }
    async getLogs(query) {
        const { page, limit, status, sender } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (sender) {
            where.sender_number = { contains: sender.replace(/\D/g, '') };
        }
        const [total, logs] = await Promise.all([
            prisma_js_1.prisma.whatsAppLog.count({ where }),
            prisma_js_1.prisma.whatsAppLog.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getEvolutionStatus() {
        return await evolution_client_js_1.evolutionClient.testConnection();
    }
    async getEvolutionLicense() {
        const [statusRes, registerRes] = await Promise.all([
            evolution_client_js_1.evolutionClient.getLicenseStatus(),
            evolution_client_js_1.evolutionClient.getLicenseRegisterUrl(),
        ]);
        return {
            status: statusRes.status,
            instance_id: statusRes.instance_id || registerRes.instance_id,
            register_url: registerRes.register_url,
        };
    }
    async testEvolutionConnection() {
        return await evolution_client_js_1.evolutionClient.testConnection();
    }
    async activateEvolutionLicense(code) {
        if (!code || !code.trim()) {
            throw new Error('Código de autorização é obrigatório.');
        }
        const result = await evolution_client_js_1.evolutionClient.activateLicense(code.trim());
        if (!result.success) {
            throw new Error(result.error || 'Falha ao ativar a licença.');
        }
        const updatedStatus = await evolution_client_js_1.evolutionClient.testConnection();
        return {
            message: 'Licença do Evolution Go ativada com sucesso!',
            status: updatedStatus,
        };
    }
    // ─── Provedor Meta Cloud API Oficial ─────────────────────────────
    async getProviderConfig() {
        let config = await prisma_js_1.prisma.whatsAppIntegrationConfig.findFirst({
            orderBy: { created_at: 'desc' },
        });
        if (!config) {
            config = await prisma_js_1.prisma.whatsAppIntegrationConfig.create({
                data: {
                    active_provider: 'EVOLUTION',
                    meta_verify_token: 'din_meta_verify_token',
                },
            });
        }
        return config;
    }
    async updateProviderConfig(data) {
        const current = await this.getProviderConfig();
        const updated = await prisma_js_1.prisma.whatsAppIntegrationConfig.update({
            where: { id: current.id },
            data: {
                ...(data.active_provider !== undefined && { active_provider: data.active_provider }),
                ...(data.meta_phone_number_id !== undefined && { meta_phone_number_id: data.meta_phone_number_id }),
                ...(data.meta_waba_id !== undefined && { meta_waba_id: data.meta_waba_id }),
                ...(data.meta_access_token !== undefined && { meta_access_token: data.meta_access_token }),
                ...(data.meta_verify_token !== undefined && { meta_verify_token: data.meta_verify_token }),
                ...(data.meta_app_secret !== undefined && { meta_app_secret: data.meta_app_secret }),
            },
        });
        return updated;
    }
    async testMetaConnection(data) {
        return await meta_client_js_1.metaClient.testConnection(data?.meta_phone_number_id, data?.meta_access_token);
    }
}
exports.AdminWhatsAppService = AdminWhatsAppService;
exports.adminWhatsAppService = new AdminWhatsAppService();
