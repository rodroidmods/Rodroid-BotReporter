import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { MyContext } from "../types/context";
import { env } from "../config/env";
import { buildReportHeader } from "../utils/formatters";
import { saveGallery } from "../utils/gallery";
import { detectLanguage, t } from "../utils/i18n";
import { generateReportId, saveReport, setOwnerMessageId, Severity, ReportStatus } from "../utils/reportsStore";

type MyConversation = Conversation<MyContext, MyContext>;

interface MediaItem {
  type: "photo" | "video";
  media: string;
  groupId?: string;
  caption?: string;
}

export async function reportWizard(conversation: MyConversation, ctx: MyContext) {
  const lang = detectLanguage(ctx);

  const appKeyboard = new InlineKeyboard()
    .text("Rodroid Il2cppDumper", "app_il2cppdumper").row()
    .text("Rodroid ModInjector", "app_modinjector").row()
    .text("Rodroid HexViewer", "app_hexviewer").row()
    .text("Rodroid Chams Tester", "app_chamstester").row()
    .text("Rodroid HookGen", "app_hookgen").row()
    .text("Other", "app_other");

  await ctx.reply(t("select_app", lang), {
    reply_markup: appKeyboard,
  });

  const appSelectionCtx = await conversation.waitForCallbackQuery([
    "app_il2cppdumper", "app_modinjector", "app_hexviewer",
    "app_chamstester", "app_hookgen", "app_other"
  ], {
    otherwise: (ctx) => ctx.reply(t("send_text_please", detectLanguage(ctx))),
  });

  await appSelectionCtx.answerCallbackQuery();

  let selectedApp = "Other";
  switch (appSelectionCtx.callbackQuery.data) {
    case "app_il2cppdumper": selectedApp = "Rodroid Il2cppDumper"; break;
    case "app_modinjector": selectedApp = "Rodroid ModInjector"; break;
    case "app_hexviewer": selectedApp = "Rodroid HexViewer"; break;
    case "app_chamstester": selectedApp = "Rodroid Chams Tester"; break;
    case "app_hookgen": selectedApp = "Rodroid HookGen"; break;
  }

  await ctx.reply(t("app_selected", lang, { app: selectedApp }), {
    parse_mode: "HTML",
  });

  const descriptionCtx = await conversation.waitFor("message:text", {
    otherwise: (ctx) => ctx.reply(t("send_text_please", detectLanguage(ctx))),
  });

  if (descriptionCtx.message.text === "/cancel") {
    await ctx.reply(t("report_cancelled", lang));
    return;
  }

  const description = descriptionCtx.message.text;
  const severityKeyboard = new InlineKeyboard()
    .text("\u{1F534} Critical", "sev_critical").row()
    .text("\u{1F7E0} Major", "sev_major").row()
    .text("\u{1F7E2} Minor", "sev_minor").row()
    .text("\u{1F4A1} Suggestion", "sev_suggestion");

  await ctx.reply(t("select_severity", lang), {
    reply_markup: severityKeyboard,
  });

  const severityCtx = await conversation.waitForCallbackQuery([
    "sev_critical", "sev_major", "sev_minor", "sev_suggestion"
  ], {
    otherwise: (ctx) => ctx.reply(t("select_severity", detectLanguage(ctx)), { reply_markup: severityKeyboard }),
  });

  await severityCtx.answerCallbackQuery();

  let severity: Severity = "minor";
  switch (severityCtx.callbackQuery.data) {
    case "sev_critical": severity = "critical"; break;
    case "sev_major": severity = "major"; break;
    case "sev_minor": severity = "minor"; break;
    case "sev_suggestion": severity = "suggestion"; break;
  }

  const mediaMenu = new InlineKeyboard().text("Next: Submit Report \u{27A1}\u{FE0F}", "media_done");

  await ctx.reply(t("send_media_prompt", lang), {
    parse_mode: "HTML",
    reply_markup: mediaMenu,
  });

  const allMedia: MediaItem[] = [];
  const documents: string[] = [];
  let additionalCaptions = "";
  const processedGroups = new Set<string>();

  while (true) {
    const mediaCtx = await conversation.waitFor(["message", "callback_query:data"]);

    if (mediaCtx.callbackQuery?.data === "media_done") {
      await mediaCtx.answerCallbackQuery();
      break;
    }

    if (mediaCtx.message?.text === "/cancel") {
      await ctx.reply(t("report_cancelled", lang));
      return;
    }

    const msg = mediaCtx.message;
    if (!msg) continue;

    if (msg.caption) {
      additionalCaptions += (additionalCaptions ? "\n" : "") + msg.caption;
    }

    let shouldReply = true;
    if (msg.media_group_id) {
      if (processedGroups.has(msg.media_group_id)) {
        shouldReply = false;
      } else {
        processedGroups.add(msg.media_group_id);
      }
    }

    if (msg.photo) {
      allMedia.push({ type: "photo", media: msg.photo[msg.photo.length - 1].file_id, groupId: msg.media_group_id, caption: msg.caption || undefined });
      if (shouldReply) await ctx.reply(t("photo_received", lang), { parse_mode: "HTML", reply_markup: mediaMenu });
    } else if (msg.video) {
      allMedia.push({ type: "video", media: msg.video.file_id, groupId: msg.media_group_id, caption: msg.caption || undefined });
      if (shouldReply) await ctx.reply(t("video_received", lang), { parse_mode: "HTML", reply_markup: mediaMenu });
    } else if (msg.document) {
      documents.push(msg.document.file_id);
      if (shouldReply) await ctx.reply(t("file_received", lang), { parse_mode: "HTML", reply_markup: mediaMenu });
    } else {
      if (shouldReply) await ctx.reply(t("send_valid_media", lang), { reply_markup: mediaMenu });
    }
  }

  const waitingMessage = await ctx.reply(t("compiling_report", lang));

  const reportId = generateReportId();
  const userId = ctx.from!.id;
  const userFirstName = ctx.from!.first_name || "User";
  const header = buildReportHeader(userId, userFirstName, selectedApp, description, additionalCaptions, severity, reportId);

  await conversation.external(() => {
    saveReport({
      id: reportId,
      user_id: userId,
      user_name: userFirstName,
      app_name: selectedApp,
      description,
      severity,
      status: "open" as ReportStatus,
      report_time: Date.now(),
      media_captions: additionalCaptions,
    });
  });

  await conversation.external(() => {
    if (ctx.session) ctx.session.lastReportId = reportId;
  });

  const isCaptionTooLong = header.length > 1024;
  let ownerMessageId: number | undefined;
  let textSent = false;

  try {
    if (allMedia.length === 0 || isCaptionTooLong) {
      const ownerMsg = await ctx.api.sendMessage(env.OWNER_CHAT_ID, header, { parse_mode: "HTML" });
      ownerMessageId = ownerMsg.message_id;
      textSent = true;
    }

    if (allMedia.length === 1) {
      const item = allMedia[0];
      const caption = textSent ? (item.caption || "") : header;
      const parseMode = textSent ? undefined : ("HTML" as const);
      if (item.type === "photo") {
        const sent = await ctx.api.sendPhoto(env.OWNER_CHAT_ID, item.media, { caption, ...(parseMode ? { parse_mode: parseMode } : {}) });
        if (!ownerMessageId) ownerMessageId = sent.message_id;
      } else {
        const sent = await ctx.api.sendVideo(env.OWNER_CHAT_ID, item.media, { caption, ...(parseMode ? { parse_mode: parseMode } : {}) });
        if (!ownerMessageId) ownerMessageId = sent.message_id;
      }
    } else if (allMedia.length > 1) {
      const galleryItems = allMedia.map((item, i) => ({
        ...item,
        caption: i === 0 ? (textSent ? (item.caption || "") : header) : (item.caption || ""),
        isHtml: i === 0 && !textSent ? true : false,
      }));

      await conversation.external(() => saveGallery(reportId, galleryItems));

      const carouselKeyboard = new InlineKeyboard()
        .text("1 / " + allMedia.length, "ignore")
        .text("Next \u{27A1}\u{FE0F}", `gallery_${reportId}_1`);

      const firstCaption = textSent ? (allMedia[0].caption || "") : header;
      const parseMode = textSent ? undefined : ("HTML" as const);
      const firstItem = allMedia[0];
      if (firstItem.type === "photo") {
        const sent = await ctx.api.sendPhoto(env.OWNER_CHAT_ID, firstItem.media, { caption: firstCaption, ...(parseMode ? { parse_mode: parseMode } : {}), reply_markup: carouselKeyboard });
        if (!ownerMessageId) ownerMessageId = sent.message_id;
      } else {
        const sent = await ctx.api.sendVideo(env.OWNER_CHAT_ID, firstItem.media, { caption: firstCaption, ...(parseMode ? { parse_mode: parseMode } : {}), reply_markup: carouselKeyboard });
        if (!ownerMessageId) ownerMessageId = sent.message_id;
      }
    }

    for (const docId of documents) {
      const captionOptions = (!textSent && allMedia.length === 0)
        ? { caption: header, parse_mode: "HTML" as const }
        : {};
      const sent = await ctx.api.sendDocument(env.OWNER_CHAT_ID, docId, captionOptions);
      if (!ownerMessageId) ownerMessageId = sent.message_id;
      textSent = true;
    }

    if (ownerMessageId) {
      await conversation.external(() => setOwnerMessageId(reportId, ownerMessageId!));
    }

    await ctx.api.deleteMessage(ctx.chat!.id, waitingMessage.message_id);
    await ctx.reply(t("report_submitted", lang, { id: reportId }), { parse_mode: "HTML" });
  } catch (err) {
    console.error("Failed to send report:", err);
    await ctx.reply(t("send_failed", lang));
  }
}
