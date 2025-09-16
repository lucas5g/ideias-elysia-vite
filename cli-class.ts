#!/usr/bin/env bun
import { writeFile, mkdir } from "node:fs/promises"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

class ModuleGenerator {
  moduleName: string
  capitalized: string
  basePath: string
  modelPath: string
  servicePath: string
  routePath: string
  specPath: string

  constructor(moduleName: string) {
    if (!moduleName) {
      console.error("❌ Use: bun cli.ts <módulo>. Ex: bun cli.ts phrase")
      process.exit(1)
    }

    this.moduleName = moduleName
    this.capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    this.basePath = path.resolve("src", moduleName)
    this.modelPath = path.join(this.basePath, `${moduleName}.model.ts`)
    this.servicePath = path.join(this.basePath, `${moduleName}.service.ts`)
    this.routePath = path.join(this.basePath, `${moduleName}.route.ts`)
    this.specPath = path.join(this.basePath, `${moduleName}.spec.ts`)
  }

  private modelTemplate() {
    return `import { t } from 'elysia'
export const create${this.capitalized}Schema = t.Object({
  name: t.String(),
})

export const update${this.capitalized}Schema = t.Partial(create${this.capitalized}Schema)

export type Create${this.capitalized}Dto = typeof create${this.capitalized}Schema.static
export type Update${this.capitalized}Dto = typeof update${this.capitalized}Schema.static
`
  }

  private serviceTemplate() {
    return `import { prisma } from '@/utils/prisma'
import { Create${this.capitalized}Dto, Update${this.capitalized}Dto } from "@/${this.moduleName}/${this.moduleName}.model"

export class ${this.capitalized}Service {
  async findAll() {
    return prisma.${this.moduleName}.findMany()
  }

  async findOne(id: number) {
    return prisma.${this.moduleName}.findUnique({ where: { id } })
  }

  async create(data: Create${this.capitalized}Dto) {
    return prisma.${this.moduleName}.create({ data })
  }

  async update(id: number, data: Update${this.capitalized}Dto) {
    return prisma.${this.moduleName}.update({ where: { id }, data })
  }

  async delete(id: number) {
    await prisma.${this.moduleName}.delete({ where: { id } })
    return true
  }
}
`
  }

  private routeTemplate() {
    return `import { Elysia } from 'elysia'
import { ${this.capitalized}Service } from '@/${this.moduleName}/${this.moduleName}.service'
import { create${this.capitalized}Schema, update${this.capitalized}Schema } from '@/${this.moduleName}/${this.moduleName}.model'

const ${this.moduleName}Service = new ${this.capitalized}Service()

export const ${this.moduleName}Route = (app: Elysia) =>
  app.group("/${this.moduleName}s", app =>
    app
      .get("/", () => ${this.moduleName}Service.findAll())
      .get("/:id", ({ params }) => ${this.moduleName}Service.findOne(Number(params.id)))
      .post("/", ({ body }) => ${this.moduleName}Service.create(body), { body: create${this.capitalized}Schema })
      .put("/:id", ({ params, body }) => ${this.moduleName}Service.update(Number(params.id), body), { body: update${this.capitalized}Schema })
      .delete("/:id", ({ params }) => ${this.moduleName}Service.delete(Number(params.id)))
  )
`
  }

  private specTemplate() {
    return `import { describe, it, beforeAll, afterAll, expect } from 'bun:test'
import { ${this.capitalized}Service } from '@/${this.moduleName}/${this.moduleName}.service'
import { Create${this.capitalized}Dto, Update${this.capitalized}Dto } from "@/${this.moduleName}/${this.moduleName}.model"

describe("${this.capitalized}Service", () => {
  const service = new ${this.capitalized}Service()
  let createdId: number

  beforeAll(async () => {
    const payload: Create${this.capitalized}Dto = { 
      name: 'Test ${this.capitalized}',      
    }
    const res = await service.create(payload)
    createdId = res.id
  })

  afterAll(async () => {
    await service.delete(createdId)
  })

  it("findAll", async () => {
    const res = await service.findAll()
    expect(res).toBeArray()
  })

  it("findOne", async () => {
    const res = await service.findOne(createdId)
    expect(res).toHaveProperty("id", createdId)
  })

  it("update", async () => {
    const payload: Update${this.capitalized}Dto = { 
      name: 'Updated ${this.capitalized}'
    }
    const res = await service.update(createdId, payload)
    expect(res).toMatchObject(payload)
  })
})
`
  }

  private async createFile(filePath: string, content: string) {
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

  private updateIndex() {
    const indexPath = path.resolve("src/index.ts")
    if (!existsSync(indexPath)) {
      console.log("⚠️ index.ts não encontrado, pulei registro automático")
      return
    }

    let indexContent = readFileSync(indexPath, "utf-8")
    const importLine = `import { ${this.moduleName}Route } from '@/${this.moduleName}/${this.moduleName}.route'`
    if (!indexContent.includes(importLine)) {
      indexContent = `${importLine}\n` + indexContent
    }

    const useLine = `.use(${this.moduleName}Route)`
    if (!indexContent.includes(useLine)) {
      indexContent = indexContent.replace(/(\.listen\s*\()/, `${useLine}\n$1`)
    }

    writeFileSync(indexPath, indexContent)
    console.log(`✅ Registrado ${this.moduleName}Route em index.ts`)
  }

  async generate() {
    await this.createFile(this.modelPath, this.modelTemplate())
    await this.createFile(this.servicePath, this.serviceTemplate())
    await this.createFile(this.routePath, this.routeTemplate())
    await this.createFile(this.specPath, this.specTemplate())
    this.updateIndex()
  }
}

// ------------------- EXECUÇÃO -------------------
const moduleNameArg = process.argv[2]
new ModuleGenerator(moduleNameArg).generate()
