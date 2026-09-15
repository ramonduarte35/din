# 🚀 Catálogo Oficial de Funcionalidades Din (SaaS)

> **Documento de Referência para Landing Page & Marketing**  
> *Este arquivo centraliza o inventário completo de recursos do sistema Din, discriminando a disponibilidade entre a versão **Grátis para Sempre** e a versão **PRO**, com orientações obrigatórias de atualização contínua.*

---

## 💎 1. Proposta de Valor do Din

O **Din** é um ecossistema completo e inteligente de gestão financeira pessoal e empresarial, desenvolvido com abordagem **Mobile First**, desenhado para transformar mensagens cotidianas de áudio e texto em controle financeiro rigoroso através de Inteligência Artificial de última geração.

### O Grande Diferencial
- **Zero Atrito:** Lance suas despesas e receitas apenas enviando um áudio ou texto pelo mensageiro que você já usa no dia a dia.
- **Inteligência Artificial Nativa:** Reconhecimento automático de valor, categoria, conta bancária e data, além de provisionamento inteligente de contas a pagar/receber.
- **Liberdade de Escolha:** Use **gratuitamente para sempre no Telegram** ou faça o upgrade para o **PRO** e tenha o assistente oficial direto no **WhatsApp** com experiência **100% livre de anúncios**.

---

## 📊 2. Matriz Comparativa: Grátis para Sempre vs PRO

| Recurso / Funcionalidade | 🆓 Plano Grátis (Para Sempre) | ⭐ Plano PRO |
| :--- | :---: | :---: |
| **Investimento** | **R$ 0,00** / vitalício | **R$ 19,90/mês** ou **R$ 199,00/ano** |
| **Assistente no Telegram (Áudio & Texto com IA)** | ✅ **Ilimitado** | ✅ **Ilimitado** |
| **Assistente no WhatsApp (Áudio Whisper & Texto)** | ❌ Bloqueado *(Aviso amigável + upgrade)* | ✅ **Ilimitado** *(Evolution Go & Meta Oficial)* |
| **Experiência Visual no Painel Web** | ⚠️ Com Anúncios Patrocinados (Google AdSense) | 🚫 **100% Livre de Anúncios** |
| **Transcrição de Áudio via Whisper OpenAI** | ✅ *(Via Telegram)* | ✅ *(Via WhatsApp e Telegram)* |
| **Compreensão de Linguagem Natural (gpt-4o-mini)** | ✅ | ✅ |
| **Lançamento de Transações (Receitas & Despesas)** | ✅ Ilimitado | ✅ Ilimitado |
| **Múltiplas Contas Bancárias & Carteiras** | ✅ Ilimitado | ✅ Ilimitado |
| **Categorias de Despesas e Receitas Customizáveis** | ✅ Ilimitado | ✅ Ilimitado |
| **Gestão de Contas a Pagar (Boletos, Contratos)** | ✅ Com status e vencimento | ✅ Com status e vencimento |
| **Gestão de Contas a Receber (Vendas, Cobranças)** | ✅ Com status e vencimento | ✅ Com status e vencimento |
| **Agenda de Contatos (Pessoa Física & Jurídica)** | ✅ Ilimitado | ✅ Ilimitado |
| **Orçamentos Mensais por Categoria** | ✅ Com barra de progresso | ✅ Com barra de progresso |
| **Objetivos e Metas Financeiras** | ✅ Com cálculo de metas | ✅ Com cálculo de metas |
| **Simulador de Gastos com Assistente IA** | ✅ Análise preditiva | ✅ Análise preditiva |
| **Aplicativo PWA (Instalação no Celular e PC)** | ✅ Funciona offline | ✅ Funciona offline |
| **Temas e Paletas de Cores Personalizadas** | ✅ 4 temas visuais | ✅ 4 temas visuais |
| **Segurança e Conformidade LGPD** | ✅ Painel de privacidade e termos | ✅ Painel de privacidade e termos |
| **Formas de Pagamento do Plano** | — | PIX Dinâmico (QR Code), Cartão e Boleto (Asaas) |

---

## 🛠️ 3. Detalhamento Módulo por Módulo

### 3.1. Assistentes por Mensageiros (WhatsApp & Telegram)
- **Telegram Bot Oficial:**
  - Disponível **sem custo** para todos os usuários do plano Grátis e PRO.
  - Vinculação de conta com 1 clique (deep link) ou compartilhamento de contato telefônico.
  - Suporte completo a mensagens de voz transcrevendo áudios via Whisper OpenAI.
  - Reconhecimento automático de despesas e receitas em linguagem natural.
  - Comandos rápidos de consulta: `/saldo`, `/ajuda`, `/vincular`.
