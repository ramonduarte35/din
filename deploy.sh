#!/usr/bin/env bash

# ==============================================================================
# 🚀 DIN - SCRIPT DE DEPLOY EM PRODUÇÃO (RASPBERRY PI / VPS / SERVIDOR)
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          🚀 DIN - SCRIPT DE DEPLOY (PRODUÇÃO / VPS / RPI)         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Identificação do Hardware / Sistema
ARCH=$(uname -m)
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "SEU_IP_OU_DOMINIO")

echo -e "🖥️  ${BOLD}Arquitetura Detectada:${NC} ${CYAN}${ARCH}${NC}"
echo -e "📍 ${BOLD}IP Local do Servidor:${NC}   ${CYAN}${HOST_IP}${NC}"

# 2. Verificar dependências
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado no servidor. Instale o Docker com:${NC}"
    echo "curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 3. Atualizar código do repositório Git (se for um repositório git ativo)
if [ -d .git ] && [ "$1" != "--no-pull" ]; then
    echo -e "\n${CYAN}📥 Baixando atualizações mais recentes do Git...${NC}"
    git fetch origin
    git pull origin main || echo -e "${YELLOW}⚠️  Aviso: Não foi possível fazer git pull automático. Continuando com arquivos locais.${NC}"
fi

# 4. Validar arquivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado em produção!${NC}"
    echo -e "Criando arquivo .env a partir de .env.example..."
    cp .env.example .env
    echo -e "${RED}${BOLD}❗ ATENÇÃO: Edite o arquivo .env e configure sua OPENAI_API_KEY e JWT_SECRET fortes!${NC}"
fi

# 5. Criar diretórios persistentes e permissões
mkdir -p data/postgres data/redis data/evolution
chmod +x docker/init-db.sh 2>/dev/null || true

# 6. Build e Inicialização dos Containers
echo -e "\n${CYAN}🔨 Construindo imagens otimizadas para ${ARCH} e iniciando containers...${NC}"
docker compose up --build -d --remove-orphans

# 7. Aguardar o banco de dados PostgreSQL inicializar
echo -e "\n${CYAN}⏳ Verificando saúde do banco de dados PostgreSQL...${NC}"
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

echo -e "\n${GREEN}✓ PostgreSQL está online e pronto para receber conexões!${NC}"

# 8. Executar migrações do banco de dados
echo -e "\n${CYAN}🔄 Aplicando migrações do Prisma...${NC}"
docker compose exec -T api npx prisma migrate deploy

# 9. Executar seed inicial caso ainda não haja categorias
echo -e "\n${CYAN}🌱 Sincronizando categorias e números de WhatsApp oficiais...${NC}"
docker compose exec -T api npx prisma db seed

# 10. Limpeza de imagens antigas não utilizadas (vital para economizar espaço no Raspberry Pi)
echo -e "\n${CYAN}🧹 Limpando camadas de build e imagens antigas...${NC}"
docker image prune -f

# 11. Status dos containers
echo -e "\n${CYAN}📊 Status dos Containers Din:${NC}"
docker compose ps

# 12. Finalização e URLs de Acesso
echo -e "\n${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "🌐 ${BOLD}Painel Web:${NC}              http://${HOST_IP}  (ou http://localhost)"
echo -e "⚡ ${BOLD}API Backend:${NC}             http://${HOST_IP}:3000/health"
echo -e "📱 ${BOLD}Evolution Go Gateway:${NC}    http://${HOST_IP}:4000"
echo -e "\n💡 ${BOLD}Comandos Úteis em Produção:${NC}"
echo -e "   - Ver logs em tempo real:   ${YELLOW}docker compose logs -f${NC}"
echo -e "   - Reiniciar aplicação:      ${YELLOW}docker compose restart${NC}"
echo -e "   - Parar sistema:            ${YELLOW}docker compose down${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}\n"
