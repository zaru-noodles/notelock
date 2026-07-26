insert into public.modules (id, title, "moduleCode", faculty, department) values
(3889, 'Data Structures and Algorithms', 'CS2040S', 'Computing', 'Computer Science');

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('notes', 'notes', false, array['application/pdf'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('thumbnail', 'thumbnail', false, array['image/png'])
on conflict (id) do nothing;

insert into public.tags (id, label) values
(1, 'Test Tag');

