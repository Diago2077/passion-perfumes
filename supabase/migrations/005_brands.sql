-- Brands table: drives both the "Marca" field on products and the
-- "Las mejores marcas" tag list on the landing page.
create table if not exists brands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table brands enable row level security;

drop policy if exists "Public read brands" on brands;
create policy "Public read brands" on brands for select using (active = true);

drop policy if exists "Admin manage brands" on brands;
create policy "Admin manage brands" on brands for all using (auth.role() = 'authenticated');

grant select on table brands to anon, authenticated;
grant insert, update, delete on table brands to authenticated;

-- New "brand" field on products, referencing brands.slug
alter table products add column if not exists brand text;
grant select on table products to anon, authenticated;

-- Seed from the brands already hardcoded in the app
insert into brands (name, slug, position) values
('Dior', 'dior', 1),
('Chanel', 'chanel', 2),
('YSL', 'ysl', 3),
('Lancôme', 'lancome', 4),
('Versace', 'versace', 5),
('Carolina Herrera', 'carolina-herrera', 6),
('Hugo Boss', 'hugo-boss', 7),
('Armani', 'armani', 8),
('Burberry', 'burberry', 9),
('Montale', 'montale', 10),
('Al Haramain', 'al-haramain', 11),
('Swiss Arabian', 'swiss-arabian', 12)
on conflict (slug) do nothing;
