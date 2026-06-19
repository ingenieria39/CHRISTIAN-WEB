-- ================================================================
-- SEED: Datos de prueba — Christian CRM
-- ----------------------------------------------------------------
-- REQUISITO PREVIO: ejecutar primero 001_crm_schema.sql
--
-- Cómo ejecutar:
--   Supabase Dashboard → SQL Editor → New query → pegar y Run
--
-- Qué crea:
--   • 7 usuarios en auth.users + auth.identities (login real)
--   • 7 perfiles en users_profiles con rol correcto
--   • 8 clientes CRM en clients (asignados a los trabajadores)
--   • 8 asignaciones en client_pipeline
--   • 12 interacciones de ejemplo
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- ── Contraseña única para todos los usuarios de prueba ────────
  pw text := 'Password123!';
  pw_hash text;

  -- ── UUIDs fijos — Trabajadores ────────────────────────────────
  w1 uuid := '10000000-0001-0000-0000-000000000001'; -- worker1@demo.com
  w2 uuid := '10000000-0001-0000-0000-000000000002'; -- worker2@demo.com

  -- ── UUIDs fijos — Clientes (cuentas auth) ─────────────────────
  c1 uuid := '20000000-0002-0000-0000-000000000001'; -- cliente1@demo.com
  c2 uuid := '20000000-0002-0000-0000-000000000002'; -- cliente2@demo.com
  c3 uuid := '20000000-0002-0000-0000-000000000003'; -- cliente3@demo.com
  c4 uuid := '20000000-0002-0000-0000-000000000004'; -- cliente4@demo.com
  c5 uuid := '20000000-0002-0000-0000-000000000005'; -- cliente5@demo.com

  -- ── UUIDs fijos — Clientes CRM (tabla clients) ────────────────
  cl1 uuid := '30000000-0003-0000-0000-000000000001';
  cl2 uuid := '30000000-0003-0000-0000-000000000002';
  cl3 uuid := '30000000-0003-0000-0000-000000000003';
  cl4 uuid := '30000000-0003-0000-0000-000000000004';
  cl5 uuid := '30000000-0003-0000-0000-000000000005';
  cl6 uuid := '30000000-0003-0000-0000-000000000006';
  cl7 uuid := '30000000-0003-0000-0000-000000000007';
  cl8 uuid := '30000000-0003-0000-0000-000000000008';

  -- ── IDs de etapas del pipeline (leídos de la tabla) ───────────
  s_investigacion uuid;
  s_contacto      uuid;
  s_calificacion  uuid;
  s_propuesta     uuid;
  s_negociacion   uuid;
  s_cerrado_g     uuid;
  s_cerrado_p     uuid;

