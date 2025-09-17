FROM oven/bun AS build

WORKDIR /app

# Copiar configs básicas
COPY package.json bun.lock tsconfig.json ./

# Instalar dependências
RUN bun install

# Copiar código e Prisma
COPY ./src ./src
COPY ./prisma ./prisma

# Gerar o client Prisma (com engines corretas pro ambiente)
RUN bunx prisma generate
RUN bunx prisma migrate deploy
ENV NODE_ENV=production

# Compilar app
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    --tsconfig-override tsconfig.json \
    src/index.ts

# ---------------------------
# Stage final (mais simples, vem com libs necessárias)
FROM oven/bun:slim

WORKDIR /app

# Copiar binário do app
COPY --from=build /app/server server

# Copiar Prisma Client + engines
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma

ENV NODE_ENV=production

EXPOSE 3000
CMD ["sh", "-c", "bunx prisma db push && ./server"]

# CMD ["./server"]

# FROM oven/bun AS build

# WORKDIR /app

# # Cache packages installation
# COPY package.json package.json
# COPY bun.lock bun.lock
# COPY tsconfig.json tsconfig.json

# RUN bun install

# COPY ./src ./src
# COPY ./prisma ./prisma

# # Gerar o client Prisma
# RUN bunx prisma generate

# ENV NODE_ENV=production

# RUN bun build \
# 	--compile \
# 	--minify-whitespace \
# 	--minify-syntax \
# 	--outfile server \
# 	--tsconfig-override tsconfig.json \
# 	src/index.ts

# FROM gcr.io/distroless/base

# WORKDIR /app

# COPY --from=build /app/server server


# # Copia as libs necessárias do Prisma
# COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
# COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma


# ENV NODE_ENV=production

# CMD ["./server"]

# EXPOSE 3000