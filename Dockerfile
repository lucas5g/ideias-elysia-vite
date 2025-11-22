# ========================
# Stage 1: Build
# ========================
FROM oven/bun AS build

WORKDIR /app

# Copiar configs básicas
COPY package.json bun.lock tsconfig.json  ./

# Instalar dependências
RUN bun install

# Desabilitar auto-install do bunx para forçar uso da versão local
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0

# Copiar código-fonte e diretório Prisma
COPY ./src ./src
COPY ./prisma ./prisma
COPY ./public ./public

# Gerar Prisma Client (com engines corretas) - usar versão do projeto
RUN bun prisma generate

ENV NODE_ENV=production

# Compilar o app
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    --tsconfig-override tsconfig.json \
    src/index.ts

# ========================
# Stage 2: Final
# ========================
FROM oven/bun:slim

WORKDIR /app

# Instalar dependências do Prisma
RUN apt-get update -y && \
    apt-get install -y libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar binário da aplicação
COPY --from=build /app/server server

# Copiar todo node_modules (necessário para Prisma CLI)
COPY --from=build /app/node_modules /app/node_modules

# Copiar o diretório prisma (schema.prisma)
COPY ./prisma ./prisma

# Copiar arquivos públicos
COPY --from=build /app/public ./public

# Criar script de inicialização
RUN echo '#!/bin/sh\nset -e\ncd /app\n./node_modules/.bin/prisma db push --accept-data-loss --skip-generate\nexec ./server' > /app/start.sh && \
    chmod +x /app/start.sh

ENV NODE_ENV=production
EXPOSE 3000

# Usar script de inicialização
CMD ["/app/start.sh"]