- **WhatsApp Oficial (PRO Exclusivo):**
  - Conexão multi-instância (Evolution Go ou Cloud API Oficial Meta).
  - Reconhecimento automático do número do remetente sem necessidade de tokens manuais.
  - Transcrição de áudios de voz e mensagens de texto instantâneas.
  - Respostas inteligentes com feedback financeiro imediato e emojis amigáveis.
  - *No plano Free:* O bot detecta o usuário e responde educadamente explicando que o WhatsApp é uma exclusividade do plano PRO, apontando o link para upgrade e lembrando que o Telegram é 100% gratuito.

### 3.2. Painel Web & Gestão Financeira
- **Dashboard Geral:**
  - Cards de Saldo Total, Total de Receitas, Total de Despesas e Saldo Previsto.
  - Gráficos visuais por categoria e evolução temporal.
  - Acesso rápido a lançamentos manuais com modais responsivos.
- **Contas Bancárias & Carteiras:**
  - Gestão de contas corrente, poupança, investimentos, dinheiro físico e cartões.
  - Saldo inicial configurável e saldo calculado em tempo real.
  - Conta padrão inteligente para lançamentos via robôs.
- **Contas a Pagar (Bills):**
  - Controle de boletos, faturas e contas pendentes, pagas ou vencidas.
  - Parcelamento automático (parcelas N de X).
  - Associação com categorias e contatos PF/PJ.
  - Baixa de conta automática gerando transação real no banco.
- **Contas a Receber (Receivables):**
  - Gestão de honorários, vendas, aluguéis e pagamentos a receber.
  - Liquidação em conta selecionada com cálculo de juros/descontos.
- **Contatos & Fornecedores (PF/PJ):**
  - Cadastro de clientes, fornecedores e parceiros com CPF/CNPJ.
  - Visualização de todas as contas vinculadas a cada contato.
- **Orçamentos Mensais:**
  - Definição de teto de gastos por categoria por mês/ano.
  - Indicadores de alerta quando o limite está próximo ou foi ultrapassado.
- **Metas & Sonhos:**
  - Acompanhamento de objetivos financeiros com prazo e barra de progresso.
- **Simulador de Gastos com IA:**
  - Projeção de impacto de grandes despesas na saúde financeira antes de realizar a compra.

### 3.3. Experiência de Uso & Publicidade
- **Plano Grátis:**
  - Exibição de blocos de anúncios sutis (Google AdSense ou espaços patrocinados) no painel web, permitindo a sustentabilidade da operação gratuita.
- **Plano PRO:**
  - Interface 100% limpa e veloz, sem nenhum anúncio ou banner publicitário.
  - Badge visual de assinante ⭐ PRO no topo e no menu lateral.

### 3.4. Gateway de Pagamento Asaas
- **Integração Completa:**
  - Geração de cobranças e assinaturas via API v3 do Asaas.
  - Suporte a PIX com QR Code dinâmico e chave Copia e Cola instantânea.
  - Fatura hospedada no Asaas para pagamento com Cartão de Crédito ou Boleto Bancário.
  - Webhooks em tempo real para ativação imediata do plano PRO após confirmação bancária.
  - Controle formal de data de expiração e tolerância a inadimplência.

### 3.5. Área Administrativa (Admin Master)
- **Painel de Assinaturas & Planos:**
  - Métricas em tempo real: Total de usuários, Assinantes PRO ativos, Usuários Free, MRR (Receita Recorrente Mensal) e assinaturas a expirar em 7 dias.
  - Gestão de usuários com filtros por termo de busca, plano e status.
  - Ação manual para conceder plano PRO (+30 dias, +90 dias, +1 ano, Vitalício) ou rebaixar para Free.
  - Histórico de pagamentos e transações sincronizadas do Asaas.
- **Painel de Canais e Instâncias:**
  - Conexão e QR Code de instâncias WhatsApp (Evolution Go).
  - Configuração de credenciais oficiais Meta Cloud API e Bot Token do Telegram.
  - Logs detalhados de mensagens processadas e diagnóstico de status.

---

## 📌 4. Diretriz Mandatória para Desenvolvedores e Agentes

> [!IMPORTANT]
> **Regra de Atualização Contínua deste Arquivo:**
> Toda e qualquer nova funcionalidade, alteração de limite, novo canal de entrada ou novo recurso de inteligência artificial adicionado ao repositório **DEVE ser obrigatoriamente documentado nesta lista**, identificando claramente se pertence ao plano **Grátis** ou ao plano **PRO**.
> 
> Dessa forma, a equipe de marketing e criação da Landing Page sempre terá uma fonte da verdade atualizada e fidedigna.
