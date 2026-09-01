import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, User, Phone, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password, phone || undefined);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080d1a] bg-ambient-gradient relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/20 mb-3">
            <Zap className="w-7 h-7 text-slate-950 fill-current" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Criar Nova Conta</h1>
          <p className="text-xs text-slate-400 mt-1">
            Experimente o controle financeiro com assistente IA no seu WhatsApp
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Como prefere ser chamado?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="WhatsApp (com DDD)"
              placeholder="Ex: 86 99999-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-emerald-400" />}
              hint="Adicione seu número para o bot te reconhecer automaticamente"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Acesso Completo PRO liberado</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Teste todos os recursos com inteligência artificial sem limitações.
              </p>
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full shadow-lg shadow-emerald-500/20 mt-2"
              isLoading={isLoading}
            >
              <span>Cadastrar e Acessar</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Já possui uma conta no Din?{' '}
            <NavLink to="/login" className="font-bold text-emerald-400 hover:underline">
              Fazer Login
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
