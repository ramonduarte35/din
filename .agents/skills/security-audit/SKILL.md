---
name: security-audit
description: >-
  Audits the codebase for hardcoded secrets, security vulnerabilities, unauthenticated routes,
  and unsafe patterns upon concluding any development demand.
---

# 🛡️ Security Audit Agent (Agente de Auditoria de Segurança)

Este agente é responsável por realizar a varredura automática de segurança sempre que uma demanda for concluída no projeto Din.

## 🎯 Objetivos da Auditoria

1. **Varredura de Hardcode & Chaves de API**:
   - Procurar por padrões de chaves sensíveis:
     - OpenAI API keys (`sk-[a-zA-Z0-9_-]{20,}`)
     - JWT Secrets fixados em código fonte
     - Senhas estáticas de banco de dados (`postgres://...` com senha real)
     - Tokens de webhook e API keys de WhatsApp
   - Garantir que todos os valores padrão em `.env.example` sejam fictícios e que valores reais sejam obtidos via `process.env`.

2. **Verificação de Permissões & Rotas (Backend Fastify)**:
   - Rotas sob `/admin/*` DEVEM possuir o middleware `requireAdmin`.
   - Rotas sob `/api/v1/transactions/*`, `/api/v1/categories/*`, `/api/v1/users/*` DEVEM possuir `requireAuth`.
   - Queries de transações DEVEM filtrar `where: { user_id: request.user.userId }` para impedir vazamento de dados entre contas.

3. **Verificação de Entrada e Sanitização**:
   - Todo endpoint de escrita (`POST`, `PUT`, `PATCH`, `DELETE`) deve usar Zod para validação.
   - Nenhuma query `raw` no PostgreSQL deve concatenar strings não validadas.

4. **Verificação de Docker & Container Security**:
   - Arquivos `.dockerignore` não devem permitir envio de `.env`, `.git` ou arquivos confidenciais para as imagens.
   - Volumes e portas expostas devem estar devidamente mapeados.

## 🔍 Procedimento de Execução do Agente

1. Analisar as alterações recentes com `git diff` ou inspecionar os arquivos modificados.
2. Executar buscas por palavras-chave sensíveis se necessário (`grep_search` para `sk-`, `password:`, `secret:`, `Bearer `).
3. Confirmar que não há arquivos sensíveis não rastreados prontos para commit.
4. Emitir o parecer de segurança no relatório final para o usuário.
