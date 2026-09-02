import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { simulateWhatsAppRequest } from '../api/transactions';
import { getSystemNumbersRequest, SystemWhatsAppNumber } from '../api/system-numbers';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Bot, Send, Sparkles, MessageSquare, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  payload?: any;
}

export function Simulator() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [instance, setInstance] = useState('din');
  const [systemNumbers, setSystemNumbers] = useState<SystemWhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '🤖 Olá! Eu sou o assistente inteligente do Din. Envie uma mensagem como "gastei 20 conto no lanche" ou "recebi 1800 de salário" para testar o processamento semântico com IA!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
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

  const [lastPayload, setLastPayload] = useState<any>(null);

  const predefinedExamples = [
    'lanchei e gastei 20 conto',
    'recebi 1600 de salario',
    'gastei 50 de gasolina e 15 na padaria',
    'qual meu saldo do mês?',
    'coloquei 120 de combustível no posto',
    'recebi 450 do freela de design',
  ];

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
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await simulateWhatsAppRequest({
        sender: senderPhone,
        message: text,
        instance,
      });

      setLastPayload(response);

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `✅ Processado pelo Din Webhook!\nStatus: ${response?.result?.status || 'Sucesso'}\nTransações: ${response?.result?.count || (response?.result?.balance !== undefined ? 'Consulta' : '1')}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        payload: response,
      };

      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        sender: 'bot',
        text: `❌ Falha ao processar mensagem: ${err?.response?.data?.message || err?.message || 'Erro de conexão'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Laboratório & Simulador WhatsApp (IA)
          </h1>
          <Badge variant="pro" className="text-[10px]">
            DEBUG LAB
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Teste o pipeline de processamento em linguagem natural e webhook do Evolution Go diretamente no navegador
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Chat Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[600px] rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden">
          {/* Top Bar do Chat WhatsApp */}
          <div className="p-4 bg-[#0b1120] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Din Assistente IA</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Remetente: {user?.phone_number || '5586999998888 (Demo)'}
                </p>
              </div>
            </div>

            <select
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              {systemNumbers.length > 0 ? (
                systemNumbers.map((num) => (
                  <option key={num.id} value={num.label || num.phone_number}>
                    {num.label} ({num.formatted_phone})
                  </option>
                ))
              ) : (
                <option value="din">Instância Padrão (din)</option>
              )}
            </select>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080d1a] bg-ambient-gradient">
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
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input de Envio */}
          <div className="p-3 bg-[#0b1120] border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem em linguagem natural..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <Button
              variant="emerald"
              size="sm"
              onClick={() => handleSend()}
              isLoading={isLoading}
              className="h-10 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Coluna Direita: Exemplos Rápidos & Payload Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Exemplos Rápidos */}
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Exemplos para Testar com 1 Clique</span>
            </div>
            <div className="space-y-2">
              {predefinedExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(ex)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="truncate">"{ex}"</span>
                  <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 font-semibold transition-opacity">
                    Enviar &rarr;
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Inspetor de Payload JSON */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Payload da Resposta do Webhook</span>
              </div>
              {lastPayload && (
                <span className="text-[10px] text-emerald-400 lowercase font-mono">
                  200 OK
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-400 max-h-[220px] overflow-y-auto">
              {lastPayload ? (
                <pre>{JSON.stringify(lastPayload, null, 2)}</pre>
              ) : (
                <p className="text-slate-500 italic">
                  Envie uma mensagem no chat ao lado para visualizar a extração semântica e os dados persistidos.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
