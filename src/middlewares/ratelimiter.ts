import { limit } from "@grammyjs/ratelimiter";
import { Context } from "grammy";

export const ratelimitMiddleware = limit({
  timeFrame: 5000,
  limit: 3,
  onLimitExceeded: async (ctx) => {
    await (ctx as Context).reply("Please do not spam requests. Wait a moment.");
  },
});
