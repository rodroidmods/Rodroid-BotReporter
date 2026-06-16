import { Composer } from "grammy";
import { Menu } from "@grammyjs/menu";
import { MyContext } from "../types/context";
import { env } from "../config/env";
import { detectLanguage, t } from "../utils/i18n";
import { getReport, getUserReports, getStats, searchReports } from "../utils/reportsStore";

export const commandsHandler = new Composer<MyContext>();

const welcomeMessage = `
<b>Welcome to the Official Support Bot!</b> \u{1F680}

I am here to help you report bugs and issues directly to the development team.
Please choose an action below to get started.

<i>Your reports help us improve our apps!</i>
`;

const helpText = `
<b>How to report a bug:</b>

1\u{FE0F}\u{20E3} Click <b>Report a Bug</b>
2\u{FE0F}\u{20E3} Select the app you are reporting for
3\u{FE0F}\u{20E3} Provide a detailed text description
4\u{FE0F}\u{20E3} Choose bug severity
5\u{FE0F}\u{20E3} Send screenshots, videos, or log files (.zip, .txt)
6\u{FE0F}\u{20E3} Click <b>Next: Submit Report</b> when you are finished

You can type /cancel at any time to abort the process.
`;

const mainMenu = new Menu<MyContext>("main-menu")
  .text("\u{1F41B} Report a Bug", async (ctx) => {
    await ctx.menu.close();
    await ctx.conversation.enter("reportWizard");
  }).row()
  .submenu("\u{2753} How it works", "help-menu", async (ctx) => {
    await ctx.editMessageText(helpText, { parse_mode: "HTML" });
  });

const helpMenu = new Menu<MyContext>("help-menu")
  .back("\u{2B05}\u{FE0F} Back", async (ctx) => {
    await ctx.editMessageText(welcomeMessage, { parse_mode: "HTML" });
  });

mainMenu.register(helpMenu);

commandsHandler.use(mainMenu);

commandsHandler.command("start", async (ctx) => {
  await ctx.reply(welcomeMessage, {
    parse_mode: "HTML",
    reply_markup: mainMenu,
  });
});

commandsHandler.command("help", async (ctx) => {
  await ctx.reply(helpText, { parse_mode: "HTML" });
});

commandsHandler.command("cancel", async (ctx) => {
  await ctx.conversation.exit("reportWizard");
  await ctx.reply("Action cancelled. Use /start to begin again.");
});

// --- Bug Status Tracking ---
commandsHandler.command("status", async (ctx) => {
  const lang = detectLanguage(ctx);
  const parts = ctx.message?.text?.split(" ");
  const reportId = parts?.[1];

  if (!reportId) {
    return ctx.reply("Usage: /status <ReportID>\nExample: /status RPT-ABCD1234");
  }

  const report = getReport(reportId.toUpperCase());
  if (!report) {
    return ctx.reply(`Report <code>${reportId}</code> not found.`, { parse_mode: "HTML" });
  }

  const severityMap: Record<string, string> = {
    critical: t("severity_critical", lang),
    major: t("severity_major", lang),
    minor: t("severity_minor", lang),
    suggestion: t("severity_suggestion", lang),
  };
  const statusMap: Record<string, string> = {
    open: t("status_open", lang),
    in_progress: t("status_in_progress", lang),
    resolved: t("status_resolved", lang),
    closed: t("status_closed", lang),
  };

  const msg = `<b>\u{1F4CB} Report: <code>${report.id}</code></b>\n\n` +
    `\u{1F464} <b>Reporter:</b> ${report.user_name}\n` +
    `\u{1F4F1} <b>App:</b> ${report.app_name}\n` +
    `\u{26A0}\u{FE0F} <b>Severity:</b> ${severityMap[report.severity] || report.severity}\n` +
    `\u{1F4CC} <b>Status:</b> ${statusMap[report.status] || report.status}\n\n` +
    `<b>Description:</b>\n<blockquote expandable><pre><code class="language-text">${report.description}</code></pre></blockquote>`;

  await ctx.reply(msg, { parse_mode: "HTML" });
});

