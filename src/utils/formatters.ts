export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const extractUserIdFromText = (text: string): number | null => {
  const match = text.match(/#USER_(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
};

function severityEmoji(severity: string): string {
  const map = { critical: "\u{1F534}", major: "\u{1F7E0}", minor: "\u{1F7E2}", suggestion: "\u{1F4A1}" };
  return (map as any)[severity] || "";
}

export const buildReportHeader = (
  userId: number,
  userFirstName: string,
  appName: string,
  description: string,
  additionalCaptions: string,
  severity?: string,
  reportId?: string
): string => {
  const safeApp = escapeHtml(appName);
  const safeDesc = escapeHtml(description);
  const safeName = escapeHtml(userFirstName);

  let lines: string[] = [];
  lines.push("\u{1F4A8} <b>NEW BUG REPORT</b> \u{1F4A8}");
  lines.push("");

  if (reportId) {
    lines.push("\u{1F194} <b>Report ID:</b> <code>" + escapeHtml(reportId) + "</code>");
  }

  lines.push("\u{1F464} <b>Reporter:</b> <a href=\"tg://user?id=" + userId + "\">" + safeName + "</a>");
  lines.push("\u{1F4F1} <b>Target App:</b> " + safeApp);

  if (severity) {
    lines.push("\u26A0\uFE0F <b>Severity:</b> " + severityEmoji(severity) + " " + severity.charAt(0).toUpperCase() + severity.slice(1));
  }

  lines.push("");
  lines.push("\u{1F4DD} <b>Description & Logs:</b>");
  lines.push("<blockquote expandable><pre><code class=\"language-text\">" + safeDesc + "</code></pre></blockquote>");

  if (additionalCaptions) {
    lines.push("");
    lines.push("\u{1F5BC} <b>Media Note:</b>");
    lines.push("<i>" + escapeHtml(additionalCaptions) + "</i>");
  }

  lines.push("");
  lines.push("<i>#USER_" + userId + "</i>");

  return lines.join("\n");
};
