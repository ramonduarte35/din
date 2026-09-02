# 🔒 Regra Obrigatória: Auditoria de Segurança Pós-Demanda

Ao finalizar qualquer demanda, implementação de funcionalidade ou refatoração no projeto Din, o agente **DEVE executar uma auditoria de segurança ativa** antes de entregar o resultado ao usuário.

---

## 🛡️ Checklist de Verificação de Segurança (Mandatório)

### 1. Ausência de Hardcoded Secrets & Credenciais
- [ ] **Nenhuma chave de API exposta:** Proibido deixar chaves da OpenAI (`sk-...`), Evolution API keys, tokens de WhatsApp ou webhook secrets fixados em strings no código.
- [ ] **Nenhuma credencial de banco exposta:** `DATABASE_URL`, `POSTGRES_PASSWORD`, senhas de Redis e tokens JWT devem vir exclusivamente de variáveis de ambiente (`process.env` / `env.ts`).
- [ ] **Arquivos `.env` protegidos:** Garantir que arquivos `.env` com dados reais estejam listados no `.gitignore` e `.dockerignore`.

### 2. Autenticação & Autorização (RBAC)
- [ ] **Proteção de Rotas Administrativas:** Toda rota que gerencie instâncias, dados globais ou configurações críticas deve ter o hook `requireAdmin`.
- [ ] **Isolamento de Dados do Usuário (Multi-tenant):** Toda transação, categoria ou histórico deve ser filtrada obrigatoriamente por `user_id` do usuário logado na sessão JWT (`request.user.userId`).
- [ ] **Hashing de Senhas:** Senhas nunca são salvas ou comparadas em texto puro (uso obrigatório de `bcrypt` com salt rounds adequados).

### 3. Sanitização e Injeção de Dados
- [ ] **Validação com Zod:** Todos os payloads de `body`, `query` e `params` devem ser validados e sanitizados via schemas Zod.
- [ ] **Prevenção de SQL Injection:** Utilizar exclusivamente o Prisma Client com queries tipadas ou parâmetros bind (`$queryRaw` parametrizado).
- [ ] **Prevenção de Command Injection:** Comandos shell nunca devem concatenar inputs de usuários diretamente sem validação estrita.

### 4. Respostas Seguras & Headers
- [ ] **Sem vazamento de Stack Traces:** Respostas de erro não devem expor detalhes sensíveis da infraestrutura interna, senhas ou queries para o cliente.
- [ ] **CORS e Headers restritivos:** Garantir que o Fastify e Nginx estejam configurados com boas práticas de segurança.

---

## 📋 Formato de Saída no Encerramento de Cada Demanda

Ao concluir a tarefa, inclua um bloco resumido de conformidade de segurança:

```markdown
### 🛡️ Relatório de Auditoria de Segurança
- [x] Hardcoded Secrets: Nenhum segredo ou credencial estática encontrada.
- [x] Controle de Acesso (RBAC): Rotas e consultas devidamente protegidas por usuário/papel.
- [x] Sanitização de Inputs: Validações de entrada aplicadas com Zod/Prisma.
- [x] Variáveis de Ambiente & Docker: Configurações seguras e isoladas.
```
