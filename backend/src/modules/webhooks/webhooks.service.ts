import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { openai, hasOpenAIConfigured } from '../../lib/openai.js';
import { evolutionClient } from './evolution.client.js';
import { normalizePhoneNumber, formatPhoneNumberDisplay } from '../../utils/phone.js';
import { formatBRL } from '../../utils/currency.js';
import {
  AIExtractionResponse,
  aiExtractionResponseSchema,
} from './webhooks.schemas.js';
import {
  AccountType,
  CategoryType,
  SubscriptionTier,
  TransactionOrigin,
  TransactionType,
  WhatsAppLogStatus,
} from '@prisma/client';

export class WebhooksService {
  async processEvolutionMessage(payload: any) {
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
          await redis.set(`qrcode:${instance}`, qrcodeBase64, 'EX', 120);
        } catch (e) {
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
    const chatJid = (
      key?.remoteJid ||
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
      ''
    ).toString().trim();

    // Identificar se há participante (presente em grupos quando um membro envia mensagem)
    const participant = (
      key?.participant ||
      key?.Participant ||
      data?.participant ||
      data?.Participant ||
      info?.participant ||
      info?.Participant ||
      data?.message?.extendedTextMessage?.contextInfo?.participant ||
      ''
    ).toString().trim();

    // Mensagens enviadas pelo próprio bot
    const fromMe =
      key?.fromMe === true ||
      key?.FromMe === true ||
      info?.isFromMe === true ||
      info?.IsFromMe === true ||
      data?.fromMe === true ||
      data?.isFromMe === true;

    // Sinalizadores de grupo
    const isGroupFlag =
      data?.isGroup === true ||
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
    const contextInfo =
      data?.message?.extendedTextMessage?.contextInfo ||
      data?.message?.ExtendedTextMessage?.ContextInfo ||
      data?.contextInfo ||
      {};
    const isGroupMention =
      Boolean(contextInfo?.groupMentions) ||
      (Boolean(contextInfo?.participant) && contextInfo.participant !== chatJid);

    // FILTRO MANDATÓRIO: Aceitar SOMENTE mensagens diretas enviadas para o número do bot
    // Bloquear:
    // - Mensagens enviadas pelo próprio bot (fromMe)
    // - Grupos (@g.us ou isGroupFlag)
    // - Menções em grupos (@everyone / @todos)
    // - Transmissões e Status (@broadcast / status@broadcast)
    // - Canais / Newsletters (@newsletter)
    // - Notificações de chamadas (@call)
    const isNonDirect =
      fromMe ||
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
    const isIndividualJid =
      chatJid.endsWith('@s.whatsapp.net') ||
      chatJid.endsWith('@c.us') ||
      /^\+?\d{8,15}$/.test(chatJid);

    if (!isIndividualJid) {
      console.log('⏭️ [Webhook] Ignorando mensagem: identificador de conversa não-individual:', chatJid);
      return { status: 'ignored_invalid_jid' };
    }

    const remoteJid = chatJid;

    // Deduplicação com Redis (24 horas)
    try {
      const isDuplicate = await redis.get(`webhook:msg:${messageId}`);
      if (isDuplicate) {
        console.log(`⏭️ [Webhook] Mensagem duplicada ignorada: ${messageId}`);
        return { status: 'duplicate_ignored' };
      }
      await redis.set(`webhook:msg:${messageId}`, '1', 'EX', 86400);
    } catch (redisErr) {
      console.warn('⚠️ [Redis] Erro ao checar deduplicação:', redisErr);
    }

    // Extrair texto da mensagem
    const messageObj = data?.message || data?.Message || {};
    const messageContent =
      (typeof messageObj === 'string' ? messageObj : null) ||
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
    const normalizedSender = normalizePhoneNumber(remoteJid);

    console.log(`📱 [Webhook] Remetente: ${normalizedSender} (${remoteJid}) | Texto: "${trimmedText}"`);

    // 1. Identificar Usuário no Banco (com suporte resiliente a variações do 9º dígito)
    let user = await prisma.user.findFirst({
      where: {
        phone_number: normalizedSender,
      },
    });

    if (!user && normalizedSender.startsWith('55')) {
      const ddd = normalizedSender.slice(2, 4);
      const rest = normalizedSender.slice(4);
      if (rest.length === 9 && rest.startsWith('9')) {
        const withoutNine = `55${ddd}${rest.slice(1)}`;
        user = await prisma.user.findFirst({
          where: { phone_number: withoutNine },
        });
      } else if (rest.length === 8) {
        const withNine = `55${ddd}9${rest}`;
        user = await prisma.user.findFirst({
          where: { phone_number: withNine },
        });
      }
    }

    // Se o usuário não existir
    if (!user) {
      console.log(`⚠️ [Webhook] Usuário não encontrado para o número: ${normalizedSender}`);
      await prisma.whatsAppLog.create({
        data: {
          sender_number: normalizedSender,
          target_instance: instance,
          message_body: trimmedText,
          status: WhatsAppLogStatus.USER_NOT_FOUND,
        },
      });

      const replyMsg =
        `👋 *Olá! Seja bem-vindo ao Din.*\n\n` +
        `Não encontramos nenhuma conta vinculada ao seu número de WhatsApp (${formatPhoneNumberDisplay(normalizedSender)}).\n\n` +
        `👉 Para começar a registrar seus gastos automaticamente com IA, cadastre-se em nossa plataforma web e adicione este número no seu perfil!\n\n` +
        `🌐 *Acesse o Din Web para criar sua conta.*`;

      await evolutionClient.sendText(instance, remoteJid, replyMsg);
      return { status: 'user_not_found' };
    }

    // 2. Validar Assinatura (Plano PRO)
    if (user.subscription_tier !== SubscriptionTier.PRO) {
      console.log(`🔒 [Webhook] Usuário ${user.name} (${user.id}) tentou usar sem plano PRO.`);
      await prisma.whatsAppLog.create({
        data: {
          sender_number: normalizedSender,
          target_instance: instance,
          message_body: trimmedText,
          status: WhatsAppLogStatus.PRO_REQUIRED,
        },
      });

      const replyMsg =
        `👋 *Olá, ${user.name}!* ⭐\n\n` +
        `O registro automático e inteligência artificial via WhatsApp é um recurso exclusivo do *Plano PRO* do Din.\n\n` +
        `🚀 Acesse seu painel web para fazer o upgrade e ter acesso ilimitado ao seu assistente financeiro no WhatsApp!`;

      await evolutionClient.sendText(instance, remoteJid, replyMsg);
      return { status: 'pro_required' };
    }

    // 3. Buscar contas bancárias do usuário (com provisionamento automático de conta padrão)
    let userAccounts = await prisma.account.findMany({
      where: { user_id: user.id },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });

    if (userAccounts.length === 0) {
      const defaultAcc = await prisma.account.create({
        data: {
          user_id: user.id,
          name: 'Conta Principal',
          type: AccountType.CHECKING,
          color: '#10b981',
          icon: 'Landmark',
          initial_balance: 0,
          is_default: true,
        },
      });
      userAccounts = [defaultAcc];
    }

    // 4. Processamento de Linguagem Natural / IA com suporte a múltiplas contas
    let extraction: AIExtractionResponse;

    try {
      extraction = await this.extractWithAI(trimmedText, userAccounts);
    } catch (aiError) {
      console.error('❌ [Webhook] Erro no pipeline de IA:', aiError);
      extraction = this.fallbackLocalParser(trimmedText, userAccounts);
    }

    console.log('🤖 [Webhook] Resultado da Extração:', JSON.stringify(extraction, null, 2));

    // Salvar Log
    await prisma.whatsAppLog.create({
      data: {
        sender_number: normalizedSender,
        target_instance: instance,
        message_body: trimmedText,
        status:
          extraction.intent === 'unknown'
            ? WhatsAppLogStatus.PARSING_ERROR
            : WhatsAppLogStatus.SUCCESS,
        openai_response_payload: extraction as any,
      },
    });

    // 5. Executar Ação Baseada na Intenção

    // Cenário A: Consulta de Saldo / Resumo
    if (extraction.intent === 'balance_query') {
      return this.handleBalanceQuery(user, instance, remoteJid, userAccounts, extraction.query_account);
    }

    // Cenário B: Registro de Transação(ões) com direcionamento para a conta bancária correta
    if (extraction.intent === 'transaction' && extraction.transactions && extraction.transactions.length > 0) {
      return this.handleTransactionsRegistration(
        user,
        instance,
        remoteJid,
        extraction.transactions,
        trimmedText,
        userAccounts
      );
    }

    // Cenário C: Mensagem Não Reconhecida / Ajuda
    return this.handleUnknownMessage(user, instance, remoteJid, userAccounts);
  }

