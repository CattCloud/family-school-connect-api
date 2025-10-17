#!/bin/bash

# Script para probar endpoints de comunicados con curl
# Requiere que el servidor esté corriendo en http://localhost:3000

BASE_URL="http://localhost:3000"

# Variables para tokens (se obtendrán durante el login)
TOKEN_DIRECTOR=""
TOKEN_DOCENTE=""
TOKEN_PADRE=""

echo "=== INICIANDO PRUEBAS DE COMUNICADOS ==="
echo ""

# Función para colorear salida
color_red() {
  echo -e "\033[0;31m$1\033[0m"
}

color_green() {
  echo -e "\033[0;32m$1\033[0m"
}

color_yellow() {
  echo -e "\033[0;33m$1\033[0m"
}

# Función para realizar login
login() {
  local tipo=$1
  local dni=$2
  
  echo "=== LOGIN - $tipo ==="
  
  response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"nro_documento\":\"$dni\",\"password\":\"password\"}")
  
  if echo "$response" | grep -q "\"success\":true"; then
    token=$(echo "$response" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    
    if [ "$tipo" = "DIRECTOR" ]; then
      TOKEN_DIRECTOR="$token"
    elif [ "$tipo" = "DOCENTE" ]; then
      TOKEN_DOCENTE="$token"
    elif [ "$tipo" = "PADRE" ]; then
      TOKEN_PADRE="$token"
    fi
    
    color_green "Login exitoso para $tipo"
  else
    color_red "Error en login para $tipo"
    echo "$response"
    exit 1
  fi
  
  echo ""
}

# Función para probar endpoint
test_endpoint() {
  local metodo=$1
  local endpoint=$2
  local token=$3
  local data=$4
  local descripcion=$5
  
  echo "=== $descripcion ==="
  echo "$metodo $endpoint"
  
  if [ -n "$data" ]; then
    response=$(curl -s -X "$metodo" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data")
  else
    response=$(curl -s -X "$metodo" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $token")
  fi
  
  if echo "$response" | grep -q "\"success\":true"; then
    color_green "✓ $descripcion - Exitoso"
  else
    color_red "✗ $descripcion - Error"
    echo "$response" | head -c 200
    echo "..."
  fi
  
  echo ""
}

# Realizar login de usuarios
login "DIRECTOR" "12345678"
login "DOCENTE" "87654321"
login "PADRE" "11223344"

echo "=== INICIANDO PRUEBAS DE ENDPOINTS ==="
echo ""

# 1. Crear comunicado como director
test_endpoint "POST" "/comunicados" "$TOKEN_DIRECTOR" \
  '{
    "titulo": "Comunicado de prueba del director",
    "tipo": "academico",
    "contenido_html": "<p>Este es un comunicado de prueba creado por el director.</p>",
    "publico_objetivo": ["padres"],
    "grados": ["5to"],
    "estado": "borrador"
  }' \
  "POST /comunicados - Crear comunicado (Director)"

# 2. Verificar permisos de docente
test_endpoint "GET" "/permisos-docentes/87654321" "$TOKEN_DIRECTOR" "" \
  "GET /permisos-docentes/:id - Verificar permisos de docente"

# 3. Obtener cursos asignados a docente
test_endpoint "GET" "/cursos/docente/87654321" "$TOKEN_DOCENTE" "" \
  "GET /cursos/docente/:id - Cursos asignados a docente"

# 4. Obtener todos los cursos (solo director)
test_endpoint "GET" "/cursos/todos" "$TOKEN_DIRECTOR" "" \
  "GET /cursos/todos - Todos los cursos (Director)"

# 5. Obtener niveles y grados (solo director)
test_endpoint "GET" "/nivel-grado" "$TOKEN_DIRECTOR" "" \
  "GET /nivel-grado - Niveles y grados (Director)"

# 6. Calcular destinatarios preview
test_endpoint "POST" "/usuarios/destinatarios/preview" "$TOKEN_DIRECTOR" \
  '{
    "publico_objetivo": ["padres"],
    "grados": ["5to"],
    "todos": false
  }' \
  "POST /usuarios/destinatarios/preview - Calcular destinatarios"

# 7. Validar HTML
test_endpoint "POST" "/comunicados/validar-html" "$TOKEN_DIRECTOR" \
  '{
    "contenido_html": "<p>Contenido válido</p><script>alert(\"XSS\")</script>"
  }' \
  "POST /comunicados/validar-html - Validar HTML"

# 8. Validar segmentación
test_endpoint "POST" "/comunicados/validar-segmentacion" "$TOKEN_DOCENTE" \
  '{
    "publico_objetivo": ["padres"],
    "grados": ["5to"]
  }' \
  "POST /comunicados/validar-segmentacion - Validar segmentación (Docente)"

# 9. Crear borrador como docente
test_endpoint "POST" "/comunicados/borrador" "$TOKEN_DOCENTE" \
  '{
    "titulo": "Borrador de prueba del docente",
    "tipo": "evento",
    "contenido_html": "<p>Este es un borrador de prueba creado por el docente.</p>",
    "publico_objetivo": ["padres"],
    "grados": ["5to"]
  }' \
  "POST /comunicados/borrador - Crear borrador (Docente)"

# 10. Listar borradores
test_endpoint "GET" "/comunicados/mis-borradores" "$TOKEN_DOCENTE" "" \
  "GET /comunicados/mis-borradores - Listar borradores"

# 11. Listar comunicados programados
test_endpoint "GET" "/comunicados/programados" "$TOKEN_DIRECTOR" "" \
  "GET /comunicados/programados - Comunicados programados"

# 12. Error: Padre intenta crear comunicado
test_endpoint "POST" "/comunicados" "$TOKEN_PADRE" \
  '{
    "titulo": "Comunicado no permitido",
    "tipo": "academico",
    "contenido_html": "<p>Este comunicado no debería crearse.</p>",
    "publico_objetivo": ["padres"],
    "grados": ["5to"],
    "estado": "borrador"
  }' \
  "POST /comunicados - Error: Padre intenta crear comunicado"

# 13. Error: Validación de título corto
test_endpoint "POST" "/comunicados" "$TOKEN_DIRECTOR" \
  '{
    "titulo": "Corto",
    "tipo": "academico",
    "contenido_html": "<p>Este es un contenido de prueba.</p>",
    "publico_objetivo": ["padres"],
    "grados": ["5to"],
    "estado": "borrador"
  }' \
  "POST /comunicados - Error: Título corto"

# 14. Error: Validación de contenido corto
test_endpoint "POST" "/comunicados" "$TOKEN_DIRECTOR" \
  '{
    "titulo": "Título con más de 10 caracteres",
    "tipo": "academico",
    "contenido_html": "<p>Corto</p>",
    "publico_objetivo": ["padres"],
    "grados": ["5to"],
    "estado": "borrador"
  }' \
  "POST /comunicados - Error: Contenido corto"

echo "=== PRUEBAS FINALIZADAS ==="
echo ""
echo "Para ver los logs del servidor, ejecuta:"
echo "tail -f logs/app.log"
echo ""
echo "Para ejecutar las pruebas unitarias:"
echo "npm test -- tests/comunicados.test.js"