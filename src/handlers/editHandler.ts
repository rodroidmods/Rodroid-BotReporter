import { Composer } from "grammy";
import { MyContext } from "../types/context";
import { env } from "../config/env";
import { detectLanguage, t } from "../utils/i18n";
import { getReport, updateReportDescription } from "../utils/reportsStore";
import { buildReportHeader } from "../utils/formatters";

export const editHandler = new Composer<MyContext>();

editHandler.on("message:text", async (ctx, next) => {
  const lang = detectLanguage(ctx);
  const reportId = ctx.session.lastReportId;

  if (!reportId || ctx.message?.text?.startsWith("/")) {
    return next();
  }

  const replyTo = ctx.message.reply_to_message;
  if (!replyTo) {
    return next();
  }

  const replyText = replyTo.text || "";
  if (!replyText.includes(reportId)) {
    return next();
  }

  const report = getReport(reportId);
  if (!report || report.user_id !== ctx.from!.id) {
    ctx.session.lastReportId = undefined;
    return next();
  }

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  if (report.report_time < fiveMinAgo) {
    ctx.session.lastReportId = undefined;
    await ctx.reply(t("edit_window_expired", lang, { id: reportId }));
    return;
  }

  const newDescription = ctx.message.text;
  updateReportDescription(reportId, newDescription);

  if (report.owner_message_id) {
    try {
      const updatedHeader = buildReportHeader(
        report.user_id,
        report.user_name,
        report.app_name,
        newDescription,
        report.media_captions,
        report.severity,
        report.id
      );
	  
      try {
        await ctx.api.editMessageText(env.OWNER_CHAT_ID, report.owner_message_id, updatedHeader, { parse_mode: "HTML" });
      } catch {
        await ctx.api.editMessageCaption(env.OWNER_CHAT_ID, report.owner_message_id, { caption: updatedHeader, parse_mode: "HTML" });
      }
    } catch (err) {
      console.error("Failed to edit owner message:", err);
    }
  }

  ctx.session.lastReportId = undefined;
  await ctx.reply(t("edit_updated", lang, { id: reportId }), { parse_mode: "HTML" });
});
