
  create table "public"."votes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "note_id" bigint not null,
    "value" smallint not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."votes" enable row level security;

CREATE INDEX votes_note_id_idx ON public.votes USING btree (note_id);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

CREATE UNIQUE INDEX votes_user_id_note_id_key ON public.votes USING btree (user_id, note_id);

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."votes" add constraint "votes_note_id_fkey" FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_note_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_note_id_key" UNIQUE using index "votes_user_id_note_id_key";

alter table "public"."votes" add constraint "votes_value_check" CHECK ((value = ANY (ARRAY[1, '-1'::integer]))) not valid;

alter table "public"."votes" validate constraint "votes_value_check";

set check_function_bodies = off;

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
    OR similarity(m."moduleCode", search_query) > 0.1 
    OR similarity(m.title, search_query) > 0.1
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

grant references on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant references on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";


  create policy "Anyone can read votes"
  on "public"."votes"
  as permissive
  for select
  to public
using (true);



  create policy "Users can change their own vote"
  on "public"."votes"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can remove their own vote"
  on "public"."votes"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can vote as themselves"
  on "public"."votes"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



