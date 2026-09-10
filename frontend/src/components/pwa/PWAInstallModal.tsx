import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { usePWA } from '../../contexts/PWAContext';
import {
  Download,
  Smartphone,
  Apple,
  Laptop,
  CheckCircle2,
  Share2,
  PlusSquare,
  MoreVertical,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export function PWAInstallModal() {
  const {
    isInstallModalOpen,
    closeInstallModal,
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  } = usePWA();

  // Tab padrão: se for iOS seleciona 'ios', senão 'android'
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(() =>
    isIOS ? 'ios' : 'android'
  );

  if (!isInstallModalOpen) return null;

  return (
    <Modal
      isOpen={isInstallModalOpen}
      onClose={closeInstallModal}
      title="Instalar MeuDino"
      maxWidth="md"
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Banner do Mascote e Benefícios */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-card-secondary to-teal-500/5 border border-emerald-500/30 flex items-center gap-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-card border border-emerald-500/30 flex items-center justify-center p-1.5 shrink-0 shadow-md shadow-emerald-500/15">
            <img
              src="/meudino-mascot.png"
              alt="MeuDino"
              className="w-11 h-11 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experiência de App Nativo</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-din-text mt-0.5">
              Tenha o MeuDino na sua tela inicial
            </h4>
            <p className="text-xs text-din-muted leading-relaxed mt-0.5">
              Acesso instantâneo com 1 toque, tela cheia sem barra de navegador e funcionamento offline.
            </p>
          </div>
        </div>

        {/* Se o botão nativo do navegador estiver pronto, oferece instalação direta */}
        {isInstallable && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <p className="text-xs font-semibold text-emerald-300">
              ✨ Seu navegador está pronto para instalar em 1 clique:
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={promptInstall}
              className="w-full shadow-glow-primary min-h-[44px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicativo com 1 Toque</span>
            </Button>
          </div>
        )}

        {/* Se já estiver instalado em modo standalone */}
        {isInstalled && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>O MeuDino já está instalado e ativo como aplicativo neste dispositivo!</span>
          </div>
        )}

        {/* Seletor de Plataforma / Abas */}
        <div className="flex items-center gap-1.5 p-1 bg-card-secondary border border-border rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'android'
                ? 'bg-din-primary text-white shadow-md'
                : 'text-din-muted hover:text-din-text hover:bg-card-hover'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'ios'
                ? 'bg-din-primary text-white shadow-md'
                : 'text-din-muted hover:text-din-text hover:bg-card-hover'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iOS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'desktop'
                ? 'bg-din-primary text-white shadow-md'
                : 'text-din-muted hover:text-din-text hover:bg-card-hover'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Computador</span>
          </button>
        </div>

        {/* Guia Passo a Passo: ANDROID */}
        {activeTab === 'android' && (
          <div className="space-y-3">
            <div className="space-y-2.5 text-xs text-din-muted">
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-din-text flex items-center gap-1.5">
                    Toque nos 3 pontinhos <MoreVertical className="w-3.5 h-3.5 inline text-emerald-400" />
                  </p>
                  <p className="mt-0.5 text-din-muted">
                    No canto superior direito do Google Chrome ou Samsung Internet.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-din-text flex items-center gap-1.5">
                    Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
                  </p>
                  <p className="mt-0.5 text-din-muted">
                    Essa opção adiciona o MeuDino como um Web App oficial.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-din-text">Confirme em "Instalar"</p>
                  <p className="mt-0.5 text-din-muted">
                    O ícone do <strong>MeuDino</strong> ficará disponível na sua tela de início e na lista de aplicativos do seu celular.
                  </p>
                </div>
              </div>
            </div>

            {/* Aviso sobre atalho apagado / cache */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-amber-300/90 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Apagou o ícone anteriormente?</strong> O Chrome às vezes pausa o banner automático após uma remoção. Utilizar os 3 pontinhos ➔ <em>Instalar aplicativo</em> funciona a qualquer momento.
              </span>
            </div>
          </div>
        )}

        {/* Guia Passo a Passo: IPHONE / IOS */}
        {activeTab === 'ios' && (
          <div className="space-y-2.5 text-xs text-din-muted">
            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-din-text flex items-center gap-1.5">
                  Toque no botão Compartilhar <Share2 className="w-3.5 h-3.5 inline text-sky-400" />
                </p>
                <p className="mt-0.5 text-din-muted">
                  No Safari, localizado na barra inferior do seu iPhone ou iPad.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-din-text flex items-center gap-1.5">
                  Toque em "Adicionar à Tela de Início" <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />
                </p>
                <p className="mt-0.5 text-din-muted">
                  Role a lista de ações do compartilhamento até encontrar essa opção.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-din-text">Toque em "Adicionar"</p>
                <p className="mt-0.5 text-din-muted">
                  No canto superior direito. Pronto! O MeuDino abrirá como app de tela cheia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guia Passo a Passo: DESKTOP */}
        {activeTab === 'desktop' && (
          <div className="space-y-2.5 text-xs text-din-muted">
            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-din-text">Ícone na barra de endereços</p>
                <p className="mt-0.5 text-din-muted">
                  No Google Chrome, Edge ou Brave, localize o ícone de instalação <Download className="w-3 h-3 inline text-emerald-400 mx-0.5" /> ao lado da estrela de favoritos na barra de URL.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-din-text">Ou pelo menu ⋮ do navegador</p>
                <p className="mt-0.5 text-din-muted">
                  Clique no menu de 3 pontinhos ➔ <strong>Salvar e Compartilhar</strong> ➔ <strong>Instalar MeuDino...</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Fechar */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeInstallModal}
            className="min-h-[44px]"
          >
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
