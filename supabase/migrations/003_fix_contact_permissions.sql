-- Fix: "permission denied for table contact_messages"
-- RLS policies alone aren't enough — the anon/authenticated roles also need
-- explicit table-level GRANTs, which Supabase normally sets up automatically
-- but may be missing if the table was created outside the standard flow.

grant insert on table contact_messages to anon, authenticated;
grant select, update on table contact_messages to authenticated;

grant select on table products to anon, authenticated;
grant insert, update, delete on table products to authenticated;

-- Re-assert RLS policies in case they weren't applied
drop policy if exists "Anyone insert contact" on contact_messages;
create policy "Anyone insert contact" on contact_messages for insert with check (true);

drop policy if exists "Admin read contacts" on contact_messages;
create policy "Admin read contacts" on contact_messages for select using (auth.role() = 'authenticated');

drop policy if exists "Admin update contacts" on contact_messages;
create policy "Admin update contacts" on contact_messages for update using (auth.role() = 'authenticated');

drop policy if exists "Public read products" on products;
create policy "Public read products" on products for select using (active = true);

drop policy if exists "Admin manage products" on products;
create policy "Admin manage products" on products for all using (auth.role() = 'authenticated');
