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
    aurora,
    auroraTestnet,
} from 'wagmi/chains';

import { agentChain } from '@/lib/agentChain';
import { WalletAuthProvider } from '@/components/WalletAuthProvider';


const config = getDefaultConfig({
    appName: 'The Agent Chain',
    projectId: '9811958bd307518b364ff7178034c435',
    chains: [aurora, auroraTestnet, agentChain],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

const projectId = '9811958bd307518b364ff7178034c435';

const { wallets } = getDefaultWallets({
    appName: 'The Agent Chain',
    projectId,
});

const demoAppInfo = {
    appName: 'The Agent Chain',
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
