drop view if exists "public"."notes_with_votes";


  create table "public"."reports" (
    "id" bigint generated always as identity not null,
    "note_id" bigint not null,
    "reporter_id" uuid not null,
    "reason" text not null,
    "created_at" timestamp with time zone not null default now(),
    "details" text
      );


alter table "public"."reports" enable row level security;

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX reports_reporter_id_note_id_key ON public.reports USING btree (reporter_id, note_id);

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."reports" add constraint "reports_details_check" CHECK ((char_length(details) <= 500)) not valid;

alter table "public"."reports" validate constraint "reports_details_check";

alter table "public"."reports" add constraint "reports_note_id_fkey" FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_note_id_fkey";

alter table "public"."reports" add constraint "reports_reason_check" CHECK ((reason = ANY (ARRAY['wrong_module'::text, 'inappropriate'::text, 'copyright'::text, 'spam'::text, 'other'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_reason_check";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_id_note_id_key" UNIQUE using index "reports_reporter_id_note_id_key";

set check_function_bodies = off;

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


grant references on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";


  create policy "admins delete reports"
  on "public"."reports"
  as permissive
  for delete
  to authenticated
using ((public.current_user_level() >= 2));



  create policy "admins read reports"
  on "public"."reports"
  as permissive
  for select
  to authenticated
using ((public.current_user_level() >= 2));



  create policy "create own reports"
  on "public"."reports"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = reporter_id));



  create policy "Admins can read all users"
  on "public"."users"
  as permissive
  for select
  to public
using ((public.current_user_level() >= 2));



