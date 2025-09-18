import { readFileSync } from "node:fs";

// Lê argumentos do terminal
const [, , rawName] = process.argv;

if (!rawName) {
  console.error("❌ Você precisa passar o nome da model. Ex: bun test.ts user");
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
const attributes = match[1]
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("//") && !line.startsWith("@") && !["id", "createdAt", "updatedAt"].some(attr => line.startsWith(attr))) // remove comentários, atributos como @id, @unique etc. e atributos indesejados
  .map((line) => {
    const [field, typeWithModifiers] = line.split(/\s+/); // pega campo e tipo com modificadores
    const type = typeWithModifiers.replace(/\?|@.*/g, ''); // remove '?' e modificadores como '@id'
    return { field, type };
  });

console.log(`📦 Atributos da model '${modelName}':\n`);
attributes.forEach(({ field, type }) => console.log(` - ${field}: ${type}`));
console.log('\n')


// TODO: Generate Elysia schemas based on 'attributes'

import { writeFile, mkdir } from "node:fs/promises"
import { existsSync, writeFileSync } from "node:fs"
import path from "node:path"

// ------------------- ARGUMENTO (already defined, just for context) -------------------
// const moduleName = process.argv[2]
// const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)

const basePath = path.resolve("src", modelName.toLowerCase())
const modelPath = path.join(basePath, `${modelName.toLowerCase()}.model.ts`)
const servicePath = path.join(basePath, `${modelName.toLowerCase()}.service.ts`)
const routePath = path.join(basePath, `${modelName.toLowerCase()}.route.ts`)
const specPath = path.join(basePath, `${modelName.toLowerCase()}.spec.ts`)

// ------------------- TEMPLATES (remaining from cli.ts) -------------------
function getServiceTemplate() {
  return `import { prisma } from '@/utils/prisma'
import { ${modelName}Model } from "@/${modelName.toLowerCase()}/${modelName.toLowerCase()}.model"

export abstract class ${modelName}Service {
  static findAll(where?: ${modelName}Model.findAllQuery) {
    return prisma.${modelName.toLowerCase()}.findMany({
      where,
    })
  }

  static findOne(id: number) {
    return prisma.${modelName.toLowerCase()}.findUniqueOrThrow({ where: { id } })
  }

  static create(data: ${modelName}Model.createBody) {
    return prisma.${modelName.toLowerCase()}.create({ data })
  }

  static update(id: number, data: ${modelName}Model.updateBody) {
    return prisma.${modelName.toLowerCase()}.update({ where: { id }, data })
  }

  static delete(id: number) {
    return prisma.${modelName.toLowerCase()}.delete({ where: { id } })
  }
}
`
}

function getRouteTemplate() {
  return `import { Elysia } from 'elysia'
import { paramsSchema } from '@/utils/params.schema'
import { ${modelName}Service } from '@/${modelName.toLowerCase()}/${modelName.toLowerCase()}.service'
import { ${modelName}Model } from '@/${modelName.toLowerCase()}/${modelName.toLowerCase()}.model'

export const ${modelName.toLowerCase()}Route = new Elysia({ prefix: '/${modelName.toLowerCase()}s' })
  .post('/', ({ body }) => ${modelName}Service.create(body), { 
    body: ${modelName}Model.createBody
  })
  .get('/', ({ query }) => ${modelName}Service.findAll(query), {
    query: ${modelName}Model.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => ${modelName}Service.findOne(params.id))
  .patch('/:id', ({ params, body }) => ${modelName}Service.update(params.id, body),{
    body: ${modelName}Model.updateBody 
  })
  .delete('/:id', ({ params }) => ${modelName}Service.delete(params.id))
`
}

function getSpecTemplate(attributes: PrismaAttribute[]) {
  const createPayloadFields = attributes
    .filter(attr => !['id', 'createdAt', 'updatedAt'].includes(attr.field))
    .map(attr => {
      switch (attr.type) {
        case 'String':
          return `  ${attr.field}: 'Test ${attr.field}',`;
        case 'String[]':
          return `  ${attr.field}: ['test1', 'test2'],`;
        case 'Int':
        case 'Float':
          return `  ${attr.field}: 123,`;
        case 'Boolean':
          return `  ${attr.field}: true,`;
        case 'DateTime':
          return `  ${attr.field}: new Date(),`;
        case 'Json':
          return `  ${attr.field}: {},`;
        default:
          return `  ${attr.field}: null,`;
      }
    })
    .join('\n');

  const updatePayloadFields = attributes
    .filter(attr => !['id', 'createdAt', 'updatedAt'].includes(attr.field))
    .slice(0, 1)
    .map(attr => {
      switch (attr.type) {
        case 'String':
          return `  ${attr.field}: 'Updated ${attr.field}',`;
        case 'Int':
        case 'Float':
          return `  ${attr.field}: 456,`;
        case 'Boolean':
          return `  ${attr.field}: false,`;
        case 'DateTime':
          return `  ${attr.field}: new Date(),`;
        case 'Json':
          return `  ${attr.field}: { updated: true },`;
        default:
          return `  ${attr.field}: null,`;
      }
    })
    .join('\n');

  return `import { describe, it, beforeAll, afterAll, expect } from 'bun:test'
import { ${modelName}Service } from '@/${modelName.toLowerCase()}/${modelName.toLowerCase()}.service'

describe('${modelName}Service', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
    ${createPayloadFields}
    };
    const created = await ${modelName}Service.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await ${modelName}Service.delete(id);
  });

  it('findAll', async () => {
    const res = await ${modelName}Service.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await ${modelName}Service.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
    ${updatePayloadFields}
    };
    const res = await ${modelName}Service.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
`;
}


