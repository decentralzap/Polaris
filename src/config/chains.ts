import { defineChain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  celo,
  classic,
  confluxESpace,
  coreDao,
  cronos,
  eos,
  fantom,
  filecoin,
  gnosis,
  klaytn,
  linea,
  mainnet,
  mantle,
  neonMainnet,
  okc,
  opBNB,
  optimism,
  polygon,
  sepolia,
  zkSync,
} from "viem/chains";

export const shibarium = defineChain({
  id: 109,
  name: "Shibarium",
  network: "shibarium",
  nativeCurrency: {
    decimals: 18,
    name: "BONE",
    symbol: "BONE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.shibrpc.com"],
    },
    public: {
      http: ["https://rpc.shibrpc.com"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://shibariumscan.io" },
  },
});

export const ethw = defineChain({
  id: 10001,
  name: "ETHW-mainnet",
  network: "ETHW-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETHW",
    symbol: "ETHW",
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.ethereumpow.org"],
    },
    public: {
      http: ["https://mainnet.ethereumpow.org"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://mainnet.ethwscan.com" },
  },
});

export const kcc = defineChain({
  id: 321,
  name: "KCC Mainnet",
  network: "KCC Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "KCS",
    symbol: "KCS",
  },
  rpcUrls: {
    default: {
      http: ["https://kcc-rpc.com"],
    },
    public: {
      http: ["https://kcc-rpc.com"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.kcc.io/en" },
  },
});

export const mapo = defineChain({
  id: 22776,
  name: "MAP Mainnet",
  network: "MAP Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "MAPO",
    symbol: "MAPO",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.maplabs.io"],
    },
    public: {
      http: ["https://rpc.maplabs.io"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://mapscan.io" },
  },
});

export const inscriptionChains = {
  eth: mainnet,
  bsc,
  opBNB,
  // okc,
  polygon,
  fantom,
  avalanche,
  arbitrum,
  optimism,
  base,
  zkSync,
  classic,
  klaytn,
  mantle,
  mapo,
  cronos,
  kcc,
  coreDao,
  ethw,
  eos,
  neonMainnet,
  linea,
  celo,
  confluxESpace,
  gnosis,
  filecoin,
  shibarium,
  sepolia,
};

export type ChainKey = keyof typeof inscriptionChains;
