#!/usr/bin/env bash

# ==============================================================================
# 🚀 DIN - SCRIPT DE EXECUÇÃO LOCAL COM DOCKER
# ==============================================================================

set -e

# Cores para saída no terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          💰 DIN - GESTÃO FINANCEIRA COM IA & WHATSAPP            ║"
echo "║                   Ambiente Local (Docker)                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Verificar se o Docker está instalado e em execução
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado! Por favor, instale o Docker antes de prosseguir.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ O daemon do Docker não está rodando. Inicie o serviço do Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker e Docker Compose detectados.${NC}"

# 2. Configurar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado.${NC}"
fi

# 3. Garantir que as pastas de persistência existam
mkdir -p data/postgres data/redis data/evolution
chmod +x docker/init-db.sh 2>/dev/null || true

# 4. Construir e inicializar containers
echo -e "\n${CYAN}📦 Construindo e inicializando containers com Docker...${NC}"
docker compose down --remove-orphans
docker compose up --build -d

# 5. Aguardar banco de dados estar pronto
echo -e "\n${CYAN}⏳ Aguardando banco de dados PostgreSQL inicializar...${NC}"
RETRIES=30
until docker compose exec -T db pg_isready -U postgres -d din &> /dev/null || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 2
    RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
    echo -e "\n${RED}❌ Timeout ao aguardar o PostgreSQL. Verifique os logs com: docker compose logs db${NC}"
    exit 1
fi
echo -e "\n${GREEN}✓ PostgreSQL pronto e saudável!${NC}"

# 6. Executar sincronização do banco de dados (Prisma) e Seed
echo -e "\n${CYAN}🔄 Sincronizando schema do banco de dados (Prisma db push)...${NC}"
docker compose exec -T api npx prisma db push --accept-data-loss

echo -e "\n${CYAN}🌱 Executando seed com dados iniciais e usuário demo...${NC}"
docker compose exec -T api npx tsx prisma/seed.ts

# 7. Resumo de Acesso
WEB_PORT=$(grep '^PORT_FRONTEND=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || echo "8000")
API_PORT=$(grep '^PORT_API=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || echo "3001")
EVO_PORT=$(grep '^PORT_EVOLUTION=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || echo "4000")
[ -z "$WEB_PORT" ] && WEB_PORT="8000"
[ -z "$API_PORT" ] && API_PORT="3001"
[ -z "$EVO_PORT" ] && EVO_PORT="4000"

echo -e "\n${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}🎉 SISTEMA DIN INICIALIZADO COM SUCESSO!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "🌐 ${BOLD}Painel Web (Dashboard):${NC}    http://localhost:${WEB_PORT}"
echo -e "⚡ ${BOLD}Backend API Fastify:${NC}       http://localhost:${API_PORT}/health"
echo -e "📱 ${BOLD}Evolution Go Gateway:${NC}      http://localhost:${EVO_PORT}"
echo -e "\n👤 ${BOLD}Credenciais da Conta Demo PRO:${NC}"
echo -e "   E-mail:   ${CYAN}demo@din.app${NC}"
echo -e "   Senha:    ${CYAN}123456${NC}"
echo -e "   WhatsApp: ${CYAN}5586999998888${NC}"
echo -e "\n💡 ${BOLD}Dica:${NC} Para ver os logs em tempo real, execute: ${YELLOW}docker compose logs -f${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}\n"
