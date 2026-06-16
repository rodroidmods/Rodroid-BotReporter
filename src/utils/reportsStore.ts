import db from "../config/db";

export type Severity = "critical" | "major" | "minor" | "suggestion";
export type ReportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface ReportRecord {
  id: string;
  user_id: number;
  user_name: string;
  app_name: string;
  description: string;
  severity: Severity;
  status: ReportStatus;
  report_time: number;
  media_captions: string;
  owner_message_id?: number;
}

export function generateReportId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RPT-${timestamp}${random}`;
}

export function saveReport(record: ReportRecord) {
  db.prepare(`
    INSERT OR REPLACE INTO reports (id, user_id, user_name, app_name, description, severity, status, report_time, media_captions, owner_message_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.user_id,
    record.user_name,
    record.app_name,
    record.description,
    record.severity,
    record.status,
    record.report_time,
    record.media_captions,
    record.owner_message_id ?? null
  );
}

export function setOwnerMessageId(id: string, messageId: number) {
  db.prepare("UPDATE reports SET owner_message_id = ? WHERE id = ?").run(messageId, id);
}

export function getReport(id: string): ReportRecord | undefined {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as ReportRecord | undefined;
  return row;
}

export function getUserReports(userId: number, limit = 10): ReportRecord[] {
  const rows = db.prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY report_time DESC LIMIT ?").all(userId, limit) as unknown as ReportRecord[];
  return rows;
}

export function updateReportStatus(id: string, status: ReportStatus) {
  db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
}

export function updateReportSeverity(id: string, severity: Severity) {
  db.prepare("UPDATE reports SET severity = ? WHERE id = ?").run(severity, id);
}

export function updateReportDescription(id: string, description: string) {
  db.prepare("UPDATE reports SET description = ? WHERE id = ?").run(description, id);
}

export function getStats(): { total: number; byApp: Record<string, number>; bySeverity: Record<string, number>; byStatus: Record<string, number> } {
  const total = (db.prepare("SELECT COUNT(*) as count FROM reports").get() as { count: number }).count;

  const appRows = db.prepare("SELECT app_name, COUNT(*) as count FROM reports GROUP BY app_name ORDER BY count DESC").all() as { app_name: string; count: number }[];
  const byApp: Record<string, number> = {};
  for (const r of appRows) byApp[r.app_name] = r.count;

  const sevRows = db.prepare("SELECT severity, COUNT(*) as count FROM reports GROUP BY severity").all() as { severity: string; count: number }[];
  const bySeverity: Record<string, number> = {};
  for (const r of sevRows) bySeverity[r.severity] = r.count;

  const statusRows = db.prepare("SELECT status, COUNT(*) as count FROM reports GROUP BY status").all() as { status: string; count: number }[];
  const byStatus: Record<string, number> = {};
  for (const r of statusRows) byStatus[r.status] = r.count;

  return { total, byApp, bySeverity, byStatus };
}

export function searchReports(query: string): ReportRecord[] {
  const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const like = `%${escaped}%`;
  const rows = db.prepare(
    "SELECT * FROM reports WHERE id LIKE ? ESCAPE '\\' OR app_name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR user_name LIKE ? ESCAPE '\\' ORDER BY report_time DESC LIMIT 20"
  ).all(like, like, like, like) as unknown as ReportRecord[];
  return rows;
}
