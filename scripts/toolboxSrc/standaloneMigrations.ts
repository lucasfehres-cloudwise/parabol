// Should roughly match runMigrations.js except it isn't run in PM2 in dev
// This file is bundled by webpack into a small migrate.js file which includes all migration files & their deps
// It is used by PPMIs who are only provided with the bundles
import {Migrator} from 'kysely'
import path from 'path'
import {migrations} from '../../.config/kyselyMigrations'
import getKysely from '../../packages/server/postgres/getKysely'
import {Logger} from '../../packages/server/utils/Logger'
import '../webpack/utils/dotenv'
import {pgEnsureExtensions} from './pgEnsureExtensions'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

const migratePG = async () => {
  const dbType = isSqlite ? 'SQLite' : 'Postgres'
  Logger.log(`🐘 ${dbType} Migration Started`)
  if (!isSqlite) {
    await pgEnsureExtensions()
  }
  // pgm uses a dynamic require statement, which doesn't work with webpack
  // if we ignore that dynamic require, we'd still have to include the migrations directory AND any dependencies it might have
  // by processing through webpack's require.context, we let webpack handle everything
  const context = (require as any).context(
    '../../packages/server/postgres/migrations',
    false,
    /\.ts$/
  )
  const collector: Record<string, any> = {}
  context.keys().forEach((relativePath: any) => {
    const {name} = path.parse(relativePath)
    // When using SQLite, only run the sqliteInit migration and skip PostgreSQL-specific ones
    if (isSqlite && !name.includes('sqliteInit')) return
    // When using PostgreSQL, skip the sqliteInit migration
    if (!isSqlite && name.includes('sqliteInit')) return
    collector[name] = context(relativePath)
  })
  const pg = getKysely()
  const migrator = new Migrator({
    ...migrations,
    db: pg,
    provider: {
      async getMigrations() {
        return collector
      }
    }
  })
  const {error, results} = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      Logger.log(`  ✅ Migration: ${it.migrationName}`)
    } else if (it.status === 'Error') {
      Logger.error(`  ⛔️ Migration: ${it.migrationName}`)
    }
  })

  if (error) {
    Logger.log(`🐘 ${dbType} Migration Failed`)
    throw error
  } else {
    Logger.log(`🐘 ${dbType} Migration Complete`)
  }
}

// If called via CLI
if (require.main === module) migratePG()

export default migratePG