  /**
   * Extração com OpenAI (gpt-4o-mini com Structured Outputs via JSON Schema)
   */
  private async extractWithAI(text: string, userAccounts: any[]): Promise<AIExtractionResponse> {
    if (!hasOpenAIConfigured() || !openai) {
      console.log('ℹ️ [AI] OpenAI API Key não configurada. Usando parser local inteligente.');
      return this.fallbackLocalParser(text, userAccounts);
    }

    const todayISO = new Date().toISOString().split('T')[0];
    const accountsListFormatted = userAccounts.map((a) => `- "${a.name}" (tipo: ${a.type})`).join('\n');

    const systemPrompt =
      `Você é o assistente financeiro inteligente do Din. Sua função é extrair com extrema precisão transações financeiras, contas de destino ou intenções de consulta de mensagens em linguagem natural em português brasileiro.\n\n` +
      `Contas bancárias/carteiras cadastradas pelo usuário:\n` +
      `${accountsListFormatted}\n\n` +
      `Gírias financeiras brasileiras:\n` +
      `- "conto", "pila", "pau", "reais", "mangos" = R$ 1,00 cada\n` +
      `- "barão", "milão", "pau" (em contexto de mil) = R$ 1.000,00\n` +
      `- "cinquentão" = R$ 50,00 | "cem conto" = R$ 100,00 | "vintão" = R$ 20,00 | "dezão" = R$ 10,00\n\n` +
      `Categorias padrão disponíveis:\n` +
      `- Alimentação, Moradia, Transporte, Saúde, Lazer & Cultura, Educação, Vestuário, Assinaturas & Serviços, Outros (Despesas)\n` +
      `- Salário, Investimentos, Freelance & Extras, Vendas & Reembolsos, Outros (Receitas)\n\n` +
      `Data atual de referência: ${todayISO}.\n\n` +
      `Instruções de Contas Bancárias:\n` +
      `- Se o usuário mencionar ou der a entender uma conta/banco (ex: "no banco do brasil", "no bb", "no nubank", "na conta inter", "no itaú", "na carteira", "em dinheiro"), extraia em "suggested_account" o nome exato ou mais compatível com a conta do usuário.\n` +
      `- Se não for mencionado nenhum banco, deixe "suggested_account" omitido ou nulo.\n\n` +
      `Identifique a intenção:\n` +
      `- "balance_query": Quando o usuário pergunta sobre saldo, extrato, quanto gastou, quanto tem em uma conta específica (ex: "saldo do nubank", "quanto tenho no banco do brasil") ou geral.\n` +
      `- "transaction": Quando o usuário descreve uma ou mais receitas ou despesas.\n` +
      `- "unknown": Mensagens de cumprimento, dúvidas gerais ou sem sentido financeiro.\n\n` +
      `Retorne estritamente um JSON no formato:\n` +
      `{\n` +
      `  "intent": "transaction" | "balance_query" | "unknown",\n` +
      `  "query_period": "current_month" | "today" | "all_time",\n` +
      `  "query_account": string (opcional, nome da conta se o usuário perguntou de uma específica),\n` +
      `  "transactions": [\n` +
      `    {\n` +
      `      "type": "INCOME" | "EXPENSE",\n` +
      `      "amount": number (positivo),\n` +
      `      "description": string (resumo conciso),\n` +
      `      "suggested_category": string,\n` +
      `      "suggested_account": string (opcional, nome da conta identificada),\n` +
      `      "date": string (ISO date)\n` +
      `    }\n` +
      `  ]\n` +
      `}`;

    const completion = await openai.chat.completions.create({
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
    return aiExtractionResponseSchema.parse(parsedJson);
  }

  /**
   * Helper para localizar conta correspondente por texto
   */
  private findMatchingAccountName(text: string, userAccounts: any[]): string | undefined {
    const lower = text.toLowerCase();

    // 1. Match exato ou substring com nomes das contas cadastradas
    for (const acc of userAccounts) {
      const accNameLower = acc.name.toLowerCase();
      if (lower.includes(accNameLower)) {
        return acc.name;
      }
    }

    // 2. Apelidos e sinônimos bancários comuns no Brasil
    const bankSynonyms: Record<string, string[]> = {
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
          // Se o usuário tem uma conta que bate com o banco
          const found = userAccounts.find(
            (a) =>
              a.name.toLowerCase().includes(canonicalName.toLowerCase()) ||
              canonicalName.toLowerCase().includes(a.name.toLowerCase()) ||
              aliases.some((al) => a.name.toLowerCase().includes(al))
          );
          if (found) return found.name;
        }
      }
    }

    return undefined;
  }