commandsHandler.command("myreports", async (ctx) => {
  const lang = detectLanguage(ctx);
  const userId = ctx.from!.id;
  const reports = getUserReports(userId, 10);

  if (reports.length === 0) {
    return ctx.reply(t("no_reports", lang));
  }

  let msg = t("my_reports_title", lang, { count: reports.length });

  const severityMap: Record<string, string> = {
    critical: t("severity_critical", lang),
    major: t("severity_major", lang),
    minor: t("severity_minor", lang),
    suggestion: t("severity_suggestion", lang),
  };
  const statusMap: Record<string, string> = {
    open: t("status_open", lang),
    in_progress: t("status_in_progress", lang),
    resolved: t("status_resolved", lang),
    closed: t("status_closed", lang),
  };

  for (const r of reports) {
    msg += t("report_status_line", lang, {
      id: r.id,
      app: r.app_name,
      status: statusMap[r.status] || r.status,
      severity: severityMap[r.severity] || r.severity,
    });
  }

  await ctx.reply(msg, { parse_mode: "HTML" });
});

commandsHandler.command("stats", async (ctx) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) {
    return ctx.reply("This command is only available to the bot owner.");
  }

  const stats = getStats();
  const lang = detectLanguage(ctx);

  let msg = t("stats_title", lang);
  msg += t("stats_total", lang, { total: stats.total });

  if (Object.keys(stats.byApp).length > 0) {
    const appsList = Object.entries(stats.byApp)
      .map(([app, count]) => `  \u{2022} ${app}: <b>${count}</b>`)
      .join("\n");
    msg += t("stats_apps", lang, { apps: appsList });
  }

  if (Object.keys(stats.bySeverity).length > 0) {
    const sevList = Object.entries(stats.bySeverity)
      .map(([sev, count]) => `  \u{2022} ${sev}: <b>${count}</b>`)
      .join("\n");
    msg += t("stats_severity", lang, { severities: sevList });
  }

  if (Object.keys(stats.byStatus).length > 0) {
    const statusList = Object.entries(stats.byStatus)
      .map(([st, count]) => `  \u{2022} ${st}: <b>${count}</b>`)
      .join("\n");
    msg += t("stats_status", lang, { statuses: statusList });
  }

  await ctx.reply(msg, { parse_mode: "HTML" });
});

commandsHandler.command("search", async (ctx) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) {
    return ctx.reply("This command is only available to the bot owner.");
  }

  const parts = ctx.message?.text?.split(" ");
  const query = parts?.slice(1).join(" ");
  if (!query) {
    return ctx.reply("Usage: /search <query>\nExample: /search Rodroid Il2cppDumper");
  }

  const results = searchReports(query);
  if (results.length === 0) {
    return ctx.reply("No reports found matching your query.");
  }

  let msg = `<b>Search Results (${results.length}):</b>\n\n`;
  for (const r of results.slice(0, 10)) {
    msg += `\u{1F4CB} <code>${r.id}</code> \u{2014} ${r.app_name} (${r.status})\n   \u{1F464} ${r.user_name}\n`;
  }
  await ctx.reply(msg, { parse_mode: "HTML" });
});

commandsHandler.command("edit", async (ctx) => {
  const lang = detectLanguage(ctx);
  const userId = ctx.from!.id;
  const reports = getUserReports(userId, 1);

  if (reports.length === 0) {
    return ctx.reply(t("edit_no_recent", lang));
  }

  const latest = reports[0];
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;

  if (latest.report_time < fiveMinAgo) {
    return ctx.reply(t("edit_window_expired", lang, { id: latest.id }));
  }

  ctx.session.lastReportId = latest.id;
  await ctx.reply(t("edit_prompt", lang, { id: latest.id }), { parse_mode: "HTML" });
});
