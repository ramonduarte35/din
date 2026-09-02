# 📱 Regra Obrigatória: Desenvolvimento Frontend Mobile First

Toda e qualquer alteração, criação ou refatoração no **Frontend (`frontend/`)** deve seguir rigorosamente a abordagem **Mobile First**.

---

## 📐 Diretrizes de Design & Código Mobile First

1. **Classes Tailwind Padrão = Mobile (< 640px)**
   - As classes sem prefixo (`p-4`, `text-sm`, `flex-col`, `w-full`) DEVEM estilizar a visualização em smartphones.
   - Use modificadores responsivos (`sm:`, `md:`, `lg:`, `xl:`) **exclusivamente para expandir / aprimorar** em telas maiores (tablets, notebooks e desktops).
   - **Proibido:** Criar componentes pensados para desktop e depois tentar "espremer" para mobile.

2. **Touch Targets & Ergonomia Mobile**
   - Todos os botões, links e ícones interativos devem ter área de clique mínima de **44x44px** (ou padding suficiente como `p-2.5` / `p-3`).
   - Espaçamento adequado entre botões para evitar toques acidentais em telas sensíveis ao toque.

3. **Tabelas e Listagens Responsivas**
   - Em telas pequenas, tabelas grandes devem possuir rolagem horizontal suave (`overflow-x-auto`) com indicação visual ou se transformar em cards empilhados.
   - Colunas secundárias podem ser ocultadas em mobile (`hidden sm:table-cell`).

4. **Modais, Drawers e Diálogos**
   - Modais devem se adaptar a telas pequenas com `max-h-[90vh]`, `overflow-y-auto`, largura `w-full max-w-lg` e botões de ação empilhados ou com rodapé fixo.
   - Em mobile, considere padrões como bottom sheets ou modais de tela cheia com botão de fechar acessível no topo.

5. **Formulários e Inputs**
   - Inputs devem ter tamanho de fonte de no mínimo `16px` (`text-base` em mobile ou `text-sm` com scaling apropriado) para evitar que navegadores mobile (como Safari no iOS) deem zoom involuntário ao focar no campo.
   - Teclados adequados: use `type="email"`, `type="tel"`, `type="number"`, `inputMode="numeric"` ou `inputMode="decimal"` onde aplicável.

6. **Prevenção de Quebras de Layout**
   - O layout raiz e containers principais nunca devem gerar overflow horizontal indesejado (`overflow-x-hidden`).
   - Textos longos devem usar `truncate` ou `break-words` para não estourar a largura da tela.
