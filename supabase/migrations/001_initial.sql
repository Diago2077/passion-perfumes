-- products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2),
  category text, -- 'femenino' | 'masculino' | 'arabe' | 'cosmetico' | 'oferta' | 'novedad'
  image_url text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- contact_messages table
create table contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table products enable row level security;
alter table contact_messages enable row level security;

-- Public can read active products
create policy "Public read products" on products for select using (active = true);

-- Only authenticated users (admin) can manage products
create policy "Admin manage products" on products for all using (auth.role() = 'authenticated');

-- Anyone can insert contact messages
create policy "Anyone insert contact" on contact_messages for insert with check (true);

-- Only authenticated can read/update contact messages
create policy "Admin read contacts" on contact_messages for select using (auth.role() = 'authenticated');
create policy "Admin update contacts" on contact_messages for update using (auth.role() = 'authenticated');

-- Seed some products
insert into products (name, description, price, category, image_url, featured) values
('Rose Élixir', 'Una fragancia floral romántica con notas de rosa búlgara y jazmín blanco', 8500, 'femenino', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', true),
('Oud Noir', 'Perfume árabe intenso con madera de oud, ámbar y especias orientales', 12900, 'arabe', 'https://images.unsplash.com/photo-1594913007880-e6e6f0d89df3?w=400', true),
('Gentleman Élite', 'Fragancia masculina sofisticada con bergamota, cuero y sándalo', 9200, 'masculino', 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400', true),
('Gold Velvet', 'Perfume árabe lujoso con vainilla dorada, pachulí y rosa', 10400, 'arabe', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', true),
('Velvet Rouge', 'Labial de larga duración con acabado aterciopelado y fórmula hidratante', 3800, 'cosmetico', 'https://images.unsplash.com/photo-1586495777744-4e6232bf2e18?w=400', true),
('Aqua Fresca', 'Fragancia masculina fresca y marina, perfecta para el día a día', 7600, 'masculino', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', true);
