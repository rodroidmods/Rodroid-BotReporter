import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1),
  OWNER_CHAT_ID: z.string().transform((val) => parseInt(val, 10)),
});

export const env = envSchema.parse(process.env);
