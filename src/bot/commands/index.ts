import { teleBot } from "@/index";
import { startBot } from "./start";
import { errorHandler, log } from "@/utils/handlers";
import { verify } from "./verify";
import { executeStep } from "../executeStep";
import { CommandContext, Context } from "grammy";
import { tokenSymbol, tokenThreshold } from "@/utils/constants";
import { ETH_SNIPER_CHANNEL, SOL_SNIPER_CHANNEL } from "@/utils/env";
import { wallets } from "@/vars/wallets";

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

  teleBot.on("chat_member", async (ctx) => {
    const channels = [Number(ETH_SNIPER_CHANNEL), Number(SOL_SNIPER_CHANNEL)];
    const member = ctx.from;
    const channelId = ctx.update.chat_member.chat.id;
    const isPrivateChannel = channels.includes(channelId);

    const userJoined =
      ctx.update.chat_member.new_chat_member.status === "member";

    if (!userJoined) return;

    const userSubscription = wallets.some(
      ({ userId, verified }) => userId === member.id && verified
    );

    const shouldBanUser =
      isPrivateChannel && !member.is_bot && !userSubscription;

    if (shouldBanUser) {
      ctx.banChatMember(member.id).catch((e) => errorHandler(e));
      log(`Banned ${member.id} from ${channelId}`);
    }
  });

  log("Bot commands up");
}
