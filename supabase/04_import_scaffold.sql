-- Temporary import table: adjust column names to match your Excel headers
create table if not exists public.liquor_catalog_tmp (
  item_code text,
  brand text,
  category text,
  name text,
  vintage text,
  abv_percent numeric(5,2),
  volume_ml int,
  pack_per_case int,
  pack_type text,
  origin_country_iso2 char(2),
  description text,
  image_url text
);

-- After uploading CSV into liquor_catalog_tmp, normalize:
insert into public.brands(name)
select distinct brand from public.liquor_catalog_tmp where brand is not null
on conflict (name) do nothing;

insert into public.categories(name)
select distinct category from public.liquor_catalog_tmp where category is not null
on conflict (name) do nothing;

insert into public.countries(iso2, name)
select distinct origin_country_iso2, origin_country_iso2 from public.liquor_catalog_tmp where origin_country_iso2 is not null
on conflict (iso2) do nothing;

insert into public.liquor_catalog(
  item_code, brand_id, category_id, name, vintage, abv_percent, volume_ml, pack_per_case, pack_type, origin_country_id, description, image_url
)
select
  t.item_code,
  (select id from public.brands b where b.name = t.brand),
  (select id from public.categories c where c.name = t.category),
  t.name, t.vintage, t.abv_percent, t.volume_ml, coalesce(t.pack_per_case, 6),
  cast(coalesce(t.pack_type, 'bottle') as pack_type),
  (select id from public.countries cc where cc.iso2 = t.origin_country_iso2),
  t.description, t.image_url
from public.liquor_catalog_tmp t
on conflict (item_code) do nothing;


