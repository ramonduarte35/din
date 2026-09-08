# 🚫 Regra Obrigatória: Nunca Verificar nem Inspecionar Pastas node_modules

É terminantemente proibido ler, listar, auditar, buscar (`grep`), inspecionar ou verificar qualquer conteúdo dentro de diretórios `node_modules` no projeto Din (seja em `node_modules/`, `frontend/node_modules/`, `backend/node_modules/` ou em subpastas).

---

## 🎯 Diretrizes de Execução

1. **Exclusão em Ferramentas de Busca (`grep_search`, `find`, `rg`)**:
   - Sempre configure padrões de inclusão/exclusão para ignorar `node_modules` (ex: `Includes: ["!**/node_modules/**"]`).
   - Nunca defina `SearchPath` apontando para dentro de `node_modules`.

2. **Auditorias de Código e Segurança**:
   - Auditorias de código, verificações de tipos, linter e varreduras de segurança devem incidir **única e exclusivamente sobre o código-fonte proprietário da aplicação** (`frontend/src/`, `backend/src/`, `backend/prisma/`, scripts de automação, arquivos de configuração na raiz, etc.).
   - Não analise dependências de terceiros em `node_modules` durante revisões ou varreduras de código.

3. **Navegação e Leitura de Arquivos (`list_dir`, `view_file`)**:
   - Nunca navegue nem leia arquivos dentro de `node_modules`.
