import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
} from "ethers";

import {
  PROOFFUND_CONTRACT_ADDRESS,
  SEPOLIA_RPC_URL,
} from "./config";

import { PROOFFUND_ABI } from "./abi";

export function getReadProvider() {
  if (!SEPOLIA_RPC_URL) {
    throw new Error(
      "Missing VITE_SEPOLIA_RPC_URL environment variable."
    );
  }

  return new JsonRpcProvider(SEPOLIA_RPC_URL);
}

export async function getWalletProvider() {
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

  return provider;
}

export async function getWalletSigner() {
  const provider =
    await getWalletProvider();

  return provider.getSigner();
}

export function getReadContract() {
  if (!PROOFFUND_CONTRACT_ADDRESS) {
    throw new Error(
      "Missing ProofFund contract address."
    );
  }

  return new Contract(
    PROOFFUND_CONTRACT_ADDRESS,
    PROOFFUND_ABI,
    getReadProvider()
  );
}

export async function getWriteContract() {
  if (!PROOFFUND_CONTRACT_ADDRESS) {
    throw new Error(
      "Missing ProofFund contract address."
    );
  }

  const provider =
    await getWalletProvider();

  const signer =
    await provider.getSigner();

  const contract = new Contract(
    PROOFFUND_CONTRACT_ADDRESS,
    PROOFFUND_ABI,
    signer
  );

  console.log(
    "Write contract:",
    PROOFFUND_CONTRACT_ADDRESS
  );

  console.log(
    "Donate function:",
    contract.getFunction("donate")
  );

  return contract;
}