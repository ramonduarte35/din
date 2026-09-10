import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-din-text selection:bg-din-primary selection:text-white pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 min-h-[44px] text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>

          <div className="flex items-center gap-2 font-bold text-sm text-din-text">
            <FileText className="w-5 h-5 text-din-primary" />
            <span>MeuDino</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Contrato de Utilização do Serviço</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-din-text">
            Termos de Uso
          </h1>
          <p className="text-xs sm:text-sm text-din-muted">
            Última atualização: Setembro de 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-din-primary" />
            1. Aceitação dos Termos
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            Ao criar uma conta ou utilizar o aplicativo <strong>MeuDino</strong>, inclusive por meio de interações com nosso assistente no WhatsApp ou Telegram, você concorda expressamente com estes Termos de Uso e com a nossa Política de Privacidade.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            2. Descrição dos Serviços & Planos
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            O MeuDino é uma plataforma de organização e inteligência financeira que permite registro de transações, gestão de contas a pagar, orçamentos, metas e relatórios analíticos:
          </p>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>
              <strong>Plano Gratuito (Free):</strong> Acesso às funcionalidades essenciais de gestão financeira com exibição de anúncios contextuais não invasivos fornecidos pelo Google AdSense.
            </li>
            <li>
              <strong>Plano PRO (Premium):</strong> Acesso completo a recursos avançados, prioridade no processamento de áudio por IA e navegação 100% livre de qualquer anúncio ou publicidade.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            3. Responsabilidade do Usuário
          </h2>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>Você é o único responsável pela veracidade e precisão dos dados informados no sistema.</li>
            <li>Você deve manter suas credenciais de acesso seguras e confidenciais.</li>
            <li>É vedado o uso da plataforma para fins ilícitos, fraudes ou tentativas de violação da infraestrutura do sistema.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            4. Isenção de Responsabilidade Financeira
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            O MeuDino é uma ferramenta de auxílio ao controle e organização de despesas e receitas. As sugestões geradas por inteligência artificial não constituem consultoria financeira ou de investimentos formal e não substituem o discernimento financeiro do próprio usuário.
          </p>
        </section>

        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg sm:text-xl font-bold text-din-text">
            5. Alterações nestes Termos
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            Podemos atualizar estes Termos periodicamente para refletir melhorias no produto ou adequações legais. O uso contínuo da aplicação após alterações implica aceitação dos novos termos.
          </p>
        </section>
      </main>
    </div>
  );
}
