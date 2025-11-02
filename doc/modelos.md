Lo que si visualiza a continuacion es modelo de datos Prisma definido en el backend

```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// Enumeración de roles de usuario
enum Rol {
  apoderado
  docente
  director
  administrador
}

/// Enumeración de estado de encuesta
enum EstadoEncuesta {
  borrador
  activa
  cerrada
  vencida
}

/// Enumeración de tipo de pregunta
enum TipoPregunta {
  texto_corto
  texto_largo
  opcion_unica
  opcion_multiple
  escala_1_5
}

/// Enumeración de tipo de permiso para docentes
enum PermisoTipo {
  comunicados
  encuestas
}

/// Enumeración de tipo de evaluación
enum EvalTipo {
  unica
  recurrente
}

/// Enumeración de estado de matrícula
enum MatriculaEstado {
  activo
  retirado
  trasladado
}

/// Enumeración de tipo de relación familiar
enum RelacionTipo {
  padre
  madre
  apoderado
  tutor
}

/// Enumeración de tipos de comunicado
enum TipoComunicado {
  academico
  administrativo
  evento
  urgente
  informativo
}

/// Enumeración de estados de comunicado
enum EstadoComunicado {
  borrador
  publicado
  programado
  archivado
  cancelado
}

/// Enumeración de prioridades de comunicado
enum PrioridadComunicado {
  baja
  normal
  alta
}

/// Tabla: usuarios
model Usuario {
  id                    String    @id @default(uuid()) @db.Uuid
  tipo_documento        String
  nro_documento         String    @db.VarChar(20)
  password_hash         String
  rol                   Rol
  nombre                String
  apellido              String
  telefono              String    @db.VarChar(20)
  fecha_creacion        DateTime  @default(now())
  fecha_ultimo_login    DateTime?
  estado_activo         Boolean   @default(true)
  debe_cambiar_password Boolean   @default(false)

  // Relaciones existentes
  resetTokens             PasswordResetToken[]
  blacklistedTokens       TokenBlacklist[]
  permisosDocentes        PermisoDocente[]
  permisosOtorgados       PermisoDocente[]    @relation("PermisoOtorgadoPor")
  permisosDocentesLogs    PermisoDocenteLog[]
  permisosLogsOtorgados   PermisoDocenteLog[] @relation("PermisoLogOtorgadoPor")
  asignacionesDocente     AsignacionDocenteCurso[]
  relacionesApoderado     RelacionesFamiliares[]
  
  // Nuevas relaciones para encuestas
  encuestasCreadas         Encuesta[]
  respuestasEncuestas       RespuestaEncuesta[]
  notificacionesUsuario     Notificacion[]
  
  // Nuevas relaciones para módulo académico
  evaluacionesRegistradas Evaluacion[] @relation("Registrante")
  asistenciasRegistradas Asistencia[] @relation("RegistranteAsistencia")
  
  // Nuevas relaciones para módulo de mensajería
  conversacionesPadre       Conversacion[] @relation("PadreConversacion")
  conversacionesDocente      Conversacion[] @relation("DocenteConversacion")
  mensajesEnviados         Mensaje[] @relation("EmisorMensaje")
  
  // Nuevas relaciones para módulo de soporte técnico
  ticketsCreados          TicketSoporte[]    @relation("TicketCreador")
  ticketsAsignados         TicketSoporte[]    @relation("TicketAsignado")
  respuestasTickets        RespuestaTicket[]
  
  // Nuevas relaciones para comunicados
  comunicados_creados   Comunicado[] @relation("AutorComunicado")
  comunicados_leidos    ComunicadoLectura[]

  @@unique([tipo_documento, nro_documento], name: "usuarios_documento_unique")
  @@map("usuarios")
}

/// Tabla: password_reset_tokens
model PasswordResetToken {
  id               String    @id @default(uuid()) @db.Uuid
  token            String    @unique
  id_usuario       String    @db.Uuid
  usuario          Usuario   @relation(fields: [id_usuario], references: [id])
  fecha_creacion   DateTime  @default(now())
  fecha_expiracion DateTime
  usado            Boolean   @default(false)

  @@index([id_usuario, fecha_creacion], name: "idx_reset_tokens_usuario_fecha")
  @@map("password_reset_tokens")
}

/// Tabla: tokens_blacklist
model TokenBlacklist {
  id             String   @id @default(uuid()) @db.Uuid
  token          String   @unique
  usuario_id     String?  @db.Uuid
  usuario        Usuario? @relation(fields: [usuario_id], references: [id])
  fecha_creacion DateTime @default(now())

  @@map("tokens_blacklist")
}

/// Tabla: permisos_docentes
model PermisoDocente {
  id               String      @id @default(uuid()) @db.Uuid
  docente_id       String      @db.Uuid
  docente          Usuario     @relation(fields: [docente_id], references: [id])
  tipo_permiso     PermisoTipo
  estado_activo    Boolean     @default(true)
  fecha_otorgamiento DateTime  @default(now())
  otorgado_por     String?     @db.Uuid
  otorgante        Usuario?    @relation("PermisoOtorgadoPor", fields: [otorgado_por], references: [id])
  año_academico    Int

  @@unique([docente_id, tipo_permiso, año_academico])
  @@map("permisos_docentes")
}

/// Tabla: historial de cambios de permisos
model PermisoDocenteLog {
  id             String      @id @default(uuid()) @db.Uuid
  docente_id     String      @db.Uuid
  docente        Usuario     @relation(fields: [docente_id], references: [id])
  tipo_permiso   PermisoTipo
  accion         String
  fecha          DateTime    @default(now())
  otorgado_por   String?     @db.Uuid
  otorgante      Usuario?    @relation("PermisoLogOtorgadoPor", fields: [otorgado_por], references: [id])
  año_academico  Int

  @@index([docente_id, año_academico])
  @@map("permisos_docentes_log")
}

/// Tabla: nivel_grado
model NivelGrado {
  id            String   @id @default(uuid()) @db.Uuid
  nivel         String
  grado         String
  descripcion   String?
  estado_activo Boolean  @default(true)

  cursos        Curso[]
  asignaciones  AsignacionDocenteCurso[]
  estudiantes   Estudiante[]
  calendarioEventos CalendarioAcademico[]

  @@unique([nivel, grado])
  @@map("nivel_grado")
}

/// Tabla: cursos
model Curso {
  id              String     @id @default(uuid()) @db.Uuid
  nombre          String
  codigo_curso    String     @unique
  nivel_grado_id  String     @db.Uuid
  nivel_grado     NivelGrado @relation(fields: [nivel_grado_id], references: [id])
  año_academico   Int
  estado_activo   Boolean    @default(true)

  asignaciones    AsignacionDocenteCurso[]
  
  // Nuevas relaciones para módulo académico
  evaluaciones Evaluacion[]
  asistencias Asistencia[]
  
  // Nuevas relaciones para módulo de mensajería
  conversaciones Conversacion[]

  @@map("cursos")
}

/// Tabla: asignaciones_docente_curso
model AsignacionDocenteCurso {
  id              String     @id @default(uuid()) @db.Uuid
  docente_id      String     @db.Uuid
  docente         Usuario    @relation(fields: [docente_id], references: [id])
  curso_id        String     @db.Uuid
  curso           Curso      @relation(fields: [curso_id], references: [id])
  nivel_grado_id  String     @db.Uuid
  nivel_grado     NivelGrado @relation(fields: [nivel_grado_id], references: [id])
  año_academico   Int
  fecha_asignacion DateTime
  estado_activo   Boolean    @default(true)

  @@index([docente_id, año_academico, estado_activo])
  @@map("asignaciones_docente_curso")
}

/// Tabla: estructura_evaluacion
model EstructuraEvaluacion {
  id                  String    @id @default(uuid()) @db.Uuid
  año_academico       Int
  nombre_item         String
  peso_porcentual     Decimal   @db.Decimal(5, 2)
  tipo_evaluacion     EvalTipo
  orden_visualizacion Int
  estado_activo       Boolean   @default(true)
  fecha_configuracion DateTime  @default(now())
  bloqueada           Boolean   @default(true)

  evaluaciones Evaluacion[]

  @@index([año_academico, estado_activo])
  @@map("estructura_evaluacion")
}

/// Tabla: estudiantes
model Estudiante {
  id               String         @id @default(uuid()) @db.Uuid
  codigo_estudiante String        @unique
  nombre           String
  apellido         String
  nivel_grado_id   String         @db.Uuid
  nivel_grado      NivelGrado     @relation(fields: [nivel_grado_id], references: [id])
  año_academico    Int
  estado_matricula MatriculaEstado @default(activo)

  relacionesFamiliares RelacionesFamiliares[]
  respuestasEncuestas       RespuestaEncuesta[]
  notificacionesEstudiante  Notificacion[]
  
  // Nuevas relaciones para módulo académico
  evaluaciones Evaluacion[]
  asistencias Asistencia[]
  
  // Nuevas relaciones para módulo de mensajería
  conversaciones Conversacion[]

  @@index([nivel_grado_id, año_academico])
  @@map("estudiantes")
}

/// Tabla: relaciones_familiares
model RelacionesFamiliares {
  id              String        @id @default(uuid()) @db.Uuid
  apoderado_id    String        @db.Uuid
  apoderado       Usuario       @relation(fields: [apoderado_id], references: [id])
  estudiante_id   String        @db.Uuid
  estudiante      Estudiante    @relation(fields: [estudiante_id], references: [id])
  tipo_relacion   RelacionTipo
  fecha_asignacion DateTime     @default(now())
  estado_activo   Boolean       @default(true)
  año_academico   Int

  @@index([apoderado_id, estado_activo], name: "idx_relaciones_apoderado")
  @@index([estudiante_id], name: "idx_relaciones_estudiante")
  @@map("relaciones_familiares")
}

/// Tabla: comunicados
model Comunicado {
  id                    String    @id @default(uuid()) @db.Uuid
  titulo                String
  contenido             String    @db.Text
  tipo                  TipoComunicado
  estado                EstadoComunicado    @default(borrador)
  autor_id              String    @db.Uuid
  autor                 Usuario    @relation("AutorComunicado", fields: [autor_id], references: [id])
  publico_objetivo      String[]
  niveles_objetivo       String[]
  grados_objetivo        String[]
  cursos_objetivo        String[]
  fecha_creacion        DateTime  @default(now())
  fecha_publicacion     DateTime?
  fecha_programada      DateTime?
  fecha_vigencia_desde DateTime?
  fecha_vigencia_hasta DateTime?
  requiere_confirmacion Boolean   @default(false)
  prioridad            PrioridadComunicado    @default(normal)
  editado               Boolean   @default(false)
  año_academico         Int

  // Relaciones
  lecturas              ComunicadoLectura[]
  notificaciones        Notificacion[] @relation("ComunicadoNotificaciones")
  
  @@map("comunicados")
}

/// Tabla: comunicados_lecturas
model ComunicadoLectura {
  id               String    @id @default(uuid()) @db.Uuid
  comunicado_id    String    @db.Uuid
  comunicado       Comunicado @relation(fields: [comunicado_id], references: [id], onDelete: Cascade)
  usuario_id       String    @db.Uuid
  usuario          Usuario    @relation(fields: [usuario_id], references: [id])
  fecha_lectura    DateTime  @default(now())
  
  @@unique([comunicado_id, usuario_id])
  @@map("comunicados_lecturas")
}

/// Tabla: encuestas
model Encuesta {
  id                        String         @id @default(uuid()) @db.Uuid
  titulo                    String         @db.VarChar(200)
  descripcion               String
  fecha_creacion            DateTime       @default(now())
  fecha_inicio              DateTime?      // Fecha de publicación
  fecha_vencimiento         DateTime?      // Fecha límite para responder
  fecha_cierre              DateTime?      // Fecha de cierre anticipado
  estado                    EstadoEncuesta @default(borrador)
  permite_respuesta_multiple Boolean        @default(false)
  es_anonima                Boolean        @default(false)
  mostrar_resultados        Boolean        @default(true)
  autor_id                  String         @db.Uuid
  autor                     Usuario        @relation(fields: [autor_id], references: [id])
  año_academico             Int
  
  // Relaciones
  preguntas                 PreguntaEncuesta[]
  respuestas                RespuestaEncuesta[]
  notificacionesEncuesta    Notificacion[]

  @@map("encuestas")
}

/// Tabla: preguntas de encuesta
model PreguntaEncuesta {
  id            String       @id @default(uuid()) @db.Uuid
  encuesta_id   String       @db.Uuid
  encuesta      Encuesta     @relation(fields: [encuesta_id], references: [id], onDelete: Cascade)
  texto         String
  tipo          TipoPregunta
  obligatoria   Boolean      @default(false)
  orden         Int
  opciones      OpcionPregunta[]
  respuestas    RespuestaPregunta[]
  votos         VotoEncuesta[]

  @@map("preguntas_encuesta")
}

/// Tabla: opciones de pregunta (para opción única y múltiple)
model OpcionPregunta {
  id           String           @id @default(uuid()) @db.Uuid
  pregunta_id  String           @db.Uuid
  pregunta     PreguntaEncuesta @relation(fields: [pregunta_id], references: [id], onDelete: Cascade)
  texto        String
  orden        Int
  votos        VotoEncuesta[]

  @@map("opciones_pregunta")
}

/// Tabla: respuestas de encuesta
model RespuestaEncuesta {
  id                       String    @id @default(uuid()) @db.Uuid
  encuesta_id              String    @db.Uuid
  encuesta                 Encuesta  @relation(fields: [encuesta_id], references: [id])
  usuario_id               String    @db.Uuid
  usuario                  Usuario   @relation(fields: [usuario_id], references: [id])
  estudiante_id            String?   @db.Uuid // Para padres, referencia al hijo
  estudiante               Estudiante? @relation(fields: [estudiante_id], references: [id])
  fecha_respuesta          DateTime  @default(now())
  tiempo_respuesta_minutos Int?
  ip_respuesta             String?
  
  // Relaciones
  respuestasPregunta       RespuestaPregunta[]
  votos                    VotoEncuesta[]

  @@unique([encuesta_id, usuario_id])
  @@map("respuestas_encuestas")
}

/// Tabla: respuestas a preguntas específicas
model RespuestaPregunta {
  id               String            @id @default(uuid()) @db.Uuid
  respuesta_id     String            @db.Uuid
  respuesta        RespuestaEncuesta @relation(fields: [respuesta_id], references: [id], onDelete: Cascade)
  pregunta_id      String            @db.Uuid
  pregunta         PreguntaEncuesta  @relation(fields: [pregunta_id], references: [id])
  valor_texto     String?           // Para respuestas de texto
  valor_opcion_id String?           // Para respuestas de opción única
  valor_opciones  String[]          // Para respuestas de opción múltiple (array de IDs)
  valor_escala    Int?              // Para respuestas de escala 1-5
  votos           VotoEncuesta[]

  @@map("respuestas_pregunta")
}

/// Tabla: votos (para opción múltiple)
model VotoEncuesta {
  id               String            @id @default(uuid()) @db.Uuid
  respuesta_id     String            @db.Uuid
  respuesta        RespuestaEncuesta @relation(fields: [respuesta_id], references: [id], onDelete: Cascade)
  pregunta_id      String            @db.Uuid
  pregunta         PreguntaEncuesta  @relation(fields: [pregunta_id], references: [id])
  opcion_id        String            @db.Uuid
  opcion           OpcionPregunta   @relation(fields: [opcion_id], references: [id])
  respuesta_pregunta_id String?      @db.Uuid
  respuesta_pregunta RespuestaPregunta? @relation(fields: [respuesta_pregunta_id], references: [id])

  @@map("votos_encuesta")
}

/// Tabla: notificaciones
model Notificacion {
  id                       String    @id @default(uuid()) @db.Uuid
  usuario_id                String    @db.Uuid
  usuario                   Usuario   @relation(fields: [usuario_id], references: [id])
  tipo                     String    // "asistencia", "calificacion", "mensaje", "comunicado", "encuesta", "sistema", "ticket"
  titulo                   String    @db.VarChar(200)
  contenido                String
  datos_adicionales        Json?     // Información extra en JSON
  canal                    String    // "plataforma", "whatsapp", "ambos"
  estado_plataforma        String    @default("pendiente") // "pendiente", "entregada", "leida"
  estado_whatsapp          String?   // "pendiente", "enviado", "entregado", "error"
  fecha_creacion           DateTime  @default(now())
  fecha_entrega_plataforma DateTime?
  fecha_envio_whatsapp     DateTime?
  fecha_lectura            DateTime?
  url_destino              String?
  estudiante_id            String?   @db.Uuid
  estudiante               Estudiante? @relation(fields: [estudiante_id], references: [id])
  referencia_id            String?   // ID del elemento que generó la notificación
  tipo_referencia           String?   // "encuesta", "ticket" para identificar tipo
  año_academico            Int
  encuesta_id              String?   @db.Uuid
  encuesta                 Encuesta?  @relation(fields: [encuesta_id], references: [id])
  ticket_id                String?   @db.Uuid
  ticket                   TicketSoporte? @relation(fields: [ticket_id], references: [id])
  comunicado_id            String?   @db.Uuid
  comunicado               Comunicado? @relation("ComunicadoNotificaciones", fields: [comunicado_id], references: [id])

  @@map("notificaciones")
}

/// Tabla: evaluaciones
model Evaluacion {
  id                        String    @id @default(uuid()) @db.Uuid
  estudiante_id             String    @db.Uuid
  estudiante                Estudiante @relation(fields: [estudiante_id], references: [id])
  curso_id                  String    @db.Uuid
  curso                     Curso     @relation(fields: [curso_id], references: [id])
  estructura_evaluacion_id  String    @db.Uuid
  estructura_evaluacion     EstructuraEvaluacion @relation(fields: [estructura_evaluacion_id], references: [id])
  trimestre                 Int
  año_academico              Int
  fecha_evaluacion           DateTime
  calificacion_numerica     Decimal   @db.Decimal(5, 2)
  calificacion_letra        String
  observaciones             String?
  estado                    String     @default("preliminar") // "preliminar" | "final"
  registrado_por             String    @db.Uuid
  registrante               Usuario    @relation("Registrante", fields: [registrado_por], references: [id])
  fecha_registro            DateTime  @default(now())

  @@index([estudiante_id, año_academico, trimestre, curso_id, estructura_evaluacion_id])
  @@map("evaluaciones")
}

/// Tabla: asistencias
model Asistencia {
  id              String    @id @default(uuid()) @db.Uuid
  estudiante_id   String    @db.Uuid
  estudiante      Estudiante @relation(fields: [estudiante_id], references: [id])
  curso_id        String    @db.Uuid
  curso           Curso     @relation(fields: [curso_id], references: [id])
  fecha           DateTime
  estado          String    // "presente", "tardanza", "permiso", "falta_justificada", "falta_injustificada"
  hora_llegada   String?   // Hora de llegada para tardanzas
  justificacion   String?   // Motivo de ausencia o permiso
  año_academico   Int       // Año lectivo
  tipo_asistencia String    // "asistencia", "tardanza", "falta", "falta_justificada"
  observaciones   String?
  registrado_por  String    @db.Uuid
  registrante     Usuario   @relation("RegistranteAsistencia", fields: [registrado_por], references: [id])
  fecha_registro  DateTime  @default(now())

  @@unique([estudiante_id, curso_id, fecha])
  @@map("asistencias")
}

/// Tabla: calendario_academico
model CalendarioAcademico {
  id          String    @id @default(uuid()) @db.Uuid
  fecha       DateTime
  tipo_evento String    // "no_lectivo", "feriado", "evaluacion", "evento"
  descripcion String
  nivel_grado_id String? @db.Uuid
  nivel_grado  NivelGrado? @relation(fields: [nivel_grado_id], references: [id])
  año_academico Int
  estado_activo Boolean   @default(true)

  @@unique([fecha, nivel_grado_id])
  @@map("calendario_academico")
}

/// Tabla: conversaciones
model Conversacion {
  id                    String    @id @default(uuid()) @db.Uuid
  estudiante_id         String    @db.Uuid
  estudiante            Estudiante @relation(fields: [estudiante_id], references: [id])
  curso_id              String    @db.Uuid
  curso                 Curso     @relation(fields: [curso_id], references: [id])
  padre_id              String    @db.Uuid
  padre                 Usuario   @relation("PadreConversacion", fields: [padre_id], references: [id])
  docente_id            String    @db.Uuid
  docente               Usuario   @relation("DocenteConversacion", fields: [docente_id], references: [id])
  asunto                String    @db.VarChar(200)
  estado                 String    @default("activa") // "activa", "cerrada"
  fecha_inicio           DateTime  @default(now())
  fecha_ultimo_mensaje  DateTime  @default(now())
  año_academico         Int
  tipo_conversacion     String    @default("padre_docente")
  creado_por            String    @db.Uuid
  
  // Relaciones
  mensajes              Mensaje[]
  
  @@map("conversaciones")
}

/// Tabla: mensajes
model Mensaje {
  id                String    @id @default(uuid()) @db.Uuid
  conversacion_id   String    @db.Uuid
  conversacion      Conversacion @relation(fields: [conversacion_id], references: [id])
  emisor_id        String    @db.Uuid
  emisor           Usuario   @relation("EmisorMensaje", fields: [emisor_id], references: [id])
  contenido         String    @db.Text
  fecha_envio      DateTime  @default(now())
  estado_lectura   String    @default("enviado") // "enviado", "leido"
  fecha_lectura    DateTime?
  tiene_adjuntos    Boolean   @default(false)
  
  // Relaciones
  archivos          ArchivoAdjunto[]
  
  @@map("mensajes")
}

/// Tabla: archivos_adjuntos
model ArchivoAdjunto {
  id                String    @id @default(uuid()) @db.Uuid
  mensaje_id        String?   @db.Uuid
  mensaje           Mensaje?   @relation(fields: [mensaje_id], references: [id])
  ticket_id         String?   @db.Uuid
  ticket            TicketSoporte? @relation(fields: [ticket_id], references: [id])
  nombre_original    String    @db.VarChar(255)
  nombre_archivo    String    @db.VarChar(255)
  url_cloudinary    String
  tipo_mime         String    @db.VarChar(100)
  tamaño_bytes      Int
  es_imagen         Boolean   @default(false)
  fecha_subida      DateTime  @default(now())
  subido_por        String    @db.Uuid
  
  @@map("archivos_adjuntos")
}

/// Enumeración de categorías de tickets de soporte
enum CategoriaTicket {
  acceso_plataforma
  funcionalidad_academica
  comunicaciones
  reportes
  sugerencias
  errores_sistema
  otros
}

/// Enumeración de estados de tickets de soporte
enum EstadoTicket {
  pendiente
  en_progreso
  esperando_respuesta
  resuelto
  cerrado
  cancelado
}

/// Enumeración de prioridades de tickets de soporte
enum PrioridadTicket {
  baja
  normal
  alta
  critica
}

/// Tabla: tickets_soporte
model TicketSoporte {
  id                    String            @id @default(uuid()) @db.Uuid
  numero_ticket         String            @unique
  titulo                String            @db.VarChar(200)
  descripcion           String            @db.Text
  categoria             CategoriaTicket
  prioridad             PrioridadTicket   @default(normal)
  estado                EstadoTicket      @default(pendiente)
  usuario_id            String            @db.Uuid
  usuario               Usuario           @relation("TicketCreador", fields: [usuario_id], references: [id])
  asignado_a            String?           @db.Uuid
  asignado              Usuario?          @relation("TicketAsignado", fields: [asignado_a], references: [id])
  fecha_creacion        DateTime          @default(now())
  fecha_asignacion      DateTime?
  fecha_resolucion      DateTime?
  tiempo_respuesta_horas Int?
  satisfaccion_usuario  Int?
  año_academico         Int
  respuestas            RespuestaTicket[]
  archivos_adjuntos     ArchivoAdjunto[]
  notificaciones        Notificacion[]

  @@map("tickets_soporte")
}

/// Tabla: respuestas_tickets
model RespuestaTicket {
  id                    String            @id @default(uuid()) @db.Uuid
  ticket_id             String            @db.Uuid
  ticket                TicketSoporte     @relation(fields: [ticket_id], references: [id], onDelete: Cascade)
  usuario_id            String            @db.Uuid
  usuario               Usuario           @relation(fields: [usuario_id], references: [id])
  contenido             String            @db.Text
  es_respuesta_publica  Boolean           @default(true)
  fecha_respuesta       DateTime          @default(now())
  estado_cambio         String?

  @@map("respuestas_tickets")
}

/// Tabla: categorias_faq
model CategoriaFAQ {
  id                String            @id @default(uuid()) @db.Uuid
  nombre            String            @unique
  icono             String
  color             String
  descripcion       String?
  preguntas         FAQ[]

  @@map("categorias_faq")
}

/// Tabla: faq
model FAQ {
  id                    String            @id @default(uuid()) @db.Uuid
  pregunta              String
  respuesta             String            @db.Text
  categoria_id          String            @db.Uuid
  categoria             CategoriaFAQ      @relation(fields: [categoria_id], references: [id])
  orden                 Int
  vistas                Int               @default(0)
  activa                Boolean           @default(true)
  fecha_actualizacion   DateTime          @updatedAt

  @@map("faq")
}

/// Tabla: categorias_guias
model CategoriaGuia {
  id                String            @id @default(uuid()) @db.Uuid
  nombre            String            @unique
  icono             String
  color             String
  descripcion       String?
  guias             Guia[]

  @@map("categorias_guias")
}

/// Tabla: guias
model Guia {
  id                    String            @id @default(uuid()) @db.Uuid
  titulo                String
  descripcion           String            @db.Text
  categoria_id          String            @db.Uuid
  categoria             CategoriaGuia     @relation(fields: [categoria_id], references: [id])
  icono                 String
  pdf_url               String
  paginas               Int?
  tamaño_mb             Decimal?          @db.Decimal(8, 2)
  descargas             Int               @default(0)
  activa                Boolean           @default(true)
  fecha_actualizacion   DateTime          @updatedAt

  @@map("guias")
}

```