BEGIN

  -- ── 0. Hash de contraseña ──────────────────────────────────────
  pw_hash := crypt(pw, gen_salt('bf'));
  RAISE NOTICE 'Generando hash de contraseña...';

  -- ── 1. Leer etapas del pipeline ───────────────────────────────
  SELECT id INTO s_investigacion FROM public.pipeline_stages WHERE name = 'Investigación'   LIMIT 1;
  SELECT id INTO s_contacto      FROM public.pipeline_stages WHERE name = 'Primer contacto' LIMIT 1;
  SELECT id INTO s_calificacion  FROM public.pipeline_stages WHERE name = 'Calificación'    LIMIT 1;
  SELECT id INTO s_propuesta     FROM public.pipeline_stages WHERE name = 'Propuesta'       LIMIT 1;
  SELECT id INTO s_negociacion   FROM public.pipeline_stages WHERE name = 'Negociación'     LIMIT 1;
  SELECT id INTO s_cerrado_g     FROM public.pipeline_stages WHERE name = 'Cerrado ganado'  LIMIT 1;
  SELECT id INTO s_cerrado_p     FROM public.pipeline_stages WHERE name = 'Cerrado perdido' LIMIT 1;

  IF s_investigacion IS NULL THEN
    RAISE EXCEPTION 'Pipeline stages no encontradas. Ejecuta primero 001_crm_schema.sql';
  END IF;

  -- ================================================================
  -- 2. AUTH.USERS — Insertar usuarios de Supabase Auth
  --    El trigger on_auth_user_created crea automáticamente
  --    el registro en users_profiles al hacer INSERT aquí.
  -- ================================================================

  -- ── Trabajadores ───────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (
      w1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'worker1@demo.com', pw_hash,
      now(),
      '{"role":"trabajador","full_name":"Carlos Mendoza"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      w2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'worker2@demo.com', pw_hash,
      now(),
      '{"role":"trabajador","full_name":"María Torres"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    )
  ON CONFLICT (id) DO NOTHING;

  -- ── Clientes ───────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (
      c1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'cliente1@demo.com', pw_hash, now(),
      '{"role":"cliente","full_name":"Ana García"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      c2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'cliente2@demo.com', pw_hash, now(),
      '{"role":"cliente","full_name":"Luis Ramírez"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      c3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'cliente3@demo.com', pw_hash, now(),
      '{"role":"cliente","full_name":"Sofía Vargas"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      c4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'cliente4@demo.com', pw_hash, now(),
      '{"role":"cliente","full_name":"Jorge Castillo"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    ),
    (
      c5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'cliente5@demo.com', pw_hash, now(),
      '{"role":"cliente","full_name":"Valentina Cruz"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', '', '', ''
    )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ auth.users insertados (7 usuarios)';

  -- ================================================================
  -- 3. AUTH.IDENTITIES — Necesario para que el login funcione
  --    Sin este registro, Supabase rechaza el email/password.
  --    provider_id = user_id (estándar para provider "email")
  -- ================================================================

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES
    -- Trabajadores
    (gen_random_uuid(), w1, jsonb_build_object('sub', w1::text, 'email', 'worker1@demo.com', 'email_verified', true, 'provider', 'email'), 'email', w1::text, now(), now(), now()),
    (gen_random_uuid(), w2, jsonb_build_object('sub', w2::text, 'email', 'worker2@demo.com', 'email_verified', true, 'provider', 'email'), 'email', w2::text, now(), now(), now()),
    -- Clientes
    (gen_random_uuid(), c1, jsonb_build_object('sub', c1::text, 'email', 'cliente1@demo.com', 'email_verified', true, 'provider', 'email'), 'email', c1::text, now(), now(), now()),
    (gen_random_uuid(), c2, jsonb_build_object('sub', c2::text, 'email', 'cliente2@demo.com', 'email_verified', true, 'provider', 'email'), 'email', c2::text, now(), now(), now()),
    (gen_random_uuid(), c3, jsonb_build_object('sub', c3::text, 'email', 'cliente3@demo.com', 'email_verified', true, 'provider', 'email'), 'email', c3::text, now(), now(), now()),
    (gen_random_uuid(), c4, jsonb_build_object('sub', c4::text, 'email', 'cliente4@demo.com', 'email_verified', true, 'provider', 'email'), 'email', c4::text, now(), now(), now()),
    (gen_random_uuid(), c5, jsonb_build_object('sub', c5::text, 'email', 'cliente5@demo.com', 'email_verified', true, 'provider', 'email'), 'email', c5::text, now(), now(), now())
  ON CONFLICT (provider_id, provider) DO NOTHING;

  RAISE NOTICE '✓ auth.identities insertados (7 entradas)';

  -- ================================================================
  -- 4. USERS_PROFILES — Actualizar/asegurar perfiles
  --    El trigger ya los crea al insertar en auth.users,
  --    pero hacemos UPSERT para garantizar los datos correctos.
  -- ================================================================

  INSERT INTO public.users_profiles (id, email, full_name, role)
  VALUES
    (w1, 'worker1@demo.com', 'Carlos Mendoza',  'trabajador'),
    (w2, 'worker2@demo.com', 'María Torres',    'trabajador'),
    (c1, 'cliente1@demo.com', 'Ana García',     'cliente'),
    (c2, 'cliente2@demo.com', 'Luis Ramírez',   'cliente'),
    (c3, 'cliente3@demo.com', 'Sofía Vargas',   'cliente'),
    (c4, 'cliente4@demo.com', 'Jorge Castillo', 'cliente'),
    (c5, 'cliente5@demo.com', 'Valentina Cruz', 'cliente')
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    role       = EXCLUDED.role,
    updated_at = now();

  RAISE NOTICE '✓ users_profiles actualizados (7 perfiles)';

  -- ================================================================
  -- 5. CLIENTS — Clientes CRM (registros comerciales)
  --    Asignados a los trabajadores para probar el dashboard.
  -- ================================================================

  INSERT INTO public.clients (id, name, company, email, phone, status, notes, assigned_to, created_by)
  VALUES
    -- Carlos Mendoza (w1) tiene 4 clientes
    (cl1, 'Empresa Tech SAC',        'Tech SAC',             'gerencia@techsac.pe',      '+51 1 555-0101', 'activo',       'Cliente premium desde 2023. Interés en módulo de reportes avanzados.',        w1, w1),
    (cl2, 'Inversiones Del Sur',     'Inversiones Del Sur',  'info@inversionesdelsur.pe', '+51 1 555-0102', 'negociacion',  'Segunda cotización enviada. Esperando aprobación del directorio.',             w1, w1),
    (cl3, 'Grupo Pacífico SRL',      'Grupo Pacífico',       'gerencia@gpacífico.pe',    '+51 1 555-0103', 'cerrado',      'Contrato anual firmado. Implementación iniciada el mes pasado.',               w1, w1),
    (cl4, 'Agroindustria Norte SA',  'Agroindustria Norte',  'ventas@agronorte.com.pe',  '+51 1 555-0104', 'activo',       'Referido por Grupo Pacífico. Gran potencial de expansión regional.',           w1, w1),
    -- María Torres (w2) tiene 4 clientes
    (cl5, 'Consultora Andina EIRL',  'Consultora Andina',    'admin@consultora-andina.pe','+51 1 555-0105', 'activo',       'Renovación de contrato pendiente para diciembre. Relación excelente.',         w2, w2),
    (cl6, 'Distribuidora Lima SA',   'Distribuidora Lima',   'compras@distlima.pe',      '+51 1 555-0106', 'pausado',      'Cliente en pausa por reestructura interna. Retomar contacto en Q1 2026.',      w2, w2),
    (cl7, 'Soluciones Digital PE',   'Soluciones Digital',   'hola@soldigital.pe',       '+51 1 555-0107', 'negociacion',  'Demo realizada con éxito. Pendiente propuesta para 25 usuarios.',              w2, w2),
    (cl8, 'Retail Moderno SAC',      'Retail Moderno',       'ti@retailmoderno.pe',      '+51 1 555-0108', 'negociacion',  'Segunda reunión la próxima semana. Evalúan integración con su ERP.',           w2, w1)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ clients insertados (8 clientes CRM)';

  -- ================================================================
  -- 6. CLIENT_PIPELINE — Asignar clientes a etapas del pipeline
  -- ================================================================

  INSERT INTO public.client_pipeline (client_id, stage_id, updated_by, notes)
  VALUES
    (cl1, s_cerrado_g,     w1, 'Cerró contrato anual en octubre.'),
    (cl2, s_negociacion,   w1, 'Revisando términos contractuales con legal.'),
    (cl3, s_cerrado_g,     w1, 'Ganado. En implementación.'),
    (cl4, s_investigacion, w1, 'Recién incorporado. Recopilando info de su operación.'),
    (cl5, s_propuesta,     w2, 'Propuesta de renovación enviada por email.'),
    (cl6, s_contacto,      w2, 'Pausado. Último contacto: WhatsApp en agosto.'),
    (cl7, s_propuesta,     w2, 'Demo completada. Elaborando propuesta económica.'),
    (cl8, s_negociacion,   w2, 'Negociando integración API con su equipo técnico.')
  ON CONFLICT (client_id) DO NOTHING;

  RAISE NOTICE '✓ client_pipeline asignados (8 etapas)';

  -- ================================================================
  -- 7. INTERACTIONS — Historial de actividad por cliente
  -- ================================================================

  INSERT INTO public.interactions (client_id, user_id, type, description)
  VALUES
    -- Tech SAC (cl1) — Carlos
    (cl1, w1, 'llamada',  'Llamada de prospección inicial. Muy receptivos. Agendan reunión.'),
    (cl1, w1, 'reunion',  'Reunión presencial en sus oficinas. Presentación del producto completada.'),
    (cl1, w1, 'email',    'Envío de propuesta comercial con 3 planes. Descuento por pago anual incluido.'),
    (cl1, w1, 'llamada',  'Llamada de cierre. Aceptan plan Empresarial. Solicitan contrato.'),

    -- Inversiones del Sur (cl2) — Carlos
    (cl2, w1, 'email',    'Primera presentación por email con brochure corporativo.'),
    (cl2, w1, 'reunion',  'Demo online de 45 minutos. Equipo directivo presente.'),
    (cl2, w1, 'whatsapp', 'Seguimiento por WhatsApp. Indican que están revisando con su contador.'),

    -- Consultora Andina (cl5) — María
    (cl5, w2, 'email',    'Envío de propuesta de renovación con mejoras incluidas para 2025.'),
    (cl5, w2, 'llamada',  'Llamada de seguimiento. Confirman renovación pero piden ajuste en precio.'),
    (cl5, w2, 'nota',     'Nota interna: cliente muy satisfecho con el soporte. Alta probabilidad de renovación.'),

    -- Soluciones Digital (cl7) — María
    (cl7, w2, 'llamada',  'Primer contacto. Explican que buscan reemplazar su CRM actual.'),
    (cl7, w2, 'reunion',  'Demo completa del sistema. Impresionados con el módulo de pipeline.')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ interactions insertadas (12 interacciones)';

  -- ================================================================
  -- RESUMEN FINAL
  -- ================================================================
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE ' SEED COMPLETADO — Christian CRM';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'TRABAJADORES (panel /trabajador):';
  RAISE NOTICE '  worker1@demo.com  →  Carlos Mendoza';
  RAISE NOTICE '  worker2@demo.com  →  María Torres';
  RAISE NOTICE '';
  RAISE NOTICE 'CLIENTES (panel /cliente):';
  RAISE NOTICE '  cliente1@demo.com →  Ana García';
  RAISE NOTICE '  cliente2@demo.com →  Luis Ramírez';
  RAISE NOTICE '  cliente3@demo.com →  Sofía Vargas';
  RAISE NOTICE '  cliente4@demo.com →  Jorge Castillo';
  RAISE NOTICE '  cliente5@demo.com →  Valentina Cruz';
  RAISE NOTICE '';
  RAISE NOTICE 'Contraseña para todos: Password123!';
  RAISE NOTICE '════════════════════════════════════════════';

END;
$$;


-- ================================================================
-- VERIFICACIÓN — Ejecutar después del seed para confirmar datos
-- ================================================================

-- Descomentar para verificar:

-- SELECT 'auth.users' AS tabla, count(*) FROM auth.users WHERE email LIKE '%@demo.com'
-- UNION ALL
-- SELECT 'users_profiles', count(*) FROM public.users_profiles WHERE email LIKE '%@demo.com'
-- UNION ALL
-- SELECT 'clients', count(*) FROM public.clients
-- UNION ALL
-- SELECT 'client_pipeline', count(*) FROM public.client_pipeline
-- UNION ALL
-- SELECT 'interactions', count(*) FROM public.interactions;

-- Ver perfiles con rol:
-- SELECT email, full_name, role FROM public.users_profiles WHERE email LIKE '%@demo.com' ORDER BY role, email;

-- Ver clientes con etapa pipeline:
-- SELECT c.name, c.company, c.status, p.name AS etapa, up.full_name AS asignado_a
-- FROM public.clients c
-- LEFT JOIN public.client_pipeline cp ON cp.client_id = c.id
-- LEFT JOIN public.pipeline_stages p ON p.id = cp.stage_id
-- LEFT JOIN public.users_profiles up ON up.id = c.assigned_to
-- ORDER BY up.full_name, c.name;
