import {Kysely, PostgresDialect, SqliteDialect} from 'kysely'
import type {SqliteDatabase, SqliteStatement} from 'kysely'
import getPg from './getPg'
import getSqliteDb from './getSqliteDb'
import type {DB} from './types/pg'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

let kysely: Kysely<DB> | undefined

/**
 * Wrap a better-sqlite3 Database to convert Date objects to ISO strings in parameters.
 * SQLite only accepts numbers, strings, bigints, buffers, and null.
 */
const wrapSqliteDatabase = (raw: ReturnType<typeof getSqliteDb>): SqliteDatabase => {
  const serializeParams = (params: ReadonlyArray<unknown>): ReadonlyArray<unknown> =>
    params.map((p) => (p instanceof Date ? p.toISOString() : p))
  return {
    close: () => raw.close(),
    prepare(sql: string): SqliteStatement {
      const stmt = raw.prepare(sql)
      return {
        get reader() {
          return stmt.reader
        },
        all: (params: ReadonlyArray<unknown>) => stmt.all(serializeParams(params) as any[]),
        run: (params: ReadonlyArray<unknown>) => stmt.run(serializeParams(params) as any[]),
        iterate: (params: ReadonlyArray<unknown>) => stmt.iterate(serializeParams(params) as any[])
      }
    }
  }
}

const makeSqliteKysely = () => {
  return new Kysely<DB>({
    dialect: new SqliteDialect({
      database: wrapSqliteDatabase(getSqliteDb())
    })
  })
}

const makePostgresKysely = (schema?: string) => {
  const nextPg = getPg(schema)
  nextPg.on('poolChange' as any, () => makePostgresKysely(schema))
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: nextPg
    })
    // ,log(event) {
    //   if (event.level === 'query') {
    //     console.log(event.query.sql)
    //     console.log(event.query.parameters)
    //   }
    // }
  })
}

const getKysely = (schema?: string) => {
  if (!kysely) {
    kysely = isSqlite ? makeSqliteKysely() : makePostgresKysely(schema)
  }
  return kysely
}

export default getKysely
