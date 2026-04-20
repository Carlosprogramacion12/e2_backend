#!/bin/sh
set -e

echo "⏳ Esperando 10 segundos por la base de datos MySQL..."
sleep 10

echo "🔄 Sincronizando esquema de base de datos..."
npx prisma db push --skip-generate --accept-data-loss

echo "🛡️ Generando cliente Prisma local (por seguridad)..."
npx prisma generate

echo "🚀 Iniciando el backend..."
exec "$@"
