drop policy "users delete their own comments" on "public"."comments";

drop policy "authors can delete own notes" on "public"."notes";

drop function if exists "public"."search_notes_with_tags"(search_query text, start_index integer, result_count integer, module_code text, selected_semester text, selected_author_id text, sort_by public.sort_order, tag_ids integer[]);

alter type "public"."sort_order" rename to "sort_order__old_version_to_be_dropped";

create type "public"."sort_order" as enum ('downloadCount', 'semester', 'rating');


  create table "public"."binder_notes" (
    "binder_id" bigint not null,
    "note_id" bigint not null,
    "position" integer not null default 0
      );


alter table "public"."binder_notes" enable row level security;


  create table "public"."binders" (
    "id" bigint not null default public.random_bigint(),
    "title" text not null,
    "author_id" uuid,
    "created_at" timestamp without time zone default now(),
    "module_id" bigint not null
      );


alter table "public"."binders" enable row level security;

drop type if exists "public"."sort_order__old_version_to_be_dropped" cascade;

alter table "public"."notes" add column "thumbnail_expiry" timestamp with time zone;

alter table "public"."notes" add column "thumbnail_url" text;

alter table "public"."users" alter column "auth_level" set default 0;

CREATE UNIQUE INDEX binder_notes_pkey ON public.binder_notes USING btree (binder_id, note_id);

CREATE UNIQUE INDEX binders_pkey ON public.binders USING btree (id);

alter table "public"."binder_notes" add constraint "binder_notes_pkey" PRIMARY KEY using index "binder_notes_pkey";

alter table "public"."binders" add constraint "binders_pkey" PRIMARY KEY using index "binders_pkey";

alter table "public"."binder_notes" add constraint "binder_notes_binder_id_fkey" FOREIGN KEY (binder_id) REFERENCES public.binders(id) ON DELETE CASCADE not valid;

alter table "public"."binder_notes" validate constraint "binder_notes_binder_id_fkey";

alter table "public"."binder_notes" add constraint "binder_notes_note_id_fkey" FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE not valid;

alter table "public"."binder_notes" validate constraint "binder_notes_note_id_fkey";

alter table "public"."binders" add constraint "binders_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."binders" validate constraint "binders_author_id_fkey";

alter table "public"."binders" add constraint "binders_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."binders" validate constraint "binders_module_id_fkey";

alter table "public"."users" add constraint "users_auth_level_valid" CHECK ((auth_level = ANY (ARRAY[0, 1, 2]))) not valid;

alter table "public"."users" validate constraint "users_auth_level_valid";

set check_function_bodies = off;

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

grant delete on table "public"."binder_notes" to "anon";

grant insert on table "public"."binder_notes" to "anon";

grant references on table "public"."binder_notes" to "anon";

grant select on table "public"."binder_notes" to "anon";

grant trigger on table "public"."binder_notes" to "anon";

grant truncate on table "public"."binder_notes" to "anon";

grant update on table "public"."binder_notes" to "anon";

grant delete on table "public"."binder_notes" to "authenticated";

grant insert on table "public"."binder_notes" to "authenticated";

grant references on table "public"."binder_notes" to "authenticated";

grant select on table "public"."binder_notes" to "authenticated";

grant trigger on table "public"."binder_notes" to "authenticated";

grant truncate on table "public"."binder_notes" to "authenticated";

grant update on table "public"."binder_notes" to "authenticated";

grant delete on table "public"."binder_notes" to "service_role";

grant insert on table "public"."binder_notes" to "service_role";

grant references on table "public"."binder_notes" to "service_role";

grant select on table "public"."binder_notes" to "service_role";

grant trigger on table "public"."binder_notes" to "service_role";

grant truncate on table "public"."binder_notes" to "service_role";

grant update on table "public"."binder_notes" to "service_role";

grant delete on table "public"."binders" to "anon";

grant insert on table "public"."binders" to "anon";

grant references on table "public"."binders" to "anon";

grant select on table "public"."binders" to "anon";

grant trigger on table "public"."binders" to "anon";

grant truncate on table "public"."binders" to "anon";

grant update on table "public"."binders" to "anon";

grant delete on table "public"."binders" to "authenticated";

grant insert on table "public"."binders" to "authenticated";

grant references on table "public"."binders" to "authenticated";

grant select on table "public"."binders" to "authenticated";

grant trigger on table "public"."binders" to "authenticated";

grant truncate on table "public"."binders" to "authenticated";

grant update on table "public"."binders" to "authenticated";

grant delete on table "public"."binders" to "service_role";

grant insert on table "public"."binders" to "service_role";

grant references on table "public"."binders" to "service_role";

grant select on table "public"."binders" to "service_role";

grant trigger on table "public"."binders" to "service_role";

grant truncate on table "public"."binders" to "service_role";

grant update on table "public"."binders" to "service_role";

grant select on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";


  create policy "users can delete own binder notes"
  on "public"."binder_notes"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.binders b
  WHERE ((b.id = binder_notes.binder_id) AND (b.author_id = auth.uid())))));



  create policy "users can insert into own binders"
  on "public"."binder_notes"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.binders b
  WHERE ((b.id = binder_notes.binder_id) AND (b.author_id = auth.uid())))));



  create policy "users can read own binder notes"
  on "public"."binder_notes"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.binders b
  WHERE ((b.id = binder_notes.binder_id) AND (b.author_id = auth.uid())))));



  create policy "users can update own binder notes"
  on "public"."binder_notes"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.binders b
  WHERE ((b.id = binder_notes.binder_id) AND (b.author_id = auth.uid())))));



  create policy "users can delete own binders"
  on "public"."binders"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = author_id));



  create policy "users can insert own binders"
  on "public"."binders"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = author_id));



  create policy "users can read own binders"
  on "public"."binders"
  as permissive
  for select
  to authenticated
using ((auth.uid() = author_id));



  create policy "users can update own binders"
  on "public"."binders"
  as permissive
  for update
  to authenticated
using ((auth.uid() = author_id));



  create policy "users/admin delete their own comments"
  on "public"."comments"
  as permissive
  for delete
  to authenticated
using (((auth.uid() = author_id) OR (public.current_user_level() >= 2)));



  create policy "authors/admin can delete own notes"
  on "public"."notes"
  as permissive
  for delete
  to authenticated
using (((auth.uid() = author_id) OR (public.current_user_level() >= 2)));


CREATE TRIGGER set_binder_note_position_trigger BEFORE INSERT ON public.binder_notes FOR EACH ROW EXECUTE FUNCTION public.set_binder_note_position();

CREATE TRIGGER guard_auth_level BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.guard_auth_level();


