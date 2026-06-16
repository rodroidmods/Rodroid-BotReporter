import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("sessions.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    value TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    user_name TEXT,
    app_name TEXT,
    description TEXT,
    severity TEXT,
    status TEXT,
    report_time INTEGER,
    media_captions TEXT,
    owner_message_id INTEGER
  )
`);

// Migration: add owner_message_id to existing tables
try {
  db.exec("ALTER TABLE reports ADD COLUMN owner_message_id INTEGER");
} catch {
  // Column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS galleries (
    id TEXT PRIMARY KEY,
    media TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    app_name TEXT PRIMARY KEY,
    thread_id INTEGER
  )
`);

export default db;
