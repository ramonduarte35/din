"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const redis_js_1 = require("../../lib/redis.js");
const openai_js_1 = require("../../lib/openai.js");
const evolution_client_js_1 = require("./evolution.client.js");
const meta_client_js_1 = require("../meta-whatsapp/meta.client.js");
const telegram_client_js_1 = require("../telegram/telegram.client.js");
const phone_js_1 = require("../../utils/phone.js");
const currency_js_1 = require("../../utils/currency.js");
const webhooks_schemas_js_1 = require("./webhooks.schemas.js");
const client_1 = require("@prisma/client");
const bills_service_js_1 = require("../bills/bills.service.js");
const billsService = new bills_service_js_1.BillsService();
class WebhooksService {
    /**
     * Envio unificado de mensagem via canais (Evolution Go, Meta Cloud API Oficial ou Telegram Bot)
     */
    async sendWhatsAppReply(instance, recipientNumber, message, options) {
        if (instance.startsWith('telegram:')) {
            return await telegram_client_js_1.telegramClient.sendMessage(recipientNumber, message, {
                reply_markup: options?.reply_markup,
            });
        }
        if (instance.startsWith('meta:')) {
            const phoneNumberId = instance.replace(/^meta:/, '');
            return await meta_client_js_1.metaClient.sendText(recipientNumber, message, { phoneNumberId });
        }
        return await evolution_client_js_1.evolutionClient.sendText(instance, recipientNumber, message);
    }
    /**
     * Validação do handshake de Webhook da Meta (GET /api/v1/webhooks/meta)
     */
    async verifyMetaWebhook(mode, token, challenge) {
        if (mode === 'subscribe') {
            const config = await prisma_js_1.prisma.whatsAppIntegrationConfig.findFirst({
                orderBy: { created_at: 'desc' },
            });
            const expected = config?.meta_verify_token || 'din_meta_verify_token';
            if (token === expected) {
                console.log('✅ [Meta Webhook] Handshake verificado com sucesso para o token:', token);
                return { success: true, challenge };
            }
            console.warn(`⚠️ [Meta Webhook] Token recebido "${token}" não coincide com esperado "${expected}"`);
        }
        return { success: false };
    }
    /**
     * Processamento de mensagens recebidas da Meta Cloud API Oficial (POST /api/v1/webhooks/meta)
     */
    async processMetaMessage(payload) {
        console.log('📥 [Meta Webhook] Recebido evento da Meta Cloud API:', JSON.stringify(payload, null, 2));
        const entry = payload?.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        if (!value || changes?.field !== 'messages') {
            return { status: 'ignored_non_message_field' };
        }
        const metadata = value?.metadata;
        const phoneNumberId = metadata?.phone_number_id || '';
        const messages = value?.messages;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return { status: 'no_messages_in_payload' };
        }
        const message = messages[0];
        const from = message?.from;
        const messageId = message?.id;
        const type = message?.type;
        if (!from || !messageId) {
            return { status: 'invalid_meta_message' };
        }
        // Deduplicação com Redis (24 horas)
        try {
            const isDuplicate = await redis_js_1.redis.get(`webhook:msg:${messageId}`);
            if (isDuplicate) {
                console.log(`⏭️ [Meta Webhook] Mensagem duplicada ignorada: ${messageId}`);
                return { status: 'duplicate_ignored' };
            }
            await redis_js_1.redis.set(`webhook:msg:${messageId}`, '1', 'EX', 86400);
        }
        catch (e) {
            // ignore redis error
        }
        let textContent = '';
        let origin = client_1.TransactionOrigin.WHATSAPP_TEXT;
        if (type === 'text') {
            textContent = message?.text?.body || '';
        }
        else if (type === 'audio' || type === 'voice') {
            const mediaId = message?.audio?.id || message?.voice?.id;
            if (mediaId) {
                console.log(`🎙️ [Meta Webhook] Mensagem de áudio recebida. MediaID: ${mediaId}`);
                origin = client_1.TransactionOrigin.WHATSAPP_AUDIO;
                if ((0, openai_js_1.hasOpenAIConfigured)() && openai_js_1.openai) {
                    try {
                        const media = await meta_client_js_1.metaClient.downloadAudioMedia(mediaId);
                        if (media) {
                            const file = new File([media.buffer], 'audio.ogg', { type: media.mimeType });
                            const transcription = await openai_js_1.openai.audio.transcriptions.create({
                                file,
                                model: 'whisper-1',
                                language: 'pt',
                            });
                            textContent = transcription.text;
                            console.log(`🗣️ [Meta Webhook] Áudio transcrito via Whisper: "${textContent}"`);
                        }
                    }
                    catch (audioErr) {
                        console.error('❌ [Meta Webhook] Falha ao transcrever áudio da Meta:', audioErr);
                    }
                }
            }
        }
        else if (type === 'interactive') {
            textContent =
                message?.interactive?.button_reply?.title ||
                    message?.interactive?.list_reply?.title ||
                    '';
        }
        if (!textContent || textContent.trim() === '') {
            console.log('⏭️ [Meta Webhook] Mensagem sem texto ou sem transcrição.');
            return { status: 'empty_meta_message' };
        }
        const mockPayload = {
            event: 'messages.upsert',
            instance: `meta:${phoneNumberId}`,
            data: {
                key: {
                    remoteJid: `${from}@s.whatsapp.net`,
                    fromMe: false,
                    id: messageId,
                },
                message: {
                    conversation: textContent.trim(),
                },
                origin,
            },
        };
        return await this.processEvolutionMessage(mockPayload);
    }
    /**
     * Processamento de eventos e mensagens recebidas do Telegram Bot API (POST /api/v1/webhooks/telegram)
     */
    async processTelegramMessage(payload) {
        console.log('📥 [Telegram Webhook] Recebido evento do Telegram:', JSON.stringify(payload, null, 2));
        const updateId = payload?.update_id;
        const message = payload?.message || payload?.edited_message;
        if (!message) {
            console.log('⏭️ [Telegram Webhook] Evento sem mensagem (ignorado).');
            return { status: 'ignored_no_message' };
        }
        const messageId = String(message.message_id || updateId || Date.now());
        const chatId = String(message.chat?.id || '');
        const from = message.from || {};
        const fromId = String(from.id || chatId);
        const fromUsername = from.username ? `@${from.username}` : null;
        const fromName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.first_name || 'Usuário';
        if (!chatId || !fromId) {
            return { status: 'invalid_telegram_payload' };
        }
        // Deduplicação com Redis (24 horas)
        try {
            const isDuplicate = await redis_js_1.redis.get(`webhook:tele:${fromId}:${messageId}`);
            if (isDuplicate) {
                console.log(`⏭️ [Telegram Webhook] Mensagem duplicada ignorada: ${fromId}:${messageId}`);
                return { status: 'duplicate_ignored' };
            }
            await redis_js_1.redis.set(`webhook:tele:${fromId}:${messageId}`, '1', 'EX', 86400);
        }
        catch (e) {
            // ignore
        }
        const instance = 'telegram:bot';
        // 1. Tratar Compartilhamento de Contato (Botão "📱 Compartilhar meu contato")
        if (message.contact && message.contact.phone_number) {
            const rawPhone = message.contact.phone_number;
            const normalizedPhone = (0, phone_js_1.normalizePhoneNumber)(rawPhone);
            console.log(`📱 [Telegram Webhook] Contato compartilhado: ${rawPhone} -> ${normalizedPhone} pelo usuário ${fromId}`);
            let user = await prisma_js_1.prisma.user.findFirst({
                where: { phone_number: normalizedPhone },
            });
            if (!user && normalizedPhone.startsWith('55')) {
                const ddd = normalizedPhone.slice(2, 4);
                const rest = normalizedPhone.slice(4);
                if (rest.length === 9 && rest.startsWith('9')) {
                    user = await prisma_js_1.prisma.user.findFirst({ where: { phone_number: `55${ddd}${rest.slice(1)}` } });
                }
                else if (rest.length === 8) {
                    user = await prisma_js_1.prisma.user.findFirst({ where: { phone_number: `55${ddd}9${rest}` } });
                }
            }
            if (user) {
                await prisma_js_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        telegram_id: fromId,
                        telegram_username: fromUsername,
                    },
                });
                const replyMsg = `🎉 *Parabéns, ${user.name}! Conta vinculada com sucesso!* 💎\n\n` +
                    `Agora seu Telegram está conectado diretamente ao seu Din.\n\n` +
                    `Você já pode enviar mensagens de texto ou áudios como:\n` +
                    `• "Gastei 45 no almoço no Nubank"\n` +
                    `• "Recebi 4000 de salário no Itaú"\n` +
                    `• "Agendar conta de luz 180 vencimento sexta"\n` +
                    `• "Qual meu saldo?"\n` +
                    `• "Quais contas tenho a pagar?"`;
                await this.sendWhatsAppReply(instance, chatId, replyMsg, {
                    reply_markup: { remove_keyboard: true },
                });
                return { status: 'telegram_account_linked_by_contact', userId: user.id };
            }
            else {
                const replyMsg = `⚠️ *Conta não encontrada!*\n\n` +
                    `Não encontramos nenhum usuário cadastrado no Din com o telefone *${(0, phone_js_1.formatPhoneNumberDisplay)(normalizedPhone)}*.\n\n` +
                    `👉 Acesse o painel web para criar sua conta ou cadastrar seu número de telefone em seu perfil.`;
                await this.sendWhatsAppReply(instance, chatId, replyMsg, {
                    reply_markup: { remove_keyboard: true },
                });
                return { status: 'telegram_contact_user_not_found' };
            }
        }
        // 2. Extrair Texto / Áudio
        let textContent = message.text || message.caption || '';
        let origin = client_1.TransactionOrigin.TELEGRAM_TEXT;
        if (message.voice || message.audio) {
            const voiceFileId = message.voice?.file_id || message.audio?.file_id;
            if (voiceFileId) {
                console.log(`🎙️ [Telegram Webhook] Mensagem de voz recebida. FileID: ${voiceFileId}`);
                origin = client_1.TransactionOrigin.TELEGRAM_AUDIO;
                if ((0, openai_js_1.hasOpenAIConfigured)() && openai_js_1.openai) {
                    try {
                        const media = await telegram_client_js_1.telegramClient.downloadVoiceAudio(voiceFileId);
                        if (media) {
                            const file = new File([media.buffer], 'voice.ogg', { type: media.mimeType });
                            const transcription = await openai_js_1.openai.audio.transcriptions.create({
                                file,
                                model: 'whisper-1',
                                language: 'pt',
                            });
                            textContent = transcription.text;
                            console.log(`🗣️ [Telegram Webhook] Áudio transcrito via Whisper: "${textContent}"`);
                        }
                    }
                    catch (audioErr) {
                        console.error('❌ [Telegram Webhook] Falha ao transcrever áudio do Telegram:', audioErr);
                    }
                }
            }
        }
        const trimmedText = textContent.trim();
        if (!trimmedText) {
            return { status: 'empty_telegram_message' };
        }
        // 3. Verificar Comandos de Início e Vinculação (/start, /vincular)
        if (trimmedText.startsWith('/start') || trimmedText.startsWith('/vincular')) {
            const parts = trimmedText.split(/\s+/);
            const param = parts[1]?.trim();
            // Se passou parâmetro de vinculação (ex: /start v_ABC123 ou /start ABC123)
            if (param) {
                const cleanParam = param.toUpperCase();
                let targetUserId = null;
                try {
                    targetUserId = await redis_js_1.redis.get(`tele_link:${param}`);
                    if (!targetUserId) {
                        targetUserId = await redis_js_1.redis.get(`tele_link:${cleanParam}`);
                    }
                }
                catch (e) { }
                if (targetUserId) {
                    const user = await prisma_js_1.prisma.user.findUnique({ where: { id: targetUserId } });
                    if (user) {
                        await prisma_js_1.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                telegram_id: fromId,
                                telegram_username: fromUsername,
                            },
                        });
                        try {
                            await redis_js_1.redis.del(`tele_link:${param}`);
                            await redis_js_1.redis.del(`tele_link:${cleanParam}`);
                        }
                        catch (e) { }
                        const replyMsg = `🎉 *Conta vinculada com sucesso, ${user.name}!* 💎\n\n` +
                            `Seu Telegram agora está conectado à sua conta do Din.\n\n` +
                            `Você já pode começar a registrar gastos, receitas e agendamentos enviando textos ou áudios aqui no chat!`;
                        await this.sendWhatsAppReply(instance, chatId, replyMsg, {
                            reply_markup: { remove_keyboard: true },
                        });
                        return { status: 'telegram_linked_via_token', userId: user.id };
                    }
                }
            }
            // Se o usuário já estiver vinculado
            const existingUser = await prisma_js_1.prisma.user.findUnique({
                where: { telegram_id: fromId },
            });
            if (existingUser) {
                const replyMsg = `👋 *Olá, ${existingUser.name}!* 💎\n\n` +
                    `Sou o seu assistente financeiro inteligente do Din no Telegram.\n\n` +
                    `Você pode me enviar a qualquer momento mensagens de texto ou áudios como:\n` +
                    `• "Gastei 50 no almoço no Nubank"\n` +
                    `• "Recebi 3500 de salário no Itaú"\n` +
                    `• "Agendar boleto de luz 150 vencimento 20/09"\n` +
                    `• "Paguei a conta de luz com o saldo do Santander"\n` +
                    `• "Qual meu saldo?"\n` +
                    `• "Quais contas tenho a pagar?"\n\n` +
                    `Seus registros são sincronizados instantaneamente com o painel web! 🚀`;
                await this.sendWhatsAppReply(instance, chatId, replyMsg);
                return { status: 'start_acknowledged_linked_user' };
            }
            // Se NÃO estiver vinculado, enviar mensagem de convite com botão de compartilhamento
            const replyMsg = `👋 *Olá, ${fromName}! Bem-vindo ao Din no Telegram!* 💎\n\n` +
                `Para começar a registrar suas finanças automaticamente com Inteligência Artificial, precisamos conectar este chat à sua conta do Din.\n\n` +
                `Escolha uma das opções abaixo:\n` +
                `1️⃣ Clique no botão abaixo para *Compartilhar seu contato* (caso use o mesmo número de telefone cadastrado no Din)\n` +
                `2️⃣ Ou acesse seu *Perfil no painel web*, gere um código de vinculação e envie aqui no formato:\n` +
                `\`/vincular CÓDIGO\``;
            await this.sendWhatsAppReply(instance, chatId, replyMsg, {
                reply_markup: {
                    keyboard: [[{ text: '📱 Compartilhar meu contato', request_contact: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
            return { status: 'unlinked_user_prompted' };
        }
        // 4. Buscar Usuário pelo Telegram ID
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { telegram_id: fromId },
        });
        if (!user) {
            console.log(`⚠️ [Telegram Webhook] Usuário não vinculado para o Telegram ID: ${fromId}`);
            await prisma_js_1.prisma.whatsAppLog.create({
                data: {
                    sender_number: `tele_${fromId}`,
                    target_instance: instance,
                    message_body: trimmedText,
                    status: client_1.WhatsAppLogStatus.USER_NOT_FOUND,
                },
            });
            const replyOnlyRegistered = await this.getReplyOnlyRegisteredSetting();
            if (replyOnlyRegistered) {
                console.log(`⏭️ [Telegram Webhook] Ignorando usuário não vinculado: regra ativa.`);
                return { status: 'unregistered_ignored' };
            }
            const replyMsg = `👋 *Olá! Não identificamos uma conta do Din vinculada a este Telegram.*\n\n` +
                `Para vincular sua conta, compartilhe seu contato pelo botão abaixo ou acesse seu painel web em *Perfil > Conectar ao Telegram*.`;
            await this.sendWhatsAppReply(instance, chatId, replyMsg, {
                reply_markup: {
                    keyboard: [[{ text: '📱 Compartilhar meu contato', request_contact: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
            return { status: 'user_not_found_notified' };
        }
        // Atualizar username se alterado
        if (fromUsername && user.telegram_username !== fromUsername) {
            prisma_js_1.prisma.user.update({
                where: { id: user.id },
                data: { telegram_username: fromUsername },
            }).catch(() => { });
        }
        // 5. Encaminhar para o pipeline unificado de processamento
        return await this.processUserFinancialMessage(user, instance, chatId, trimmedText, origin, `tele_${fromId}`);
    }
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
            return { status: 'connection_status_logged' };
        }
        // Processamento de Mensagens Recebidas (MESSAGES_UPSERT / Message)
        const info = data?.Info || data?.info || payload?.Info || payload?.info || {};
        const key = data?.key || data?.Key || payload?.key || {};
        const fromMe = key?.fromMe ??
            key?.FromMe ??
            info?.isFromMe ??
            info?.IsFromMe ??
            payload?.fromMe ??
            payload?.FromMe ??
            data?.fromMe ??
            data?.FromMe ??
            false;
        const chatJid = key?.remoteJid ||
            key?.RemoteJid ||
            info?.chat ||
            info?.Chat ||
            info?.sender ||
            info?.Sender ||
            payload?.remoteJid ||
            payload?.RemoteJid ||
            data?.remoteJid ||
            data?.RemoteJid ||
            data?.sender ||
            data?.from ||
            payload?.sender ||
            payload?.from ||
            '';
        const participant = key?.participant ||
            key?.Participant ||
            info?.participant ||
            info?.Participant ||
            data?.participant ||
            payload?.participant ||
            '';
        const messageId = key?.id ||
            key?.Id ||
            info?.id ||
            info?.ID ||
            payload?.id ||
            data?.id ||
            `msg_${Date.now()}`;
        // REQUISITO ESTRITO DE SEGURANÇA E PRIVACIDADE:
        // O webhook deve ler APENAS mensagens diretas individuais enviadas para o número do Din.
        // Ignorar sumariamente mensagens de grupos, canais, status, transmissões (@g.us, @broadcast, @newsletter)
        // ou mensagens com múltiplos participantes/menções coletivas.
        const isGroupFlag = data?.isGroup === true ||
            data?.IsGroup === true ||
            info?.isGroup === true ||
            info?.IsGroup === true ||
            payload?.isGroup === true ||
            payload?.IsGroup === true ||
            data?.messageType === 'group' ||
            payload?.messageType === 'group';
        const isGroupMention = Boolean(participant) ||
            chatJid.includes('@g.us') ||
            chatJid.includes('@broadcast') ||
            chatJid.includes('@newsletter') ||
            chatJid.includes('status@broadcast');
        const isNonDirect = fromMe || isGroupFlag || isGroupMention;
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
        const messageObj = data?.message || data?.Message || payload?.message || payload?.Message || {};
        const messageContent = (typeof messageObj === 'string' ? messageObj : null) ||
            messageObj?.conversation ||
            messageObj?.Conversation ||
            messageObj?.extendedTextMessage?.text ||
            messageObj?.ExtendedTextMessage?.Text ||
            messageObj?.extendedTextMessage?.Text ||
            messageObj?.imageMessage?.caption ||
            messageObj?.ImageMessage?.Caption ||
            data?.text ||
            data?.Text ||
            data?.body ||
            data?.Body ||
            data?.content ||
            data?.Content ||
            payload?.text ||
            payload?.body ||
            payload?.content ||
            (typeof data === 'string' ? data : '') ||
            '';
        const origin = data?.origin || payload?.origin || client_1.TransactionOrigin.WHATSAPP_TEXT;
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
            // Verificar se a opção de responder apenas números cadastrados está ativa no /admin
            const replyOnlyRegistered = await this.getReplyOnlyRegisteredSetting();
            if (replyOnlyRegistered) {
                console.log(`⏭️ [Webhook] Ignorando resposta para ${normalizedSender}: regra 'Responder apenas a números cadastrados' está ATIVADA.`);
                return { status: 'unregistered_ignored' };
            }
            const replyMsg = `👋 *Olá! Seja bem-vindo ao Din.*\n\n` +
                `Não encontramos nenhuma conta vinculada ao seu número de WhatsApp (${(0, phone_js_1.formatPhoneNumberDisplay)(normalizedSender)}).\n\n` +
                `Para começar a gerenciar suas finanças com IA diretamente por aqui:\n` +
                `1️⃣ Acesse a plataforma web: http://localhost:8000\n` +
                `2️⃣ Crie sua conta ou faça login\n` +
                `3️⃣ No seu *Perfil*, adicione e confirme seu número de WhatsApp: *${(0, phone_js_1.formatPhoneNumberDisplay)(normalizedSender)}*\n\n` +
                `Assim que cadastrado, você poderá registrar gastos e receitas enviando mensagens de texto ou áudio! 🚀`;
            await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
            return { status: 'user_not_found_notified' };
        }
        // 2. Encaminhar para o pipeline financeiro unificado
        return await this.processUserFinancialMessage(user, instance, remoteJid, trimmedText, origin, normalizedSender);
    }
    /**
     * Pipeline Financeiro Unificado (WhatsApp Evolution, WhatsApp Meta e Telegram Bot)
     */
    async processUserFinancialMessage(user, instance, remoteJid, trimmedText, origin = client_1.TransactionOrigin.WHATSAPP_TEXT, senderIdentifier) {
        const senderLogKey = senderIdentifier || (instance.startsWith('telegram:') ? `tele_${user.telegram_id || remoteJid}` : remoteJid);
        // 1. Verificar Plano PRO
        if (user.subscription_tier !== client_1.SubscriptionTier.PRO) {
            console.log(`🔒 [Financial Pipeline] Usuário "${user.email}" (${user.id}) não possui plano PRO.`);
            await prisma_js_1.prisma.whatsAppLog.create({
                data: {
                    sender_number: senderLogKey,
                    target_instance: instance,
                    message_body: trimmedText,
                    status: client_1.WhatsAppLogStatus.PRO_REQUIRED,
                },
            });
            const channelName = instance.startsWith('telegram:') ? 'Telegram' : 'WhatsApp';
            const replyMsg = `👋 *Olá, ${user.name}!* ⭐\n\n` +
                `O registro automático e inteligência artificial via ${channelName} é um recurso exclusivo do *Plano PRO* do Din.\n\n` +
                `🚀 Acesse seu painel web para fazer o upgrade e ter acesso ilimitado ao seu assistente financeiro no ${channelName}!`;
            await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
            return { status: 'pro_required' };
        }
        // 2. Buscar contas bancárias do usuário (com provisionamento automático de conta padrão)
        let userAccounts = await prisma_js_1.prisma.account.findMany({
            where: { user_id: user.id },
            orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
        });
        if (userAccounts.length === 0) {
            const defaultAcc = await prisma_js_1.prisma.account.create({
                data: {
                    user_id: user.id,
                    name: 'Conta Principal',
                    type: client_1.AccountType.CHECKING,
                    color: '#10b981',
                    icon: 'Landmark',
                    initial_balance: 0,
                    is_default: true,
                },
            });
            userAccounts = [defaultAcc];
        }
        // 3. Processamento de Linguagem Natural / IA com suporte a múltiplas contas e contas a pagar
        let extraction;
        try {
            extraction = await this.extractWithAI(trimmedText, userAccounts);
        }
        catch (aiError) {
            console.error('❌ [Financial Pipeline] Erro no pipeline de IA:', aiError);
            extraction = this.fallbackLocalParser(trimmedText, userAccounts);
        }
        console.log('🤖 [Financial Pipeline] Resultado da Extração:', JSON.stringify(extraction, null, 2));
        // Salvar Log
        await prisma_js_1.prisma.whatsAppLog.create({
            data: {
                sender_number: senderLogKey,
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
            return this.handleBalanceQuery(user, instance, remoteJid, userAccounts, extraction.query_account);
        }
        // Cenário B: Cadastro de Conta a Pagar (Boleto / Agendamento)
        if (extraction.intent === 'register_bill' && extraction.bill_data) {
            return this.handleRegisterBill(user, instance, remoteJid, extraction.bill_data, trimmedText);
        }
        // Cenário C: Consulta de Contas a Pagar / Boletos
        if (extraction.intent === 'query_bills') {
            return this.handleQueryBills(user, instance, remoteJid);
        }
        // Cenário D: Pagamento / Baixa de Conta a Pagar com Débito em Conta Bancária
        if (extraction.intent === 'pay_bill' && extraction.pay_bill_data) {
            return this.handlePayBill(user, instance, remoteJid, extraction.pay_bill_data, userAccounts);
        }
        // Cenário E: Registro de Transação(ões) com direcionamento para a conta bancária correta
        if (extraction.intent === 'transaction' && extraction.transactions && extraction.transactions.length > 0) {
            return this.handleTransactionsRegistration(user, instance, remoteJid, extraction.transactions, trimmedText, userAccounts, origin);
        }
        // Cenário F: Mensagem Não Reconhecida / Ajuda
        return this.handleUnknownMessage(user, instance, remoteJid, userAccounts);
    }
    /**
     * Extração com OpenAI (gpt-4o-mini com Structured Outputs via JSON Schema)
     */
    async extractWithAI(text, userAccounts) {
        if (!(0, openai_js_1.hasOpenAIConfigured)() || !openai_js_1.openai) {
            console.log('ℹ️ [AI] OpenAI API Key não configurada. Usando parser local inteligente.');
            return this.fallbackLocalParser(text, userAccounts);
        }
        const todayISO = new Date().toISOString().split('T')[0];
        const accountsListFormatted = userAccounts.map((a) => `- "${a.name}" (tipo: ${a.type})`).join('\n');
        const systemPrompt = `Você é o assistente financeiro inteligente do Din. Sua função é extrair com extrema precisão transações financeiras, agendamentos de contas a pagar, liquidações/pagamentos e consultas em português brasileiro.\n\n` +
            `Contas bancárias/carteiras cadastradas pelo usuário:\n` +
            `${accountsListFormatted}\n\n` +
            `🚨 REGRAS MANDATÓRIAS DE CONVERSÃO DE VALORES MONETÁRIOS (PADRÃO BRASILEIRO PT-BR):\n` +
            `- No Brasil, o ponto (.) é usado como separador de milhar e a vírgula (,) como separador decimal.\n` +
            `- NUNCA interprete "6.000" como 6 reais! "6.000" significa SEIS MIL REAIS (amount: 6000).\n` +
            `- Exemplos de conversão de texto para o número float no JSON:\n` +
            `  * "6.000" ou "6.000,00" ou "6000" ou "6 mil" ou "6k" => 6000\n` +
            `  * "1.500" ou "1.500,00" ou "1500" ou "1,5 mil" ou "1.5k" => 1500\n` +
            `  * "12.500,50" => 12500.50\n` +
            `  * "50" ou "50,00" ou "50.00" => 50\n` +
            `  * "6,50" ou "6.50" => 6.50\n` +
            `  * "6,00" => 6\n` +
            `  * "cem conto" => 100\n` +
            `  * "cinco barões" ou "5 milão" => 5000\n` +
            `  * "dezão" => 10 | "vintão" => 20 | "cinquentão" => 50\n\n` +
            `Gírias financeiras brasileiras:\n` +
            `- "conto", "pila", "pau", "reais", "mangos" = R$ 1,00 cada\n` +
            `- "barão", "milão", "mil", "k" = R$ 1.000,00\n` +
            `- "cinquentão" = R$ 50,00 | "cem conto" = R$ 100,00 | "vintão" = R$ 20,00 | "dezão" = R$ 10,00\n\n` +
            `Categorias padrão disponíveis:\n` +
            `- Alimentação, Moradia, Transporte, Saúde, Lazer & Cultura, Educação, Vestuário, Assinaturas & Serviços, Outros (Despesas)\n` +
            `- Salário, Investimentos, Freelance & Extras, Vendas & Reembolsos, Outros (Receitas)\n\n` +
            `Data atual de referência: ${todayISO}.\n\n` +
            `Instruções de Contas Bancárias:\n` +
            `- Se o usuário mencionar ou der a entender uma conta/banco (ex: "no banco do brasil", "no bb", "no nubank", "na conta inter", "no itaú", "na carteira", "em dinheiro"), extraia em "suggested_account" o nome exato ou mais compatível com a conta do usuário.\n` +
            `- Se não for mencionado nenhum banco, deixe "suggested_account" omitido ou nulo.\n\n` +
            `Identifique a intenção com rigor:\n` +
            `- "register_bill": Quando o usuário pede para agendar/lembrar/cadastrar uma conta a pagar futura ou boleto (ex: "agendar conta de luz 150 vencimento dia 10", "lembrar boleto faculdade 800 vence dia 15/09", "cadastrar conta de internet 120 dia 20"). Preencha "bill_data" com description, amount, due_date (data ISO calculada), suggested_category.\n` +
            `- "query_bills": Quando o usuário pergunta sobre contas a pagar, boletos a vencer, contas do mês ou da semana (ex: "quais contas vencem essa semana?", "o que tenho pra pagar?", "quais boletos pendentes?").\n` +
            `- "pay_bill": Quando o usuário informa que pagou ou quer dar baixa em uma conta a pagar/boleto (ex: "paguei a conta de luz no Nubank", "pagar conta de internet 90 pelo Banco do Brasil", "dei baixa no boleto do aluguel"). Preencha "pay_bill_data" com search_term (ex: "luz", "internet"), amount (se citado), suggested_account (banco onde foi pago) e paid_date.\n` +
            `- "balance_query": Quando o usuário pergunta sobre saldo, extrato, quanto gastou ou quanto tem em uma conta específica ou geral.\n` +
            `- "transaction": Quando o usuário descreve receitas ou despesas que já foram realizadas de forma imediata.\n` +
            `- "unknown": Mensagens de cumprimento, dúvidas gerais ou sem sentido financeiro.\n\n` +
            `Retorne estritamente um JSON no formato:\n` +
            `{\n` +
            `  "intent": "transaction" | "balance_query" | "register_bill" | "query_bills" | "pay_bill" | "unknown",\n` +
            `  "query_period": "current_month" | "today" | "all_time" | "upcoming_week",\n` +
            `  "query_account": string (opcional),\n` +
            `  "bill_data": {\n` +
            `    "description": string,\n` +
            `    "amount": number,\n` +
            `    "due_date": string (ISO date YYYY-MM-DD),\n` +
            `    "suggested_category": string\n` +
            `  },\n` +
            `  "pay_bill_data": {\n` +
            `    "search_term": string,\n` +
            `    "amount": number,\n` +
            `    "suggested_account": string,\n` +
            `    "paid_date": string (ISO date)\n` +
            `  },\n` +
            `  "transactions": [\n` +
            `    {\n` +
            `      "type": "INCOME" | "EXPENSE",\n` +
            `      "amount": number,\n` +
            `      "description": string,\n` +
            `      "suggested_category": string,\n` +
            `      "suggested_account": string,\n` +
            `      "date": string\n` +
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
     * Helper para localizar conta correspondente por texto
     */
    findMatchingAccountName(text, userAccounts) {
        const lower = text.toLowerCase();
        // 1. Match exato ou substring com nomes das contas cadastradas
        for (const acc of userAccounts) {
            const accNameLower = acc.name.toLowerCase();
            if (lower.includes(accNameLower)) {
                return acc.name;
            }
        }
        // 2. Apelidos e sinônimos bancários comuns no Brasil
        const bankSynonyms = {
            'Banco do Brasil': ['banco do brasil', 'bb', 'bancodobrasil'],
            Nubank: ['nubank', 'nu', 'roxinho', 'nu bank'],
            Itaú: ['itau', 'itaú', 'iti'],
            Bradesco: ['bradesco', 'next'],
            Inter: ['inter', 'banco inter'],
            Caixa: ['caixa', 'cef', 'caixa economica', 'caixa econômica'],
            Santander: ['santander'],
            'C6 Bank': ['c6', 'c6 bank', 'c6bank'],
            Carteira: ['carteira', 'dinheiro', 'em maos', 'em mãos', 'especie', 'espécie'],
        };
        for (const [canonicalName, aliases] of Object.entries(bankSynonyms)) {
            for (const alias of aliases) {
                if (new RegExp(`\\b${alias}\\b`, 'i').test(lower)) {
                    const found = userAccounts.find((a) => a.name.toLowerCase().includes(canonicalName.toLowerCase()) ||
                        canonicalName.toLowerCase().includes(a.name.toLowerCase()) ||
                        aliases.some((al) => a.name.toLowerCase().includes(al)));
                    if (found)
                        return found.name;
                }
            }
        }
        return undefined;
    }
    /**
     * Parser Local Resiliente de Fallback com suporte a regexes avançadas
     */
    fallbackLocalParser(text, userAccounts) {
        const lower = text.toLowerCase();
        const today = new Date();
        const todayISO = today.toISOString().split('T')[0];
        // Detectar conta bancária citada no texto
        const detectedAccount = this.findMatchingAccountName(text, userAccounts);
        // 1. Detectar intenção de consulta de contas a pagar
        if (lower.includes('contas a pagar') ||
            lower.includes('contas pra pagar') ||
            lower.includes('boletos pendentes') ||
            lower.includes('contas pendentes') ||
            lower.includes('quais contas') ||
            lower.includes('o que tenho pra pagar') ||
            lower.includes('contas vencem') ||
            lower.includes('vence essa semana')) {
            return {
                intent: 'query_bills',
            };
        }
        // 2. Detectar intenção de cadastro de conta a pagar (agendamento / vencimento)
        if (lower.includes('agendar conta') ||
            lower.includes('lembrar conta') ||
            lower.includes('lembrar boleto') ||
            lower.includes('cadastrar conta') ||
            lower.includes('vencimento dia') ||
            lower.includes('vence dia') ||
            lower.includes('vence em')) {
            const amount = (0, currency_js_1.extractAmountFromText)(text);
            const dayMatch = lower.match(/(?:dia|vence|vencimento)\s*(\d{1,2})(?:\/(\d{1,2}))?/);
            if (amount > 0) {
                let dueDate = new Date();
                if (dayMatch) {
                    const day = parseInt(dayMatch[1], 10);
                    const month = dayMatch[2] ? parseInt(dayMatch[2], 10) - 1 : today.getMonth();
                    let year = today.getFullYear();
                    if (month < today.getMonth() || (month === today.getMonth() && day < today.getDate())) {
                        // Se já passou este mês, avançar para o próximo mês ou próximo ano
                        if (!dayMatch[2]) {
                            dueDate = new Date(year, today.getMonth() + 1, day);
                        }
                        else {
                            dueDate = new Date(year + 1, month, day);
                        }
                    }
                    else {
                        dueDate = new Date(year, month, day);
                    }
                }
                else {
                    dueDate.setDate(dueDate.getDate() + 5); // Default: 5 dias
                }
                let desc = 'Conta Agendada';
                let cat = 'Moradia';
                if (lower.includes('luz') || lower.includes('energia')) {
                    desc = 'Conta de Luz';
                    cat = 'Moradia';
                }
                else if (lower.includes('água') || lower.includes('agua')) {
                    desc = 'Conta de Água';
                    cat = 'Moradia';
                }
                else if (lower.includes('internet') || lower.includes('wifi')) {
                    desc = 'Internet';
                    cat = 'Assinaturas & Serviços';
                }
                else if (lower.includes('faculdade') || lower.includes('curso')) {
                    desc = 'Faculdade/Educação';
                    cat = 'Educação';
                }
                else if (lower.includes('aluguel')) {
                    desc = 'Aluguel';
                    cat = 'Moradia';
                }
                return {
                    intent: 'register_bill',
                    bill_data: {
                        description: desc,
                        amount,
                        due_date: dueDate.toISOString().split('T')[0],
                        suggested_category: cat,
                    },
                };
            }
        }
        // 3. Detectar intenção de pagar conta
        if (lower.includes('paguei a conta') ||
            lower.includes('paguei o boleto') ||
            lower.includes('pagar conta') ||
            lower.includes('pagar boleto') ||
            lower.includes('dei baixa') ||
            lower.includes('quitei')) {
            let searchTerm = 'conta';
            if (lower.includes('luz'))
                searchTerm = 'luz';
            else if (lower.includes('água') || lower.includes('agua'))
                searchTerm = 'agua';
            else if (lower.includes('internet'))
                searchTerm = 'internet';
            else if (lower.includes('aluguel'))
                searchTerm = 'aluguel';
            else if (lower.includes('faculdade'))
                searchTerm = 'faculdade';
            const parsedAmount = (0, currency_js_1.extractAmountFromText)(text);
            const amount = parsedAmount > 0 ? parsedAmount : undefined;
            return {
                intent: 'pay_bill',
                pay_bill_data: {
                    search_term: searchTerm,
                    amount,
                    suggested_account: detectedAccount,
                    paid_date: todayISO,
                },
            };
        }
        // 4. Detectar consulta de saldo
        if (lower.includes('saldo') ||
            lower.includes('extrato') ||
            lower.includes('quanto gastei') ||
            lower.includes('quanto tenho') ||
            lower.includes('quanto sobrou') ||
            lower.includes('resumo') ||
            lower.includes('balanço')) {
            return {
                intent: 'balance_query',
                query_period: 'current_month',
                query_account: detectedAccount,
            };
        }
        // 5. Detectar transação convencional
        const transactions = [];
        const amount = (0, currency_js_1.extractAmountFromText)(text);
        if (amount > 0) {
            const isIncome = lower.includes('recebi') ||
                lower.includes('ganhei') ||
                lower.includes('salário') ||
                lower.includes('salario') ||
                lower.includes('rendeu') ||
                lower.includes('vendi') ||
                lower.includes('pix recebido') ||
                lower.includes('caiu o salário') ||
                lower.includes('caiu o salario') ||
                lower.includes('caiu');
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
                suggested_account: detectedAccount,
                date: todayISO,
            });
            return {
                intent: 'transaction',
                transactions,
            };
        }
        return {
            intent: 'unknown',
        };
    }
    /**
     * Trata o cadastro de uma nova conta a pagar via WhatsApp
     */
    async handleRegisterBill(user, instance, remoteJid, billData, rawText) {
        try {
            // 1. Localizar ou criar categoria
            let category = await prisma_js_1.prisma.category.findFirst({
                where: {
                    type: client_1.CategoryType.EXPENSE,
                    name: { contains: billData.suggested_category || 'Moradia', mode: 'insensitive' },
                    OR: [{ user_id: user.id }, { user_id: null }],
                },
            });
            if (!category) {
                category = await prisma_js_1.prisma.category.findFirst({
                    where: { type: client_1.CategoryType.EXPENSE, OR: [{ user_id: user.id }, { user_id: null }] },
                });
            }
            const createdBill = await billsService.createBill(user.id, {
                description: billData.description || 'Conta a Pagar',
                amount: billData.amount,
                due_date: billData.due_date,
                category_id: category?.id,
                barcode: billData.barcode,
                notes: billData.notes,
            });
            const dueDateObj = new Date(createdBill.due_date);
            const formattedDate = dueDateObj.toLocaleDateString('pt-BR');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = dueDateObj.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let daysNotice = '';
            if (diffDays === 0)
                daysNotice = '(Vence hoje!)';
            else if (diffDays === 1)
                daysNotice = '(Vence amanhã)';
            else if (diffDays > 1)
                daysNotice = `(Vence em ${diffDays} dias)`;
            else
                daysNotice = `(Atrasada há ${Math.abs(diffDays)} dias)`;
            const replyMsg = `📅 *Conta a Pagar Agendada com Sucesso!*\n\n` +
                `📝 *Descrição:* ${createdBill.description}\n` +
                `💵 *Valor:* ${(0, currency_js_1.formatBRL)(Number(createdBill.amount))}\n` +
                `🗓️ *Vencimento:* ${formattedDate} ${daysNotice}\n` +
                `🏷️ *Categoria:* ${category?.name || 'Geral'}\n\n` +
                `💡 _Quando efetuar o pagamento, basta avisar por aqui (ex: "paguei ${createdBill.description} no Nubank") para lançar a despesa na sua conta!_`;
            await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
            return { status: 'bill_registered', bill_id: createdBill.id };
        }
        catch (error) {
            console.error('❌ [Webhook] Erro ao registrar conta a pagar:', error);
            await this.sendWhatsAppReply(instance, remoteJid, `❌ Não consegui agendar sua conta a pagar. Por favor, tente novamente (ex: "agendar conta de luz 150 vencimento dia 10").`);
            return { status: 'bill_registration_failed' };
        }
    }
    /**
     * Trata a consulta de contas a pagar / boletos pendentes via WhatsApp
     */
    async handleQueryBills(user, instance, remoteJid) {
        try {
            const summary = await billsService.getBillSummary(user.id);
            const listResult = await billsService.listBills(user.id, { limit: 15 });
            const pendingBills = listResult.bills.filter((b) => b.status === client_1.BillStatus.PENDING || b.computed_status === client_1.BillStatus.OVERDUE);
            if (pendingBills.length === 0) {
                const replyMsg = `🎉 *Parabéns, ${user.name}! Tudo em dia!*\n\n` +
                    `Você não possui nenhuma conta a pagar pendente no momento.\n\n` +
                    `💡 _Para agendar um novo boleto ou conta, envie por exemplo: "lembrar conta de luz 150 dia 15"._`;
                await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
                return { status: 'query_bills_empty' };
            }
            const overdueList = [];
            const upcomingList = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const bill of pendingBills) {
                const dDate = new Date(bill.due_date);
                const formattedDate = dDate.toLocaleDateString('pt-BR');
                const diffDays = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) {
                    overdueList.push(`⚠️ *${bill.description}*\n` +
                        `   💵 ${(0, currency_js_1.formatBRL)(bill.amount)} | 🗓️ Venceu em ${formattedDate} (${Math.abs(diffDays)}d atrás)`);
                }
                else if (diffDays === 0) {
                    upcomingList.push(`🔴 *${bill.description}*\n` +
                        `   💵 ${(0, currency_js_1.formatBRL)(bill.amount)} | 🗓️ *Vence HOJE!*`);
                }
                else {
                    upcomingList.push(`📌 *${bill.description}*\n` +
                        `   💵 ${(0, currency_js_1.formatBRL)(bill.amount)} | 🗓️ Vence em ${formattedDate} (${diffDays} dias)`);
                }
            }
            let msg = `📑 *Suas Contas a Pagar — Din*\n\n`;
            if (overdueList.length > 0) {
                msg += `🚨 *ATENÇÃO: Contas Vencidas (${overdueList.length})*\n`;
                msg += overdueList.join('\n\n') + '\n\n';
            }
            if (upcomingList.length > 0) {
                msg += `📅 *Próximos Vencimentos (${upcomingList.length})*\n`;
                msg += upcomingList.join('\n\n') + '\n\n';
            }
            const totalToPay = summary.total_pending.amount + summary.total_overdue.amount;
            msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `💰 *Total Pendente a Pagar:* ${(0, currency_js_1.formatBRL)(totalToPay)}\n\n`;
            msg += `💡 _Para dar baixa em uma conta, envie por exemplo: "paguei a conta de luz no Nubank"._`;
            await this.sendWhatsAppReply(instance, remoteJid, msg);
            return { status: 'query_bills_sent' };
        }
        catch (error) {
            console.error('❌ [Webhook] Erro ao consultar contas a pagar:', error);
            await this.sendWhatsAppReply(instance, remoteJid, `❌ Ocorreu um erro ao consultar suas contas a pagar. Tente novamente mais tarde.`);
            return { status: 'query_bills_error' };
        }
    }
    /**
     * Trata a liquidação / pagamento de uma conta a pagar debitando da conta bancária
     */
    async handlePayBill(user, instance, remoteJid, payData, userAccounts) {
        try {
            // 1. Buscar contas pendentes do usuário
            const pendingBills = await prisma_js_1.prisma.bill.findMany({
                where: {
                    user_id: user.id,
                    status: client_1.BillStatus.PENDING,
                },
                include: { category: true },
                orderBy: { due_date: 'asc' },
            });
            if (pendingBills.length === 0) {
                await this.sendWhatsAppReply(instance, remoteJid, `ℹ️ *${user.name}*, você não possui nenhuma conta a pagar pendente no sistema para dar baixa.\n\nSe deseja registrar uma nova despesa direta, envie por exemplo: "Gastei 50 no almoço no Nubank".`);
                return { status: 'no_pending_bills_to_pay' };
            }
            // 2. Encontrar a conta mais compatível com o termo de busca ou valor
            let matchedBill = pendingBills[0]; // default: a mais próxima do vencimento
            if (payData.search_term) {
                const termLower = payData.search_term.toLowerCase();
                const found = pendingBills.find((b) => b.description.toLowerCase().includes(termLower) ||
                    termLower.includes(b.description.toLowerCase()));
                if (found)
                    matchedBill = found;
            }
            if (payData.amount && !payData.search_term) {
                const foundByAmount = pendingBills.find((b) => Math.abs(Number(b.amount) - payData.amount) < 0.01);
                if (foundByAmount)
                    matchedBill = foundByAmount;
            }
            // 3. Identificar Conta Bancária de Débito
            const defaultAccount = userAccounts.find((a) => a.is_default) || userAccounts[0];
            let targetAccount = defaultAccount;
            if (payData.suggested_account) {
                const sLower = payData.suggested_account.toLowerCase();
                const found = userAccounts.find((a) => a.name.toLowerCase().includes(sLower) ||
                    sLower.includes(a.name.toLowerCase()));
                if (found) {
                    targetAccount = found;
                }
                else {
                    const matchFromSynonym = this.findMatchingAccountName(payData.suggested_account, userAccounts);
                    if (matchFromSynonym) {
                        const foundSyn = userAccounts.find((a) => a.name === matchFromSynonym);
                        if (foundSyn)
                            targetAccount = foundSyn;
                    }
                }
            }
            // 4. Executar liquidação através do BillsService
            const result = await billsService.payBill(user.id, matchedBill.id, {
                account_id: targetAccount.id,
                paid_date: payData.paid_date || new Date().toISOString(),
                amount: payData.amount,
            });
            // 5. Obter novo saldo da conta debitada
            const accountTxs = await prisma_js_1.prisma.transaction.findMany({
                where: { user_id: user.id, account_id: targetAccount.id },
                select: { type: true, amount: true },
            });
            let accIncome = 0;
            let accExpense = 0;
            for (const t of accountTxs) {
                const amt = Number(t.amount);
                if (t.type === client_1.TransactionType.INCOME)
                    accIncome += amt;
                else
                    accExpense += amt;
            }
            const updatedAccBalance = Number(targetAccount.initial_balance) + accIncome - accExpense;
            const replyMsg = `✅ *Conta Paga com Sucesso!*\n\n` +
                `📝 *Conta Liquidada:* ${result.bill.description}\n` +
                `💵 *Valor Pago:* ${(0, currency_js_1.formatBRL)(Number(result.bill.amount))}\n` +
                `🏦 *Debitado de:* ${targetAccount.name}\n` +
                `💰 *Novo Saldo no ${targetAccount.name}:* ${(0, currency_js_1.formatBRL)(updatedAccBalance)}\n` +
                `🗓️ *Data do Pagamento:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                `✨ _Despesa lançada automaticamente no seu extrato e fluxo de caixa!_`;
            await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
            return { status: 'bill_paid', bill_id: result.bill.id, transaction_id: result.transaction.id };
        }
        catch (error) {
            console.error('❌ [Webhook] Erro ao pagar conta:', error);
            await this.sendWhatsAppReply(instance, remoteJid, `❌ Não foi possível dar baixa na conta: ${error.message || 'Erro interno'}.`);
            return { status: 'pay_bill_error' };
        }
    }
    /**
     * Consulta de saldo por WhatsApp (com suporte a múltiplas contas)
     */
    async handleBalanceQuery(user, instance, remoteJid, userAccounts, queryAccountName) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Se o usuário pediu o saldo de um banco específico
        if (queryAccountName) {
            const matchName = this.findMatchingAccountName(queryAccountName, userAccounts) || queryAccountName;
            const targetAccount = userAccounts.find((a) => a.name.toLowerCase().includes(matchName.toLowerCase()) ||
                matchName.toLowerCase().includes(a.name.toLowerCase()));
            if (targetAccount) {
                // Transações de todo o histórico desta conta para saldo real
                const allAccTransactions = await prisma_js_1.prisma.transaction.findMany({
                    where: { user_id: user.id, account_id: targetAccount.id },
                    select: { type: true, amount: true },
                });
                let totalIncome = 0;
                let totalExpense = 0;
                for (const t of allAccTransactions) {
                    const amt = Number(t.amount);
                    if (t.type === client_1.TransactionType.INCOME)
                        totalIncome += amt;
                    else
                        totalExpense += amt;
                }
                const currentBalance = Number(targetAccount.initial_balance) + totalIncome - totalExpense;
                // Transações do mês atual nesta conta
                const monthAccTransactions = await prisma_js_1.prisma.transaction.findMany({
                    where: {
                        user_id: user.id,
                        account_id: targetAccount.id,
                        date: { gte: startOfMonth, lte: endOfMonth },
                    },
                    select: { type: true, amount: true },
                });
                let monthIncome = 0;
                let monthExpense = 0;
                for (const t of monthAccTransactions) {
                    const amt = Number(t.amount);
                    if (t.type === client_1.TransactionType.INCOME)
                        monthIncome += amt;
                    else
                        monthExpense += amt;
                }
                const replyMsg = `🏦 *Extrato — ${targetAccount.name}*\n` +
                    `Olá, *${user.name}*! Aqui está o saldo da sua conta:\n\n` +
                    `💰 *Saldo Atual:* ${(0, currency_js_1.formatBRL)(currentBalance)}\n\n` +
                    `📊 *Movimentação deste Mês:*\n` +
                    `  🟢 Receitas no ${targetAccount.name}: ${(0, currency_js_1.formatBRL)(monthIncome)}\n` +
                    `  🔴 Despesas no ${targetAccount.name}: ${(0, currency_js_1.formatBRL)(monthExpense)}\n` +
                    `  ⚖️ Resultado: ${(0, currency_js_1.formatBRL)(monthIncome - monthExpense)}\n\n` +
                    `💡 _Para registrar um gasto nesta conta, basta enviar: "Gastei 50 no ${targetAccount.name}"._`;
                await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
                return { status: 'account_balance_sent' };
            }
        }
        // Consulta Geral de Todas as Contas
        const allUserTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: { user_id: user.id },
            select: { type: true, amount: true, account_id: true },
        });
        let globalInitial = 0;
        let globalIncome = 0;
        let globalExpense = 0;
        const accountBalances = {};
        for (const acc of userAccounts) {
            accountBalances[acc.id] = Number(acc.initial_balance);
            globalInitial += Number(acc.initial_balance);
        }
        for (const t of allUserTransactions) {
            const amt = Number(t.amount);
            if (t.type === client_1.TransactionType.INCOME) {
                globalIncome += amt;
                if (t.account_id && accountBalances[t.account_id] !== undefined) {
                    accountBalances[t.account_id] += amt;
                }
            }
            else {
                globalExpense += amt;
                if (t.account_id && accountBalances[t.account_id] !== undefined) {
                    accountBalances[t.account_id] -= amt;
                }
            }
        }
        const totalCurrentBalance = globalInitial + globalIncome - globalExpense;
        // Movimentação do Mês Atual
        const monthTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: {
                user_id: user.id,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            select: { type: true, amount: true },
        });
        let currentMonthIncome = 0;
        let currentMonthExpense = 0;
        for (const t of monthTransactions) {
            const amt = Number(t.amount);
            if (t.type === client_1.TransactionType.INCOME)
                currentMonthIncome += amt;
            else
                currentMonthExpense += amt;
        }
        const monthBalance = currentMonthIncome - currentMonthExpense;
        // Formatar lista de saldos por banco
        const accountsBreakdown = userAccounts
            .map((acc) => `  • *${acc.name}:* ${(0, currency_js_1.formatBRL)(accountBalances[acc.id] || 0)}`)
            .join('\n');
        const replyMsg = `📊 *Resumo Financeiro — Din*\n` +
            `Olá, *${user.name}*! Aqui está o seu balanço geral:\n\n` +
            `💰 *Saldo Total (Todas as Contas):* ${(0, currency_js_1.formatBRL)(totalCurrentBalance)}\n\n` +
            `🏦 *Saldos por Conta Bancária:*\n` +
            `${accountsBreakdown}\n\n` +
            `📅 *Mês Atual (${now.toLocaleString('pt-BR', { month: 'long' })}):*\n` +
            `  🟢 Receitas: ${(0, currency_js_1.formatBRL)(currentMonthIncome)}\n` +
            `  🔴 Despesas: ${(0, currency_js_1.formatBRL)(currentMonthExpense)}\n` +
            `  ⚖️ Resultado do Mês: ${(0, currency_js_1.formatBRL)(monthBalance)}\n\n` +
            `💡 _Dica: Você pode consultar o saldo de um banco específico enviando "saldo do Nubank" ou consultar suas contas enviando "quais contas tenho a pagar?"._`;
        await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
        return { status: 'balance_query_sent' };
    }
    /**
     * Registro de transações com direcionamento para a conta bancária correta
     */
    async handleTransactionsRegistration(user, instance, remoteJid, transactions, rawText, userAccounts, origin = client_1.TransactionOrigin.WHATSAPP_TEXT) {
        const userCategories = await prisma_js_1.prisma.category.findMany({
            where: {
                OR: [{ user_id: user.id }, { user_id: null }],
            },
        });
        const defaultAccount = userAccounts.find((a) => a.is_default) || userAccounts[0];
        const registeredItems = [];
        for (const item of transactions) {
            const type = item.type === 'INCOME' ? client_1.TransactionType.INCOME : client_1.TransactionType.EXPENSE;
            const categoryType = type === client_1.TransactionType.INCOME ? client_1.CategoryType.INCOME : client_1.CategoryType.EXPENSE;
            // 1. Localizar ou criar Categoria
            let category = userCategories.find((c) => c.type === categoryType &&
                c.name.toLowerCase().includes(item.suggested_category.toLowerCase()));
            if (!category) {
                category = userCategories.find((c) => c.type === categoryType);
            }
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
            // 2. Localizar Conta Bancária de Destino
            let targetAccount = defaultAccount;
            if (item.suggested_account) {
                const sLower = item.suggested_account.toLowerCase();
                const found = userAccounts.find((a) => a.name.toLowerCase().includes(sLower) ||
                    sLower.includes(a.name.toLowerCase()));
                if (found) {
                    targetAccount = found;
                }
                else {
                    const matchFromSynonym = this.findMatchingAccountName(item.suggested_account, userAccounts);
                    if (matchFromSynonym) {
                        const foundSyn = userAccounts.find((a) => a.name === matchFromSynonym);
                        if (foundSyn)
                            targetAccount = foundSyn;
                    }
                }
            }
            const txDate = item.date ? new Date(item.date) : new Date();
            const defaultDesc = instance.startsWith('telegram:') ? 'Transação Telegram' : 'Transação WhatsApp';
            const createdTx = await prisma_js_1.prisma.transaction.create({
                data: {
                    user_id: user.id,
                    account_id: targetAccount.id,
                    category_id: category.id,
                    description: item.description || defaultDesc,
                    amount: item.amount,
                    type,
                    date: txDate,
                    origin,
                    received_on_number: instance,
                    raw_message: rawText,
                },
            });
            // Calcular saldo atualizado desta conta após o registro
            const accountTxs = await prisma_js_1.prisma.transaction.findMany({
                where: { user_id: user.id, account_id: targetAccount.id },
                select: { type: true, amount: true },
            });
            let accIncome = 0;
            let accExpense = 0;
            for (const t of accountTxs) {
                const amt = Number(t.amount);
                if (t.type === client_1.TransactionType.INCOME)
                    accIncome += amt;
                else
                    accExpense += amt;
            }
            const updatedAccBalance = Number(targetAccount.initial_balance) + accIncome - accExpense;
            const typeLabel = type === client_1.TransactionType.INCOME ? '🟢 Receita' : '🔴 Despesa';
            registeredItems.push(`📌 *Tipo:* ${typeLabel}\n` +
                `📝 *Descrição:* ${createdTx.description}\n` +
                `💵 *Valor:* ${(0, currency_js_1.formatBRL)(Number(createdTx.amount))}\n` +
                `🏷️ *Categoria:* ${category.name}\n` +
                `🏦 *Conta:* ${targetAccount.name}\n` +
                `💰 *Saldo da Conta:* ${(0, currency_js_1.formatBRL)(updatedAccBalance)}`);
        }
        const title = transactions.length > 1
            ? `✅ *${transactions.length} transações registradas com sucesso no Din!*`
            : `✅ *Registrado com sucesso no Din!*`;
        const replyMsg = `${title}\n\n` +
            registeredItems.join('\n\n─────────────\n\n') +
            `\n\n💡 _Dica: Digite "qual meu saldo?" para ver o balanço de todas as suas contas._`;
        await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
        return { status: 'transactions_created', count: transactions.length };
    }
    /**
     * Responde com guia de uso amigável
     */
    async handleUnknownMessage(user, instance, remoteJid, userAccounts) {
        const replyMsg = `🤖 *Assistente Financeiro Din*\n` +
            `Olá, *${user.name}*! Como posso te ajudar hoje?\n\n` +
            `*Gastos e Ganhos por Conta Bancária:*\n` +
            `• 💵 *"Recebi 4 mil de salário no Banco do Brasil"*\n` +
            `• 🍔 *"Gastei 25 de lanche no Nubank"*\n` +
            `• 🚗 *"Coloquei 150 de gasolina no posto"*\n\n` +
            `*Contas a Pagar e Boletos:*\n` +
            `• 📅 *"Agendar conta de luz 150 vencimento dia 10"*\n` +
            `• 📑 *"Quais contas tenho a pagar?"*\n` +
            `• ✅ *"Paguei a conta de luz no Nubank"*\n\n` +
            `*Consultas de Saldo:*\n` +
            `• 📊 *"Qual meu saldo geral?"*\n` +
            `• 🏦 *"Qual o saldo do ${userAccounts[0]?.name || 'Banco'}?"*`;
        await this.sendWhatsAppReply(instance, remoteJid, replyMsg);
        return { status: 'unknown_message_handled' };
    }
    /**
     * Obtém a configuração do sistema sobre responder apenas a números cadastrados
     */
    async getReplyOnlyRegisteredSetting() {
        try {
            const cached = await redis_js_1.redis.get('system_setting:reply_only_registered');
            if (cached !== null) {
                return cached === 'true' || cached === '1';
            }
        }
        catch (e) {
            // ignore redis error
        }
        try {
            const setting = await prisma_js_1.prisma.systemSetting.findUnique({
                where: { key: 'reply_only_registered' },
            });
            const isEnabled = setting ? setting.value === 'true' : false;
            try {
                await redis_js_1.redis.set('system_setting:reply_only_registered', isEnabled ? 'true' : 'false', 'EX', 3600);
            }
            catch (e) {
                // ignore redis error
            }
            return isEnabled;
        }
        catch (e) {
            return false;
        }
    }
}
exports.WebhooksService = WebhooksService;
