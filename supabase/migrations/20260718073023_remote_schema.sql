drop view if exists "public"."notes_with_votes";

set check_function_bodies = off;

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

create or replace view "public"."notes_with_votes" as  SELECT n.id,
    n.created_at,
    n.module_id,
    n.title,
    n.semester,
    n.download_count,
    n.author_id,
    count(v.*) FILTER (WHERE (v.value = 1)) AS ups,
    count(v.*) FILTER (WHERE (v.value = '-1'::integer)) AS downs
   FROM (public.notes n
     LEFT JOIN public.votes v ON ((v.note_id = n.id)))
  GROUP BY n.id;


CREATE OR REPLACE FUNCTION public.search_module(search_query text, result_count integer)
 RETURNS TABLE(id bigint, title text, "moduleCode" text, faculty text, department text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    m.id,
    m.title,
    m."moduleCode",
    m.faculty,
    m.department
  FROM modules m
  WHERE (
    search_query = '' 
    OR similarity(m."moduleCode", search_query) > 0.2 
    OR similarity(m.title, search_query) > 0.2
  )
  AND auth.uid() IS NOT NULL
  ORDER BY 
    GREATEST(
      similarity(m."moduleCode", search_query),
      similarity(m.title, search_query)
    ) DESC
  LIMIT result_count;
$function$
;

CREATE OR REPLACE FUNCTION public.search_notes_with_tags(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order, tag_ids integer[] DEFAULT '{}'::integer[])
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, "upvoteCount" integer, "downvoteCount" integer, "userId" uuid, username text, "deletePermission" boolean, tags jsonb, "thumbnailUrl" text, "thumbnailExpiry" timestamp with time zone, "totalCount" integer)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    n.id::text,
    n.title,
    n.semester,
    m."moduleCode",
    n.download_count,
    v.ups,
    v.downs,
    up.id,
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
    ) AS tags,
    n.thumbnail_url,
    n.thumbnail_expiry,
    COUNT(*) OVER() AS "totalCount"
  FROM notes n
  JOIN notes_with_votes as v ON n.id = v.id 
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
    CASE WHEN sort_by = 'semester' THEN n.semester END DESC,
    CASE WHEN sort_by = 'rating' THEN (v.ups * 2 - v.downs) END DESC
  LIMIT result_count
  OFFSET start_index; 
$function$
;

CREATE OR REPLACE FUNCTION public.set_binder_note_position()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  SELECT COUNT(*) + 1 INTO NEW.position
  FROM binder_notes
  WHERE binder_id = NEW.binder_id;
  RETURN NEW;
END;
$function$
;
GRANT SELECT ON public.notes_with_votes TO authenticated;

