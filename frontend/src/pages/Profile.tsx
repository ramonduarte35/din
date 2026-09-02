import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changePasswordRequest } from '../api/auth';
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
} from 'lucide-react';

export function Profile() {
  const { user, updateProfile } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Configurações de Perfil & WhatsApp
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Gerencie suas informações cadastrais, segurança da conta e WhatsApp vinculado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Resumo do Plano e Status */}
        <Card className="md:col-span-1 space-y-4">
          <div className="text-center pb-4 border-b border-slate-800">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'Avatar'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-lg shadow-emerald-500/20 mb-3 border-2 border-emerald-400/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3 uppercase">
                {user?.name ? user.name.slice(0, 2) : 'D'}
              </div>
            )}
            <h3 className="font-bold text-base text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>

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

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Registro ilimitado de receitas/despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Inteligência Artificial gpt-4o-mini</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Integração multi-números WhatsApp</span>
            </div>
          </div>
        </Card>

        {/* Formulário de Dados Cadastrais */}
        <Card className="md:col-span-2 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Dados Cadastrais</h3>
            <p className="text-xs text-slate-400">
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
              icon={<Phone className="w-4 h-4 text-emerald-400" />}
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

      {/* Card de Segurança & Troca de Senha */}
      <Card className="space-y-5 border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              {user?.has_password ? 'Segurança da Conta (Alterar Senha)' : 'Segurança da Conta (Definir Senha de Acesso)'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
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
            icon={<Lock className="w-4 h-4 text-emerald-400" />}
            required
            className={user?.has_password ? '' : 'sm:col-span-1'}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-emerald-400" />}
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

      {/* Guia de Uso do WhatsApp */}
      <Card className="bg-gradient-to-r from-slate-900/80 to-[#0b1329] border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm">Como funciona o Bot do Din no WhatsApp?</h4>
            <p className="text-slate-300 leading-relaxed">
              1. Salve qualquer um dos números oficiais do Din exibidos no seu Dashboard na agenda do seu celular.
              <br />
              2. Certifique-se de que o seu número pessoal de WhatsApp está cadastrado exatamente igual no campo acima.
              <br />
              3. Envie mensagens normais como se estivesse conversando com um amigo (ex: <em>"Gastei 20 conto na padaria"</em> ou <em>"Recebi 1500 de salário"</em>).
              <br />
              4. O sistema identificará seu número, extrairá o valor e a categoria com IA e registrará tudo na sua conta instantaneamente!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

