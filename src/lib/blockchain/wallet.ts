import { BrowserProvider } from "ethers";

import { SEPOLIA_CHAIN_ID } from "./config";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed."
    );
  }

  const provider =
    new BrowserProvider(window.ethereum);

  await provider.send(
    "eth_requestAccounts",
    []
  );

  const network =
    await provider.getNetwork();

  if (
    Number(network.chainId) !==
    SEPOLIA_CHAIN_ID
  ) {
    throw new Error(
      "Please switch MetaMask to the Sepolia network."
    );
  }

  const signer =
    await provider.getSigner();

  const address =
    await signer.getAddress();

  return {
    provider,
    signer,
    address,
  };
}