// ------------------- UTILS (remaining from cli.ts) -------------------
interface PrismaAttribute {
  field: string;
  type: string;
}

function generateElysiaSchemaContent(modelName: string, attributes: PrismaAttribute[], capitalized: string): string {
  const fieldLines = attributes
    .filter(attr => !['id', 'createdAt', 'updatedAt'].includes(attr.field))
    .map(({ field, type }) => {
      let elysiaType;
      switch (type) {
        case 'String':
          elysiaType = 't.String({ minLength: 2 })';
          break;
        case 'String[]':
          elysiaType = 't.Array(t.String({ minLength: 2 }))';
          break;
        case 'Int':
        case 'Float':
          elysiaType = 't.Number()';
          break;
        case 'Boolean':
          elysiaType = 't.Boolean()';
          break;
        case 'DateTime':
          elysiaType = 't.Date()';
          break;
        case 'Json':
          elysiaType = 't.Any()';
          break;
        default:
          elysiaType = 't.Any()';
      }
      return `  ${field}: ${elysiaType},`;
    })
    .join('\n');

  return `import { t } from 'elysia';

export namespace ${modelName}Model {
  export const createBody = t.Object({
  ${fieldLines}
  })

  export const updateBody = t.Partial(createBody)
  export const findAllQuery = t.Partial(createBody)
  
  export type createBody = typeof createBody.static
  export type updateBody = typeof updateBody.static
  export type findAllQuery = typeof findAllQuery.static

}`;
}

function getModelTemplate(modelName: string, capitalized: string, schemaContent: string) {
  const regex = new RegExp(`model\\s+${modelName}\\s+{([\\s\\S]*?)}`, "m");
  const match = schemaContent.match(regex);

  if (!match) {
    console.error(`❌ Model '${modelName}' não encontrada em schema.prisma`);
    process.exit(1);
  }

  const attributes: PrismaAttribute[] = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//") && !line.startsWith("@"))
    .map((line) => {
      const [field, typeWithModifiers] = line.split(/\s+/);
      const type = typeWithModifiers.replace(/\?|@.*/g, '');
      return { field, type };
    });

  return generateElysiaSchemaContent(modelName, attributes, capitalized);
}

async function createFile(filePath: string, content: string) {
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  if (!existsSync(filePath)) {
    await writeFile(filePath, content)
    console.log(`✅ Criado: ${filePath}`)
  } else {
    console.log(`⚠️ Já existe: ${filePath}`)
  }
}

function updateIndex() {
  const indexPath = path.resolve("src/index.ts")
  if (!existsSync(indexPath)) {
    console.log("⚠️ index.ts não encontrado, pulei registro automático")
    return
  }

  let indexContent = readFileSync(indexPath, "utf-8")
  const importLine = `import { ${modelName.toLowerCase()}Route } from '@/${modelName.toLowerCase()}/${modelName.toLowerCase()}.route'`
  if (!indexContent.includes(importLine)) {
    indexContent = `${importLine}\n` + indexContent
  }

  const useLine = `.use(${modelName.toLowerCase()}Route)`

  if (!indexContent.includes(useLine)) {
    indexContent = indexContent.replace(/(^\s*)(\.listen\s*\()/m, (match, indent, listenCall) => {
      return `${indent}${useLine}\n${indent}${listenCall}`
    })
  }

  writeFileSync(indexPath, indexContent)
  console.log(`✅ Registrado ${modelName.toLowerCase()}Route em index.ts`)
}

// ------------------- EXECUÇÃO -------------------
async function generateModule() {
  const schemaPath = "./prisma/schema.prisma";
  const schemaContent = readFileSync(schemaPath, "utf-8");

  await createFile(modelPath, getModelTemplate(modelName, modelName, schemaContent)); // Pass modelName for capitalized as well, since modelName is already capitalized
  await createFile(servicePath, getServiceTemplate());
  await createFile(routePath, getRouteTemplate());
  await createFile(specPath, getSpecTemplate(attributes));
  updateIndex();
}

generateModule();
