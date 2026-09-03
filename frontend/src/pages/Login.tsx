import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, loginWithGoogle, googleClientId } = useAuth();
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

  const handleGoogleSuccess = async (credential: string) => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle(credential);
      navigate('/');
    } catch (err: any) {
      console.error('Erro na resposta do login com Google:', err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Falha ao autenticar com o Google. Tente novamente.';
      setError(serverMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background bg-ambient-gradient relative overflow-hidden transition-colors duration-300">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-din-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/20 mb-4">
            <Zap className="w-7 h-7 text-slate-950 fill-current" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-din-text">
            Din <span className="text-din-primary">Finance</span>
          </h1>
          <p className="text-xs text-din-muted mt-1">
            Gestão financeira inteligente com IA e integração direta no WhatsApp
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border backdrop-blur-2xl shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">Acessar Conta</h2>
            <p className="text-xs text-slate-400 mt-0.5">Entre com sua conta Google ou com seu e-mail e senha</p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-2">
            {googleClientId ? (
              <div className="w-full flex justify-center min-h-[44px]">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleSuccess(credentialResponse.credential);
                    }
                  }}
                  onError={() => {
                    setError('Não foi possível autenticar com o Google. Tente novamente.');
                  }}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  locale="pt-BR"
                  width="100%"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setError(
                    'Para habilitar o login com o Google, configure a variável VITE_GOOGLE_CLIENT_ID no arquivo .env.'
                  )
                }
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-all shadow-sm min-h-[44px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>
            )}

            {isGoogleLoading && (
              <p className="text-center text-xs text-emerald-400 font-medium animate-pulse">
                Autenticando com o Google...
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800/90 w-full" />
            <span className="bg-slate-900/90 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              ou com seu e-mail
            </span>
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
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full shadow-lg shadow-emerald-500/20 mt-2 min-h-[44px]"
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

