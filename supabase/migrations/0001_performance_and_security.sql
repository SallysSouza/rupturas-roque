-- ============================================================================
-- Rupturas Roque — migração de performance e segurança
-- Rode este script no SQL Editor do seu projeto Supabase.
-- Ele NÃO apaga dados; só cria índices e políticas de acesso.
-- ============================================================================

-- 1) Necessário para os índices de busca por texto (ILIKE) ficarem rápidos
--    mesmo com 20.000+ produtos.
create extension if not exists pg_trgm;

-- 2) Índices GIN trigram: aceleram buscas com ILIKE '%termo%' em qualquer
--    posição do texto (a pesquisa por código/descrição/departamento/
--    subcategoria da tela "Gestão do Cadastro" e "Registrar Ruptura").
create index if not exists idx_produtos_codigo_trgm       on produtos       using gin (codigo       gin_trgm_ops);
create index if not exists idx_produtos_descricao_trgm    on produtos       using gin (descricao    gin_trgm_ops);
create index if not exists idx_produtos_departamento_trgm on produtos       using gin (departamento gin_trgm_ops);
create index if not exists idx_produtos_subcategoria_trgm on produtos       using gin (subcategoria gin_trgm_ops);

-- 3) Índices simples para as listagens ordenadas e filtros mais comuns.
create index if not exists idx_produtos_descricao       on produtos  (descricao);
create index if not exists idx_rupturas_status           on rupturas (status);
create index if not exists idx_rupturas_data_hora         on rupturas (data_hora desc);
create index if not exists idx_rupturas_criado_por        on rupturas (criado_por);
create index if not exists idx_rupturas_loja               on rupturas (loja);
create index if not exists idx_produtos_sem_cadastro_status on produtos_sem_cadastro (status);

-- ============================================================================
-- Segurança: exclusão definitiva restrita aos perfis Comprador/Admin.
-- Ajuste "role" abaixo caso o perfil esteja em outro lugar (ex: tabela
-- separada de usuários) — aqui assumimos que fica em
-- auth.users.raw_user_meta_data->>'role', como o app usa hoje.
-- ============================================================================

alter table produtos  enable row level security;
alter table rupturas   enable row level security;

drop policy if exists "produtos: leitura autenticada" on produtos;
create policy "produtos: leitura autenticada" on produtos
  for select using (auth.role() = 'authenticated');

drop policy if exists "produtos: escrita comprador/admin" on produtos;
create policy "produtos: escrita comprador/admin" on produtos
  for insert with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('comprador', 'admin')
  );

drop policy if exists "produtos: atualizacao comprador/admin" on produtos;
create policy "produtos: atualizacao comprador/admin" on produtos
  for update using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('comprador', 'admin')
  );

drop policy if exists "produtos: exclusao comprador/admin" on produtos;
create policy "produtos: exclusao comprador/admin" on produtos
  for delete using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('comprador', 'admin')
  );

drop policy if exists "rupturas: leitura autenticada" on rupturas;
create policy "rupturas: leitura autenticada" on rupturas
  for select using (auth.role() = 'authenticated');

drop policy if exists "rupturas: insercao autenticada" on rupturas;
create policy "rupturas: insercao autenticada" on rupturas
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "rupturas: atualizacao comprador/admin" on rupturas;
create policy "rupturas: atualizacao comprador/admin" on rupturas
  for update using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('comprador', 'admin')
  );

drop policy if exists "rupturas: exclusao comprador/admin" on rupturas;
create policy "rupturas: exclusao comprador/admin" on rupturas
  for delete using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('comprador', 'admin')
  );
