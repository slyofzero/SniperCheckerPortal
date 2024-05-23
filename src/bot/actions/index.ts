import { log } from "@/utils/handlers";
import { CallbackQueryContext, Context } from "grammy";
import { executeStep } from "../executeStep";
import { teleBot } from "@/index";

export function initiateCallbackQueries() {
  teleBot.on("callback_query:data", (ctx) =>
    executeStep(ctx as CallbackQueryContext<Context>)
  );

  log("Bot callback queries up");
}
