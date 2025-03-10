import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';

import {
    getDefaultConfig,
    RainbowKitProvider,
    getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import 'dotenv/config'

import {
    sonicBlazeTestnet,
    sonic, 
    sepolia
} from 'wagmi/chains';
import { WalletAuthProvider } from '@/components/WalletAuthProvider';


const config = getDefaultConfig({
    appName: 'SonicAgents Hub',
    projectId: '9811958bd307518b364ff7178034c435',
    chains: [sonicBlazeTestnet, sonic, sepolia],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

const projectId = '9811958bd307518b364ff7178034c435';

const { wallets } = getDefaultWallets({
    appName: 'SonicAgents Hub',
    projectId,
});

const demoAppInfo = {
    appName: 'SonicAgents Hub',
};

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider appInfo={demoAppInfo}>
                    <WalletAuthProvider>
                        {mounted && children}
                    </WalletAuthProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
