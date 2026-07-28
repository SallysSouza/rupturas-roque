# Rupturas Roque

Monitoramento de rupturas de estoque das lojas **Forquilha, Angelim e Santa Inês**.

Stack: React + React Router + Vite + Tailwind CSS v4 + Supabase (auth, banco, realtime).

## ⚠️ Leia antes de subir para produção

Este projeto foi **reconstruído a partir do build de produção** (o app original só
existia como arquivos já compilados/minificados, sem repositório de código-fonte).
A reconstrução usou o que foi possível extrair com segurança do bundle: schema real
das tabelas, rotas, perfis, textos e paleta de cores. Ainda assim:

- **Teste tudo em um ambiente de homologação antes de substituir o sistema atual em produção.**
  Idealmente, aponte primeiro para uma cópia (branch) do seu projeto Supabase, não o de produção.
- Alguns detalhes de negócio podem ter pequenas diferenças do app original (ex: nomes
  exatos de algumas colunas menos usadas). Onde não havia certeza, deixei comentários
  no código (`// ...`) explicando a suposição feita.
- As políticas de segurança (RLS) em `supabase/migrations/0001_performance_and_security.sql`
  assumem que o perfil do usuário (`vendedor` / `comprador` / `admin`) fica em
  `user_metadata.role` do Supabase Auth, pois é assim que o app original lê o perfil.
  Se vocês guardam isso em outro lugar, me avisem para eu ajustar.

## Como rodar localmente

```bash
npm install
cp .env.example .env   # preencha com a URL e a chave "publishable" do seu projeto Supabase
npm run dev
```

## Antes de usar: rode a migração SQL

Abra o **SQL Editor** do seu projeto Supabase e rode o conteúdo de
`supabase/migrations/0001_performance_and_security.sql`. Ele:

- cria os índices que fazem a pesquisa de produtos ser instantânea mesmo com 20.000+ itens;
- ativa Row Level Security e restringe exclusões/edições de produtos e rupturas aos perfis
  `comprador`/`admin` — **isso é o que impede um vendedor de excluir dados mesmo se
  alguém tentar chamar a API diretamente**, e é tão importante quanto esconder o botão na tela.

## Dashboard

O Dashboard do perfil Comprador/Admin traz: indicadores rápidos, rupturas recentes,
gráfico de rupturas por status, rupturas em aberto por loja (Forquilha/Angelim/Santa Inês)
e a fila de produtos sem cadastro pendentes. O campo `loja` em `rupturas` e
`produtos_sem_cadastro` foi confirmado no bundle original (não é suposição). O perfil
Vendedor vê uma versão mais enxuta, só com o indicador de rupturas em análise.

## O que foi implementado (das 10 mudanças pedidas)

1. **Importação de produtos** — sem limite de 1.000: lê a planilha inteira no navegador e
   grava em lotes de 500 (`upsert` por código, então reimportar é seguro). Mostra progresso,
   quantidade importada/restante e percentual. Nenhuma linha válida é descartada; linhas sem
   código/descrição são reportadas ao final para revisão, não silenciosamente ignoradas.
2. **Pesquisa de produtos** — busca por código, descrição, departamento e subcategoria,
   com paginação real no servidor (`.range()`) e "carregar mais" (lazy loading), em vez de
   carregar a base inteira. Isso também resolve o limite de 1.000 registros na *listagem*
   (limite padrão do Supabase/PostgREST quando não se pagina).
3. **Exclusão de produtos** — perfil Comprador tem Editar e Excluir (exclusão definitiva,
   com confirmação), não só "Inativar".
4. **Exclusão de rupturas** — perfil Comprador tem Visualizar/Editar/Excluir com o texto de
   confirmação pedido.
5. **Layout modernizado** — mantendo exatamente a paleta original (azul/amarelo/cinza escuro,
   extraída do CSS do app atual), com cards mais limpos, cantos arredondados, mais espaçamento
   e ícones padronizados (lucide-react).
6. **Menu lateral retrátil** — hambúrguer no mobile, fixo no desktop, com nome/perfil/e-mail/avatar
   no topo e itens filtrados por perfil (Comprador vs Vendedor), conforme especificado.
7. **Minha Conta** — nome, perfil, e-mail, senha mascarada (`••••••••••`) e botão "Alterar senha".
8. **Logout** — botão "Sair deste login" com confirmação, que encerra a sessão no Supabase.
9. **Segurança pós-logout** — limpa local storage/cache do Supabase e o estado em memória;
   todas as rotas internas revalidam a sessão a cada navegação (inclusive ao usar "Voltar" do
   navegador), então uma tela protegida nunca fica visível sem sessão válida. *Observação
   honesta:* nenhum app web consegue desativar literalmente o botão "Voltar" do navegador —
   o que se consegue (e o que foi implementado) é garantir que, ao voltar, a tela protegida
   detecta a ausência de sessão e redireciona para o login antes de mostrar qualquer dado.
10. **Desempenho** — paginação em produtos, índices de banco (migração SQL acima) e busca
    otimizada. Recomendo also revisar, conforme a base crescer, se o plano do Supabase
    comporta o volume de conexões simultâneas esperado.

## Estrutura do projeto

```
src/
  components/   # componentes reutilizáveis (Sidebar, cards, diálogos, etc.)
  contexts/      # AuthContext (sessão, perfil, login/logout)
  hooks/         # useDebounce, useProdutosPaginados
  lib/           # menu.js (config do menu por perfil), importProdutos.js (importação em lote)
  pages/         # uma tela por arquivo
  routes/        # AppRoutes.jsx + ProtectedRoute.jsx
supabase/
  migrations/    # SQL para rodar no seu projeto Supabase
```
