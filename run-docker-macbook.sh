#!/usr/bin/env bash

# ==============================================================================
# 🍎 DIN - SCRIPT DE EXECUÇÃO DOCKER OTIMIZADO PARA MACBOOK (macOS)
# Suporta Apple Silicon (M1/M2/M3/M4 - ARM64) e Mac Intel (x86_64)
# ==============================================================================

set -e

# Cores e Estilos para o Terminal macOS
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Tratamento de flags / argumentos
AUTO_OPEN=true
FOLLOW_LOGS=false
REBUILD_FLAGS="--build"

for arg in "$@"; do
    case $arg in
        --no-open)
            AUTO_OPEN=false
            shift
            ;;
        --logs|-l)
            FOLLOW_LOGS=true
            shift
            ;;
        --rebuild)
            REBUILD_FLAGS="--build --no-cache"
            shift
            ;;
        --down|--stop)
            echo -e "${YELLOW}🛑 Parando todos os serviços do Din...${NC}"
            docker compose down
            echo -e "${GREEN}✓ Containers encerrados com sucesso.${NC}"
            exit 0
            ;;
        --help|-h)
            echo -e "${CYAN}${BOLD}Uso:${NC} ./run-docker-macbook.sh [opções]"
            echo ""
            echo "Opções disponíveis:"
            echo "  --no-open     Não abre o navegador automaticamente ao concluir"
            echo "  --logs, -l    Acompanha os logs em tempo real logo após a inicialização"
            echo "  --rebuild     Reconstrói as imagens do Docker sem usar cache"
            echo "  --down        Para e remove os containers do sistema Din"
            echo "  --help, -h    Exibe este menu de ajuda"
            exit 0
            ;;
    esac
done

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          🍎 DIN - GESTÃO FINANCEIRA COM IA & WHATSAPP            ║"
echo "║             Ambiente Docker Otimizado para MacBook               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Identificação do Hardware e Sistema no macOS
OS_TYPE=$(uname -s)
ARCH_TYPE=$(uname -m)

if [ "$OS_TYPE" != "Darwin" ]; then
    echo -e "${YELLOW}⚠️  Aviso: Este script foi otimizado para macOS (Darwin), mas você está em ${OS_TYPE}.${NC}"
    echo -e "Continuando execução padrão..."
fi

if [ "$ARCH_TYPE" = "arm64" ]; then
    echo -e "🍏 ${BOLD}Chip Detectado:${NC}       ${GREEN}Apple Silicon (${ARCH_TYPE} - M1/M2/M3/M4)${NC}"
elif [ "$ARCH_TYPE" = "x86_64" ]; then
    echo -e "💻 ${BOLD}Processador Detectado:${NC} ${CYAN}Intel Core (${ARCH_TYPE})${NC}"
else
    echo -e "💻 ${BOLD}Arquitetura:${NC}          ${CYAN}${ARCH_TYPE}${NC}"
fi

# 2. Verificar se o Docker CLI está instalado
if ! command -v docker &> /dev/null; then
    echo -e "\n${RED}❌ Docker não encontrado no seu MacBook!${NC}"
    echo -e "${YELLOW}Para instalar no macOS:${NC}"
    echo -e "  - Baixe o Docker Desktop: ${CYAN}https://www.docker.com/products/docker-desktop/${NC}"
    echo -e "  - Ou instale via Homebrew: ${CYAN}brew install --cask docker${NC}\n"
    exit 1
fi

# 3. Verificar e inicializar o Daemon do Docker no macOS
if ! docker info &> /dev/null; then
    echo -e "\n${YELLOW}⏳ O daemon do Docker não está rodando.${NC}"
    
    if [ -d "/Applications/Docker.app" ] || [ -d "$HOME/Applications/Docker.app" ]; then
        echo -e "${CYAN}🚀 Iniciando o Docker Desktop automaticamente no seu Mac...${NC}"
        open -a Docker
    elif [ -d "/Applications/OrbStack.app" ]; then
        echo -e "${CYAN}🚀 Iniciando o OrbStack automaticamente no seu Mac...${NC}"
        open -a OrbStack
    else
        echo -e "${RED}❌ Não foi possível encontrar o Docker Desktop em /Applications.${NC}"
        echo -e "Por favor, inicie o aplicativo do Docker manualmente e execute este script novamente."
        exit 1
    fi

    echo -e "${CYAN}Aguardando o serviço do Docker inicializar completamente...${NC}"
    DOCKER_TIMEOUT=60
    while ! docker info &> /dev/null; do
        echo -n "."
        sleep 2
        DOCKER_TIMEOUT=$((DOCKER_TIMEOUT - 2))
        if [ $DOCKER_TIMEOUT -le 0 ]; then
            echo -e "\n${RED}❌ Tempo limite esgotado esperando o Docker iniciar.${NC}"
            echo -e "Certifique-se de que o Docker Desktop abriu corretamente e tente novamente."
            exit 1
        fi
    done
    echo -e "\n${GREEN}✓ Docker Desktop iniciado e pronto!${NC}"
else
    echo -e "🐳 ${BOLD}Status do Docker:${NC}     ${GREEN}Online e Operacional${NC}"
fi

# 4. Configurar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado com sucesso!${NC}"
fi

