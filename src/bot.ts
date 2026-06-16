import { Bot } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import { conversations, createConversation } from "@grammyjs/conversations";
import { env } from "./config/env";
import db from "./config/db";
import { MyContext } from "./types/context";
import { sessionMiddleware } from "./middlewares/session";
import { ratelimitMiddleware } from "./middlewares/ratelimiter";
import { reportWizard } from "./conversations/reportWizard";
import { commandsHandler } from "./handlers/commands";
import { ownerReplyHandler } from "./handlers/ownerReply";
import { galleryHandler } from "./handlers/gallery";
import { editHandler } from "./handlers/editHandler";

const bot = new Bot<MyContext>(env.BOT_TOKEN);

bot.use(sequentialize((ctx) => ctx.chat?.id.toString()));

bot.use(sessionMiddleware);
bot.use(ratelimitMiddleware);
bot.use(conversations());

bot.use(createConversation(reportWizard));

bot.use(commandsHandler);
bot.use(editHandler);
bot.use(ownerReplyHandler);
bot.use(galleryHandler);

bot.catch((err) => {
  console.error("Global bot error:", err);
});

bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "How to report a bug" },
  { command: "status", description: "Check a report status" },
  { command: "myreports", description: "View your recent reports" },
  { command: "edit", description: "Edit your last report (5 min window)" },
  { command: "cancel", description: "Cancel current action" },
]);

// Owner-only commands (visible only to the owner)
bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "How to report a bug" },
  { command: "reply", description: "Reply to a user's report" },
  { command: "changestatus", description: "Change report status" },
  { command: "stats", description: "View report statistics" },
  { command: "search", description: "Search reports" },
  { command: "status", description: "Check a report status" },
  { command: "myreports", description: "View your recent reports" },
  { command: "cancel", description: "Cancel current action" },
], { scope: { type: "chat", chat_id: env.OWNER_CHAT_ID } });

const runner = run(bot);

console.log("Bot is running...");

const stopRunner = () => {
  if (runner.isRunning()) {
    runner.stop();
  }
  db.close();
  console.log("Bot stopped gracefully.");
};

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