  /**
   * Parser local inteligente com suporte a gírias brasileiras, bancos e regex (Fallback)
   */
  private fallbackLocalParser(text: string, userAccounts: any[]): AIExtractionResponse {
    const lower = text.toLowerCase();
    const todayISO = new Date().toISOString().split('T')[0];

    const detectedAccount = this.findMatchingAccountName(text, userAccounts);

    // Checar intenção de consulta de saldo
    if (
      lower.includes('saldo') ||
      lower.includes('extrato') ||
      lower.includes('quanto gastei') ||
      lower.includes('quanto tenho') ||
      lower.includes('resumo') ||
      lower.includes('gastos do mês')
    ) {
      return {
        intent: 'balance_query',
        query_period: 'current_month',
        query_account: detectedAccount,
      };
    }

    // Multi-transações ou transação única via regex
    const transactions: any[] = [];

    // Mapeamento de multiplicadores de gírias
    let textToParse = lower
      .replace(/(\d+)\s*mil\b/g, (_, n) => `${parseInt(n) * 1000}`)
      .replace(/(\d+)\s*bar(ão|oes|ões)\b/g, (_, n) => `${parseInt(n) * 1000}`)
      .replace(/\bum barão\b/g, '1000')
      .replace(/\bcinquentão\b/g, '50')
      .replace(/\bvintão\b/g, '20')
      .replace(/\bdezão\b/g, '10');

    // Detectar Receita
    const isIncome =
      lower.includes('recebi') ||
      lower.includes('ganhei') ||
      lower.includes('salario') ||
      lower.includes('salário') ||
      lower.includes('rendeu') ||
      lower.includes('vendi') ||
      lower.includes('pix recebido') ||
      lower.includes('caiu o salário') ||
      lower.includes('caiu o salario') ||
      lower.includes('caiu');

    // Expressão regular para extrair quantias
    const amountMatch = textToParse.match(/(?:r\$|reais|conto|pila|pau|mangos)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:reais|conto|pila|pau|mangos)?/i);

