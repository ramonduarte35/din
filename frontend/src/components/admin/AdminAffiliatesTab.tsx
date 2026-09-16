import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';
import {
  AffiliateBanner,
  AdminAffiliatesResponse,
  CreateAffiliateBannerPayload,
  fetchAdminAffiliateBanners,
  createAdminAffiliateBanner,
  updateAdminAffiliateBanner,
  toggleAdminAffiliateBanner,
  deleteAdminAffiliateBanner,
} from '../../api/affiliates';

export const AdminAffiliatesTab: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<AdminAffiliatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros
  const [placementFilter, setPlacementFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AffiliateBanner | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateAffiliateBannerPayload>({
    title: '',
    description: '',
    image_url: '',
    badge_text: 'Parceiro Recomendado',
    cta_text: 'Saiba Mais',
    target_url: '',
    placement: 'DASHBOARD',
    is_active: true,
    display_order: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminAffiliateBanners({
        placement: placementFilter,
        is_active: statusFilter,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Erro ao carregar banners de afiliados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [placementFilter, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      badge_text: 'Parceiro Recomendado',
      cta_text: 'Saiba Mais',
      target_url: '',
      placement: 'DASHBOARD',
      is_active: true,
      display_order: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: AffiliateBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url || '',
      badge_text: banner.badge_text || '',
      cta_text: banner.cta_text,
      target_url: banner.target_url,
      placement: banner.placement,
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.target_url.trim()) {
      toast.error('Título e URL de destino são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBanner) {
        await updateAdminAffiliateBanner(editingBanner.id, formData);
        toast.success('Banner de afiliado atualizado com sucesso!');
      } else {
        await createAdminAffiliateBanner(formData);
        toast.success('Banner de afiliado criado com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao salvar banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (banner: AffiliateBanner) => {
    try {
      await toggleAdminAffiliateBanner(banner.id);
      toast.success(`Banner ${!banner.is_active ? 'ativado' : 'desativado'} com sucesso!`);
      loadData();
    } catch (err: any) {
      toast.error('Erro ao alterar status do banner');
    }
  };

  const handleDelete = async (banner: AffiliateBanner) => {
    if (!window.confirm(`Tem certeza que deseja remover o banner "${banner.title}"?`)) {
      return;
    }

    try {
      await deleteAdminAffiliateBanner(banner.id);
      toast.success('Banner removido com sucesso!');
      loadData();
    } catch (err: any) {
      toast.error('Erro ao remover banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cards de Métricas Gerais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-din-muted font-medium">Banners Ativos</p>
              <h3 className="text-lg font-bold text-foreground">
                {data?.metrics.active_banners ?? 0}{' '}
                <span className="text-xs font-normal text-din-muted">
                  / {data?.metrics.total_banners ?? 0}
                </span>
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-din-muted font-medium">Visualizações (Views)</p>
              <h3 className="text-lg font-bold text-foreground">
                {data?.metrics.total_views.toLocaleString('pt-BR') ?? 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <MousePointerClick className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-din-muted font-medium">Cliques Gerados</p>
              <h3 className="text-lg font-bold text-foreground">
                {data?.metrics.total_clicks.toLocaleString('pt-BR') ?? 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-din-muted font-medium">CTR Médio</p>
              <h3 className="text-lg font-bold text-foreground">
                {data?.metrics.overall_ctr.toFixed(2) ?? '0.00'}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Barra Superior com Filtros & Botão de Criação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todas as Posições</option>
            <option value="DASHBOARD">Dashboard</option>
            <option value="TRANSACTIONS">Extrato de Transações</option>
            <option value="BILLS">Contas a Pagar</option>
            <option value="GLOBAL">Global (Todas as telas)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="TRUE">Ativos</option>
            <option value="FALSE">Inativos</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-10 px-3 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="h-11 gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Banner de Afiliado</span>
        </Button>
      </div>

      {/* 3. Listagem de Banners */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : !data?.banners || data.banners.length === 0 ? (
        <Card className="p-8 text-center bg-card/40 border-border/80">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border text-din-muted mb-3">
            <Tag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Nenhum banner encontrado</h3>
          <p className="mt-1 text-xs text-din-muted max-w-sm mx-auto">
            Cadastre ofertas de parceiros (bancos, cartões, contabilidade) para monetizar os usuários gratuitos do Din.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="mt-4 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-10 px-4 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Primeiro Banner</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.banners.map((banner) => (
            <Card
              key={banner.id}
              className={`p-4 transition-all border-border/80 bg-card/60 ${
                !banner.is_active ? 'opacity-60 bg-card/30' : ''
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Imagem + Textos */}
                <div className="flex items-start gap-3.5">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover border border-border/60 bg-card"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Tag className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {banner.title}
                      </span>
                      {banner.badge_text && (
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {banner.badge_text}
                        </span>
                      )}
                      <span className="rounded-md bg-din-muted/10 border border-border/50 px-2 py-0.5 text-[10px] font-medium text-din-muted">
                        {banner.placement}
                      </span>
                    </div>

                    {banner.description && (
                      <p className="text-xs text-din-muted line-clamp-1 mb-2">
                        {banner.description}
                      </p>
                    )}

                    {/* Métricas do Banner */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-din-muted">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-blue-400" />
                        <strong>{banner.views_count.toLocaleString('pt-BR')}</strong> views
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick className="h-3.5 w-3.5 text-purple-400" />
                        <strong>{banner.clicks_count.toLocaleString('pt-BR')}</strong> cliques
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                        <strong>{banner.ctr_percent?.toFixed(2) ?? '0.00'}%</strong> CTR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações (Touch target mínimo de 44px) */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={banner.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-din-muted hover:text-foreground transition-colors"
                    title="Testar Link de Afiliado"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => handleToggle(banner)}
                    className={`flex h-11 px-3 items-center gap-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      banner.is_active
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-din-muted/15 text-din-muted hover:bg-din-muted/25'
                    }`}
                  >
                    {banner.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{banner.is_active ? 'Ativo' : 'Pausado'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(banner)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-din-muted hover:text-emerald-400 transition-colors"
                    title="Editar Banner"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(banner)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Excluir Banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 4. Modal de Criação / Edição com Preview em Tempo Real */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Tag className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {editingBanner ? 'Editar Banner de Afiliado' : 'Novo Banner de Afiliado'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-din-muted hover:bg-muted/50 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Preview em tempo real */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-din-muted mb-2">
                  Pré-visualização (Como o usuário gratuito verá no app):
                </label>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-card/80 to-card/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex h-5 items-center gap-1 rounded-md bg-emerald-500/15 px-2 text-[10px] font-semibold text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      {formData.badge_text || 'Parceiro Recomendado'}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-din-muted/50">
                      Patrocinado
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="Logo"
                          className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border/60 bg-card"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <Tag className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">
                          {formData.title || 'Título da Oferta ou Parceiro'}
                        </h4>
                        <p className="text-[11px] text-din-muted line-clamp-1">
                          {formData.description || 'Descrição da oferta com vantagens para o usuário.'}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-emerald-500 px-3 text-[11px] font-semibold text-white">
                      <span>{formData.cta_text || 'Saiba Mais'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Campos do Formulário */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Título da Oferta / Empresa *
                  </label>
                  <Input
                    placeholder="Ex: Conta PJ Inter Empresas"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Descrição Curta / Vantagens
                  </label>
                  <Input
                    placeholder="Ex: Sem anuidade, PIX gratuito e maquininha com taxa zero"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Texto do Selo / Badge
                    </label>
                    <Input
                      placeholder="Ex: Parceiro Oficial, Oferta Especial"
                      value={formData.badge_text || ''}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Texto do Botão CTA
                    </label>
                    <Input
                      placeholder="Ex: Abrir Conta Grátis"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Link de Afiliado (URL de Destino) *
                  </label>
                  <Input
                    type="url"
                    placeholder="https://parceiro.com.br/din?utm_source=din_app"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      URL do Logo / Imagem (Opcional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/logo.png"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Posicionamento no App
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="DASHBOARD">Dashboard Principal</option>
                      <option value="TRANSACTIONS">Extrato de Transações</option>
                      <option value="BILLS">Contas a Pagar</option>
                      <option value="GLOBAL">Global (Todas as telas)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Ativar e exibir este banner imediatamente</span>
                  </label>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="h-11 rounded-xl text-xs px-4"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-5 font-semibold"
                >
                  {isSaving ? 'Salvando...' : editingBanner ? 'Atualizar Banner' : 'Criar Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
