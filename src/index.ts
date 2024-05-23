import { Bot, Context, MemorySessionStorage } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { syncWallets } from "./vars/wallets";
import { chatMembers, type ChatMembersFlavor } from "@grammyjs/chat-members";
import { ChatMember } from "grammy/types";

type MyContext = Context & ChatMembersFlavor;
const adapter = new MemorySessionStorage<ChatMember>();
export const teleBot = new Bot<MyContext>(BOT_TOKEN || "");
log("Bot instance ready");
teleBot.use(chatMembers(adapter));

// Check for new transfers at every 20 seconds
// const interval = 20;

(async function () {
  teleBot.start({
    allowed_updates: ["chat_member", "message", "callback_query"],
  });
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
