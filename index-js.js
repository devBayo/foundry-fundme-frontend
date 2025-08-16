import {
  createWalletClient,
  createPublicClient,
  custom,
  defineChain,
  parseEther,
  formatEther,
} from "https://esm.sh/viem";

import { contractAddress, abi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const getAddressToFundedButton = document.getElementById(
  "addressToFundedButton"
);

let walletClient;
let publicClient;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses();
    connectButton.innerHTML = `Connected!`;
  } else {
    connectButton.innerHTML = "Please install a MetaMask.";
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "fund",
      account: connectedAccount,
      chain: currentChain,
      value: parseEther(ethAmount),
    });

    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install a MetaMask.";
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId();

  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });

  return currentChain;
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const balance = await publicClient.getBalance({
      address: contractAddress,
    });

    console.log(formatEther(balance));
  } else {
    connectButton.innerHTML = "Please install a MetaMask.";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = await createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "withdraw",
      account: connectedAccount,
      chain: currentChain,
    });

    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install metamask";
  }
}

async function getAddressToAmount() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = await createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);
    console.log(connectedAccount);
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const amountFunded = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "getAddressToAmountFunded",
      account: connectedAccount,
      chain: currentChain,
      args: [connectedAccount],
    });

    console.log(formatEther(amountFunded));
  } else {
    connectButton.innerHTML = "Please install metamask";
  }
}

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceButton.addEventListener("click", getBalance);
withdrawButton.addEventListener("click", withdraw);
getAddressToFundedButton.addEventListener("click", getAddressToAmount);
