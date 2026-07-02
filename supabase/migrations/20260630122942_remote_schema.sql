alter table "public"."note_tag" enable row level security;

alter table "public"."tags" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_notes_with_tags(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order)
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, username text, "deletePermission" boolean, tags jsonb)
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
    ) AS deletePermission,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', t.id, 'label', t.label))
        FROM note_tag nt
        JOIN tags t ON nt.tag_id = t.id
        WHERE nt.note_id = n.id
      ),
      '[]'::jsonb
    ) AS tags
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

CREATE OR REPLACE FUNCTION public.search_notes_with_tags(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order, tag_ids integer[] DEFAULT '{}'::integer[])
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, username text, "deletePermission" boolean, tags jsonb)
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
    ) AS deletePermission,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', t.id, 'label', t.label))
        FROM note_tag nt
        JOIN tags t ON nt.tag_id = t.id
        WHERE nt.note_id = n.id
      ),
      '[]'::jsonb
    ) AS tags
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
  AND (
    tag_ids = '{}' OR n.id IN (
      SELECT nt.note_id 
      FROM note_tag nt 
      WHERE nt.tag_id = ANY(tag_ids)
      GROUP BY nt.note_id
      HAVING COUNT(DISTINCT nt.tag_id) = array_length(tag_ids, 1)
    )
  )
  AND auth.uid() IS NOT NULL
  ORDER BY
    CASE WHEN sort_by = 'downloadCount' THEN n.download_count END DESC,
    CASE WHEN sort_by = 'semester' THEN n.semester END DESC
  LIMIT result_count
  OFFSET start_index; 
$function$
;

grant delete on table "public"."note_tag" to "anon";

grant insert on table "public"."note_tag" to "anon";

grant select on table "public"."note_tag" to "anon";

grant update on table "public"."note_tag" to "anon";

grant delete on table "public"."note_tag" to "authenticated";

grant insert on table "public"."note_tag" to "authenticated";

grant select on table "public"."note_tag" to "authenticated";

grant update on table "public"."note_tag" to "authenticated";

grant delete on table "public"."note_tag" to "service_role";

grant insert on table "public"."note_tag" to "service_role";

grant select on table "public"."note_tag" to "service_role";

grant update on table "public"."note_tag" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


  create policy "authenticated users can read note tags"
  on "public"."note_tag"
  as permissive
  for select
  to authenticated
using (true);



  create policy "authors can delete tags on own notes"
  on "public"."note_tag"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.notes n
  WHERE ((n.id = note_tag.note_id) AND ((n.author_id = auth.uid()) OR (( SELECT users.auth_level
           FROM public.users
          WHERE (users.id = auth.uid())) >= 2))))));



  create policy "authors can insert tags on own notes"
  on "public"."note_tag"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.notes n
  WHERE ((n.id = note_tag.note_id) AND ((n.author_id = auth.uid()) OR (( SELECT users.auth_level
           FROM public.users
          WHERE (users.id = auth.uid())) >= 2))))));



  create policy "authenticated users can read tags"
  on "public"."tags"
  as permissive
  for select
  to authenticated
using (true);



