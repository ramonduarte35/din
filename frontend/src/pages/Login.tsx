import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao realizar login. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@din.app');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080d1a] bg-ambient-gradient relative overflow-hidden">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/20 mb-4">
            <Zap className="w-7 h-7 text-slate-950 fill-current" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Din <span className="text-emerald-400">Finance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão financeira inteligente com IA e integração direta no WhatsApp
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Acessar Conta</h2>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              Usar Conta Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Senha"
              type="password"
              placeholder="Sua senha secreta"
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

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full shadow-lg shadow-emerald-500/20 mt-2"
              isLoading={isLoading}
            >
              <span>Entrar no Din</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Ainda não tem uma conta?{' '}
            <NavLink to="/register" className="font-bold text-emerald-400 hover:underline">
              Cadastre-se gratuitamente
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
