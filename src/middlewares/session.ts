import { session } from "grammy";
import db from "../config/db";
import { SessionData } from "../types/context";

const adapter = {
  read: (key: string) => {
    const row = db.prepare("SELECT value FROM sessions WHERE id = ?").get(key) as { value: string } | undefined;
    return row ? JSON.parse(row.value) : undefined;
  },
  write: (key: string, value: any) => {
    db.prepare("INSERT OR REPLACE INTO sessions (id, value) VALUES (?, ?)").run(key, JSON.stringify(value));
  },
  delete: (key: string) => {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(key);
  },
};

export const sessionMiddleware = session({
  initial: (): SessionData => ({}),
  storage: adapter,
});
