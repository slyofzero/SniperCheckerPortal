import { contract } from "@/rpc";

export async function getTokenBalance(address: string) {
  try {
    const balance = (await contract.methods
      .balanceOf(address)
      .call()) as bigint;
    const decimals = (await contract.methods.decimals().call()) as bigint;
    const tokenBalance = parseInt(Number(balance / 10n ** decimals).toFixed(0));
    return tokenBalance;
  } catch (error) {
    return 0;
  }
}
