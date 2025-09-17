#!/usr/bin/env bun
import { writeFile, mkdir } from "node:fs/promises"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

// ------------------- ARGUMENTO -------------------
const moduleName = process.argv[2]

if (!moduleName) {
  console.error("❌ Use: bun cli.ts <módulo>. Ex: bun cli.ts phrase")
  process.exit(1)
}

const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
const basePath = path.resolve("src", moduleName)
const modelPath = path.join(basePath, `${moduleName}.model.ts`)
const servicePath = path.join(basePath, `${moduleName}.service.ts`)
const routePath = path.join(basePath, `${moduleName}.route.ts`)
const specPath = path.join(basePath, `${moduleName}.spec.ts`)

// ------------------- TEMPLATES -------------------
function getModelTemplate() {
  return `import { t, Static } from 'elysia'
export const create${capitalized}Schema = t.Object({
  name: t.String(),
})

export const update${capitalized}Schema = t.Partial(create${capitalized}Schema)
export const findAll${capitalized}Schema = t.Partial(create${capitalized}Schema)

export type Create${capitalized}Dto = Static<typeof create${capitalized}Schema>
export type Update${capitalized}Dto = Static<typeof update${capitalized}Schema>
export type FindAll${capitalized}Dto = Static<typeof findAll${capitalized}Schema>
`
}

function getServiceTemplate() {
  return `import { prisma } from '@/utils/prisma'
import { Create${capitalized}Dto, Update${capitalized}Dto, FindAll${capitalized}Dto } from "@/${moduleName}/${moduleName}.model"

export class ${capitalized}Service {
  findAll(where?: FindAll${capitalized}Dto) {
    return prisma.${moduleName}.findMany({
      where,
    })
  }

  findOne(id: number) {
    return prisma.${moduleName}.findUnique({ where: { id } })
  }

  create(data: Create${capitalized}Dto) {
    return prisma.${moduleName}.create({ data })
  }

  update(id: number, data: Update${capitalized}Dto) {
    return prisma.${moduleName}.update({ where: { id }, data })
  }

  delete(id: number) {
    return prisma.${moduleName}.delete({ where: { id } })
  }
}
`
}

function getRouteTemplate() {
  return `import { Elysia } from 'elysia'
import { paramsSchema } from '@/utils/params.schema'
import { ${capitalized}Service } from '@/${moduleName}/${moduleName}.service'
import { create${capitalized}Schema, update${capitalized}Schema } from '@/${moduleName}/${moduleName}.model'

const ${moduleName}Service = new ${capitalized}Service()

export const ${moduleName}Route = (app: Elysia) =>
  app.group('/${moduleName}s', app =>
    app
      .get('/', () => ${moduleName}Service.findAll())
      .get('/:id', ({ params }) => ${moduleName}Service.findOne(params.id), {
        params: paramsSchema
      })
      .post('/', ({ body }) => ${moduleName}Service.create(body), { 
        body: create${capitalized}Schema 
      })
      .patch('/:id', ({ params, body }) => ${moduleName}Service.update(params.id, body), {
        params: paramsSchema,
        body: update${capitalized}Schema 
      })
      .delete('/:id', ({ params }) => ${moduleName}Service.delete(params.id), {
        params: paramsSchema
      })
  )
`
}

function getSpecTemplate() {
  return `import { describe, it, beforeAll, afterAll, expect } from 'bun:test'
import { ${capitalized}Service } from '@/${moduleName}/${moduleName}.service'
import { Create${capitalized}Dto, Update${capitalized}Dto } from '@/${moduleName}/${moduleName}.model'

describe('${capitalized}Service', () => {
  const service = new ${capitalized}Service()
  let createdId: number

  beforeAll(async () => {
    const payload: Create${capitalized}Dto = { 
      name: 'Test ${capitalized}',      
    }
    const res = await service.create(payload)
    createdId = res.id
  })

  afterAll(async () => {
    await service.delete(createdId)
  })

  it('findAll', async () => {
    const res = await service.findAll()
    expect(res).toBeArray()
  })

  it('findOne', async () => {
    const res = await service.findOne(createdId)
    expect(res).toHaveProperty('id', createdId)
  })

  it('update', async () => {
    const payload: Update${capitalized}Dto = { 
      name: 'Updated ${capitalized}'
    }
    const res = await service.update(createdId, payload)
    expect(res).toMatchObject(payload)
  })
})
`
}

// ------------------- FUNÇÃO PARA CRIAR ARQUIVOS -------------------
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

// ------------------- ATUALIZAR index.ts -------------------
function updateIndex() {
  const indexPath = path.resolve("src/index.ts")
  if (!existsSync(indexPath)) {
    console.log("⚠️ index.ts não encontrado, pulei registro automático")
    return
  }

  let indexContent = readFileSync(indexPath, "utf-8")
  const importLine = `import { ${moduleName}Route } from '@/${moduleName}/${moduleName}.route'`
  if (!indexContent.includes(importLine)) {
    indexContent = `${importLine}\n` + indexContent
  }

  const useLine = `.use(${moduleName}Route)`

  if (!indexContent.includes(useLine)) {
    indexContent = indexContent.replace(/(^\s*)(\.listen\s*\()/m, (match, indent, listenCall) => {
      return `${indent}${useLine}\n${indent}${listenCall}`
    })
  }

  writeFileSync(indexPath, indexContent)
  console.log(`✅ Registrado ${moduleName}Route em index.ts`)
}


// ------------------- EXECUÇÃO -------------------
async function generateModule() {
  await createFile(modelPath, getModelTemplate())
  await createFile(servicePath, getServiceTemplate())
  await createFile(routePath, getRouteTemplate())
  await createFile(specPath, getSpecTemplate())
  updateIndex()
}

generateModule()
