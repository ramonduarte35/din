import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, Sparkles, Smartphone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SystemWhatsAppNumber } from '../../api/system-numbers';

interface WhatsAppNumbersCardProps {
  systemNumbers: SystemWhatsAppNumber[];
  isLoading: boolean;
  userPhone: string | null;
}

export function WhatsAppNumbersCard({ systemNumbers, isLoading, userPhone }: WhatsAppNumbersCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border-emerald-500/20 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Números do Assistente no WhatsApp
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO IA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Salve qualquer uma das linhas abaixo para enviar seus gastos e receitas por áudio ou texto.
            </p>
          </div>
        </div>

        {!userPhone && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Adicione seu WhatsApp no perfil para ativar</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-900/80 border border-slate-800 animate-pulse"
            />
          ))
        ) : systemNumbers.length > 0 ? (
          systemNumbers.map((num) => (
            <div
              key={num.id}
              className="p-3.5 rounded-xl bg-[#0b1120] border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {num.label}
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                    {num.formatted_phone}
                  </span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <a
                  href={num.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="emerald" size="sm" className="w-full text-xs py-1.5 h-8">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chamar</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </Button>
                </a>
                <button
                  onClick={() => handleCopy(num.id, num.phone_number)}
                  title="Copiar número"
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors h-8 flex items-center justify-center aspect-square"
                >
                  {copiedId === num.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 col-span-3 py-2">
            Nenhum número de WhatsApp ativo configurado no momento.
          </p>
        )}
      </div>

      {/* Dicas Rápidas de IA */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Exemplos de envio: <em>"Gastei 35 de almoço"</em>, <em>"Recebi 2500 de salário"</em>, ou{' '}
            <em>"Qual meu saldo do mês?"</em>
          </span>
        </div>
      </div>
    </Card>
  );
}
