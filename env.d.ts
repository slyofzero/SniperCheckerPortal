declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      ETH_SNIPER_TOKEN: string | undefined;
      ETH_SNIPER_CHANNEL: string | undefined;
      SOL_SNIPER_TOKEN: string | undefined;
      SOL_SNIPER_CHANNEL: string | undefined;
      NODE_ENV: "development" | "production";
      FIREBASE_KEY: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      RPC_URL: string | undefined;
      ETH_CHANNEL_LINK: string | undefined;
      SOL_CHANNEL_LINK: string | undefined;
    }
  }
}

export {};
