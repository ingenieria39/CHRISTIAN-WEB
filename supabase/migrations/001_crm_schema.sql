-- =================================================================
-- CRM DATABASE SCHEMA — Christian CRM
-- Ejecutar completo en: Supabase → SQL Editor → New query
-- =================================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =================================================================
-- TABLAS
-- =================================================================

-- ─── users_profiles ──────────────────────────────────────────────
-- Extiende auth.users con datos del perfil y rol
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'cliente'
                          CHECK (role IN ('cliente', 'trabajador', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── clients ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  company      TEXT,
  email        TEXT,
  phone        TEXT,
  status       TEXT        NOT NULL DEFAULT 'activo'
                           CHECK (status IN ('activo', 'negociacion', 'cerrado', 'pausado')),
  assigned_to  UUID        REFERENCES public.users_profiles(id) ON DELETE SET NULL,
  notes        TEXT,
  created_by   UUID        REFERENCES public.users_profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── interactions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interactions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  type         TEXT        NOT NULL
                           CHECK (type IN ('llamada', 'email', 'reunion', 'nota', 'whatsapp')),
  description  TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── pipeline_stages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  description  TEXT,
  order_index  INTEGER     NOT NULL DEFAULT 0,
  color        TEXT        NOT NULL DEFAULT '#6b7280',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── client_pipeline ─────────────────────────────────────────────
-- Un cliente solo puede estar en UNA etapa al mismo tiempo (UNIQUE)
CREATE TABLE IF NOT EXISTS public.client_pipeline (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  stage_id    UUID        NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  notes       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID        REFERENCES public.users_profiles(id) ON DELETE SET NULL,
  UNIQUE (client_id)
);


-- =================================================================
-- ÍNDICES (rendimiento)
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to    ON public.clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_status         ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email          ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_interactions_client    ON public.interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user      ON public.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created   ON public.interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_pipeline_stage  ON public.client_pipeline(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order  ON public.pipeline_stages(order_index);


-- =================================================================
-- FUNCIONES Y TRIGGERS
-- =================================================================

-- ─── updated_at automático ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_profiles_updated_at
  BEFORE UPDATE ON public.users_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_client_pipeline_updated_at
  BEFORE UPDATE ON public.client_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Crear perfil automáticamente al registrarse ─────────────────
-- Lee el rol desde user_metadata (seteado en signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Helper: rol del usuario actual ──────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =================================================================
-- DATOS INICIALES — Etapas del pipeline
-- =================================================================
INSERT INTO public.pipeline_stages (name, description, order_index, color) VALUES
  ('Investigación',   'Prospecto identificado, recopilando información',  1, '#6b7280'),
  ('Primer contacto', 'Primer contacto realizado con el prospecto',        2, '#3b82f6'),
  ('Calificación',    'Verificando si es un cliente potencial real',       3, '#8b5cf6'),
  ('Propuesta',       'Propuesta enviada, esperando respuesta',            4, '#f59e0b'),
  ('Negociación',     'En proceso de negociación activa',                  5, '#e94560'),
  ('Cerrado ganado',  'Negocio cerrado exitosamente',                      6, '#22c55e'),
  ('Cerrado perdido', 'Negocio no concretado',                             7, '#ef4444')
ON CONFLICT DO NOTHING;


-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

ALTER TABLE public.users_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pipeline  ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────
-- POLICIES: users_profiles
-- ─────────────────────────────────────────────────────────────────

-- SELECT: propio perfil; trabajador/admin ven todos
CREATE POLICY "profiles_select"
  ON public.users_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.get_my_role() IN ('trabajador', 'admin')
  );

-- INSERT: fallback si el trigger falla
CREATE POLICY "profiles_insert_own"
  ON public.users_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- UPDATE: propio perfil o admin
CREATE POLICY "profiles_update"
  ON public.users_profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR public.get_my_role() = 'admin'
  );


-- ─────────────────────────────────────────────────────────────────
-- POLICIES: clients
-- ─────────────────────────────────────────────────────────────────

-- SELECT:
--   admin      → ve todos
--   trabajador → solo los asignados a él
--   cliente    → solo su propio registro (por email)
CREATE POLICY "clients_select"
  ON public.clients FOR SELECT
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'trabajador' AND assigned_to = auth.uid())
    OR (
      public.get_my_role() = 'cliente'
      AND email = (SELECT email FROM public.users_profiles WHERE id = auth.uid())
    )
  );

-- INSERT: solo trabajador y admin
CREATE POLICY "clients_insert"
  ON public.clients FOR INSERT
  WITH CHECK (public.get_my_role() IN ('trabajador', 'admin'));

-- UPDATE: admin o trabajador con cliente asignado
CREATE POLICY "clients_update"
  ON public.clients FOR UPDATE
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'trabajador' AND assigned_to = auth.uid())
  );

-- DELETE: solo admin
CREATE POLICY "clients_delete"
  ON public.clients FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ─────────────────────────────────────────────────────────────────
-- POLICIES: interactions
-- ─────────────────────────────────────────────────────────────────

CREATE POLICY "interactions_select"
  ON public.interactions FOR SELECT
  USING (
    public.get_my_role() = 'admin'
    OR user_id = auth.uid()
    OR (
      public.get_my_role() = 'trabajador'
      AND client_id IN (
        SELECT id FROM public.clients WHERE assigned_to = auth.uid()
      )
    )
    OR (
      public.get_my_role() = 'cliente'
      AND client_id IN (
        SELECT id FROM public.clients
        WHERE email = (SELECT email FROM public.users_profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "interactions_insert"
  ON public.interactions FOR INSERT
  WITH CHECK (
    public.get_my_role() IN ('trabajador', 'admin')
    AND user_id = auth.uid()
  );

-- UPDATE/DELETE: quien la creó o admin
CREATE POLICY "interactions_update"
  ON public.interactions FOR UPDATE
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "interactions_delete"
  ON public.interactions FOR DELETE
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');


-- ─────────────────────────────────────────────────────────────────
-- POLICIES: pipeline_stages (catálogo, lectura pública autenticada)
-- ─────────────────────────────────────────────────────────────────

CREATE POLICY "stages_select"
  ON public.pipeline_stages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "stages_insert"
  ON public.pipeline_stages FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "stages_update"
  ON public.pipeline_stages FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "stages_delete"
  ON public.pipeline_stages FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ─────────────────────────────────────────────────────────────────
-- POLICIES: client_pipeline
-- ─────────────────────────────────────────────────────────────────

CREATE POLICY "cpipeline_select"
  ON public.client_pipeline FOR SELECT
  USING (
    public.get_my_role() = 'admin'
    OR (
      public.get_my_role() = 'trabajador'
      AND client_id IN (SELECT id FROM public.clients WHERE assigned_to = auth.uid())
    )
    OR (
      public.get_my_role() = 'cliente'
      AND client_id IN (
        SELECT id FROM public.clients
        WHERE email = (SELECT email FROM public.users_profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "cpipeline_insert"
  ON public.client_pipeline FOR INSERT
  WITH CHECK (public.get_my_role() IN ('trabajador', 'admin'));

CREATE POLICY "cpipeline_update"
  ON public.client_pipeline FOR UPDATE
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'trabajador'
        AND client_id IN (SELECT id FROM public.clients WHERE assigned_to = auth.uid()))
  );

CREATE POLICY "cpipeline_delete"
  ON public.client_pipeline FOR DELETE
  USING (public.get_my_role() IN ('trabajador', 'admin'));


-- =================================================================
-- FIN DE LA MIGRACIÓN
-- =================================================================
-- Verifica que todo esté correcto:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
