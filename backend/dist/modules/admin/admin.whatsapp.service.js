"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWhatsAppService = exports.AdminWhatsAppService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const evolution_client_js_1 = require("../webhooks/evolution.client.js");
const phone_js_1 = require("../../utils/phone.js");
class AdminWhatsAppService {
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
            const connectData = await evolution_client_js_1.evolutionClient.connectInstance(instance.instance_name);
            // Evolution Go costuma retornar { base64: "data:image/png;base64,...", code: "..." } ou { qrcode: { base64: ... } }
            const base64 = connectData?.base64 || connectData?.qrcode?.base64 || connectData?.code;
            const pairingCode = connectData?.pairingCode || connectData?.pairing_code;
            const count = connectData?.count;
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
}
exports.AdminWhatsAppService = AdminWhatsAppService;
exports.adminWhatsAppService = new AdminWhatsAppService();
