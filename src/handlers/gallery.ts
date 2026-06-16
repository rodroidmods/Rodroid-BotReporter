import { Composer, InlineKeyboard } from "grammy";
import { InputMediaBuilder } from "grammy";
import { MyContext } from "../types/context";
import { getGallery } from "../utils/gallery";

export const galleryHandler = new Composer<MyContext>();

galleryHandler.callbackQuery(/^gallery_(RPT-[A-Z0-9]+)_(\d+)$/, async (ctx) => {
  const reportId = ctx.match[1];
  const index = parseInt(ctx.match[2], 10);

  const gallery = getGallery(reportId);
  if (!gallery) {
    return ctx.answerCallbackQuery({ text: "Gallery expired or not found.", show_alert: true });
  }

  if (index < 0 || index >= gallery.length) {
    return ctx.answerCallbackQuery("Invalid page.");
  }

  const item = gallery[index];
  const keyboard = new InlineKeyboard();

  if (index > 0) {
    keyboard.text("\u{2B05}\u{FE0F} Back", `gallery_${reportId}_${index - 1}`);
  }
  keyboard.text(`${index + 1} / ${gallery.length}`, "ignore");
  if (index < gallery.length - 1) {
    keyboard.text("Next \u{27A1}\u{FE0F}", `gallery_${reportId}_${index + 1}`);
  }

  const caption = item.caption || "";
  const parseMode = item.isHtml ? "HTML" as const : undefined;

  try {
    const media = item.type === "photo"
      ? InputMediaBuilder.photo(item.media, { caption, ...(parseMode ? { parse_mode: parseMode } : {}) })
      : InputMediaBuilder.video(item.media, { caption, ...(parseMode ? { parse_mode: parseMode } : {}) });

    await ctx.editMessageMedia(media, { reply_markup: keyboard });
    await ctx.answerCallbackQuery();
  } catch (err) {
    console.error("Gallery navigation error:", err);
    await ctx.answerCallbackQuery();
  }
});
