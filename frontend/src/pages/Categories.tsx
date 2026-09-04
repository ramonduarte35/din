import React, { useState, useEffect } from 'react';
import { Category, getCategoriesRequest, deleteCategoryRequest } from '../api/categories';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { CategoryModal } from '../components/categories/CategoryModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import {
  Tag,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
  Layers,
} from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'CUSTOM'>('ALL');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const confirm = useConfirm();
  const toast = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategoriesRequest();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      toast.error('Erro ao carregar categorias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (cat: Category) => {
    const ok = await confirm({
      title: 'Excluir Categoria',
      message: `Deseja realmente excluir a categoria "${cat.name}"? As transações associadas não serão apagadas, mas perderão este vínculo.`,
      confirmText: 'Excluir Categoria',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deleteCategoryRequest(cat.id);
      toast.success('Categoria excluída com sucesso!');
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  const filteredCategories = categories.filter((c) => {
    // Busca por texto
    if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase().trim())) {
      return false;
    }

    if (activeTab === 'EXPENSE') return c.type === 'EXPENSE';
    if (activeTab === 'INCOME') return c.type === 'INCOME';
    if (activeTab === 'CUSTOM') return c.user_id !== null;

    return true;
  });

  const customCount = categories.filter((c) => c.user_id !== null).length;
  const expenseCount = categories.filter((c) => c.type === 'EXPENSE').length;
  const incomeCount = categories.filter((c) => c.type === 'INCOME').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
              Categorias Financeiras
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-din-muted mt-1">
            Gerencie e crie categorias personalizadas para organizar suas receitas e despesas
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto py-2.5 px-4 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card">
          <span className="text-[11px] font-semibold text-din-muted uppercase">Total</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-din-text mt-0.5">{categories.length}</p>
        </Card>
        <Card className="p-3.5 border-border bg-card">
          <span className="text-[11px] font-semibold text-rose-400 uppercase">Despesas</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-rose-400 mt-0.5">{expenseCount}</p>
        </Card>
        <Card className="p-3.5 border-border bg-card">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Receitas</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">{incomeCount}</p>
        </Card>
        <Card className="p-3.5 border-border bg-card">
          <span className="text-[11px] font-semibold text-din-primary uppercase">Personalizadas</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-din-primary mt-0.5">{customCount}</p>
        </Card>
      </div>

      {/* Filtros e Abas */}
      <Card className="p-3 sm:p-4 border-border bg-card space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          {/* Abas Rápidas */}
          <div className="flex items-center overflow-x-auto no-scrollbar space-x-1.5 pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'EXPENSE', label: 'Despesas' },
              { key: 'INCOME', label: 'Receitas' },
              { key: 'CUSTOM', label: `Personalizadas (${customCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 min-h-[44px] sm:min-h-[40px] ${
                  activeTab === tab.key
                    ? 'bg-din-primary text-white font-bold shadow-md shadow-din-primary/20'
                    : 'bg-card-secondary text-din-muted hover:text-din-text hover:bg-card-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-din-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 py-2 text-xs sm:text-sm h-10 min-h-[44px] sm:min-h-[40px]"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Categorias em Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-8 h-8" />}
          title="Nenhuma categoria encontrada"
          description={
            search.trim()
              ? `Nenhuma categoria com o termo "${search}" encontrada.`
              : 'Você ainda não possui categorias cadastradas com este filtro.'
          }
          actionText="Criar Nova Categoria"
          onAction={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          variant="emerald"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCategories.map((cat) => {
            const isCustom = cat.user_id !== null;
            const isExpense = cat.type === 'EXPENSE';

            return (
              <Card
                key={cat.id}
                className="p-4 border border-border bg-card rounded-3xl shadow-lg hover:border-din-primary/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Ícone com cor da categoria */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white font-bold"
                    style={{ backgroundColor: cat.color || (isExpense ? '#ef4444' : '#10b981') }}
                  >
                    <Tag className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-din-text text-sm sm:text-base truncate">
                        {cat.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isExpense
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isExpense ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        <span>{isExpense ? 'Despesa' : 'Receita'}</span>
                      </span>

                      {isCustom ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-din-primary/15 text-din-primary border border-din-primary/30">
                          Personalizada
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-card-secondary text-din-muted border border-border flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Padrão</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações (apenas para categorias personalizadas) */}
                {isCustom ? (
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      title="Editar Categoria"
                      className="p-2.5 rounded-xl bg-card-secondary hover:bg-card-hover text-din-muted hover:text-din-text transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-border"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      title="Excluir Categoria"
                      className="p-2.5 rounded-xl bg-card-secondary hover:bg-red-500/20 text-din-muted hover:text-red-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-border"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-din-muted p-2" title="Categoria protegida do sistema">
                    <Lock className="w-4 h-4 opacity-40" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={loadCategories}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}
