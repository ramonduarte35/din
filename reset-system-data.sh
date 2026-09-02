#!/usr/bin/env bash

# ==============================================================================
# ⚠️ DIN - SCRIPT DE RESET TOTAL E LIMPEZA DE DADOS
# ==============================================================================
# Este script apaga completamente os dados do banco de dados (PostgreSQL),
# sessões do WhatsApp (Evolution API), cache (Redis) e volumes do Docker.
# Útil após implantação, troca de servidor ou para iniciar um ambiente limpo.
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${RED}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          ⚠️  DIN - RESET TOTAL E LIMPEZA DE DADOS               ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}${BOLD}❗ ATENÇÃO: Esta ação é IRREVERSÍVEL!${NC}"
echo -e "Serão excluídos permanentemente:"
echo -e "  🗑️  Todas as transações, contas bancárias e orçamentos"
echo -e "  🗑️  Todos os usuários cadastrados no banco de dados"
echo -e "  🗑️  Todas as instâncias e sessões ativas do WhatsApp (Evolution API)"
echo -e "  🗑️  Todo o cache do Redis e arquivos de log"
echo -e "  🗑️  Todos os volumes do Docker (${CYAN}postgres_data${NC}, ${CYAN}redis_data${NC}, ${CYAN}evolution_data${NC})\n"

# 1. Confirmação de segurança (a menos que a flag --force ou -y seja informada)
if [ "$1" != "--force" ] && [ "$1" != "-y" ]; then
    echo -e "${BOLD}Para confirmar que deseja apagar TODOS os dados do sistema,${NC}"
    read -p "digite 'RESET' (em maiúsculas) e pressione Enter: " CONFIRMACAO

    if [ "$CONFIRMACAO" != "RESET" ]; then
        echo -e "\n${GREEN}✓ Operação cancelada. Nenhum dado foi alterado.${NC}\n"
        exit 0
    fi
fi

echo -e "\n${CYAN}🔄 [1/5] Parando e removendo containers do Docker...${NC}"
docker compose down -v --remove-orphans 2>/dev/null || true

echo -e "\n${CYAN}🔄 [2/5] Removendo volumes nomeados do Docker associados ao Din...${NC}"
VOLUMES=$(docker volume ls -q -f "name=din_" -f "name=contaszap_" 2>/dev/null || true)
if [ -n "$VOLUMES" ]; then
    echo "$VOLUMES" | xargs -r docker volume rm -f 2>/dev/null || true
    echo -e "${GREEN}✓ Volumes Docker removidos com sucesso.${NC}"
else
    echo -e "${GREEN}✓ Nenhum volume Docker antigo encontrado.${NC}"
fi

echo -e "\n${CYAN}🔄 [3/5] Limpando pastas de dados locais persistentes...${NC}"
rm -rf data/postgres/* data/redis/* data/evolution/* 2>/dev/null || true
rm -rf *.log backend/*.log frontend/*.log 2>/dev/null || true
echo -e "${GREEN}✓ Pastas locais data/ e logs limpos.${NC}"

echo -e "\n${CYAN}🔄 [4/5] Recriando diretórios essenciais e permissões...${NC}"
mkdir -p data/postgres data/redis data/evolution
chmod +x docker/init-db.sh 2>/dev/null || true
echo -e "${GREEN}✓ Estrutura de pastas recriada.${NC}"

echo -e "\n${CYAN}🔄 [5/5] Limpando cache e imagens órfãs do Docker...${NC}"
docker image prune -f 2>/dev/null || true

echo -e "\n${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}🎉 RESET DE DADOS CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "O ambiente agora está completamente limpo como uma nova instalação.\n"
echo -e "💡 ${BOLD}Próximos passos para reiniciar o sistema:${NC}"
echo -e "   - Para ambiente de Produção / Servidor VPS:  ${CYAN}./deploy.sh${NC}"
echo -e "   - Para ambiente Local Linux:                 ${CYAN}sudo ./run-docker.sh${NC}"
echo -e "   - Para ambiente MacBook (macOS):             ${CYAN}./run-docker-macbook.sh${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}\n"
