#!/usr/bin/env bun

import { readFileSync } from "node:fs";

// Lê argumentos do terminal
const [, , rawName] = process.argv;

if (!rawName) {
  console.error("❌ Você precisa passar o nome da model. Ex: bun cli-test.ts user");
  process.exit(1);
}

// Nome da model no Prisma é PascalCase
const modelName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

// Caminho do schema.prisma
const schemaPath = "./prisma/schema.prisma";
const schema = readFileSync(schemaPath, "utf-8");

// Expressão regular para pegar a model
const regex = new RegExp(`model\\s+${modelName}\\s+{([\\s\\S]*?)}`, "m");
const match = schema.match(regex);

if (!match) {
  console.error(`❌ Model '${modelName}' não encontrada em ${schemaPath}`);
  process.exit(1);
}

// Extrai atributos da model
const body = match[1]
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("//")) // remove comentários
  .map((line) => {
    const [field, type] = line.split(/\s+/); // pega campo e tipo
    return { field, type };
  });

console.log(`📦 Atributos da model '${modelName}':\n`);
body.forEach(({ field, type }) => console.log(` - ${field}: ${type}`));
