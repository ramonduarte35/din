import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  changePasswordRequest,
  generateTelegramLinkCodeRequest,
  unlinkTelegramAccountRequest,
} from '../api/auth';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Check,
  MessageSquare,
  Info,
  Lock,
  KeyRound,
  AlertCircle,
  Palette,
  Sun,
  Moon,
  Sparkle,
  Send,
  ExternalLink,
  Copy,
  Unlink,
  Radio,
} from 'lucide-react';

export function Profile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Telegram fields
  const [isGeneratingTelegramCode, setIsGeneratingTelegramCode] = useState(false);
  const [telegramLinkData, setTelegramLinkData] = useState<{
    code: string;
    token: string;
    deep_link: string | null;
    bot_username: string | null;
  } | null>(null);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [isUnlinkingTelegram, setIsUnlinkingTelegram] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Theme change status
  const [themeSuccess, setThemeSuccess] = useState<string | null>(null);
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleGenerateTelegramCode = async () => {
    setIsGeneratingTelegramCode(true);
    setTelegramError(null);
    setTelegramSuccess(null);
    try {
      const res = await generateTelegramLinkCodeRequest();
      setTelegramLinkData(res);
    } catch (err: any) {
      setTelegramError(err?.response?.data?.message || 'Erro ao gerar código do Telegram. Verifique se o bot está configurado no painel de administração.');
    } finally {
      setIsGeneratingTelegramCode(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!window.confirm('Deseja realmente desvincular sua conta do Telegram?')) return;
    setIsUnlinkingTelegram(true);
    setTelegramError(null);
    setTelegramSuccess(null);
    try {
      const res = await unlinkTelegramAccountRequest();
      setTelegramSuccess(res.message || 'Conta do Telegram desvinculada com sucesso!');
      setTelegramLinkData(null);
      await refreshUser();
      setTimeout(() => setTelegramSuccess(null), 4000);
    } catch (err: any) {
      setTelegramError(err?.response?.data?.message || 'Erro ao desvincular conta do Telegram.');
    } finally {
      setIsUnlinkingTelegram(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`/vincular ${code}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone_number: phone.trim() || null,
      });
      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Erro ao atualizar dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTheme = async (themeId: typeof theme) => {
    if (themeId === theme) return;
    setIsChangingTheme(true);
    try {
      await setTheme(themeId, true);
      const selected = themes.find((t) => t.id === themeId);
      setThemeSuccess(`Paleta alterada para "${selected?.name}" e salva na sua conta!`);
      setTimeout(() => setThemeSuccess(null), 4000);
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
    } finally {
      setIsChangingTheme(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordRequest({
        current_password: user?.has_password ? currentPassword : undefined,
        new_password: newPassword,
      });
      setPasswordSuccess(res.message || 'Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Erro ao processar senha. Verifique seus dados.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
          Configurações de Perfil & Preferências
        </h1>
        <p className="text-xs text-din-muted mt-0.5">
          Personalize sua paleta de cores, gerencie dados cadastrais, segurança da conta e WhatsApp
        </p>
      </div>

      {/* 🎨 SEÇÃO DE APARÊNCIA & PALETAS DE CORES */}
      <Card className="space-y-5 border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-din-primary" />
              <h3 className="text-base font-bold text-din-text tracking-tight">
                Aparência & Paleta de Cores
              </h3>
            </div>
            <p className="text-xs text-din-muted mt-0.5">
              Escolha o visual que mais combina com seu estilo. Sua preferência é salva automaticamente.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-din-primary/10 text-din-primary border border-din-primary/25 self-start sm:self-auto">
            {themes.find((t) => t.id === theme)?.name} Ativo
          </span>
        </div>

        {themeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{themeSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {themes.map((t) => {
            const isSelected = t.id === theme;
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`group relative rounded-2xl p-3.5 cursor-pointer transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-card-hover border-din-primary shadow-lg ring-2 ring-din-primary/40'
                    : 'bg-card-secondary border-border hover:border-din-primary/40 hover:bg-card-hover'
                }`}
              >
                {/* Visual Preview Box */}
                <div
                  className="w-full h-20 rounded-xl mb-3 p-2.5 flex flex-col justify-between border shadow-inner relative overflow-hidden"
                  style={{
                    backgroundColor: t.preview.bg,
                    borderColor: isSelected ? t.accentColor : 'rgba(150,150,150,0.2)',
                  }}
                >
                  {/* Top Bar Mockup */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <div
                        className="w-6 h-1.5 rounded-full opacity-60"
                        style={{ backgroundColor: t.accentColor }}
                      />
                    </div>
                    <div
                      className="w-4 h-1.5 rounded-full"
                      style={{ backgroundColor: t.preview.secondary }}
                    />
                  </div>

                  {/* Card Simulation */}
                  <div
                    className="p-1.5 rounded-lg border flex items-center justify-between"
                    style={{
                      backgroundColor: t.preview.card,
                      borderColor: 'rgba(150,150,150,0.15)',
                    }}
                  >
                    <div className="space-y-1">
                      <div
                        className="w-10 h-1.5 rounded-full"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <div className="w-6 h-1 rounded-full bg-slate-500/40" />
                    </div>
                    <div
                      className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] font-bold"
                      style={{ backgroundColor: t.accentColor, color: '#000' }}
                    >
                      R$
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-din-text group-hover:text-din-primary transition-colors">
                      {t.name}
                    </h4>
                    {isSelected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-950 shadow-sm"
                        style={{ backgroundColor: t.accentColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-din-muted line-clamp-2 leading-relaxed mb-3">
                    {t.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isChangingTheme}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-din-primary text-slate-950 shadow-md font-extrabold'
                      : 'bg-card border border-border text-din-muted hover:text-din-text hover:border-din-primary/30'
                  }`}
                >
                  {isSelected ? '✓ Paleta Ativa' : 'Aplicar Paleta'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Resumo do Plano e Status */}
        <Card className="md:col-span-1 space-y-4 bg-card border-border">
          <div className="text-center pb-4 border-b border-border">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'Avatar'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-lg shadow-emerald-500/20 mb-3 border-2 border-din-primary/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3 uppercase">
                {user?.name ? user.name.slice(0, 2) : 'D'}
              </div>
            )}
            <h3 className="font-bold text-base text-din-text">{user?.name}</h3>
            <p className="text-xs text-din-muted">{user?.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant={user?.subscription_tier === 'PRO' ? 'pro' : 'free'} className="text-xs py-1 px-3">
                {user?.subscription_tier === 'PRO' ? '⭐ Plano PRO Ativo' : 'Plano Gratuito'}
              </Badge>
              {user?.google_id && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  Google Conectado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-xs text-din-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-din-primary" />
              <span className="text-din-text font-medium">Registro ilimitado de receitas/despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-din-primary" />
              <span className="text-din-text font-medium">Inteligência Artificial gpt-4o-mini</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-din-primary" />
              <span className="text-din-text font-medium">Integração multi-números WhatsApp</span>
            </div>
          </div>
        </Card>

        {/* Formulário de Dados Cadastrais */}
        <Card className="md:col-span-2 space-y-5 bg-card border-border">
          <div>
            <h3 className="text-sm font-bold text-din-text tracking-tight">Dados Cadastrais</h3>
            <p className="text-xs text-din-muted">
              O número de telefone é utilizado pelo Din para reconhecer suas mensagens automaticamente.
            </p>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <Input
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="E-mail de Acesso"
              value={user?.email || ''}
              disabled
              icon={<Mail className="w-4 h-4" />}
              hint="O e-mail não pode ser alterado diretamente"
            />

            <Input
              label="Seu Telefone WhatsApp (com DDD)"
              placeholder="Ex: 5586999998888 ou 86 99999-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-din-primary" />}
              hint="Digite o número do WhatsApp que você utiliza para enviar mensagens"
            />

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="emerald" isLoading={isLoading} className="min-h-[44px]">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* ✈️ INTEGRAÇÃO COM TELEGRAM BOT */}
      <Card className="space-y-5 border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
              </div>
              <h3 className="text-base font-bold text-din-text tracking-tight">
                Integração com Telegram Bot
              </h3>
            </div>
            <p className="text-xs text-din-muted mt-0.5">
              Conecte sua conta do Telegram para registrar transações por texto ou áudios e consultar saldos com Inteligência Artificial.
            </p>
          </div>

          <div>
            {user?.telegram_id || user?.is_telegram_connected ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Telegram Conectado
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-500/10 text-din-muted border border-border inline-flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Desconectado
              </span>
            )}
          </div>
        </div>

        {telegramSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{telegramSuccess}</span>
          </div>
        )}

        {telegramError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{telegramError}</span>
          </div>
        )}

        {user?.telegram_id || user?.is_telegram_connected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-card-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                  TG
                </div>
                <div>
                  <p className="text-xs font-semibold text-din-text">
                    {user.telegram_username ? `@${user.telegram_username}` : `ID: ${user.telegram_id}`}
                  </p>
                  <p className="text-[11px] text-din-muted">
                    Sua conta está vinculada e pronta para receber comandos, mensagens e áudios.
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={handleUnlinkTelegram}
                isLoading={isUnlinkingTelegram}
                className="min-h-[44px] self-start sm:self-auto"
              >
                <Unlink className="w-4 h-4 mr-1.5" />
                Desvincular Telegram
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15 space-y-3">
              <p className="text-xs text-din-muted leading-relaxed">
                Você pode vincular sua conta de duas formas simples:
              </p>
              <ul className="text-xs space-y-2 text-din-muted">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                  <span><strong>Link Direto com 1 Clique:</strong> Gere o link de conexão e abra o bot no Telegram para conectar instantaneamente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                  <span><strong>Comando ou Contato:</strong> Abra a conversa com o bot no Telegram e envie o comando gerado abaixo ou compartilhe seu contato.</span>
                </li>
              </ul>
            </div>

            {telegramLinkData ? (
              <div className="p-4 rounded-2xl bg-card-secondary border border-sky-500/30 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-din-muted font-medium">Seu Código de Vinculação:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black font-mono text-sky-400 tracking-wider">
                        {telegramLinkData.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(telegramLinkData.code)}
                        className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-border text-xs font-medium text-din-text flex items-center gap-1.5 transition-all min-h-[44px]"
                        title="Copiar comando"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {telegramLinkData.deep_link || telegramLinkData.bot_username ? (
                      <a
                        href={telegramLinkData.deep_link || `https://t.me/${telegramLinkData.bot_username}?start=v_${telegramLinkData.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md min-h-[44px]"
                      >
                        <Send className="w-4 h-4" />
                        Abrir no Telegram
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    ) : null}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => refreshUser()}
                      className="min-h-[44px]"
                    >
                      Verificar Conexão
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-din-muted">
                  💡 Este código expira em 15 minutos. Após clicar no botão ou enviar <code className="px-1 py-0.5 bg-card rounded font-mono text-sky-300">/vincular {telegramLinkData.code}</code> no Telegram, clique em "Verificar Conexão".
                </p>
              </div>
            ) : (
              <div className="flex justify-start">
                <Button
                  variant="primary"
                  onClick={handleGenerateTelegramCode}
                  isLoading={isGeneratingTelegramCode}
                  className="min-h-[44px] bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gerar Conexão com Telegram
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Card de Segurança & Troca de Senha */}
      <Card className="space-y-5 border-border bg-card">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-din-primary" />
            <h3 className="text-sm font-bold text-din-text tracking-tight">
              {user?.has_password ? 'Segurança da Conta (Alterar Senha)' : 'Segurança da Conta (Definir Senha de Acesso)'}
            </h3>
          </div>
          <p className="text-xs text-din-muted mt-0.5">
            {user?.has_password
              ? 'Mantenha sua conta protegida utilizando uma senha forte com no mínimo 6 caracteres.'
              : 'Sua conta foi criada através do Google. Você pode definir uma senha para também poder entrar via e-mail e senha.'}
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user?.has_password && (
            <Input
              label="Senha Atual"
              type="password"
              placeholder="Sua senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
          )}

          <Input
            label={user?.has_password ? 'Nova Senha' : 'Criar Senha'}
            type="password"
            placeholder="Mínimo 6 dígitos"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-din-primary" />}
            required
            className={user?.has_password ? '' : 'sm:col-span-1'}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-din-primary" />}
            required
            className={user?.has_password ? '' : 'sm:col-span-2'}
          />

          {passwordSuccess && (
            <div className="sm:col-span-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="sm:col-span-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="sm:col-span-3 flex justify-end pt-1">
            <Button
              type="submit"
              variant="secondary"
              isLoading={isChangingPassword}
              disabled={(user?.has_password && !currentPassword) || !newPassword || !confirmNewPassword}
              className="min-h-[44px]"
            >
              <KeyRound className="w-4 h-4 mr-1.5" />
              {user?.has_password ? 'Atualizar Senha' : 'Salvar Senha'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Guia de Canais de Entrada: WhatsApp e Telegram */}
      <Card className="bg-card border-border">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-din-text text-sm">Canais de Entrada Din (WhatsApp & Telegram)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-din-muted leading-relaxed">
              <div className="p-3 rounded-xl bg-card-secondary border border-border">
                <p className="font-semibold text-din-text mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  WhatsApp (Evolution Go ou Oficial Meta)
                </p>
                <p>
                  1. Salve o número oficial do Din na agenda do seu smartphone.
                  <br />
                  2. Mantenha seu número de telefone preenchido em <strong>Dados Cadastrais</strong>.
                  <br />
                  3. Envie áudios ou textos com seus gastos (ex: <em>"Gastei 25 no almoço"</em>).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card-secondary border border-border">
                <p className="font-semibold text-din-text mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Telegram Bot Oficial
                </p>
                <p>
                  1. Vincule sua conta através do botão ou comando <code className="px-1 py-0.5 bg-card rounded font-mono text-sky-300">/vincular</code> acima.
                  <br />
                  2. Envie mensagens de voz ou textos diretamente no chat do Bot.
                  <br />
                  3. Consulte saldos com <code className="px-1 py-0.5 bg-card rounded font-mono text-sky-300">/saldo</code> ou pergunte sobre suas finanças com IA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


