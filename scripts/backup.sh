#!/usr/bin/env bash

# ==============================================================================
# Sellio — Script de Backup Semanal (Supabase -> Cloudflare R2)
# ==============================================================================
# Requisitos:
#   1. pg_dump (instalado en el sistema)
#   2. aws-cli (configurado para usar el endpoint de Cloudflare R2)
# ==============================================================================

set -euo pipefail

# Cargar variables de entorno si existe .env.local localmente (para ejecución manual)
if [ -f "apps/web/.env.local" ]; then
  # shellcheck disable=SC1091
  export "$(grep -v '^#' apps/web/.env.local | xargs)"
fi

# Validar variables requeridas
DATABASE_URL="${DATABASE_URL:-}"
R2_BUCKET_NAME="${R2_BUCKET_NAME:-sellio-db-backups}"
R2_ENDPOINT_URL="${R2_ENDPOINT_URL:-}" # p. ej., https://<account_id>.r2.cloudflarestorage.com

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL no está definida."
  exit 1
fi

if [ -z "$R2_ENDPOINT_URL" ]; then
  echo "⚠️ Advertencia: R2_ENDPOINT_URL no está definida. Se omitirá la subida a Cloudflare R2."
fi

# Configuración de archivos temporales
BACKUP_DIR="tmp/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sellio_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando backup de la base de datos..."
# Ejecutar pg_dump y comprimir el output
if pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$BACKUP_FILE"; then
  echo "✅ Backup local creado con éxito: ${BACKUP_FILE}"
  echo "📊 Tamaño del archivo: $(du -sh "$BACKUP_FILE" | cut -f1)"
else
  echo "❌ Error al ejecutar pg_dump."
  exit 1
fi

# Subir a R2 si el endpoint y el bucket están configurados
if [ -n "$R2_ENDPOINT_URL" ]; then
  echo "🚀 Subiendo backup a Cloudflare R2..."
  if aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET_NAME}/sellio_backup_${TIMESTAMP}.sql.gz" --endpoint-url "$R2_ENDPOINT_URL"; then
    echo "✅ Archivo subido con éxito a R2."
    
    # Limpieza de backups locales antiguos (mantener solo los últimos 7 días localmente)
    find "$BACKUP_DIR" -name "sellio_backup_*.sql.gz" -mtime +7 -delete
    echo "🗑️ Backups locales de más de 7 días eliminados."
  else
    echo "❌ Error al subir el archivo a R2. Revisa la configuración de las credenciales de AWS."
    exit 1
  fi
else
  echo "ℹ️ Subida a R2 omitida. El archivo permanece localmente en: ${BACKUP_FILE}"
fi

echo "🎉 Proceso de backup finalizado con éxito."
