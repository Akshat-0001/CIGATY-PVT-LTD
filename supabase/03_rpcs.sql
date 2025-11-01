create or replace function public.approve_listing(p_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'not_admin';
  end if;
  update public.listings set status = 'approved', approved_at = now(), rejected_reason = null where id = p_id;
end $$;

create or replace function public.reject_listing(p_id uuid, reason text)
returns void language plpgsql security definer as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'not_admin';
  end if;
  update public.listings set status = 'rejected', rejected_reason = reason where id = p_id;
end $$;


