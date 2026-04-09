// kysely-ctl does some weird esbuild stuff so we can't bundle it, so we extract this object from it
// so kysely.config.ts is not required by the bundle, only in dev

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

export const migrations = {
  // Uncomment this if you need to fix your local DB migration order!
  // allowUnorderedMigrations: true,
  getMigrationPrefix: () => `${new Date().toISOString()}_`,
  migrationFolder: './packages/server/postgres/migrations',
  // SQLite does not support schemas, so only set this for PostgreSQL
  ...(isSqlite ? {} : {migrationTableSchema: 'public'}),
  migrationTableName: '_migrationV2',
  migrationLockTableName: '_migrationLock'
}
