import React, { useState, useEffect } from 'react';
import { Goal, getGoalsRequest, deleteGoalRequest } from '../api/goals';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { GoalModal } from '../components/goals/GoalModal';
import { DepositModal } from '../components/goals/DepositModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import {
  Target,
  Plus,
  PiggyBank,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Sparkles,
  Trophy,
  Plane,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  Gem,
  Smartphone,
  ArrowUpRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  PiggyBank,
  Plane,
  Car,
  Home,
  Trophy,
  GraduationCap,
  Gem,
  Sparkles,
  Smartphone,
  HeartPulse,
};

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);

  const confirm = useConfirm();
  const toast = useToast();
  const { maskValue } = usePrivacy();

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const data = await getGoalsRequest();
      setGoals(data);
    } catch (err) {
      console.error('Erro ao carregar metas financeiras:', err);
      toast.error('Erro ao carregar metas financeiras.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDelete = async (goal: Goal) => {
    const ok = await confirm({
      title: 'Excluir Meta Financeira',
      message: `Deseja realmente excluir a meta "${goal.title}"? O histórico do cofrinho será removido.`,
      confirmText: 'Excluir Meta',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deleteGoalRequest(goal.id);
      toast.success('Meta excluída com sucesso!');
      loadGoals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao excluir meta.');
    }
  };

  const handleOpenDeposit = (goal: Goal) => {
    setSelectedGoalForDeposit(goal);
    setIsDepositModalOpen(true);
  };

  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const completedCount = goals.filter((g) => g.is_completed).length;
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'ACTIVE') return !g.is_completed;
    if (activeTab === 'COMPLETED') return g.is_completed;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
              Metas Financeiras & Cofrinhos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-din-muted mt-1">
            Defina objetivos, faça aportes inteligentes e visualize seu progresso de economia
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="w-full sm:w-auto py-2.5 px-4 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Meta</span>
        </Button>
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Guardado */}
        <Card className="p-4 border-border bg-card shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-din-muted font-semibold uppercase">Total Acumulado</span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
              {maskValue(totalSaved)}
            </p>
            <p className="text-[11px] text-din-muted mt-0.5">Guardado em todas as metas</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <PiggyBank className="w-5 h-5" />
          </div>
        </Card>

        {/* Meta Geral */}
        <Card className="p-4 border-border bg-card shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-din-muted font-semibold uppercase">Objetivo Total</span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-din-text mt-1">
              {maskValue(totalTarget)}
            </p>
            <p className="text-[11px] text-din-muted mt-0.5">Soma de todos os alvos</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <Target className="w-5 h-5" />
          </div>
        </Card>

        {/* Progresso Médio */}
        <Card className="p-4 border-border bg-card shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-din-muted font-semibold uppercase">Progresso Global</span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-teal-400 mt-1">
              {overallProgress}%
            </p>
            <p className="text-[11px] text-din-muted mt-0.5">Média de conclusão</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        {/* Concluídas */}
        <Card className="p-4 border-border bg-card shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-din-muted font-semibold uppercase">Metas Atingidas</span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
              {completedCount} de {goals.length}
            </p>
            <p className="text-[11px] text-din-muted mt-0.5">{completedCount === 1 ? 'meta conquistada' : 'metas conquistadas'}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filtros de Abas */}
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        {[
          { key: 'ALL', label: `Todas (${goals.length})` },
          { key: 'ACTIVE', label: `Em Andamento (${goals.length - completedCount})` },
          { key: 'COMPLETED', label: `Concluídas (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
              activeTab === tab.key
                ? 'bg-din-primary text-white font-bold shadow-md shadow-din-primary/20'
                : 'bg-card-secondary text-din-muted hover:text-din-text hover:bg-card-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid de Metas */}
      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="Nenhuma meta financeira encontrada"
          description={
            activeTab === 'COMPLETED'
              ? 'Você ainda não concluiu nenhuma meta financeira. Continue economizando!'
              : 'Crie sua primeira meta (ex: Reserva de Emergência) para começar a poupar.'
          }
          actionText="Criar Meta Financeira"
          onAction={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          variant="emerald"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const IconComponent = ICON_MAP[goal.icon] || Target;
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const isFinished = goal.is_completed || goal.current_amount >= goal.target_amount;

            let deadlineText = '';
            let isDeadlinePassed = false;
            if (goal.deadline) {
              const d = new Date(goal.deadline);
              const now = new Date();
              const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays < 0) {
                deadlineText = 'Prazo expirado';
                isDeadlinePassed = true;
              } else if (diffDays === 0) {
                deadlineText = 'Prazo termina hoje';
              } else {
                deadlineText = `Prazo: ${diffDays} dias restantes`;
              }
            }

            return (
              <Card
                key={goal.id}
                className={`p-5 border rounded-3xl shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  isFinished
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-500/5'
                    : 'bg-card border-border hover:border-din-primary/40'
                }`}
              >
                {/* Glow decorativo */}
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: goal.color || '#10b981' }}
                />

                <div className="space-y-4">
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white font-bold"
                        style={{ backgroundColor: goal.color || '#10b981' }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-din-text text-base truncate">
                          {goal.title}
                        </h3>
                        {isFinished ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Meta Conquistada 🎉</span>
                          </span>
                        ) : goal.deadline ? (
                          <span className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${
                            isDeadlinePassed ? 'text-rose-400' : 'text-din-muted'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{deadlineText}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-din-muted">Sem prazo fixo</span>
                        )}
                      </div>
                    </div>

                    {/* Menu de Edição / Exclusão */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-card-secondary hover:bg-card-hover text-din-muted hover:text-din-text transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-border"
                        title="Editar Meta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal)}
                        className="p-2 rounded-xl bg-card-secondary hover:bg-red-500/20 text-din-muted hover:text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-border"
                        title="Excluir Meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Valores & Progresso */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-din-muted block">Guardado</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          {maskValue(goal.current_amount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-din-muted block">Alvo</span>
                        <span className="text-sm font-semibold font-mono text-din-text">
                          {maskValue(goal.target_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full h-3 bg-card-secondary rounded-full overflow-hidden border border-border flex">
                      <div
                        className="h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{
                          width: `${goal.progress}%`,
                          backgroundColor: goal.color || '#10b981',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-din-muted pt-0.5">
                      <span className="font-bold text-din-text">{goal.progress}% atingido</span>
                      {!isFinished && remaining > 0 && (
                        <span>Faltam {maskValue(remaining)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Aporte Rápido */}
                <div className="pt-4 border-t border-border mt-4">
                  <Button
                    onClick={() => handleOpenDeposit(goal)}
                    variant={isFinished ? 'secondary' : 'emerald'}
                    className="w-full min-h-[44px] font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar Dinheiro (Aporte)</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={loadGoals}
        goalToEdit={editingGoal}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedGoalForDeposit(null);
        }}
        onSuccess={loadGoals}
        goal={selectedGoalForDeposit}
      />
    </div>
  );
}
