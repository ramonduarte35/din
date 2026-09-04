import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { simulateWhatsAppRequest } from '../api/transactions';
import { getSystemNumbersRequest, SystemWhatsAppNumber } from '../api/system-numbers';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  MessageSquare,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  SendHorizontal,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  channel?: 'whatsapp' | 'telegram';
  payload?: any;
}

export function Simulator() {
  const { user } = useAuth();
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [message, setMessage] = useState('');
  const [instance, setInstance] = useState('din');
  const [systemNumbers, setSystemNumbers] = useState<SystemWhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPayload, setLastPayload] = useState<any>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '🤖 Olá! Eu sou o assistente inteligente do Din.\n\nEnvie uma mensagem em linguagem natural (ex: "gastei 35 no almoço", "recebi 2500 de salário") ou use comandos para testar o processamento com IA em tempo real!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      channel: 'whatsapp',
    },
  ]);

  useEffect(() => {
    getSystemNumbersRequest()
      .then((numbers) => {
        setSystemNumbers(numbers);
        if (numbers.length > 0) {
          setInstance(numbers[0].label || 'din');
        }
      })
      .catch(() => {});
  }, []);

  const whatsappExamples = [
    'recebi o salario de 4 mil no banco do brasil',
    'gastei 50 de lanche no nubank',
    'qual o saldo do banco do brasil?',
    'qual meu saldo geral?',
    'coloquei 120 de combustível no posto',
    'recebi 450 do freela de design no nubank',
    'paguei a conta de luz de 180 reais',
  ];

  const telegramExamples = [
    '/start',
    '/saldo',
    'comprei 3 livros na amazon por 150 no cartao',
    'gastei 28 reais na padaria em dinheiro',
    'recebi 300 reais de reembolso via pix',
    'qual meu saldo total?',
    '/ajuda',
  ];

  const currentExamples = channel === 'whatsapp' ? whatsappExamples : telegramExamples;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    const senderPhone = user?.phone_number || '5586999998888';
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Adiciona mensagem do usuário
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowTime,
      channel,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await simulateWhatsAppRequest({
        channel,
        sender: senderPhone,
        message: text,
        instance,
        telegramId: (user as any)?.telegram_id || '999888777',
      });

      setLastPayload(response);

      const status = response?.result?.status || 'Sucesso';
      const isBalanceQuery = response?.result?.balance !== undefined;
      const count = response?.result?.count;

      let replyText = `✅ Processado com IA pelo Din (${channel === 'whatsapp' ? 'WhatsApp Webhook' : 'Telegram Bot'})!\n\n`;
      if (status === 'success' || status === 'created') {
        replyText += `Status: ${status}\nTransações registradas: ${count || 1}`;
      } else if (isBalanceQuery) {
        replyText += `Consulta de Saldo realizada com sucesso.`;
      } else {
        replyText += `Resultado: ${JSON.stringify(response?.result || response?.message || 'OK')}`;
      }

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel,
        payload: response,
      };

      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        sender: 'bot',
        text: `❌ Falha ao processar mensagem: ${err?.response?.data?.message || err?.message || 'Erro de conexão com o servidor'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel,
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        id: `reset_${Date.now()}`,
        sender: 'bot',
        text: `🤖 Chat reiniciado. Canal ativo: ${channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}. Envie mensagens para testar!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel,
      },
    ]);
    setLastPayload(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 animate-fade-in">
      {/* Header com Toggle de Canais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
              Simulador Multi-Canal com IA
            </h1>
            <Badge variant="pro" className="text-[10px]">
              DEBUG LAB
            </Badge>
          </div>
          <p className="text-xs text-din-muted mt-0.5">
            Teste o pipeline de IA, comandos e linguagem natural em múltiplos canais
          </p>
        </div>

        {/* Toggle WhatsApp vs Telegram */}
        <div className="flex items-center p-1 rounded-2xl bg-card border border-border self-start sm:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setChannel('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              channel === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-din-muted hover:text-din-text'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setChannel('telegram')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              channel === 'telegram'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-din-muted hover:text-din-text'
            }`}
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Telegram Bot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Chat Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[600px] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
          {/* Top Bar do Chat */}
          <div
            className={`p-4 border-b border-border flex items-center justify-between transition-colors ${
              channel === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-950/40 via-card-secondary to-card-secondary'
                : 'bg-gradient-to-r from-sky-950/40 via-card-secondary to-card-secondary'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-md ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-sky-500/10'
                }`}
              >
                {channel === 'whatsapp' ? <Bot className="w-5 h-5" /> : <SendHorizontal className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-din-text flex items-center gap-1.5">
                  <span>Din Assistant ({channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'})</span>
                  <span
                    className={`w-2 h-2 rounded-full inline-block animate-pulse ${
                      channel === 'whatsapp' ? 'bg-emerald-400' : 'bg-sky-400'
                    }`}
                  />
                </h3>
                <p className="text-[11px] text-din-muted font-mono">
                  {channel === 'whatsapp'
                    ? `Telefone: ${user?.phone_number || '5586999998888 (Demo)'}`
                    : `Telegram ID: ${(user as any)?.telegram_id || '999888777 (Demo)'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {channel === 'whatsapp' && (
                <select
                  value={instance}
                  onChange={(e) => setInstance(e.target.value)}
                  className="bg-card border border-border text-din-text text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-din-primary max-w-[140px] truncate"
                >
                  {systemNumbers.length > 0 ? (
                    systemNumbers.map((num) => (
                      <option key={num.id} value={num.label || num.phone_number}>
                        {num.label}
                      </option>
                    ))
                  ) : (
                    <option value="din">Instância: din</option>
                  )}
                </select>
              )}

              <button
                type="button"
                onClick={handleClearChat}
                title="Limpar Chat"
                className="p-2 rounded-xl bg-card hover:bg-card-hover text-din-muted hover:text-din-text border border-border transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background bg-ambient-gradient">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? channel === 'whatsapp'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-card-secondary text-din-text border border-border rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-din-muted mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input de Envio */}
          <div className="p-3 bg-card-secondary border-t border-border flex items-center gap-2">
            <input
              type="text"
              placeholder={
                channel === 'whatsapp'
                  ? 'Ex: gastei 25 no lanche com pix nubank...'
                  : 'Ex: /saldo ou comprei 80 de mercado no BB...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-din-text placeholder:text-din-muted focus:outline-none focus:ring-2 focus:ring-din-primary/50 min-h-[44px]"
            />
            <Button
              variant={channel === 'whatsapp' ? 'emerald' : 'primary'}
              size="sm"
              onClick={() => handleSend()}
              isLoading={isLoading}
              className={`h-11 px-4 min-h-[44px] ${
                channel === 'telegram'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                  : ''
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Coluna Direita: Exemplos Rápidos & Payload Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Exemplos Rápidos */}
          <Card className="p-4 border-border bg-card rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-din-text uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${channel === 'whatsapp' ? 'text-emerald-400' : 'text-sky-400'}`} />
                <span>Exemplos {channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</span>
              </div>
              <span className="text-[10px] text-din-muted font-normal">1 toque</span>
            </div>

            <div className="space-y-2">
              {currentExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(ex)}
                  className="w-full text-left p-2.5 rounded-xl bg-card-secondary hover:bg-card-hover border border-border hover:border-din-primary/40 text-xs text-din-muted hover:text-din-text transition-all flex items-center justify-between group min-h-[40px]"
                >
                  <span className="truncate">{ex.startsWith('/') ? <strong className="text-din-text">{ex}</strong> : `"${ex}"`}</span>
                  <span className={`text-[10px] opacity-0 group-hover:opacity-100 font-semibold transition-opacity shrink-0 ml-2 ${
                    channel === 'whatsapp' ? 'text-emerald-400' : 'text-sky-400'
                  }`}>
                    Enviar &rarr;
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Inspetor de Payload JSON */}
          <Card className="p-4 border-border bg-card rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-din-text uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-din-primary" />
                <span>Payload da Resposta do Webhook</span>
              </div>
              {lastPayload && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  200 OK
                </span>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-border font-mono text-[11px] text-emerald-400 max-h-[220px] overflow-y-auto">
              {lastPayload ? (
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastPayload, null, 2)}</pre>
              ) : (
                <p className="text-slate-500 italic">
                  Envie uma mensagem no chat para visualizar a extração semântica da IA e o payload persistido.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
