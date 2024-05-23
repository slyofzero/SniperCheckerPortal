import dotenv from "dotenv";

export const { NODE_ENV } = process.env;
dotenv.config({
  path: NODE_ENV === "development" ? ".env" : ".env.production",
});

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  ETH_SNIPER_TOKEN,
  SOL_SNIPER_TOKEN,
  ETH_SNIPER_CHANNEL,
  SOL_SNIPER_CHANNEL,
  ENCRYPTION_KEY,
  FIREBASE_KEY,
  RPC_URL,
  ETH_CHANNEL_LINK,
  SOL_CHANNEL_LINK,
} = process.env;
