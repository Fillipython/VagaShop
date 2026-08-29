FROM postgres:16-alpine

# Copia o script SQL para a pasta de inicialização automática do PostgreSQL
COPY schema.sql /docker-entrypoint-initdb.d/

