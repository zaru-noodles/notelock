drop view if exists "public"."notes_with_votes";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid)
 RETURNS TABLE("noteCount" bigint, "noteCountPercentile" numeric, "totalLikes" bigint, "totalLikesPercentile" numeric, "totalDownloads" bigint, "totalDownloadsPercentile" numeric, "totalComments" bigint, "totalCommentsPercentile" numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_note_count bigint;
  v_total_likes bigint;
  v_total_downloads bigint;
  v_total_comments bigint;
  v_total_users bigint;
BEGIN
  -- total users (including those with no notes)
  SELECT COUNT(*) INTO v_total_users FROM users;

  SELECT COUNT(*) INTO v_note_count
  FROM notes WHERE author_id = target_user_id;

  SELECT COALESCE(SUM(ups), 0) INTO v_total_likes
  FROM notes_with_votes WHERE author_id = target_user_id;

  SELECT COALESCE(SUM(download_count), 0) INTO v_total_downloads
  FROM notes WHERE author_id = target_user_id;

  SELECT COUNT(*) INTO v_total_comments
  FROM comments c
  JOIN notes n ON c.note_id = n.id
  WHERE n.author_id = target_user_id;

  RETURN QUERY
  SELECT
    v_note_count,
    ROUND(100 - (
      SELECT COUNT(*)::numeric * 100 / NULLIF(v_total_users, 0)
      FROM (
        SELECT u.id, COALESCE(cnt.note_count, 0) as cnt
        FROM users u
        LEFT JOIN (
          SELECT author_id, COUNT(*) as note_count FROM notes GROUP BY author_id
        ) cnt ON u.id = cnt.author_id
      ) counts
      WHERE counts.cnt > v_note_count
    ), 0),

    v_total_likes,
    ROUND(100 - (
      SELECT COUNT(*)::numeric * 100 / NULLIF(v_total_users, 0)
      FROM (
        SELECT u.id, COALESCE(cnt.likes, 0) as cnt
        FROM users u
        LEFT JOIN (
          SELECT author_id, SUM(ups) as likes FROM notes_with_votes GROUP BY author_id
        ) cnt ON u.id = cnt.author_id
      ) counts
      WHERE counts.cnt > v_total_likes
    ), 0),

    v_total_downloads,
    ROUND(100 - (
      SELECT COUNT(*)::numeric * 100 / NULLIF(v_total_users, 0)
      FROM (
        SELECT u.id, COALESCE(cnt.downloads, 0) as cnt
        FROM users u
        LEFT JOIN (
          SELECT author_id, SUM(download_count) as downloads FROM notes GROUP BY author_id
        ) cnt ON u.id = cnt.author_id
      ) counts
      WHERE counts.cnt > v_total_downloads
    ), 0),

    v_total_comments,
    ROUND(100 - (
      SELECT COUNT(*)::numeric * 100 / NULLIF(v_total_users, 0)
      FROM (
        SELECT u.id, COALESCE(cnt.comments, 0) as cnt
        FROM users u
        LEFT JOIN (
          SELECT n.author_id, COUNT(*) as comments
          FROM comments c
          JOIN notes n ON c.note_id = n.id
          GROUP BY n.author_id
        ) cnt ON u.id = cnt.author_id
      ) counts
      WHERE counts.cnt > v_total_comments
    ), 0);
END;
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



