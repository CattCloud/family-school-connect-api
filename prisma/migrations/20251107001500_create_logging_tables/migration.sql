-- Migration: create logging tables for validation phase 3
-- Generated on 2025-11-07 by planning_fase3_validacion.md

BEGIN;

-- Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- Table: auth_logs (authentication events)
-- =========================================
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento VARCHAR(50) NOT NULL CHECK (evento IN ('login','logout','intento_fallido')),
  exito BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id UUID,
  año_academico INT NOT NULL DEFAULT 2025
);

COMMENT ON TABLE public.auth_logs IS 'Registros de autenticación para métricas M9 y M10';
COMMENT ON COLUMN public.auth_logs.evento IS 'Tipo de evento: login | logout | intento_fallido';
COMMENT ON COLUMN public.auth_logs.exito IS 'true para login exitoso, false para intento fallido';

-- Indexes for auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_usuario_fecha ON public.auth_logs(usuario_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_evento_exito ON public.auth_logs(evento, exito);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON public.auth_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_auth_logs_session ON public.auth_logs(session_id);

-- =========================================
-- Table: access_logs (module access events)
-- =========================================
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  modulo VARCHAR(100) NOT NULL CHECK (modulo IN (
    'calificaciones','asistencia','comunicados','notificaciones',
    'encuestas','soporte','mensajeria','dashboard','perfil','faq_guias'
  )),
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE SET NULL,
  curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  duracion_sesion INT CHECK (duracion_sesion >= 0),
  url_visitada TEXT,
  año_academico INT NOT NULL DEFAULT 2025
);

COMMENT ON TABLE public.access_logs IS 'Registros de navegación para métricas M1,M2,M3,M11,M12,M13,M14';
COMMENT ON COLUMN public.access_logs.duracion_sesion IS 'Duración en segundos de la interacción medida';

-- Indexes for access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_usuario_modulo ON public.access_logs(usuario_id, modulo, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_estudiante ON public.access_logs(estudiante_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_modulo_academico ON public.access_logs(modulo, timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_duracion ON public.access_logs(duracion_sesion);

COMMIT;