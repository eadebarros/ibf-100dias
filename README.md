# IBF 100 Dias — Como atualizar

## Acesso ao admin
URL: `[seu-dominio]/admin`  
Senha: definida na variável `ADMIN_PASSWORD` do Railway (padrão local: `ibf2026`)

---

## O que você pode editar no admin

- Status de cada milestone (A iniciar · Em andamento · Concluído)
- Conteúdo rico de cada milestone (cole do ClickUp em Markdown)
- O que está por vir em milestones futuros
- Feed de atualizações recentes
- Artefatos entregues (documento, organograma, apresentação, dashboard)

---

## Campos de conteúdo

**O que foi feito** (`content`): aparece quando o milestone está Em andamento ou Concluído.  
Cole o conteúdo do ClickUp diretamente — aceita Markdown (títulos com `##`, listas com `-`, negrito com `**`).

**O que está por vir** (`expected_outcome`): aparece quando o milestone está A iniciar ou Em andamento.  
Descreva o que a Diretoria pode esperar desta entrega.

---

## Fluxo de atualização

1. Acesse `/admin`
2. Edite os campos necessários
3. Clique em **Salvar tudo**
4. As mudanças aparecem imediatamente no site público

Não é necessário fazer push no GitHub para atualizar conteúdo.

---

## Variáveis de ambiente no Railway

| Variável | Descrição |
|---|---|
| `ADMIN_PASSWORD` | Senha de acesso ao admin |
| `DATA_DIR` | Path do Volume persistente (ex: `/data`) |

---

## Deploy

O Railway está conectado ao GitHub e faz deploy automático a cada push.  
Conteúdo editado via admin é salvo no Volume persistente — **não é sobrescrito** por novos deploys.

---

*IBF 100 Dias · v2 · Edu de Barros · Diretoria de Receita · 2026*