    if (amountMatch) {
      const rawNumber = amountMatch[1].replace(',', '.');
      const amount = parseFloat(rawNumber);

      if (!isNaN(amount) && amount > 0) {
        let type: 'INCOME' | 'EXPENSE' = isIncome ? 'INCOME' : 'EXPENSE';
        let suggested_category = 'Outros (Despesas)';
        let description = 'Transação WhatsApp';

        if (type === 'INCOME') {
          if (lower.includes('salário') || lower.includes('salario')) {
            suggested_category = 'Salário';
            description = 'Salário';
          } else if (lower.includes('freela') || lower.includes('projeto') || lower.includes('extra')) {
            suggested_category = 'Freelance & Extras';
            description = 'Trabalho Freelance';
          } else if (lower.includes('investimento') || lower.includes('dividendo') || lower.includes('rendeu')) {
            suggested_category = 'Investimentos';
            description = 'Rendimento de Investimentos';
          } else {
            suggested_category = 'Vendas & Reembolsos';
            description = 'Receita Diversa';
          }
        } else {
          if (
            lower.includes('lanche') ||
            lower.includes('almoço') ||
            lower.includes('almoco') ||
            lower.includes('jantar') ||
            lower.includes('comida') ||
            lower.includes('mercado') ||
            lower.includes('supermercado') ||
            lower.includes('padaria') ||
            lower.includes('ifood')
          ) {
            suggested_category = 'Alimentação';
            description = lower.includes('lanche')
              ? 'Lanche'
              : lower.includes('mercado')
              ? 'Supermercado'
              : lower.includes('padaria')
              ? 'Padaria'
              : 'Alimentação';
          } else if (
            lower.includes('gasolina') ||
            lower.includes('combustivel') ||
            lower.includes('combustível') ||
            lower.includes('uber') ||
            lower.includes('onibus') ||
            lower.includes('posto')
          ) {
            suggested_category = 'Transporte';
            description = lower.includes('gasolina')
              ? 'Combustível Gasolina'
              : lower.includes('uber')
              ? 'Corrida Uber'
              : 'Transporte';
          } else if (
            lower.includes('aluguel') ||
            lower.includes('condominio') ||
            lower.includes('luz') ||
            lower.includes('agua') ||
            lower.includes('internet')
          ) {
            suggested_category = 'Moradia';
            description = 'Contas da Casa';
          } else if (
            lower.includes('cinema') ||
            lower.includes('bar') ||
            lower.includes('festa') ||
            lower.includes('jogo') ||
            lower.includes('praia')
          ) {
            suggested_category = 'Lazer & Cultura';
            description = 'Lazer';
          } else if (
            lower.includes('farmacia') ||
            lower.includes('farmácia') ||
            lower.includes('remedio') ||
            lower.includes('remédio') ||
            lower.includes('medico') ||
            lower.includes('consulta')
          ) {
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
    }

    return {
      intent: 'unknown',
    };
  }

  /**
   * Responde à consulta de saldo (específico por conta ou geral consolidado)
   */
  private async handleBalanceQuery(
    user: any,
    instance: string,
    remoteJid: string,
    userAccounts: any[],
    queryAccountName?: string
  ) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

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

    // 1. Caso o usuário queira consultar o saldo de uma conta bancária específica
    let targetAccount = null;
    if (queryAccountName) {
      const qLower = queryAccountName.toLowerCase();
      targetAccount = userAccounts.find(
        (a) =>
          a.name.toLowerCase().includes(qLower) ||
          qLower.includes(a.name.toLowerCase())
      );
    }

    if (targetAccount) {
      const [allTx, monthTx] = await Promise.all([
        prisma.transaction.findMany({
          where: { user_id: user.id, account_id: targetAccount.id },
          select: { type: true, amount: true },
        }),
        prisma.transaction.findMany({
          where: {
            user_id: user.id,
            account_id: targetAccount.id,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          select: { type: true, amount: true },
        }),
      ]);

      let totalIncome = 0;
      let totalExpense = 0;
      for (const t of allTx) {
        const val = Number(t.amount);
        if (t.type === TransactionType.INCOME) totalIncome += val;
        else totalExpense += val;
      }

      let mIncome = 0;
      let mExpense = 0;
      for (const t of monthTx) {
        const val = Number(t.amount);
        if (t.type === TransactionType.INCOME) mIncome += val;
        else mExpense += val;
      }

      const currentBalance = Number(targetAccount.initial_balance) + totalIncome - totalExpense;

      const replyMsg =
        `🏦 *Balanço da Conta: ${targetAccount.name}*\n` +
        `Olá, *${user.name}*! Aqui está a posição da sua conta no Din:\n\n` +
        `💰 *Saldo Atual:* *${formatBRL(currentBalance)}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📅 *Mês de ${currentMonthName}/${now.getFullYear()}:*\n` +
        `🟢 *Receitas:* ${formatBRL(mIncome)}\n` +
        `🔴 *Despesas:* ${formatBRL(mExpense)}\n` +
        `📝 *Lançamentos no Mês:* ${monthTx.length}\n\n` +
        `🌐 _Acesse seu painel web para ver extrato completo._`;

      await evolutionClient.sendText(instance, remoteJid, replyMsg);
      return { status: 'account_balance_sent', account: targetAccount.name, balance: currentBalance };
    }

    // 2. Consulta Geral Consolidada + Lista de Saldos por Conta
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { type: true, amount: true, account_id: true },
    });

    let income = 0;
    let expense = 0;
    for (const t of monthTransactions) {
      const val = Number(t.amount);
      if (t.type === TransactionType.INCOME) income += val;
      else expense += val;
    }

    // Calcular saldo atual de cada conta
    const accountsBalances = await Promise.all(
      userAccounts.map(async (acc) => {
        const txs = await prisma.transaction.findMany({
          where: { user_id: user.id, account_id: acc.id },
          select: { type: true, amount: true },
        });

        let accIncome = 0;
        let accExpense = 0;
        for (const t of txs) {
          const val = Number(t.amount);
          if (t.type === TransactionType.INCOME) accIncome += val;
          else accExpense += val;
        }

        const bal = Number(acc.initial_balance) + accIncome - accExpense;
        return {
          name: acc.name,
          balance: bal,
          is_default: acc.is_default,
        };
      })
    );

    const totalBalance = accountsBalances.reduce((acc, item) => acc + item.balance, 0);

    const accountsListText = accountsBalances
      .map((acc) => `• *${acc.name}:* ${formatBRL(acc.balance)}${acc.is_default ? ' _(Padrão)_' : ''}`)
      .join('\n');

    const replyMsg =
      `📊 *Resumo Financeiro - ${currentMonthName}/${now.getFullYear()}*\n` +
      `Olá, *${user.name}*! Aqui está o seu balanço geral:\n\n` +
      `💰 *Saldo Total Consolidado:* *${formatBRL(totalBalance)}*\n` +
      `🟢 *Receitas do Mês:* ${formatBRL(income)}\n` +
      `🔴 *Despesas do Mês:* ${formatBRL(expense)}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🏦 *Saldos por Conta Bancária:*\n` +
      `${accountsListText}\n\n` +
      `📝 *Total de Lançamentos no Mês:* ${monthTransactions.length}\n` +
      `💡 _Dica: Pergunte "qual o saldo do nubank?" para ver uma conta isolada._`;

    await evolutionClient.sendText(instance, remoteJid, replyMsg);
    return { status: 'balance_sent', income, expense, totalBalance };
  }

