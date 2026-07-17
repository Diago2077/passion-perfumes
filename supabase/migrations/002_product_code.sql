alter table products add column if not exists code text;

create unique index if not exists products_code_unique on products (code) where code is not null;
