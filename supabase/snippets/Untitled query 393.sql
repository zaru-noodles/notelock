CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION search_module(
  search_query text,
  result_count int
)
RETURNS TABLE (
  id bigint,
  title text,
  "moduleCode" text,
  faculty text,
  department text
)
AS $$
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
$$ LANGUAGE sql STABLE;