  /**
   * Registra uma ou mais transações e responde com confirmação formatada incluindo a conta de destino
   */
  private async handleTransactionsRegistration(
    user: any,
    instance: string,
    remoteJid: string,
    transactions: any[],
    rawText: string,
    userAccounts: any[]
  ) {
    // Buscar categorias do usuário ou globais
    const userCategories = await prisma.category.findMany({
      where: {
        OR: [{ user_id: null }, { user_id: user.id }],
      },
    });

    const defaultAccount = userAccounts.find((a) => a.is_default) || userAccounts[0];
    const registeredItems: string[] = [];

    for (const item of transactions) {
      const type = item.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE;
      const categoryType = type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;

      // 1. Localizar Categoria
      let category = userCategories.find(
        (c) =>
          c.type === categoryType &&
          c.name.toLowerCase().includes(item.suggested_category.toLowerCase())
      );

      if (!category) {
        category = userCategories.find((c) => c.type === categoryType);
      }

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: item.suggested_category || (type === TransactionType.INCOME ? 'Receitas' : 'Despesas'),
            type: categoryType,
            icon: type === TransactionType.INCOME ? 'TrendingUp' : 'Tag',
            color: type === TransactionType.INCOME ? '#10b981' : '#f97316',
            user_id: user.id,
          },
        });
      }

      // 2. Localizar Conta Bancária de Destino
      let targetAccount = defaultAccount;
      if (item.suggested_account) {
        const sLower = item.suggested_account.toLowerCase();
        const found = userAccounts.find(
          (a) =>
            a.name.toLowerCase().includes(sLower) ||
            sLower.includes(a.name.toLowerCase())
        );
        if (found) {
          targetAccount = found;
        } else {
          // Tentar sinônimos
          const matchFromSynonym = this.findMatchingAccountName(item.suggested_account, userAccounts);
          if (matchFromSynonym) {
            const foundSyn = userAccounts.find((a) => a.name === matchFromSynonym);
            if (foundSyn) targetAccount = foundSyn;
          }
        }
      }

      const txDate = item.date ? new Date(item.date) : new Date();

      const createdTx = await prisma.transaction.create({
        data: {
          user_id: user.id,
          account_id: targetAccount.id,
          category_id: category.id,
          description: item.description || 'Transação WhatsApp',
          amount: item.amount,
          type,
          date: txDate,
          origin: TransactionOrigin.WHATSAPP_TEXT,
          received_on_number: instance,
          raw_message: rawText,
        },
      });

      // Calcular saldo atualizado desta conta após o registro
      const accountTxs = await prisma.transaction.findMany({
        where: { user_id: user.id, account_id: targetAccount.id },
        select: { type: true, amount: true },
      });

      let accIncome = 0;
      let accExpense = 0;
      for (const t of accountTxs) {
        const amt = Number(t.amount);
        if (t.type === TransactionType.INCOME) accIncome += amt;
        else accExpense += amt;
      }
      const updatedAccBalance = Number(targetAccount.initial_balance) + accIncome - accExpense;

      const typeLabel = type === TransactionType.INCOME ? '🟢 Receita' : '🔴 Despesa';
      registeredItems.push(
        `📌 *Tipo:* ${typeLabel}\n` +
        `📝 *Descrição:* ${createdTx.description}\n` +
        `💵 *Valor:* ${formatBRL(Number(createdTx.amount))}\n` +
        `🏷️ *Categoria:* ${category.name}\n` +
        `🏦 *Conta:* ${targetAccount.name}\n` +
        `💰 *Saldo da Conta:* ${formatBRL(updatedAccBalance)}`
      );
    }

    const title =
      transactions.length > 1
        ? `✅ *${transactions.length} transações registradas com sucesso no Din!*`
        : `✅ *Registrado com sucesso no Din!*`;

    const replyMsg =
      `${title}\n\n` +
      registeredItems.join('\n\n─────────────\n\n') +
      `\n\n💡 _Dica: Digite "qual meu saldo?" para ver o balanço de todas as suas contas._`;

    await evolutionClient.sendText(instance, remoteJid, replyMsg);
    return { status: 'transactions_created', count: transactions.length };
  }

  /**
   * Responde com guia de uso amigável
   */
  private async handleUnknownMessage(
    user: any,
    instance: string,
    remoteJid: string,
    userAccounts: any[]
  ) {
    const accountsExample = userAccounts.map((a) => a.name).slice(0, 2).join(' e ');

    const replyMsg =
      `🤖 *Assistente Financeiro Din*\n` +
      `Olá, *${user.name}*! Não consegui identificar uma transação na sua mensagem.\n\n` +
      `*Como registrar gastos e ganhos em suas contas:*\n` +
      `• 💵 *"Recebi 4 mil de salário no Banco do Brasil"*\n` +
      `• 🍔 *"Gastei 25 de lanche no Nubank"*\n` +
      `• 🚗 *"Coloquei 150 de gasolina no posto"*\n` +
      `• 🛒 *"Gastei 50 de mercado e 15 na padaria"*\n\n` +
      `*Como consultar seus saldos:*\n` +
      `• 📊 *"Qual meu saldo geral?"*\n` +
      `• 🏦 *"Qual o saldo do ${userAccounts[0]?.name || 'Banco'}?"*\n` +
      `• 📈 *"Quanto gastei este mês?"*`;

    await evolutionClient.sendText(instance, remoteJid, replyMsg);
    return { status: 'unknown_message_handled' };
  }
}
