#!/usr/bin/env bash
# ==============================================================================
# 👑 DIN - PROMOVER USUÁRIO A ADMINISTRADOR
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso: ./make-admin.sh <email_do_usuario>${NC}"
    echo -e "Exemplo: ./make-admin.sh seu-email@dominio.com"
    exit 1
fi

EMAIL="$1"

echo -e "\n${CYAN}🔍 Buscando e promovendo o usuário: ${BOLD}${EMAIL}${NC}..."

# Executa o UPDATE no PostgreSQL dentro do container db
RESULT=$(docker compose exec -T db psql -U postgres -d din -t -A -c "UPDATE users SET role = 'ADMIN' WHERE email = '${EMAIL}' RETURNING name, email, role;")

if [ -z "$RESULT" ]; then
    echo -e "${RED}❌ Usuário com o e-mail '${EMAIL}' não foi encontrado no banco de dados!${NC}"
    echo -e "Certifique-se de que a conta já foi criada na tela de Registro."
    exit 1
else
    NAME=$(echo "$RESULT" | cut -d '|' -f1)
    echo -e "${GREEN}✓ Sucesso! O usuário '${BOLD}${NAME} (${EMAIL})${NC}${GREEN}' agora é um ${BOLD}ADMINISTRADOR${NC}!${NC}"
    echo -e "\n${YELLOW}💡 Dica:${NC} Se você já estiver logado no painel web, faça ${BOLD}Logout e Login novamente${NC} para atualizar suas permissões na sessão.\n"
fi
