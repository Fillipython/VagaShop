FROM postgres:16-alpine

# Copia o script SQL para a pasta de inicialização automática do PostgreSQL
COPY schema.sql /docker-entrypoint-initdb.d/

# Define variáveis de ambiente padrão para o banco (podem ser sobrescritas ao rodar o container)
ENV POSTGRES_DB=vagashop
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
