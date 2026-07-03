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
    OR similarity(m."moduleCode", search_query) > 0.3 
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


