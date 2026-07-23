drop view if exists "public"."notes_with_votes";

drop function if exists "public"."search_notes_with_tags"(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order, tag_ids integer[]);

alter table "public"."notes" add column "pinned" boolean not null default false;

alter table "public"."notes" add column "summary" text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.pin_note(note_id bigint, pinned boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
          AND auth_level >= 1
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE notes
    SET pinned = pin_note.pinned
    WHERE id = pin_note.note_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_notes_with_tags(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, selected_auth_level integer, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order, tag_ids integer[] DEFAULT '{}'::integer[])
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, "upvoteCount" integer, "downvoteCount" integer, pinned boolean, "userId" uuid, username text, "userAuthLevel" integer, "deletePermission" boolean, "featurePermission" boolean, tags jsonb, "thumbnailUrl" text, "thumbnailExpiry" timestamp with time zone, "totalCount" integer)
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
    n.pinned,
    up.id,
    up.username,
    up.auth_level,
    (
      auth.uid() = n.author_id OR
      (SELECT auth_level FROM users WHERE id = auth.uid()) >= 2
    ) AS deletePermission,
    (
      (SELECT auth_level FROM users WHERE id = auth.uid()) >= 1
    ) AS featurePermission,
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
    selected_auth_level = -1 OR up.auth_level = selected_auth_level
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

CREATE OR REPLACE FUNCTION public.current_user_level()
 RETURNS smallint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select auth_level from public.users where id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.get_vote_state(p_note_id bigint)
 RETURNS TABLE(ups bigint, downs bigint, user_vote smallint)
 LANGUAGE sql
 STABLE
AS $function$
  select
    count(*) filter (where value = 1),
    count(*) filter (where value = -1),
    coalesce((select value from public.votes
              where note_id = p_note_id and user_id = auth.uid()), 0)::smallint
  from public.votes
  where note_id = p_note_id;
$function$
;

CREATE OR REPLACE FUNCTION public.guard_auth_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.auth_level is distinct from old.auth_level then
    -- no JWT = Studio / service-role / system context: allow
    if auth.uid() is null then
      return new;
    end if;
    -- a real user session: must be admin
    if coalesce(public.current_user_level(), -1) < 2 then
      raise exception 'Only admins can change account levels';
    end if;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_vote(p_note_id bigint, p_value smallint)
 RETURNS TABLE(ups bigint, downs bigint, user_vote smallint)
 LANGUAGE plpgsql
AS $function$
declare
  v_existing smallint;
begin
  if p_value not in (1, -1) then
    raise exception 'Invalid vote value';
  end if;

  select value into v_existing
  from public.votes
  where user_id = auth.uid() and note_id = p_note_id;

  if v_existing is null then
    insert into public.votes (user_id, note_id, value)
    values (auth.uid(), p_note_id, p_value);
  elsif v_existing = p_value then
    delete from public.votes
    where user_id = auth.uid() and note_id = p_note_id;
  else
    update public.votes set value = p_value
    where user_id = auth.uid() and note_id = p_note_id;
  end if;

  return query
  select
    count(*) filter (where v.value = 1),
    count(*) filter (where v.value = -1),
    coalesce((select value from public.votes
              where user_id = auth.uid() and note_id = p_note_id), 0)::smallint
  from public.votes v
  where v.note_id = p_note_id;
end;
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


CREATE OR REPLACE FUNCTION public.search_notes_with_tags(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order DEFAULT 'downloadCount'::public.sort_order, tag_ids integer[] DEFAULT '{}'::integer[])
 RETURNS TABLE(id text, title text, semester text, "moduleCode" text, "downloadCount" integer, "upvoteCount" integer, "downvoteCount" integer, "userId" uuid, username text, "userAuthLevel" integer, "deletePermission" boolean, tags jsonb, "thumbnailUrl" text, "thumbnailExpiry" timestamp with time zone, "totalCount" integer)
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
    up.auth_level,
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

CREATE OR REPLACE FUNCTION public.set_auth_level(p_user_id uuid, p_level smallint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if coalesce(public.current_user_level(), -1) < 2 then
    raise exception 'Admins only';
  end if;
  if p_level not in (0, 1, 2) then
    raise exception 'Invalid level';
  end if;
  update public.users set auth_level = p_level where id = p_user_id;
end;
$function$
;

create or replace view "public"."user_profiles" as  SELECT id,
    username,
    auth_level
   FROM public.users;



  create policy "authors update own notes"
  on "public"."notes"
  as permissive
  for update
  to authenticated
using ((auth.uid() = author_id))
with check ((auth.uid() = author_id));

grant select on table "public"."notes_with_votes" to "authenticated";

