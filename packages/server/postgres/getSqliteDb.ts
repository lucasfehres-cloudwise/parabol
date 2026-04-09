import Database from 'better-sqlite3'
import path from 'node:path'

let db: ReturnType<typeof Database> | undefined

const getSqliteDb = () => {
  if (!db) {
    const rawPath = process.env.SQLITE_DB_PATH || 'parabol.sqlite'
    // Resolve relative paths from the project root (where pnpm-lock.yaml lives)
    // to avoid CWD-dependent behavior when running from sub-packages (e.g. jest in packages/server)
    const dbPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.join(__dirname, '..', '..', '..', rawPath)
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
  }
  return db
}

export const closeSqlite = () => {
  if (db) {
    db.close()
    db = undefined
  }
}

export default getSqliteDb
