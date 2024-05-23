import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";
import { ethers } from "ethers";
import { tokenSymbol, tokenThreshold } from "@/utils/constants";
import { addDocument } from "@/firebase";
import { StoredWallet } from "@/types";
import { encrypt } from "@/utils/cryptography";
import { userState } from "@/vars/userState";
import { syncWallets, wallets } from "@/vars/wallets";

export async function walletCreate(ctx: CallbackQueryContext<Context>) {
  const userChat = ctx.chat;

  if (!userChat) {
    const message = "Please click on Create Wallet again.";
    return ctx.reply(message);
  }

  // Checking wallet existence
  const { id: userId, username } = userChat;
  const createdWallet = wallets.find(
    ({ userId: storedUserId, type }) =>
      userId === storedUserId && type === "CREATED"
  );
  if (createdWallet) {
    const { wallet } = createdWallet;
    const message = `You have already created a wallet for verification\\.\n\`${wallet}\``;
    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }

  // Wallet creation
  const wallet = ethers.Wallet.createRandom();
  const { address, mnemonic } = wallet;

  if (!mnemonic) {
    const message = "Please click on Create Wallet again.";
    return ctx.reply(message);
  }

  const mnemonicPhrase = mnemonic.phrase;

  const addressMessage = `Your wallet's address is \\-\n\`${address}\``;
  await ctx.reply(addressMessage, { parse_mode: "MarkdownV2" });

  const mnemonicMessage = `
Mnemonic Phrase \\-
||${mnemonicPhrase}||

Store your mnemonic phrase in someplace safe, and don't share it with anyone\\. It won't be shown again after you click on the button below\\. After you have sent ${tokenThreshold} ${tokenSymbol} and the bot has verified it, you can use this mnemonic phrase to take them back\\.

Once you have sent the tokens to the wallet, do /verify to let the bot verify your token balance\\.`;

  addDocument<StoredWallet>({
    collectionName: "wallets",
    data: {
      userId,
      username: username || "",
      mnemonic: encrypt(mnemonicPhrase),
      wallet: address,
      type: "CREATED",
      verified: false,
    },
  }).then(() => {
    syncWallets();
  });

  const keyboard = new InlineKeyboard().text("I have saved", "walletSaved");

  return ctx.reply(mnemonicMessage, {
    parse_mode: "MarkdownV2",
    reply_markup: keyboard,
  });
}

export async function walletSaved(ctx: CallbackQueryContext<Context>) {
  ctx.deleteMessage();
}

export async function walletImport(ctx: CallbackQueryContext<Context>) {
  const userChat = ctx.chat;

  if (!userChat) {
    const message = "Please click on Import Wallet again.";
    return ctx.reply(message);
  }

  // Checking wallet existence
  const { id: userId } = userChat;
  const importedWallet = wallets.find(
    ({ userId: storedUserId, type }) =>
      userId === storedUserId && type === "IMPORTED"
  );

  if (importedWallet) {
    const { wallet } = importedWallet;
    const message = `You have already imported a wallet for verification\\.\n\`${wallet}\``;
    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }

  userState[userId] = "walletMnemonic";
  const message =
    "Enter you wallet's mnemonic phrase in the next message.\n\nThe phrase isn't stored anywhere and is simply used to link your Telegram ID to the ETH address the phrase belongs to.";
  return ctx.reply(message);
}

export async function walletMnemonic(ctx: CommandContext<Context>) {
  const userChat = ctx.chat;

  if (!userChat) {
    const message = "Please click on Import Wallet again.";
    return ctx.reply(message);
  }

  const { id: userId, username } = userChat;
  const mnemonicPhrase = ctx.message?.text;

  if (
    !mnemonicPhrase ||
    !ethers.Mnemonic.isValidMnemonic(mnemonicPhrase) ||
    !username
  ) {
    const message = "Please enter a valid mnemonic phrase.";
    return ctx.reply(message);
  }

  const { address } = ethers.Wallet.fromPhrase(mnemonicPhrase);

  const createdWallet = wallets.find(
    ({ userId: storedUserId, wallet, type }) =>
      userId === storedUserId && type === "CREATED" && wallet === address
  );

  if (createdWallet) {
    const { wallet } = createdWallet;
    const message = `You are trying to import the same wallet which you created for verification\\.\n\`${wallet}\``;
    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }

  const message = `Your wallet's address is \\-
\`${address}\`

If you have ${tokenThreshold} ${tokenSymbol} in your wallet, do /verify to let the bot verify your token balance\\. Otherwise first make sure you hold enough tokens, and then do /verify\\.
`;

  delete userState[userId];

  addDocument<StoredWallet>({
    collectionName: "wallets",
    data: {
      userId,
      username: username,
      mnemonic: encrypt(mnemonicPhrase),
      wallet: address,
      type: "IMPORTED",
      verified: false,
    },
  });

  return ctx.reply(message, {
    parse_mode: "MarkdownV2",
  });
}
