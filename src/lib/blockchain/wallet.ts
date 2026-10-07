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

  // Read the chain directly from MetaMask.
  const rawChainId =
    await window.ethereum.request({
      method: "eth_chainId",
    });

  const chainId =
    parseInt(String(rawChainId), 16);

  console.log("MetaMask chain ID:", rawChainId);
  console.log("Parsed chain ID:", chainId);
  console.log("Expected Sepolia:", SEPOLIA_CHAIN_ID);

  if (chainId !== SEPOLIA_CHAIN_ID) {
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
