# Convenção de Naming para Skills

## Regra Obrigatória

O **nome da pasta** de uma skill DEVE ser idêntico ao campo `name` no frontmatter do `SKILL.md`.

Exemplo correto:
```
.agents/skills/react-ux-specialist/SKILL.md  ← pasta = "react-ux-specialist"
---
name: react-ux-specialist                    ← name = "react-ux-specialist"
```

## Por Que Esta Regra Existe

O autocomplete `@` do IDE Antigravity indexa skills pelo **nome da pasta**.
Se a pasta se chama `ux-designer` mas o frontmatter diz `name: react-ux-specialist`,
a skill fica **invisível** no `@`.

## Checklist ao Criar ou Renomear uma Skill

1. Definir o `name` desejado no frontmatter do `SKILL.md`.
2. Garantir que o nome da pasta seja **idêntico** ao `name`.
3. Se renomeando uma skill existente, usar `mv` para renomear a pasta:
   ```bash
   mv .agents/skills/<nome-antigo> .agents/skills/<nome-novo>
   ```
4. Verificar com `ls .agents/skills/` se a pasta está correta.
