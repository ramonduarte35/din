"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billsNotificationService = exports.BillsNotificationService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const redis_js_1 = require("../../lib/redis.js");
const currency_js_1 = require("../../utils/currency.js");
const date_js_1 = require("../../utils/date.js");
const telegram_client_js_1 = require("../telegram/telegram.client.js");
const meta_client_js_1 = require("../meta-whatsapp/meta.client.js");
const evolution_client_js_1 = require("./../webhooks/evolution.client.js");
const client_1 = require("@prisma/client");
class BillsNotificationService {
    /**
     * Obtém a lista de contas a vencer para um usuário específico
     */
    async getDueBillsForUser(userId, daysAhead = 3) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureCutoff = new Date(today);
        futureCutoff.setDate(futureCutoff.getDate() + daysAhead);
        futureCutoff.setHours(23, 59, 59, 999);
        const bills = await prisma_js_1.prisma.bill.findMany({
            where: {
                user_id: userId,
                status: client_1.BillStatus.PENDING,
                due_date: {
                    lte: futureCutoff,
                },
            },
            include: {
                category: true,
                account: true,
            },
            orderBy: {
                due_date: 'asc',
            },
        });
        const overdue = [];
        const dueToday = [];
        const upcoming = [];
        for (const bill of bills) {
            const diffDays = (0, date_js_1.getDiffDays)(bill.due_date);
            if (diffDays < 0) {
                overdue.push(bill);
            }
            else if (diffDays === 0) {
                dueToday.push(bill);
            }
            else {
                upcoming.push(bill);
            }
        }
        return {
            allBills: bills,
            overdue,
            dueToday,
            upcoming,
            totalCount: bills.length,
            totalAmount: bills.reduce((acc, b) => acc + Number(b.amount), 0),
        };
    }
    /**
     * Formata a mensagem de lembrete
     */
    formatNotificationMessage(userName, data) {
        const { overdue, dueToday, upcoming, totalAmount } = data;
        const firstName = userName.split(' ')[0] || 'Usuário';
        let msg = `🔔 *Dino - Lembrete de Contas a Pagar*\n\n`;
        msg += `Olá, *${firstName}*! Aqui está o resumo das suas contas pendentes:\n\n`;
        if (overdue.length > 0) {
            msg += `⚠️ *VENCIDAS / EM ATRASO:*\n`;
            for (const bill of overdue) {
                const d = (0, date_js_1.formatDateBR)(bill.due_date);
                msg += `• ${bill.description} — *${(0, currency_js_1.formatBRL)(Number(bill.amount))}* (venceu em ${d})\n`;
            }
            msg += `\n`;
        }
        if (dueToday.length > 0) {
            msg += `📅 *VENCE HOJE:*\n`;
            for (const bill of dueToday) {
                msg += `• ${bill.description} — *${(0, currency_js_1.formatBRL)(Number(bill.amount))}*\n`;
            }
            msg += `\n`;
        }
        if (upcoming.length > 0) {
            msg += `⏳ *PRÓXIMOS DIAS:*\n`;
            for (const bill of upcoming) {
                const d = (0, date_js_1.formatDateBR)(bill.due_date);
                msg += `• ${bill.description} — *${(0, currency_js_1.formatBRL)(Number(bill.amount))}* (${d})\n`;
            }
            msg += `\n`;
        }
        msg += `💰 *Total a pagar:* ${(0, currency_js_1.formatBRL)(totalAmount)}\n\n`;
        msg += `💡 *Dica:* Quando realizar o pagamento, você pode me avisar diretamente por aqui dizendo _"Paguei a conta de [nome]"_ ou dar baixa pelo painel web do Dino.`;
        return msg;
    }
    /**
     * Envia a notificação para os canais disponíveis do usuário (Telegram e/ou WhatsApp)
     */
    async sendNotification(user, message) {
        const sentChannels = [];
        const errors = [];
        // 1. Enviar via Telegram se cadastrado
        if (user.telegram_id) {
            try {
                const success = await telegram_client_js_1.telegramClient.sendMessage(user.telegram_id, message);
                if (success) {
                    sentChannels.push('telegram');
                }
                else {
                    errors.push('Telegram: Falha no envio');
                }
            }
            catch (err) {
                errors.push(`Telegram: ${err?.message || 'Erro desconhecido'}`);
            }
        }
        // 2. Enviar via WhatsApp se cadastrado
        if (user.phone_number) {
            try {
                const config = await prisma_js_1.prisma.whatsAppIntegrationConfig.findFirst({
                    orderBy: { created_at: 'desc' },
                });
                if (config?.active_provider === 'META_OFFICIAL' && config.meta_phone_number_id) {
                    const sent = await meta_client_js_1.metaClient.sendText(user.phone_number, message, {
                        phoneNumberId: config.meta_phone_number_id,
                    });
                    if (sent)
                        sentChannels.push('meta_whatsapp');
                    else
                        errors.push('Meta WhatsApp: Erro no envio');
                }
                else {
                    // Evolution API / Go
                    const activeInstance = await prisma_js_1.prisma.systemWhatsAppNumber.findFirst({
                        where: { is_active: true },
                    });
                    if (activeInstance) {
                        const sent = await evolution_client_js_1.evolutionClient.sendText(activeInstance.instance_name, user.phone_number, message);
                        if (sent)
                            sentChannels.push(`evolution_whatsapp (${activeInstance.instance_name})`);
                        else
                            errors.push('Evolution WhatsApp: Erro no envio');
                    }
                }
            }
            catch (err) {
                errors.push(`WhatsApp: ${err?.message || 'Erro desconhecido'}`);
            }
        }
        return {
            sent: sentChannels.length > 0,
            sentChannels,
            errors,
        };
    }
    /**
     * Processamento e despacho de notificações de contas a vencer
     */
    async dispatchDueBillNotifications(options = {}) {
        const { userId, daysAhead = 3, force = false } = options;
        const todayStr = new Date().toISOString().slice(0, 10);
        const result = {
            success: true,
            totalUsersChecked: 0,
            notificationsSent: 0,
            details: [],
        };
        // Selecionar usuários alvo
        const users = await prisma_js_1.prisma.user.findMany({
            where: {
                ...(userId ? { id: userId } : {}),
                OR: [
                    { phone_number: { not: null } },
                    { telegram_id: { not: null } },
                ],
            },
            select: {
                id: true,
                name: true,
                phone_number: true,
                telegram_id: true,
            },
        });
        result.totalUsersChecked = users.length;
        for (const user of users) {
            try {
                // Verificar idempotência no Redis se não for forçado
                const redisKey = `din:notif:due_bills:${user.id}:${todayStr}`;
                if (!force) {
                    try {
                        const alreadySent = await redis_js_1.redis.get(redisKey);
                        if (alreadySent) {
                            result.details.push({
                                userId: user.id,
                                userName: user.name,
                                billsCount: 0,
                                channels: [],
                                status: 'skipped',
                                reason: 'Notificação já enviada hoje para este usuário',
                            });
                            continue;
                        }
                    }
                    catch {
                        // Ignora erro de conexão do Redis
                    }
                }
                const dueData = await this.getDueBillsForUser(user.id, daysAhead);
                if (dueData.totalCount === 0) {
                    result.details.push({
                        userId: user.id,
                        userName: user.name,
                        billsCount: 0,
                        channels: [],
                        status: 'skipped',
                        reason: 'Nenhuma conta a vencer no período selecionado',
                    });
                    continue;
                }
                const message = this.formatNotificationMessage(user.name, dueData);
                const sendRes = await this.sendNotification(user, message);
                if (sendRes.sent) {
                    result.notificationsSent++;
                    try {
                        await redis_js_1.redis.set(redisKey, '1', 'EX', 86400); // 24h
                    }
                    catch {
                        // Ignora erro do Redis
                    }
                    result.details.push({
                        userId: user.id,
                        userName: user.name,
                        billsCount: dueData.totalCount,
                        channels: sendRes.sentChannels,
                        status: 'sent',
                    });
                }
                else {
                    result.details.push({
                        userId: user.id,
                        userName: user.name,
                        billsCount: dueData.totalCount,
                        channels: [],
                        status: 'failed',
                        reason: sendRes.errors.join('; ') || 'Nenhum canal de mensagem configurado ou disponível',
                    });
                }
            }
            catch (err) {
                result.details.push({
                    userId: user.id,
                    userName: user.name,
                    billsCount: 0,
                    channels: [],
                    status: 'failed',
                    reason: err?.message || 'Erro inesperado',
                });
            }
        }
        return result;
    }
    /**
     * Inicializa o scheduler de verificação periódica de contas (executado em background)
     */
    initScheduledBillNotifier() {
        console.log('⏰ [Scheduler] Inicializando monitor de notificações de contas a vencer (Dino Proactive Notifier)...');
        // Checar a cada 30 minutos
        const INTERVAL_MS = 30 * 60 * 1000;
        const checkAndDispatch = async () => {
            try {
                const now = new Date();
                const currentHour = now.getHours(); // 0 a 23
                // Executar a rotina matinal entre 8h e 10h
                if (currentHour >= 8 && currentHour <= 10) {
                    const todayStr = now.toISOString().slice(0, 10);
                    const globalDailyRunKey = `din:scheduler:daily_bills_notif:${todayStr}`;
                    let hasRunToday = null;
                    try {
                        hasRunToday = await redis_js_1.redis.get(globalDailyRunKey);
                    }
                    catch {
                        // Ignora se Redis não estiver conectado
                    }
                    if (!hasRunToday) {
                        console.log('📢 [Scheduler] Iniciando disparo matinal automático de lembretes de contas a vencer...');
                        const dispatchResult = await this.dispatchDueBillNotifications({ force: false });
                        try {
                            await redis_js_1.redis.set(globalDailyRunKey, '1', 'EX', 86400);
                        }
                        catch {
                            // Ignora
                        }
                        console.log(`✅ [Scheduler] Disparo diário concluído: ${dispatchResult.notificationsSent} notificações enviadas de ${dispatchResult.totalUsersChecked} usuários avaliados.`);
                    }
                }
            }
            catch (err) {
                console.warn('⚠️ [Scheduler] Erro durante checagem agendada de contas:', err?.message);
            }
        };
        // Agendar primeiro check com pequeno delay e depois periodicamente
        setTimeout(checkAndDispatch, 10000);
        setInterval(checkAndDispatch, INTERVAL_MS);
    }
}
exports.BillsNotificationService = BillsNotificationService;
exports.billsNotificationService = new BillsNotificationService();
