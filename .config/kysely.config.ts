import {defineConfig} from 'kysely-ctl'
import {FileMigrationProvider} from 'kysely'
import * as fs from 'fs'
import * as path from 'path'
import getKysely from '../packages/server/postgres/getKysely'
import {migrations} from './kyselyMigrations'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

const migrationFolder = path.resolve(__dirname, '../packages/server/postgres/migrations')

// Custom migration provider that filters migrations based on database driver
class FilteredMigrationProvider {
  async getMigrations() {
    const files = fs.readdirSync(migrationFolder).filter((f) => f.endsWith('.ts'))
    const migrationMap: Record<string, any> = {}
    for (const file of files) {
      const name = path.parse(file).name
      // When using SQLite, only run sqliteInit migration
      if (isSqlite && !name.includes('sqliteInit')) continue
      // When using PostgreSQL, skip sqliteInit migration
      if (!isSqlite && name.includes('sqliteInit')) continue
      migrationMap[name] = await import(path.join(migrationFolder, file))
    }
    return migrationMap
  }
}

export default defineConfig({
  kysely: getKysely(),
  migrations: {
    ...migrations,
    migrationFolder,
    provider: new FilteredMigrationProvider()
  }
})
