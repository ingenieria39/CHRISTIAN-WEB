-- ================================================================
-- ROLLBACK: Eliminar datos de prueba — Christian CRM
-- ----------------------------------------------------------------
-- Ejecutar en Supabase → SQL Editor si quieres borrar el seed
-- y volver a empezar desde cero.
-- ================================================================

DO $$
DECLARE
  demo_emails text[] := ARRAY[
    'worker1@demo.com', 'worker2@demo.com',
    'cliente1@demo.com', 'cliente2@demo.com', 'cliente3@demo.com',
    'cliente4@demo.com', 'cliente5@demo.com'
  ];
  demo_user_ids uuid[];
BEGIN
  -- Obtener los IDs de los usuarios demo
  SELECT array_agg(id) INTO demo_user_ids
  FROM auth.users
  WHERE email = ANY(demo_emails);

  -- 1. Interacciones (FK cascade desde clients, pero por si acaso)
  DELETE FROM public.interactions
  WHERE user_id = ANY(demo_user_ids);

  -- 2. Client pipeline
  DELETE FROM public.client_pipeline
  WHERE client_id IN (
    SELECT id FROM public.clients
    WHERE assigned_to = ANY(demo_user_ids)
       OR created_by  = ANY(demo_user_ids)
  );

  -- 3. Clients CRM
  DELETE FROM public.clients
  WHERE assigned_to = ANY(demo_user_ids)
     OR created_by  = ANY(demo_user_ids);

  -- 4. Profiles (CASCADE desde auth.users, pero explícito por si acaso)
  DELETE FROM public.users_profiles
  WHERE id = ANY(demo_user_ids);

  -- 5. Identities (CASCADE desde auth.users)
  DELETE FROM auth.identities
  WHERE user_id = ANY(demo_user_ids);

  -- 6. Auth users (CASCADE elimina identities y profiles)
  DELETE FROM auth.users
  WHERE email = ANY(demo_emails);

  RAISE NOTICE '✅ Rollback completado. Usuarios demo eliminados.';
END;
$$;
