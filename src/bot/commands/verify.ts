import { updateDocumentById } from "@/firebase";
import { teleBot } from "@/index";
import { StoredWallet } from "@/types";
import { tokenSymbol, tokenThreshold } from "@/utils/constants";
import {
  ETH_CHANNEL_LINK,
  ETH_SNIPER_CHANNEL,
  SOL_CHANNEL_LINK,
  SOL_SNIPER_CHANNEL,
} from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { getTokenBalance } from "@/utils/web3";
import { syncWallets, wallets } from "@/vars/wallets";
import { CommandContext, Context } from "grammy";

export async function verify(ctx: CommandContext<Context>) {
  const userChat = ctx.chat;

  if (!userChat) {
    const message = "Please do /verify again.";
    return ctx.reply(message);
  }

  // Checking wallet existence
  const { id: userId } = userChat;
  const userWallets = wallets.filter(
    ({ userId: storedUserId }) => userId === storedUserId
  );
  if (!userWallets.length) {
    const message = `No user wallets were found linked to your Telegram account. Do /start to create or import a wallet.`;
    return ctx.reply(message);
  }

  for (const userWallet of userWallets) {
    try {
      const { wallet } = userWallet;
      const balance = await getTokenBalance(wallet);

      if (!(balance >= tokenThreshold)) {
        await Promise.all([
          teleBot.api.unbanChatMember(ETH_SNIPER_CHANNEL || "", userId),
          teleBot.api.unbanChatMember(SOL_SNIPER_CHANNEL || "", userId),
        ]);
        log(`Unbanned ${userId}`);

        updateDocumentById<StoredWallet>({
          collectionName: "wallets",
          updates: { verified: true },
          id: userWallet.id || "",
        }).then(() => syncWallets());

        const formattedBalance = balance.toLocaleString("en");
        const message = `Token balance verified, your wallet \`${wallet}\` holds ${formattedBalance} ${tokenSymbol}\\. You can now join our Sniper Alert channels for Ethereum and Solana\\.
      
[ETH channel](${ETH_CHANNEL_LINK}) \\| [SOL channel](${SOL_CHANNEL_LINK})`;

        return ctx.reply(message, { parse_mode: "MarkdownV2" });
      }
    } catch (error) {
      errorHandler(error);
      const message =
        "An error occurred during verification, please try again.";
      return ctx.reply(message);
    }
  }

  const message = `No wallet linked to your Telegram account holds ${tokenThreshold} ${tokenSymbol}. Verification failed.`;
  return ctx.reply(message);
}
