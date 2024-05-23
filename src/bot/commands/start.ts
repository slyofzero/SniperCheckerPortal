import { tokenSymbol, tokenThreshold } from "@/utils/constants";
import { BOT_USERNAME } from "@/utils/env";
import { CommandContext, Context, InlineKeyboard } from "grammy";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `Welcome to ${BOT_USERNAME}, your portal to our Ethereum and Solana chains sniper tracker bots. To gain access to our channels you need to hold atleast ${tokenThreshold} ${tokenSymbol} in your ETH wallet.
  
For us to verify that you hold enough ${tokenSymbol}, you can either create a wallet with the bot and send ${tokenThreshold} ${tokenSymbol} to it, or import your existing wallet which already holds the tokens.`;

  const keyboard = new InlineKeyboard()
    .text("Create Wallet", "walletCreate")
    .text("Import Wallet", "walletImport");

  return ctx.reply(text, { reply_markup: keyboard });
}
