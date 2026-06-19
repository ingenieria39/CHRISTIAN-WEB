-- ================================================================
-- Cambiar ingenieria@mic.pe → trabajador
-- ----------------------------------------------------------------
-- Ejecutar en Supabase → SQL Editor → New query
-- Correr las dos queries por separado (seleccionar y Run cada una)
-- ================================================================

-- QUERY 1: Actualizar metadata en auth.users
-- (Funciona aunque users_profiles no exista todavía)
UPDATE auth.users
SET    raw_user_meta_data = jsonb_set(
         COALESCE(raw_user_meta_data, '{}'::jsonb),
         '{role}',
         '"trabajador"'
       ),
       updated_at = now()
WHERE  email = 'ingenieria@mic.pe';

-- ────────────────────────────────────────────────────────────────

-- QUERY 2: Actualizar users_profiles (si la tabla ya existe)
-- Si aparece error "relation does not exist", ignorar — no es necesaria
-- hasta que corras 001_crm_schema.sql
INSERT INTO public.users_profiles (id, email, role, full_name)
SELECT id, email, 'trabajador', 'Ingeniería MIC'
FROM   auth.users
WHERE  email = 'ingenieria@mic.pe'
ON CONFLICT (id) DO UPDATE
  SET role       = 'trabajador',
      updated_at = now();

-- ────────────────────────────────────────────────────────────────

-- VERIFICAR resultado (correr al final):
SELECT
  u.email,
  u.raw_user_meta_data->>'role' AS meta_role,
  p.role                        AS profile_role
FROM auth.users u
LEFT JOIN public.users_profiles p ON p.id = u.id
WHERE u.email = 'ingenieria@mic.pe';
