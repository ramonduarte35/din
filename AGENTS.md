# 🧠 Memória e Regras do Projeto Din

Este arquivo contém as diretrizes mandatórias de desenvolvimento para este repositório.

---

## 📱 1. Frontend 100% Mobile First
- **Todas as modificações ou criações no frontend (`frontend/`) DEVEM ser desenvolvidas com abordagem Mobile First.**
- Estilos padrão sem prefixo no Tailwind aplicam-se a telas de smartphones (< 640px).
- Modificadores como `sm:`, `md:`, `lg:`, `xl:` são usados apenas para aprimoramento progressivo em telas maiores.
- Touch targets com área mínima de 44x44px (`p-2.5`/`p-3`).
- Tabelas com rolagem horizontal suave (`overflow-x-auto`) ou transformação em cards no mobile.
- Modais e formulários com suporte a rolagem vertical em telas baixas (`max-h-[90vh]`) e inputs com tamanho de fonte adequado para evitar zoom automático em navegadores mobile.

---

## 🛡️ 2. Agente de Auditoria de Segurança Pós-Demanda
- **Ao concluir qualquer demanda ou alteração de código, o agente de segurança deve ser executado para verificar o código antes da entrega final.**
- **Checklist de Varredura:**
  1. **Ausência de Hardcode:** Nenhuma API Key (OpenAI, Evolution), JWT Secret, senha ou token gravado diretamente no código fonte. Todos os dados sensíveis devem vir do `.env` e `env.ts`.
  2. **Controle de Acesso (RBAC & Multi-tenant):** Rotas administrativas protegidas com `requireAdmin` e rotas de usuário isoladas por `user_id`.
  3. **Sanitização de Dados:** Validação de entradas com schemas Zod e queries seguras parametrizadas pelo Prisma.
  4. **Segurança de Containers:** Arquivos `.env` e chaves confidenciais excluídos via `.dockerignore` e `.gitignore`.
- **Relatório Obrigatório:** Sempre incluir o checklist de segurança resumido na resposta final da demanda.

---

## 🗄️ 3. Evolução de Banco de Dados Obrigatória via Migrations
- **Sempre que novos campos, tabelas, enums, índices ou relações forem criados ou alterados, a alteração DEVE ser feita obrigatoriamente através de migrations formais do Prisma (`npx prisma migrate dev --name <nome_da_migracao>`).**
- O histórico de migrations em `backend/prisma/migrations/` é o controle de versão oficial do banco de dados para deploy e produção.
- Nos scripts de deploy (`deploy.sh`, `run-docker.sh`, `run-docker-macbook.sh`), a sincronização de banco de dados deve sempre executar `prisma migrate deploy` para aplicar todas as migrations pendentes de forma segura, garantindo que as tabelas sejam atualizadas automaticamente a cada deploy.
