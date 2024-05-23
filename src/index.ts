import { Api, Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, ETH_SNIPER_TOKEN, SOL_SNIPER_TOKEN } from "./utils/env";
import { syncWallets } from "./vars/wallets";

export const teleBot = new Bot(BOT_TOKEN || "");
export const ethSniperBot = new Api(ETH_SNIPER_TOKEN || "");
export const solSniperBot = new Api(SOL_SNIPER_TOKEN || "");
log("Bot instance ready");

// Check for new transfers at every 20 seconds
// const interval = 20;

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncWallets()]);

  // async function toRepeat() {
  //   //
  //   setTimeout(toRepeat, interval * 1e3);
  // }
  // await toRepeat();
})();
