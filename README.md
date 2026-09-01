# 💰 Din — Sistema Inteligente de Gestão Financeira Pessoal (Web & WhatsApp com IA via Evolution Go)

![Din Banner](https://img.shields.io/badge/Din-Finance%20IA-10b981?style=for-the-badge&logo=whatsapp&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Fastify%20%2B%20TypeScript-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Vite%20%2B%20TailwindCSS-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📖 1. Visão Geral

O **Din** é uma plataforma inteligente e completa de controle financeiro pessoal que integra dois canais de alta performance:

1. **Painel Web (Dashboard):** Gestão manual completa, KPIs em tempo real (saldo geral, receitas e despesas do mês), gráficos dinâmicos de categorias e comparativo mensal histórico (últimos 6 meses), extrato filtrável e paginado, listagem das linhas oficiais do WhatsApp do sistema e simulador interativo de IA.
2. **Bot Inteligente via WhatsApp (Módulo PRO):** Registro automático e em linguagem natural de receitas e despesas por mensagens de texto e áudio via WhatsApp, alimentado pela **OpenAI (`gpt-4o-mini`)** e intermediado pelo **Evolution Go**.
   - **Dinâmica Multi-Instância:** O sistema disponibiliza números oficiais (ex: Linha Principal, Linha Secundária 01, Linha Secundária 02). O usuário cadastra seu telefone no perfil e salva qualquer uma das linhas oficiais na sua agenda. Ao enviar uma mensagem de gasto ou ganho, o sistema identifica quem é o remetente, extrai os valores semânticos com IA e persiste na conta do usuário instantaneamente.

---

## 🏗️ 2. Arquitetura Conteinerizada (Docker)

O projeto é 100% orquestrado via `docker-compose.yml`:

| Serviço | Imagem / Container | Descrição |
|---|---|---|
| **`db`** | `postgres:16-alpine` | Banco de dados relacional com volume persistente e script multi-banco (`din`, `evogo_auth`, `evogo_users`). |
| **`redis`** | `redis:7-alpine` | Cache de deduplicação de mensagens e controle de idempotência do webhook. |
| **`evolution-go`** | `evoapicloud/evolution-go:latest` | Gateway de alta performance em Go para conexões WhatsApp e envio de webhooks. |
| **`api`** | `din-api` (Node 20 / Fastify / TS) | Backend RESTful, Prisma ORM, integração com OpenAI Structured Outputs e Evolution Client. |
| **`frontend`** | `din-frontend` (Nginx + React + Vite) | Painel Web moderno com tema dark glassmorphism e gráficos interativos. |

---

## 🚀 3. Como Executar o Sistema

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados na sua máquina.

### 3. Como Executar o Sistema

Você pode executar o sistema de forma 100% automatizada utilizando os scripts prontos:

#### A. Execução Local Rápida (Desenvolvimento / Testes):
```bash
./run-docker.sh
```
> O script cuidará de tudo: verificação de dependências, criação de diretórios, subida dos containers com Docker Compose, espera pela saúde do PostgreSQL, execução automática das migrações do Prisma e Seed com usuário Demo.

#### B. Deploy em Produção (Raspberry Pi 4/5 ARM64, VPS ou Servidor Cloud):
```bash
./deploy.sh
```
> O script detecta a arquitetura do hardware (ARM64/x86), atualiza o repositório (`git pull`), constrói imagens otimizadas, aplica migrações, limpa imagens antigas (`prune`) para economizar espaço em disco e exibe os IPs de acesso na sua rede local ou domínio.

5. **Acesse as aplicações:**
   - 🌐 **Painel Web (Frontend):** [http://localhost](http://localhost) (ou porta `80`)
   - ⚡ **API Backend (Fastify):** [http://localhost:3000/health](http://localhost:3000/health)
   - 📱 **Evolution Go Gateway:** [http://localhost:4000](http://localhost:4000)

---

## 🔑 4. Usuário de Demonstração (Seed)

Para testar imediatamente sem precisar criar uma conta do zero:
- **E-mail:** `demo@din.app`
- **Senha:** `123456`
- **Telefone cadastrado:** `5586999998888`
- **Plano:** `PRO`

*(Você também pode criar uma nova conta na tela de cadastro do painel web a qualquer momento).*

---

## 📱 5. Conectando os Números de WhatsApp no Evolution Go

Para parear seu WhatsApp corporativo/oficial com as instâncias do Evolution Go:

1. **Criar a instância:**
   ```bash
   curl -X POST http://localhost:4000/instance/create \
     -H "apikey: din_evolution_global_key_2026" \
     -H "Content-Type: application/json" \
     -d '{"instanceName": "din-finance-01", "qrcode": true}'
   ```

2. **Obter o QR Code para leitura no WhatsApp:**
   ```bash
   curl -X GET http://localhost:4000/instance/connect/din-finance-01 \
     -H "apikey: din_evolution_global_key_2026"
   ```
   *Leia o QR Code com o aplicativo WhatsApp no seu celular (Aparelhos Conectados).*

3. **Configurar o Webhook na Instância:**
   ```bash
   curl -X POST http://localhost:4000/webhook/set/din-finance-01 \
     -H "apikey: din_evolution_global_key_2026" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "http://api:3000/api/v1/webhooks/evolution",
       "webhook_by_events": false,
       "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
     }'
   ```

---

## 🧪 6. Simulador WhatsApp & IA Integrado

Para desenvolvedores e testes sem necessidade de escanear QR Code imediatamente, o painel web inclui a página **"Simulador WhatsApp"** (`/simulator`):

- Permite enviar mensagens simulando o webhook do Evolution Go em tempo real.
- Exibe a resposta formatada do bot do Din e o payload JSON extraído pela OpenAI.
- Testa frases brasileiras como:
  - *"Lanchei e gastei 20 conto"*
  - *"Recebi 1600 de salario"*
  - *"Gastei 50 de gasolina e 15 na padaria"*
  - *"Qual meu saldo do mês?"*

---

## 📡 7. Principais Endpoints da API RESTful

### Autenticação & Usuários
- `POST /api/v1/auth/register` — Criar conta
- `POST /api/v1/auth/login` — Login e geração de Token JWT
- `GET /api/v1/users/me` — Obter dados do perfil e plano
- `PUT /api/v1/users/profile` — Atualizar nome e telefone do WhatsApp

### Transações & Resumo Financeiro
- `GET /api/v1/transactions` — Listar transações com filtros (`start_date`, `end_date`, `type`, `category_id`, `origin`, `search`, `page`, `limit`)
- `POST /api/v1/transactions` — Criar transação manual
- `PUT /api/v1/transactions/:id` — Atualizar transação
- `DELETE /api/v1/transactions/:id` — Excluir transação
- `GET /api/v1/transactions/summary` — Resumo financeiro (KPIs, comparativo 6 meses, gráfico de categorias, transações recentes)

### Categorias & Números do Sistema
- `GET /api/v1/categories` — Listar categorias (globais + personalizadas do usuário)
- `POST /api/v1/categories` — Criar categoria personalizada
- `GET /api/v1/system-numbers` — Listar números oficiais de WhatsApp ativos

### Webhooks
- `POST /api/v1/webhooks/evolution` — Endpoint que recebe mensagens do Evolution Go
- `POST /api/v1/webhooks/simulate` — Endpoint de simulação rápida para desenvolvimento

---

## 🛡️ 8. Licença e Autoria
Desenvolvido para o ecossistema **Din — Inteligência Financeira**.
# din
