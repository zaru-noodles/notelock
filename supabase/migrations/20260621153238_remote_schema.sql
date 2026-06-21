alter table "public"."user_module" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email, username, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_download_count(p_note_id bigint)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update notes set download_count = coalesce(download_count, 0) + 1 where id = p_note_id;
$function$
;

CREATE OR REPLACE FUNCTION public.random_bigint()
 RETURNS bigint
 LANGUAGE sql
AS $function$
  SELECT floor(random() * 9223372036854775807)::bigint;
$function$
;

CREATE OR REPLACE FUNCTION public.search_notes(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order)
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, username text, "deletePermission" boolean)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    n.id::text,
    n.title,
    n.semester,
    m."moduleCode",
    n.download_count,
    up.username,
    (
      auth.uid() = n.author_id OR
      (SELECT auth_level FROM users WHERE id = auth.uid()) >= 2
    ) AS deletePermission
  FROM notes n
  JOIN modules m ON n.module_id = m.id
  LEFT JOIN user_profiles up ON n.author_id = up.id
  WHERE (module_code = '' OR m."moduleCode" = module_code)
  AND (
    search_query = '' OR similarity(n.title, search_query) > 0.1
  )
  AND (
    selected_semester = '' OR n.semester = selected_semester
  )
  AND (
    selected_author_id = '' OR n.author_id = selected_author_id::uuid
  )
  AND auth.uid() IS NOT NULL
  ORDER BY
    CASE WHEN sort_by = 'downloadCount' THEN n.download_count END DESC,
    CASE WHEN sort_by = 'semester' THEN n.semester END DESC
  LIMIT result_count
  OFFSET start_index; 
$function$
;

grant delete on table "public"."user_module" to "anon";

grant insert on table "public"."user_module" to "anon";

grant select on table "public"."user_module" to "anon";

grant update on table "public"."user_module" to "anon";

grant delete on table "public"."user_module" to "authenticated";

grant insert on table "public"."user_module" to "authenticated";

grant select on table "public"."user_module" to "authenticated";

grant update on table "public"."user_module" to "authenticated";

grant delete on table "public"."user_module" to "service_role";

grant insert on table "public"."user_module" to "service_role";

grant select on table "public"."user_module" to "service_role";

grant update on table "public"."user_module" to "service_role";


  create policy "users can delete own favourites"
  on "public"."user_module"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "users can insert own favourites"
  on "public"."user_module"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "users can read own favourites"
  on "public"."user_module"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



