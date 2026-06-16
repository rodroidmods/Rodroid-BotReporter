import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../types/context";
import { env } from "../config/env";
import { extractUserIdFromText } from "../utils/formatters";
import { getReport, updateReportStatus, ReportStatus } from "../utils/reportsStore";

export const ownerReplyHandler = new Composer<MyContext>();

ownerReplyHandler.command("reply", async (ctx) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) return;

  const replyTo = ctx.message?.reply_to_message;
  const rawText = ctx.message?.text || "";
  const withoutCommand = rawText.replace(/^\/reply\s*/, "");

  let reportId: string | undefined;
  let messageText: string;

  if (replyTo) {
    const textToParse = replyTo.text || replyTo.caption || "";
    const match = textToParse.match(/RPT-[A-Z0-9]+/);
    if (match) {
      reportId = match[0];
      messageText = withoutCommand;
    } else {
      await ctx.reply("Could not find a report ID in the replied message.");
      return;
    }
  } else {
    const match = withoutCommand.match(/^(RPT-[A-Z0-9]+)\s+(.+)/s);
    if (!match) {
      await ctx.reply("Usage:\n• /reply RPT-XXXX Your message here\n• Or reply to a report message with: /reply Your message");
      return;
    }
    reportId = match[1];
    messageText = match[2];
  }

  const report = getReport(reportId);
  if (!report) {
    await ctx.reply(`Report <code>${reportId}</code> not found.`, { parse_mode: "HTML" });
    return;
  }

  if (!messageText.trim()) {
    await ctx.reply("Please provide a message to send.");
    return;
  }

  try {
    await ctx.api.sendMessage(report.user_id,
      `\u{1F9D1}\u{200D}\u{1F4BB} <b>Developer Reply</b> (<code>${reportId}</code>)\n\n${messageText}`,
      { parse_mode: "HTML" }
    );
    updateReportStatus(reportId, "in_progress");
    await ctx.reply(`\u{2705} Reply sent to ${report.user_name} for ${reportId}.`);
  } catch (err) {
    console.error("Owner reply error:", err);
    await ctx.reply("\u{274C} Failed to send. The user might have blocked the bot.");
  }
});

ownerReplyHandler.command("changestatus", async (ctx) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) return;

  const replyTo = ctx.message?.reply_to_message;
  const rawText = ctx.message?.text || "";
  const withoutCommand = rawText.replace(/^\/changestatus\s*/, "").trim();

  let reportId: string | undefined;

  if (replyTo) {
    const textToParse = replyTo.text || replyTo.caption || "";
    const match = textToParse.match(/RPT-[A-Z0-9]+/);
    if (match) {
      reportId = match[0];
    } else {
      await ctx.reply("Could not find a report ID in the replied message.");
      return;
    }
  } else if (withoutCommand.match(/^RPT-[A-Z0-9]+$/)) {
    reportId = withoutCommand;
  } else {
    await ctx.reply("Usage:\n• /changestatus RPT-XXXX\n• Or reply to a report message with: /changestatus");
    return;
  }

  const report = getReport(reportId);
  if (!report) {
    await ctx.reply(`Report <code>${reportId}</code> not found.`, { parse_mode: "HTML" });
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("\u{1F7E1} In Progress", `status_${reportId}_in_progress`).row()
    .text("\u{1F535} Resolved", `status_${reportId}_resolved`).row()
    .text("\u{274C} Close & Delete", `status_${reportId}_closed`);

  await ctx.reply(
    `<b>Change status for <code>${reportId}</code></b>\nCurrent: <b>${report.status}</b>`,
    { parse_mode: "HTML", reply_markup: keyboard }
  );
});

ownerReplyHandler.callbackQuery(/^status_(RPT-[A-Z0-9]+)_(.+)$/, async (ctx) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) {
    return ctx.answerCallbackQuery({ text: "Only the owner can do this.", show_alert: true });
  }

  const reportId = ctx.match[1];
  const newStatus = ctx.match[2] as ReportStatus;

  const report = getReport(reportId);
  if (!report) {
    return ctx.answerCallbackQuery({ text: "Report not found.", show_alert: true });
  }

  updateReportStatus(reportId, newStatus);

  const statusLabels: Record<string, string> = {
    in_progress: "\u{1F7E1} In Progress",
    resolved: "\u{1F535} Resolved",
    closed: "\u{274C} Closed",
  };

  try {
    await ctx.api.sendMessage(report.user_id,
      `\u{1F4CB} <b>Report Update</b> (<code>${reportId}</code>)\n\nStatus changed to: <b>${statusLabels[newStatus] || newStatus}</b>`,
      { parse_mode: "HTML" }
    );
  } catch {
	  
  }

  if (newStatus === "closed" && report.owner_message_id) {
    try {
      await ctx.api.deleteMessage(env.OWNER_CHAT_ID, report.owner_message_id);
    } catch {

    }
  }

  await ctx.answerCallbackQuery({ text: `Status: ${newStatus}` });
  await ctx.editMessageText(
    `\u{2705} <code>${reportId}</code> — Status changed to <b>${statusLabels[newStatus] || newStatus}</b>`,
    { parse_mode: "HTML" }
  );
});

ownerReplyHandler.on("message", async (ctx, next) => {
  if (ctx.from?.id !== env.OWNER_CHAT_ID) {
    return next();
  }

  const replyTo = ctx.message?.reply_to_message;
  if (!replyTo) {
    return next();
  }

  if (ctx.message.text?.startsWith("/")) {
    return next();
  }

  const textToParse = replyTo.text || replyTo.caption || "";
  const targetUserId = extractUserIdFromText(textToParse);

  if (!targetUserId) {
    return next();
  }

  try {
    const reportIdMatch = textToParse.match(/RPT-[A-Z0-9]+/);
    if (reportIdMatch) {
      updateReportStatus(reportIdMatch[0], "in_progress");
    }

    if (ctx.message.text) {
      const idLabel = reportIdMatch ? ` (<code>${reportIdMatch[0]}</code>)` : "";
      await ctx.api.sendMessage(targetUserId,
        `\u{1F9D1}\u{200D}\u{1F4BB} <b>Developer Reply</b>${idLabel}\n\n${ctx.message.text}`,
        { parse_mode: "HTML" }
      );
    } else if (ctx.message.photo || ctx.message.video || ctx.message.document || ctx.message.audio || ctx.message.voice || ctx.message.sticker || ctx.message.animation) {
      const caption = ctx.message.caption
        ? `\u{1F9D1}\u{200D}\u{1F4BB} <b>Developer Reply</b>\n\n${ctx.message.caption}`
        : "\u{1F9D1}\u{200D}\u{1F4BB} <b>Developer Reply</b>";

      await ctx.api.copyMessage(targetUserId, ctx.chat!.id, ctx.message.message_id, {
        caption,
        parse_mode: "HTML",
      });
    } else {
      await ctx.api.copyMessage(targetUserId, ctx.chat!.id, ctx.message.message_id);
    }

    await ctx.reply("\u{2705} Reply forwarded to the user.");
  } catch (err) {
    console.error("Owner reply error:", err);
    await ctx.reply("\u{274C} Failed to forward. The user might have blocked the bot.");
  }
});
