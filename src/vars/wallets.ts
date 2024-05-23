import { getDocument } from "@/firebase";
import { StoredWallet } from "@/types";

export let wallets: StoredWallet[] = [];

export async function syncWallets() {
  wallets = await getDocument<StoredWallet>({ collectionName: "wallets" });
}
