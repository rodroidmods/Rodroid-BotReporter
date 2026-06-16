import { Context, SessionFlavor } from "grammy";
import { ConversationFlavor } from "@grammyjs/conversations";

export interface SessionData {
  lastReportTime?: number;
  lastReportId?: string;
  lang?: string;
}

export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor<Context>;
