import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { formatBRL } from '../../utils/currency.js';
import { telegramClient } from '../telegram/telegram.client.js';
import { metaClient } from '../meta-whatsapp/meta.client.js';
import { evolutionClient } from './../webhooks/evolution.client.js';
import { BillStatus } from '@prisma/client';

export interface DispatchOptions {
  userId?: string;
  daysAhead?: number;
  force?: boolean;
}

export interface DispatchResult {
  success: boolean;
  totalUsersChecked: number;
  notificationsSent: number;
  details: Array<{
    userId: string;
    userName: string;
    billsCount: number;
    channels: string[];
    status: 'sent' | 'skipped' | 'failed';
    reason?: string;
  }>;
}

export class BillsNotificationService {
  /**
   * Obtém a lista de contas a vencer para um usuário específico
   */
  async getDueBillsForUser(userId: string, daysAhead = 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureCutoff = new Date(today);
    futureCutoff.setDate(futureCutoff.getDate() + daysAhead);
    futureCutoff.setHours(23, 59, 59, 999);

    const bills = await prisma.bill.findMany({
      where: {
        user_id: userId,
        status: BillStatus.PENDING,
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

    const overdue: typeof bills = [];
    const dueToday: typeof bills = [];
    const upcoming: typeof bills = [];

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    for (const bill of bills) {
      const dueDate = new Date(bill.due_date);
      if (dueDate < today) {
        overdue.push(bill);
      } else if (dueDate <= todayEnd) {
        dueToday.push(bill);
      } else {
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
  formatNotificationMessage(userName: string, data: Awaited<ReturnType<typeof this.getDueBillsForUser>>) {
    const { overdue, dueToday, upcoming, totalAmount } = data;
    const firstName = userName.split(' ')[0] || 'Usuário';

    let msg = `🔔 *Din - Lembrete de Contas a Pagar*\n\n`;
    msg += `Olá, *${firstName}*! Aqui está o resumo das suas contas pendentes:\n\n`;

    if (overdue.length > 0) {
      msg += `⚠️ *VENCIDAS / EM ATRASO:*\n`;
      for (const bill of overdue) {
        const d = new Date(bill.due_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        msg += `• ${bill.description} — *${formatBRL(Number(bill.amount))}* (venceu em ${d})\n`;
      }
      msg += `\n`;
    }

    if (dueToday.length > 0) {
      msg += `📅 *VENCE HOJE:*\n`;
      for (const bill of dueToday) {
        msg += `• ${bill.description} — *${formatBRL(Number(bill.amount))}*\n`;
      }
      msg += `\n`;
    }

    if (upcoming.length > 0) {
      msg += `⏳ *PRÓXIMOS DIAS:*\n`;
      for (const bill of upcoming) {
        const d = new Date(bill.due_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        msg += `• ${bill.description} — *${formatBRL(Number(bill.amount))}* (${d})\n`;
      }
      msg += `\n`;
    }

    msg += `💰 *Total a pagar:* ${formatBRL(totalAmount)}\n\n`;
    msg += `💡 *Dica:* Quando realizar o pagamento, você pode me avisar diretamente por aqui dizendo _"Paguei a conta de [nome]"_ ou dar baixa pelo painel web do Din.`;

    return msg;
  }

  /**
   * Envia a notificação para os canais disponíveis do usuário (Telegram e/ou WhatsApp)
   */
  async sendNotification(user: { id: string; name: string; phone_number: string | null; telegram_id: string | null }, message: string) {
    const sentChannels: string[] = [];
    const errors: string[] = [];

    // 1. Enviar via Telegram se cadastrado
    if (user.telegram_id) {
      try {
        const success = await telegramClient.sendMessage(user.telegram_id, message);
        if (success) {
          sentChannels.push('telegram');
        } else {
          errors.push('Telegram: Falha no envio');
        }
      } catch (err: any) {
        errors.push(`Telegram: ${err?.message || 'Erro desconhecido'}`);
      }
    }

    // 2. Enviar via WhatsApp se cadastrado
    if (user.phone_number) {
      try {
        const config = await prisma.whatsAppIntegrationConfig.findFirst({
          orderBy: { created_at: 'desc' },
        });

        if (config?.active_provider === 'META_OFFICIAL' && config.meta_phone_number_id) {
          const sent = await metaClient.sendText(user.phone_number, message, {
            phoneNumberId: config.meta_phone_number_id,
          });
          if (sent) sentChannels.push('meta_whatsapp');
          else errors.push('Meta WhatsApp: Erro no envio');
        } else {
          // Evolution API / Go
          const activeInstance = await prisma.systemWhatsAppNumber.findFirst({
            where: { is_active: true },
          });

          if (activeInstance) {
            const sent = await evolutionClient.sendText(activeInstance.instance_name, user.phone_number, message);
            if (sent) sentChannels.push(`evolution_whatsapp (${activeInstance.instance_name})`);
            else errors.push('Evolution WhatsApp: Erro no envio');
          }
        }
      } catch (err: any) {
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
  async dispatchDueBillNotifications(options: DispatchOptions = {}): Promise<DispatchResult> {
    const { userId, daysAhead = 3, force = false } = options;

    const todayStr = new Date().toISOString().slice(0, 10);
    const result: DispatchResult = {
      success: true,
      totalUsersChecked: 0,
      notificationsSent: 0,
      details: [],
    };

    // Selecionar usuários alvo
    const users = await prisma.user.findMany({
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
            const alreadySent = await redis.get(redisKey);
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
          } catch {
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
            await redis.set(redisKey, '1', 'EX', 86400); // 24h
          } catch {
            // Ignora erro do Redis
          }

          result.details.push({
            userId: user.id,
            userName: user.name,
            billsCount: dueData.totalCount,
            channels: sendRes.sentChannels,
            status: 'sent',
          });
        } else {
          result.details.push({
            userId: user.id,
            userName: user.name,
            billsCount: dueData.totalCount,
            channels: [],
            status: 'failed',
            reason: sendRes.errors.join('; ') || 'Nenhum canal de mensagem configurado ou disponível',
          });
        }
      } catch (err: any) {
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
    console.log('⏰ [Scheduler] Inicializando monitor de notificações de contas a vencer (Din Proactive Notifier)...');

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
            hasRunToday = await redis.get(globalDailyRunKey);
          } catch {
            // Ignora se Redis não estiver conectado
          }

          if (!hasRunToday) {
            console.log('📢 [Scheduler] Iniciando disparo matinal automático de lembretes de contas a vencer...');
            const dispatchResult = await this.dispatchDueBillNotifications({ force: false });
            try {
              await redis.set(globalDailyRunKey, '1', 'EX', 86400);
            } catch {
              // Ignora
            }
            console.log(`✅ [Scheduler] Disparo diário concluído: ${dispatchResult.notificationsSent} notificações enviadas de ${dispatchResult.totalUsersChecked} usuários avaliados.`);
          }
        }
      } catch (err: any) {
        console.warn('⚠️ [Scheduler] Erro durante checagem agendada de contas:', err?.message);
      }
    };

    // Agendar primeiro check com pequeno delay e depois periodicamente
    setTimeout(checkAndDispatch, 10000);
    setInterval(checkAndDispatch, INTERVAL_MS);
  }
}

export const billsNotificationService = new BillsNotificationService();
