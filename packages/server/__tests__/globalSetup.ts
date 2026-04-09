import {sql} from 'kysely'
import '../../../scripts/webpack/utils/dotenv'
import getKysely from '../postgres/getKysely'

const isSqlite = process.env.DATABASE_DRIVER === 'sqlite'

async function setup() {
  // The IP address is always localhost
  // so the safety checks will eventually fail if run too much
  const db = getKysely()
  if (isSqlite) {
    await sql`DELETE FROM "PasswordResetRequest"`.execute(db)
    await sql`DELETE FROM "FailedAuthRequest"`.execute(db)
  } else {
    await sql`
      TRUNCATE TABLE "PasswordResetRequest";
      TRUNCATE TABLE "FailedAuthRequest";
      ALTER TABLE "NewMeeting" DISABLE TRIGGER "check_meeting_overlap";
    `.execute(db)
  }
}

export default setup
