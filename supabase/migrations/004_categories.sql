-- Unified categories table: drives both the product category dropdown
-- and the "Explorá la colección" mosaic tiles on the landing page.
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table categories enable row level security;

drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories for select using (active = true);

drop policy if exists "Admin manage categories" on categories;
create policy "Admin manage categories" on categories for all using (auth.role() = 'authenticated');

grant select on table categories to anon, authenticated;
grant insert, update, delete on table categories to authenticated;

-- Seed from the categories already hardcoded in the app (slugs match
-- the values already used in products.category)
insert into categories (name, slug, image_url, position) values
('Perfumes Femeninos', 'femenino', 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 1),
('Perfumes Masculinos', 'masculino', 'https://images.unsplash.com/photo-1598634222670-87c5f558119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 2),
('Perfumes Árabes', 'arabe', 'https://images.unsplash.com/photo-1611146264101-358a3b387eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 3),
('Cosméticos', 'cosmetico', 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 4),
('Ofertas', 'oferta', 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 5),
('Novedades', 'novedad', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80', 6)
on conflict (slug) do nothing;
