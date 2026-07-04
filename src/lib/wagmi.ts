import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, monadTestnet, baseSepolia, arbitrumSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [monadTestnet, sepolia, baseSepolia, arbitrumSepolia, mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [monadTestnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
  },
})
