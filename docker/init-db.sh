#!/bin/sh
set -e

# Create required databases for Evolution Go if they don't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE evogo_auth' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evogo_auth')\gexec
    SELECT 'CREATE DATABASE evogo_users' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evogo_users')\gexec
    GRANT ALL PRIVILEGES ON DATABASE evogo_auth TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON DATABASE evogo_users TO "$POSTGRES_USER";
EOSQL

