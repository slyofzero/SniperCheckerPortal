import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { verify } from "./verify";
import { executeStep } from "../executeStep";
import { CommandContext, Context } from "grammy";
import { tokenSymbol, tokenThreshold } from "@/utils/constants";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    {
      command: "verify",
      description: `To verify if your wallet holds atleast ${tokenThreshold} ${tokenSymbol}`,
    },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("verify", (ctx) => verify(ctx));

  teleBot.on(["message"], (ctx) => {
    executeStep(ctx as CommandContext<Context>);
  });

  log("Bot commands up");
}
