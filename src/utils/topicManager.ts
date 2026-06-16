import db from "../config/db";

export const getTopicId = (appName: string): number | undefined => {
  const row = db.prepare("SELECT thread_id FROM topics WHERE app_name = ?").get(appName) as { thread_id: number } | undefined;
  return row?.thread_id;
};

export const saveTopicId = (appName: string, threadId: number) => {
  db.prepare("INSERT OR REPLACE INTO topics (app_name, thread_id) VALUES (?, ?)").run(appName, threadId);
};
