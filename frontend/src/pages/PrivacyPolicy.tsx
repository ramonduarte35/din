import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Cookie, Eye, UserCheck, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PrivacyPolicy() {
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
            <ShieldCheck className="w-5 h-5 text-din-primary" />
            <span>MeuDino</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conformidade com a LGPD & Google AdSense</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-din-text">
            Política de Privacidade
          </h1>
          <p className="text-xs sm:text-sm text-din-muted">
            Última atualização: Setembro de 2026
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <Lock className="w-5 h-5 text-din-primary" />
            1. Compromisso com a sua Privacidade
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            O <strong>MeuDino</strong> valoriza e respeita a sua privacidade. Esta política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e as diretrizes globais de privacidade.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            2. Informações que Coletamos
          </h2>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>
              <strong>Dados Cadastrais:</strong> Nome, endereço de e-mail e número de telefone (WhatsApp) fornecidos voluntariamente no cadastro.
            </li>
            <li>
              <strong>Dados Financeiros Pessoais:</strong> Lançamentos de receitas, despesas, contas a pagar, categorias e metas financeiras registradas por você.
            </li>
            <li>
              <strong>Mensagens via WhatsApp ou Telegram:</strong> Textos e áudios enviados ao bot oficial do MeuDino para transcrição e categorização automática por Inteligência Artificial.
            </li>
            <li>
              <strong>Dados de Navegação:</strong> Informações de dispositivo, endereço IP, cookies técnicos de sessão e estatísticas de uso anônimas.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-400" />
            3. Google AdSense e Cookies de Terceiros
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            Utilizamos o <strong>Google AdSense</strong> para veicular anúncios não intrusivos aos usuários do plano gratuito:
          </p>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>
              Fornecedores terceirizados, incluindo o Google, utilizam <em>cookies</em> para veicular anúncios com base em visitas anteriores do usuário ao nosso site ou a outros sites.
            </li>
            <li>
              O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios para os usuários com base nas visitas a este e/ou a outros sites na Internet.
            </li>
            <li>
              Você pode desativar a publicidade personalizada acessando as{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noreferrer"
                className="text-din-primary hover:underline font-semibold"
              >
                Configurações de Anúncios do Google
              </a>
              . Alternativamente, você pode desativar o uso de cookies de terceiros para publicidade personalizada acessando o site{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noreferrer"
                className="text-din-primary hover:underline font-semibold"
              >
                aboutads.info
              </a>
              .
            </li>
            <li>
              <strong>Usuários do Plano PRO:</strong> Usuários com assinatura ativa do plano PRO navegam em um ambiente 100% livre de publicidade e sem rastreamento de anúncios de terceiros.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <Lock className="w-5 h-5 text-din-primary" />
            4. Armazenamento Seguro e Criptografia
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            Seus dados são protegidos com padrões rigorosos de segurança da informação:
          </p>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>Isolamento rigoroso multi-tenant (seus registros nunca são compartilhados ou acessados por outros usuários).</li>
            <li>Senhas criptografadas com algoritmos de hash irreversíveis (bcrypt).</li>
            <li>Comunicação 100% criptografada via HTTPS/TLS em trânsito.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            5. Seus Direitos (LGPD)
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            De acordo com o Art. 18 da LGPD, você tem o direito de solicitar a qualquer momento:
          </p>
          <ul className="list-disc list-inside text-sm text-din-muted space-y-2 leading-relaxed ml-2">
            <li>Confirmação da existência de tratamento dos seus dados.</li>
            <li>Acesso e exportação de seus dados financeiros (disponível via exportação CSV).</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Eliminação completa da sua conta e de todos os seus dados históricos.</li>
          </ul>
        </section>

        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg sm:text-xl font-bold text-din-text flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-din-primary" />
            6. Contato e Encarregado de Proteção de Dados (DPO)
          </h2>
          <p className="text-sm text-din-muted leading-relaxed">
            Se você tiver dúvidas, solicitações ou quiser exercer seus direitos de privacidade, entre em contato com nosso suporte através da plataforma MeuDino.
          </p>
        </section>
      </main>
    </div>
  );
}
