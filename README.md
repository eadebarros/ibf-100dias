# IBF 100 Dias — Como atualizar o site

## O único arquivo que você edita
`data.json` — está na raiz do projeto. O site lê esse arquivo automaticamente.

---

## Como atualizar o status de um milestone

1. Abra `data.json`
2. Encontre o milestone pelo campo `"name"`
3. Altere o campo `"status"`:
   - `"upcoming"` → ainda não iniciado
   - `"active"` → em andamento
   - `"done"` → concluído
4. Salve o arquivo
5. Commit + push no GitHub → Railway reimplanta em ~1 minuto

---

## Como adicionar uma atualização no feed

1. Abra `data.json`
2. Vá para o array `"updates"`
3. Adicione um novo objeto **no início** do array:
```json
{
  "date": "15 abr 2026",
  "text": "Descrição do que aconteceu."
}
```
4. Push → Railway reimplanta

---

## Como adicionar um artefato a um milestone

1. Encontre o milestone no `data.json`
2. Substitua `"artifact": null` por:
```json
"artifact": {
  "type": "DOCUMENTO",
  "name": "Nome do artefato",
  "date": "15 abr 2026",
  "link": "https://link-opcional.com"
}
```

Tipos válidos: `DOCUMENTO` · `ORGANOGRAMA` · `APRESENTAÇÃO` · `DASHBOARD`

Se não houver link público, omita o campo `"link"` ou deixe `null`.

---

## Fluxo de deploy

```
Edita data.json → git add data.json → git commit -m "update" → git push → Railway reimplanta
```

O Railway está conectado ao repositório GitHub e faz deploy automático a cada push.

---

*IBF 100 Dias · Edu de Barros · Diretoria de Receita · 2026*
