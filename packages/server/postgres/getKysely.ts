import {Kysely, PostgresDialect, SqliteDialect} from 'kysely'
import getPg from './getPg'
import getSqliteDb from './getSqliteDb'
import type {DB} from './types/pg'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

let kysely: Kysely<DB> | undefined

const makeSqliteKysely = () => {
  return new Kysely<DB>({
    dialect: new SqliteDialect({
      database: getSqliteDb()
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
