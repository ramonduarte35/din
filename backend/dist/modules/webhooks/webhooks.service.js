"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const redis_js_1 = require("../../lib/redis.js");
const openai_js_1 = require("../../lib/openai.js");
const evolution_client_js_1 = require("./evolution.client.js");
const phone_js_1 = require("../../utils/phone.js");
const currency_js_1 = require("../../utils/currency.js");
const webhooks_schemas_js_1 = require("./webhooks.schemas.js");
const client_1 = require("@prisma/client");
class WebhooksService {
    async processEvolutionMessage(payload) {
        console.log('📥 [Webhook] Recebido evento do Evolution:', JSON.stringify(payload, null, 2));
        // Extrair dados do payload da Evolution Go / Evolution API
        const event = payload?.event || payload?.type || '';
        const instance = payload?.instance || payload?.instanceName || 'din-finance-01';
        const data = payload?.data || payload;
        // Tratar eventos de QR Code
        if (event === 'qrcode.updated' || event === 'qrcode_updated' || event === 'QRCODE_UPDATED') {
            const qrcodeBase64 = data?.qrcode?.base64 || data?.base64 || data?.code;
            if (qrcodeBase64) {
                console.log(`📱 [Webhook] Recebido e cacheado QR Code para a instância "${instance}"`);
                try {
                    await redis_js_1.redis.set(`qrcode:${instance}`, qrcodeBase64, 'EX', 120);
                }
                catch (e) {
                    // ignore redis error
                }
            }
            return { status: 'qrcode_saved' };
        }
        // Tratar eventos de status de conexão
        if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
            console.log(`📡 [Webhook] Atualização de conexão para "${instance}":`, data?.state || data?.status);
            return { status: 'connection_updated' };
        }
        // Filtrar apenas eventos válidos de mensagens (se o campo event estiver preenchido)
        const validMessageEvents = [
            'messages.upsert',
            'MESSAGES_UPSERT',
            'message',
            'MESSAGE',
            'messages',
            'send.message',
            'SEND_MESSAGE',
            '',
        ];
        if (event && !validMessageEvents.includes(event)) {
            console.log(`⏭️ [Webhook] Evento ignorado (não é mensagem): "${event}"`);
            return { status: 'ignored_event' };
        }
        const key = data?.key || data?.Key || {};
        const info = data?.info || data?.Info || {};
        const messageId = key?.id || key?.ID || info?.id || info?.ID || data?.id || `msg_${Date.now()}_${Math.random()}`;
        // Identificar a conversa principal (sala/chat)
        const chatJid = (key?.remoteJid ||
            key?.RemoteJid ||
            info?.chat ||
            info?.Chat ||
            data?.chatId ||
            data?.chatJid ||
            data?.remoteJid ||
            payload?.remoteJid ||
            info?.sender ||
            data?.sender ||
            data?.from ||
            payload?.sender ||
            '').toString().trim();
        // Identificar se há participante (presente em grupos quando um membro envia mensagem)
        const participant = (key?.participant ||
            key?.Participant ||
            data?.participant ||
            data?.Participant ||
            info?.participant ||
            info?.Participant ||
            data?.message?.extendedTextMessage?.contextInfo?.participant ||
            '').toString().trim();
        // Mensagens enviadas pelo próprio bot
        const fromMe = key?.fromMe === true ||
            key?.FromMe === true ||
            info?.isFromMe === true ||
            info?.IsFromMe === true ||
            data?.fromMe === true ||
            data?.isFromMe === true;
        // Sinalizadores de grupo
        const isGroupFlag = data?.isGroup === true ||
            data?.IsGroup === true ||
            key?.isGroup === true ||
            key?.IsGroup === true ||
            info?.isGroup === true ||
            info?.IsGroup === true ||
            payload?.isGroup === true ||
            payload?.IsGroup === true ||
            data?.chatType === 'group' ||
            payload?.chatType === 'group';
        // Contexto de menção coletiva em grupos (@todos / @everyone / menções de participantes)
        const contextInfo = data?.message?.extendedTextMessage?.contextInfo ||
            data?.message?.ExtendedTextMessage?.ContextInfo ||
            data?.contextInfo ||
            {};
        const isGroupMention = Boolean(contextInfo?.groupMentions) ||
            (Boolean(contextInfo?.participant) && contextInfo.participant !== chatJid);
        // FILTRO MANDATÓRIO: Aceitar SOMENTE mensagens diretas enviadas para o número do bot
        // Bloquear:
        // - Mensagens enviadas pelo próprio bot (fromMe)
        // - Grupos (@g.us ou isGroupFlag)
        // - Menções em grupos (@everyone / @todos)
        // - Transmissões e Status (@broadcast / status@broadcast)
        // - Canais / Newsletters (@newsletter)
        // - Notificações de chamadas (@call)
        const isNonDirect = fromMe ||
            isGroupFlag ||
            isGroupMention ||
            Boolean(participant && participant !== chatJid) ||
            chatJid.includes('@g.us') ||
            chatJid.includes('@broadcast') ||
            chatJid.includes('status@broadcast') ||
            chatJid.includes('@newsletter') ||
            chatJid.includes('@lid') ||
            chatJid.includes('@call');
        if (isNonDirect) {
            console.log('⏭️ [Webhook] Ignorando mensagem não-direta (grupo, menção coletiva, canal, status ou fromMe):', {
                chatJid,
                participant,
                fromMe,
                isGroupFlag,
                isGroupMention,
            });
            return { status: 'ignored_non_direct_message' };
        }
        // Garantir formato válido de mensagem direta individual (@s.whatsapp.net, @c.us ou dígitos)
        const isIndividualJid = chatJid.endsWith('@s.whatsapp.net') ||
            chatJid.endsWith('@c.us') ||
            /^\+?\d{8,15}$/.test(chatJid);
        if (!isIndividualJid) {
            console.log('⏭️ [Webhook] Ignorando mensagem: identificador de conversa não-individual:', chatJid);
            return { status: 'ignored_invalid_jid' };
        }
        const remoteJid = chatJid;
        // Deduplicação com Redis (24 horas)
        try {
            const isDuplicate = await redis_js_1.redis.get(`webhook:msg:${messageId}`);
            if (isDuplicate) {
                console.log(`⏭️ [Webhook] Mensagem duplicada ignorada: ${messageId}`);
                return { status: 'duplicate_ignored' };
            }
            await redis_js_1.redis.set(`webhook:msg:${messageId}`, '1', 'EX', 86400);
        }
        catch (redisErr) {
            console.warn('⚠️ [Redis] Erro ao checar deduplicação:', redisErr);
        }
        // Extrair texto da mensagem
        const messageObj = data?.message || data?.Message || {};
        const messageContent = (typeof messageObj === 'string' ? messageObj : null) ||
            messageObj?.conversation ||
            messageObj?.Conversation ||
            messageObj?.extendedTextMessage?.text ||
            messageObj?.ExtendedTextMessage?.Text ||
            messageObj?.imageMessage?.caption ||
            messageObj?.ImageMessage?.Caption ||
            data?.text ||
            data?.body ||
            data?.content ||
            (typeof data === 'string' ? data : '') ||
            '';
        if (!messageContent || messageContent.trim() === '') {
            console.log('⏭️ [Webhook] Mensagem sem texto legível.');
            return { status: 'empty_message' };
        }
        const trimmedText = messageContent.trim();
        const normalizedSender = (0, phone_js_1.normalizePhoneNumber)(remoteJid);
        console.log(`📱 [Webhook] Remetente: ${normalizedSender} (${remoteJid}) | Texto: "${trimmedText}"`);
        // 1. Identificar Usuário no Banco (com suporte resiliente a variações do 9º dígito)
        let user = await prisma_js_1.prisma.user.findFirst({
            where: {
                phone_number: normalizedSender,
            },
        });
        if (!user && normalizedSender.startsWith('55')) {
            const ddd = normalizedSender.slice(2, 4);
            const rest = normalizedSender.slice(4);
            if (rest.length === 9 && rest.startsWith('9')) {
                const withoutNine = `55${ddd}${rest.slice(1)}`;
                user = await prisma_js_1.prisma.user.findFirst({
                    where: { phone_number: withoutNine },
                });
            }
            else if (rest.length === 8) {
                const withNine = `55${ddd}9${rest}`;
                user = await prisma_js_1.prisma.user.findFirst({
                    where: { phone_number: withNine },
                });
            }
        }
        // Se o usuário não existir
        if (!user) {
            console.log(`⚠️ [Webhook] Usuário não encontrado para o número: ${normalizedSender}`);
            await prisma_js_1.prisma.whatsAppLog.create({
                data: {
                    sender_number: normalizedSender,
                    target_instance: instance,
                    message_body: trimmedText,
                    status: client_1.WhatsAppLogStatus.USER_NOT_FOUND,
                },
            });
            const replyMsg = `👋 *Olá! Seja bem-vindo ao Din.*\n\n` +
                `Não encontramos nenhuma conta vinculada ao seu número de WhatsApp (${(0, phone_js_1.formatPhoneNumberDisplay)(normalizedSender)}).\n\n` +
                `👉 Para começar a registrar seus gastos automaticamente com IA, cadastre-se em nossa plataforma web e adicione este número no seu perfil!\n\n` +
                `🌐 *Acesse o Din Web para criar sua conta.*`;
            await evolution_client_js_1.evolutionClient.sendText(instance, remoteJid, replyMsg);
            return { status: 'user_not_found' };
        }
        // 2. Validar Assinatura (Plano PRO)
        if (user.subscription_tier !== client_1.SubscriptionTier.PRO) {
            console.log(`🔒 [Webhook] Usuário ${user.name} (${user.id}) tentou usar sem plano PRO.`);
            await prisma_js_1.prisma.whatsAppLog.create({
                data: {
                    sender_number: normalizedSender,
                    target_instance: instance,
                    message_body: trimmedText,
                    status: client_1.WhatsAppLogStatus.PRO_REQUIRED,
                },
            });
            const replyMsg = `👋 *Olá, ${user.name}!* ⭐\n\n` +
                `O registro automático e inteligência artificial via WhatsApp é um recurso exclusivo do *Plano PRO* do Din.\n\n` +
                `🚀 Acesse seu painel web para fazer o upgrade e ter acesso ilimitado ao seu assistente financeiro no WhatsApp!`;
            await evolution_client_js_1.evolutionClient.sendText(instance, remoteJid, replyMsg);
            return { status: 'pro_required' };
        }
        // 3. Processamento de Linguagem Natural / IA
        let extraction;
        try {
            extraction = await this.extractWithAI(trimmedText);
        }
        catch (aiError) {
            console.error('❌ [Webhook] Erro no pipeline de IA:', aiError);
            extraction = this.fallbackLocalParser(trimmedText);
        }
        console.log('🤖 [Webhook] Resultado da Extração:', JSON.stringify(extraction, null, 2));
        // Salvar Log
        await prisma_js_1.prisma.whatsAppLog.create({
            data: {
                sender_number: normalizedSender,
                target_instance: instance,
                message_body: trimmedText,
                status: extraction.intent === 'unknown'
                    ? client_1.WhatsAppLogStatus.PARSING_ERROR
                    : client_1.WhatsAppLogStatus.SUCCESS,
                openai_response_payload: extraction,
            },
        });
        // 4. Executar Ação Baseada na Intenção
        // Cenário A: Consulta de Saldo / Resumo
        if (extraction.intent === 'balance_query') {
            return this.handleBalanceQuery(user, instance, remoteJid);
        }
        // Cenário B: Registro de Transação(ões)
        if (extraction.intent === 'transaction' && extraction.transactions && extraction.transactions.length > 0) {
            return this.handleTransactionsRegistration(user, instance, remoteJid, extraction.transactions, trimmedText);
        }
        // Cenário C: Mensagem Não Reconhecida / Ajuda
        return this.handleUnknownMessage(user, instance, remoteJid);
    }
    /**
     * Extração com OpenAI (gpt-4o-mini com Structured Outputs via JSON Schema)
     */
    async extractWithAI(text) {
        if (!(0, openai_js_1.hasOpenAIConfigured)() || !openai_js_1.openai) {
            console.log('ℹ️ [AI] OpenAI API Key não configurada. Usando parser local inteligente.');
            return this.fallbackLocalParser(text);
        }
        const todayISO = new Date().toISOString().split('T')[0];
        const systemPrompt = `Você é o assistente financeiro inteligente do Din. Sua função é extrair com precisão transações financeiras ou intenções de consulta de mensagens em linguagem natural em português brasileiro.\n\n` +
            `Gírias financeiras brasileiras:\n` +
            `- "conto", "pila", "pau", "reais", "mangos" = R$ 1,00 cada\n` +
            `- "barão", "milão", "pau" (em contexto de mil) = R$ 1.000,00\n` +
            `- "cinquentão" = R$ 50,00 | "cem conto" = R$ 100,00 | "vintão" = R$ 20,00 | "dezão" = R$ 10,00\n\n` +
            `Categorias padrão disponíveis:\n` +
            `- Alimentação, Moradia, Transporte, Saúde, Lazer & Cultura, Educação, Vestuário, Assinaturas & Serviços, Outros (Despesas)\n` +
            `- Salário, Investimentos, Freelance & Extras, Vendas & Reembolsos, Outros (Receitas)\n\n` +
            `Data atual de referência: ${todayISO}.\n\n` +
            `Identifique a intenção:\n` +
            `- "balance_query": Quando o usuário pergunta sobre saldo, gastos do mês, extrato, quanto gastou hoje, etc.\n` +
            `- "transaction": Quando o usuário descreve uma ou mais receitas ou despesas.\n` +
            `- "unknown": Mensagens de cumprimento, dúvidas gerais ou sem sentido financeiro.\n\n` +
            `Retorne estritamente um JSON no formato:\n` +
            `{\n` +
            `  "intent": "transaction" | "balance_query" | "unknown",\n` +
            `  "query_period": "current_month" | "today" | "all_time",\n` +
            `  "transactions": [\n` +
            `    {\n` +
            `      "type": "INCOME" | "EXPENSE",\n` +
            `      "amount": number (positivo),\n` +
            `      "description": string (resumo conciso),\n` +
            `      "suggested_category": string,\n` +
            `      "date": string (ISO date)\n` +
            `    }\n` +
            `  ]\n` +
            `}`;
        const completion = await openai_js_1.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });
        const rawResult = completion.choices[0]?.message?.content || '{}';
        const parsedJson = JSON.parse(rawResult);
        return webhooks_schemas_js_1.aiExtractionResponseSchema.parse(parsedJson);
    }
    /**
     * Parser local inteligente com suporte a gírias brasileiras e regex (Fallback)
     */
    fallbackLocalParser(text) {
        const lower = text.toLowerCase();
        const todayISO = new Date().toISOString().split('T')[0];
        // Checar intenção de consulta de saldo
        if (lower.includes('saldo') ||
            lower.includes('extrato') ||
            lower.includes('quanto gastei') ||
            lower.includes('quanto tenho') ||
            lower.includes('resumo') ||
            lower.includes('gastos do mês')) {
            return {
                intent: 'balance_query',
                query_period: 'current_month',
            };
        }
        // Multi-transações ou transação única via regex
        // Padrões como: "lanchei e gastei 20 conto", "recebi 1600 de salario", "gastei 50 na padaria"
        const transactions = [];
        // Mapeamento de multiplicadores de gírias
        let textToParse = lower
            .replace(/(\d+)\s*mil\b/g, (_, n) => `${parseInt(n) * 1000}`)
            .replace(/(\d+)\s*bar(ão|oes|ões)\b/g, (_, n) => `${parseInt(n) * 1000}`)
            .replace(/\bum barão\b/g, '1000')
            .replace(/\bcinquentão\b/g, '50')
            .replace(/\bvintão\b/g, '20')
            .replace(/\bdezão\b/g, '10');
        // Detectar Receita
        const isIncome = lower.includes('recebi') ||
            lower.includes('ganhei') ||
            lower.includes('salario') ||
            lower.includes('salário') ||
            lower.includes('rendeu') ||
            lower.includes('vendi') ||
            lower.includes('pix recebido');
        // Expressão regular para extrair quantias
        const amountMatch = textToParse.match(/(?:r\$|reais|conto|pila|pau|mangos)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:reais|conto|pila|pau|mangos)?/i);
        if (amountMatch) {
            const rawNumber = amountMatch[1].replace(',', '.');
            const amount = parseFloat(rawNumber);
            if (!isNaN(amount) && amount > 0) {
                let type = isIncome ? 'INCOME' : 'EXPENSE';
                let suggested_category = 'Outros (Despesas)';
                let description = 'Transação WhatsApp';
                if (type === 'INCOME') {
                    if (lower.includes('salário') || lower.includes('salario')) {
                        suggested_category = 'Salário';
                        description = 'Salário';
                    }
                    else if (lower.includes('freela') || lower.includes('projeto') || lower.includes('extra')) {
                        suggested_category = 'Freelance & Extras';
                        description = 'Trabalho Freelance';
                    }
                    else if (lower.includes('investimento') || lower.includes('dividendo') || lower.includes('rendeu')) {
                        suggested_category = 'Investimentos';
                        description = 'Rendimento de Investimentos';
                    }
                    else {
                        suggested_category = 'Vendas & Reembolsos';
                        description = 'Receita Diversa';
                    }
                }
                else {
                    if (lower.includes('lanche') ||
                        lower.includes('almoço') ||
                        lower.includes('almoco') ||
                        lower.includes('jantar') ||
                        lower.includes('comida') ||
                        lower.includes('mercado') ||
                        lower.includes('supermercado') ||
                        lower.includes('padaria') ||
                        lower.includes('ifood')) {
                        suggested_category = 'Alimentação';
                        description = lower.includes('lanche')
                            ? 'Lanche'
                            : lower.includes('mercado')
                                ? 'Supermercado'
                                : lower.includes('padaria')
                                    ? 'Padaria'
                                    : 'Alimentação';
                    }
                    else if (lower.includes('gasolina') ||
                        lower.includes('combustivel') ||
                        lower.includes('combustível') ||
                        lower.includes('uber') ||
                        lower.includes('onibus') ||
                        lower.includes('posto')) {
                        suggested_category = 'Transporte';
                        description = lower.includes('gasolina')
                            ? 'Combustível Gasolina'
                            : lower.includes('uber')
                                ? 'Corrida Uber'
                                : 'Transporte';
                    }
                    else if (lower.includes('aluguel') ||
                        lower.includes('condominio') ||
                        lower.includes('luz') ||
                        lower.includes('agua') ||
                        lower.includes('internet')) {
                        suggested_category = 'Moradia';
                        description = 'Contas da Casa';
                    }
                    else if (lower.includes('cinema') ||
                        lower.includes('bar') ||
                        lower.includes('festa') ||
                        lower.includes('jogo') ||
                        lower.includes('praia')) {
                        suggested_category = 'Lazer & Cultura';
                        description = 'Lazer';
                    }
                    else if (lower.includes('farmacia') ||
                        lower.includes('farmácia') ||
                        lower.includes('remedio') ||
                        lower.includes('remédio') ||
                        lower.includes('medico') ||
                        lower.includes('consulta')) {
                        suggested_category = 'Saúde';
                        description = 'Saúde e Farmácia';
                    }
                }
                transactions.push({
                    type,
                    amount,
                    description,
                    suggested_category,
                    date: todayISO,
                });
                return {
                    intent: 'transaction',
                    transactions,
                };
            }
        }
        return {
            intent: 'unknown',
        };
    }
    /**
     * Responde à consulta de saldo
     */
    async handleBalanceQuery(user, instance, remoteJid) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: {
                user_id: user.id,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
        });
        let income = 0;
        let expense = 0;
        for (const t of monthTransactions) {
            const val = Number(t.amount);
            if (t.type === client_1.TransactionType.INCOME)
                income += val;
            else
                expense += val;
        }
        const balance = income - expense;
        const monthNames = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];
        const currentMonthName = monthNames[now.getMonth()];
        const replyMsg = `📊 *Resumo Financeiro - ${currentMonthName}/${now.getFullYear()}*\n` +
            `Olá, *${user.name}*! Aqui está o seu balanço atual:\n\n` +
            `🟢 *Receitas:* ${(0, currency_js_1.formatBRL)(income)}\n` +
            `🔴 *Despesas:* ${(0, currency_js_1.formatBRL)(expense)}\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `💰 *Saldo Líquido:* *${(0, currency_js_1.formatBRL)(balance)}*\n\n` +
            `📝 *Total de Lançamentos:* ${monthTransactions.length}\n` +
            `🌐 _Acesse seu painel web para ver gráficos e relatórios detalhados._`;
        await evolution_client_js_1.evolutionClient.sendText(instance, remoteJid, replyMsg);
        return { status: 'balance_sent', income, expense, balance };
    }
    /**
     * Registra uma ou mais transações e responde com confirmação formatada
     */
    async handleTransactionsRegistration(user, instance, remoteJid, transactions, rawText) {
        // Buscar categorias do usuário ou globais
        const userCategories = await prisma_js_1.prisma.category.findMany({
            where: {
                OR: [{ user_id: null }, { user_id: user.id }],
            },
        });
        const registeredItems = [];
        for (const item of transactions) {
            const type = item.type === 'INCOME' ? client_1.TransactionType.INCOME : client_1.TransactionType.EXPENSE;
            const categoryType = type === client_1.TransactionType.INCOME ? client_1.CategoryType.INCOME : client_1.CategoryType.EXPENSE;
            // Localizar categoria similar
            let category = userCategories.find((c) => c.type === categoryType &&
                c.name.toLowerCase().includes(item.suggested_category.toLowerCase()));
            if (!category) {
                category = userCategories.find((c) => c.type === categoryType);
            }
            // Se ainda não existir nenhuma categoria, cria uma para o usuário
            if (!category) {
                category = await prisma_js_1.prisma.category.create({
                    data: {
                        name: item.suggested_category || (type === client_1.TransactionType.INCOME ? 'Receitas' : 'Despesas'),
                        type: categoryType,
                        icon: type === client_1.TransactionType.INCOME ? 'TrendingUp' : 'Tag',
                        color: type === client_1.TransactionType.INCOME ? '#10b981' : '#f97316',
                        user_id: user.id,
                    },
                });
            }
            const txDate = item.date ? new Date(item.date) : new Date();
            const createdTx = await prisma_js_1.prisma.transaction.create({
                data: {
                    user_id: user.id,
                    category_id: category.id,
                    description: item.description || 'Transação WhatsApp',
                    amount: item.amount,
                    type,
                    date: txDate,
                    origin: client_1.TransactionOrigin.WHATSAPP_TEXT,
                    received_on_number: instance,
                    raw_message: rawText,
                },
            });
            const typeLabel = type === client_1.TransactionType.INCOME ? '🟢 Receita' : '🔴 Despesa';
            registeredItems.push(`📌 *Tipo:* ${typeLabel}\n` +
                `📝 *Descrição:* ${createdTx.description}\n` +
                `💵 *Valor:* ${(0, currency_js_1.formatBRL)(Number(createdTx.amount))}\n` +
                `🏷️ *Categoria:* ${category.name}`);
        }
        const title = transactions.length > 1
            ? `✅ *${transactions.length} transações registradas com sucesso no Din!*`
            : `✅ *Registrado com sucesso no Din!*`;
        const replyMsg = `${title}\n\n` +
            registeredItems.join('\n\n─────────────\n\n') +
            `\n\n💡 _Dica: Digite "qual meu saldo?" a qualquer momento para ver o resumo do mês._`;
        await evolution_client_js_1.evolutionClient.sendText(instance, remoteJid, replyMsg);
        return { status: 'transactions_created', count: transactions.length };
    }
    /**
     * Responde com guia de uso amigável
     */
    async handleUnknownMessage(user, instance, remoteJid) {
        const replyMsg = `🤖 *Assistente Financeiro Din*\n` +
            `Olá, *${user.name}*! Não consegui identificar uma transação na sua mensagem.\n\n` +
            `*Como registrar gastos e ganhos:*\n` +
            `• 🍔 *"Lanchei e gastei 20 conto"*\n` +
            `• 🚗 *"Coloquei 150 de gasolina no posto"*\n` +
            `• 💵 *"Recebi 1800 de salário"*\n` +
            `• 🛒 *"Gastei 50 de mercado e 15 na padaria"*\n\n` +
            `*Como consultar seu saldo:*\n` +
            `• 📊 *"Qual meu saldo do mês?"*\n` +
            `• 📈 *"Quanto gastei hoje?"*`;
        await evolution_client_js_1.evolutionClient.sendText(instance, remoteJid, replyMsg);
        return { status: 'unknown_message_handled' };
    }
}
exports.WebhooksService = WebhooksService;