# Carregar variáveis de porta do .env (com fallbacks)
WEB_PORT=$(grep '^PORT_FRONTEND=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$WEB_PORT" ] && WEB_PORT="8000"

API_PORT=$(grep '^PORT_API=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$API_PORT" ] && API_PORT="3001"

EVO_PORT=$(grep '^PORT_EVOLUTION=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$EVO_PORT" ] && EVO_PORT="4000"

PG_PORT=$(grep '^POSTGRES_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$PG_PORT" ] && PG_PORT="5434"

REDIS_PORT_VAL=$(grep '^REDIS_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$REDIS_PORT_VAL" ] && REDIS_PORT_VAL="6381"

ADMIN_EMAIL_VAL=$(grep '^ADMIN_EMAIL=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$ADMIN_EMAIL_VAL" ] && ADMIN_EMAIL_VAL="admin@din.app"

ADMIN_PASS_VAL=$(grep '^ADMIN_PASSWORD=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' "\r\n' || true)
[ -z "$ADMIN_PASS_VAL" ] && ADMIN_PASS_VAL="din_admin_password_2026"

# 5. Verificação de Conflitos de Portas no macOS
check_port() {
    local port=$1
    local name=$2
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | grep -q LISTEN; then
        # Verificar se quem está usando é o próprio docker
        local proc_name
        proc_name=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $1}')
        if [[ "$proc_name" != *"docker"* ]] && [[ "$proc_name" != *"com.dock"* ]] && [[ "$proc_name" != *"com.orbstack"* ]]; then
            echo -e "${YELLOW}⚠️  Atenção: A porta ${port} (${name}) já está em uso por '${proc_name}'.${NC}"
            echo -e "   Se houver erro de bind, altere a porta correspondente no arquivo .env."
        fi
    fi
}

check_port "$WEB_PORT" "Frontend Web"
check_port "$API_PORT" "API Backend"
check_port "$EVO_PORT" "Evolution Gateway"
check_port "$PG_PORT" "PostgreSQL"
check_port "$REDIS_PORT_VAL" "Redis"

# 6. Garantir que as pastas de persistência existam
mkdir -p data/postgres data/redis data/evolution
chmod +x docker/init-db.sh 2>/dev/null || true

# 7. Construir e inicializar containers
echo -e "\n${CYAN}📦 Construindo e inicializando containers (Docker Compose)...${NC}"
docker compose down --remove-orphans
docker compose up $REBUILD_FLAGS -d

# 8. Aguardar banco de dados estar pronto
echo -e "\n${CYAN}⏳ Aguardando banco de dados PostgreSQL inicializar...${NC}"
RETRIES=30
until docker compose exec -T db pg_isready -U postgres -d din &> /dev/null || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 2
    RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
    echo -e "\n${RED}❌ Timeout aguardando o banco PostgreSQL.${NC}"
    echo -e "Verifique os logs com: ${YELLOW}docker compose logs db${NC}"
    exit 1
fi
echo -e "\n${GREEN}✓ PostgreSQL pronto e saudável!${NC}"

# 9. Executar sincronização do banco de dados (Prisma) e Seed
echo -e "\n${CYAN}🔄 Sincronizando schema do banco de dados (Prisma db push)...${NC}"
docker compose exec -T api npx prisma db push --accept-data-loss

echo -e "\n${CYAN}🌱 Executando seed com dados iniciais e usuário demo...${NC}"
docker compose exec -T api npx tsx prisma/seed.ts

# 10. Resumo de Acesso
echo -e "\n${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}🎉 SISTEMA DIN INICIALIZADO COM SUCESSO NO MACBOOK!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "🌐 ${BOLD}Painel Web (Dashboard):${NC}    ${CYAN}http://localhost:${WEB_PORT}${NC}"
echo -e "⚡ ${BOLD}Backend API Fastify:${NC}       ${CYAN}http://localhost:${API_PORT}/health${NC}"
echo -e "📱 ${BOLD}Evolution Go Gateway:${NC}      ${CYAN}http://localhost:${EVO_PORT}${NC}"
echo -e "\n👤 ${BOLD}Credenciais do Administrador do Sistema (.env):${NC}"
echo -e "   E-mail:   ${CYAN}${ADMIN_EMAIL_VAL}${NC}"
echo -e "   Senha:    ${CYAN}${ADMIN_PASS_VAL}${NC}"
echo -e "\n💡 ${BOLD}Comandos Úteis no seu Mac:${NC}"
echo -e "   - Ver logs em tempo real:   ${YELLOW}docker compose logs -f${NC}"
echo -e "   - Parar todos os serviços:  ${YELLOW}./run-docker-macbook.sh --down${NC} ou ${YELLOW}docker compose down${NC}"
echo -e "   - Promover usuário a Admin: ${YELLOW}./make-admin.sh seu-email@dominio.com${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}\n"

# 11. Abrir navegador automaticamente no macOS
if [ "$AUTO_OPEN" = true ]; then
    echo -e "🚀 ${CYAN}Abrindo o Painel Web no seu navegador padrão...${NC}\n"
    sleep 1
    open "http://localhost:${WEB_PORT}" 2>/dev/null || true
fi

# 12. Acompanhar logs se solicitado
if [ "$FOLLOW_LOGS" = true ]; then
    echo -e "${CYAN}📡 Conectando ao fluxo de logs dos containers... (Pressione Ctrl+C para sair)${NC}\n"
    docker compose logs -f
fi
