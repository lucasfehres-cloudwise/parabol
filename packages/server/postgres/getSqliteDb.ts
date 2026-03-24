import Database from 'better-sqlite3'
import path from 'node:path'

let db: ReturnType<typeof Database> | undefined

const getSqliteDb = () => {
  if (!db) {
    const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'parabol.sqlite')
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
