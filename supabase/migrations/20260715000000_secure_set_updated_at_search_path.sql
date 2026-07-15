-- Keep trigger execution independent from a caller-controlled search_path.
alter function public.set_updated_at() set search_path = '';
