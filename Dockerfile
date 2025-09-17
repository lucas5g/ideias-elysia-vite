# ========================
# Stage 1: Build
# ========================
FROM oven/bun AS build

WORKDIR /app

# Copiar configs básicas
COPY package.json bun.lock tsconfig.json  ./

# Instalar dependências
RUN bun install

# Copiar código-fonte e diretório Prisma
COPY ./src ./src
COPY ./prisma ./prisma

# Gerar Prisma Client (com engines corretas)
RUN bunx prisma generate

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

# Instalar OpenSSL (dependência do Prisma)
RUN apt-get update -y && apt-get install -y openssl libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*


# Copiar binário da aplicação
COPY --from=build /app/server server

# Copiar Prisma Client + engines
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma

# Copiar o diretório prisma (schema.prisma)
COPY ./prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

# Rodar prisma db push antes do servidor iniciar
CMD ["sh", "-c", "bunx prisma db push && ./server"]
