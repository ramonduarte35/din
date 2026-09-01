import React from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { TransactionFilters, TransactionType, TransactionOrigin } from '../../api/transactions';
import { Category } from '../../api/categories';
import { Button } from '../ui/Button';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (filters: TransactionFilters) => void;
  onClear: () => void;
}

export function TransactionFiltersBar({
  filters,
  categories,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    !!filters.search ||
    !!filters.type ||
    !!filters.origin ||
    !!filters.category_id ||
    !!filters.start_date ||
    !!filters.end_date;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Busca por texto */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filtro por Tipo */}
        <div>
          <select
            value={filters.type || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                type: (e.target.value as TransactionType) || undefined,
                page: 1,
              })
            }
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Todos os Tipos</option>
            <option value="EXPENSE">🔴 Apenas Despesas</option>
            <option value="INCOME">🟢 Apenas Receitas</option>
          </select>
        </div>

        {/* Filtro por Origem */}
        <div>
          <select
            value={filters.origin || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                origin: (e.target.value as TransactionOrigin) || undefined,
                page: 1,
              })
            }
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Todas as Origens</option>
            <option value="WHATSAPP_TEXT">📱 WhatsApp (IA)</option>
            <option value="MANUAL">💻 Manual (Web)</option>
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div>
          <select
            value={filters.category_id || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                category_id: e.target.value || undefined,
                page: 1,
              })
            }
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === 'INCOME' ? 'Receita' : 'Despesa'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Linha secundária de filtros: Datas e Limpar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Período:</span>
          </span>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onChange({ ...filters, start_date: e.target.value, page: 1 })}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200"
          />
          <span className="text-slate-500">até</span>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onChange({ ...filters, end_date: e.target.value, page: 1 })}
            className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
