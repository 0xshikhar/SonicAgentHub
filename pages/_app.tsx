import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/globals.css';
import Providers from '@/pages/providers';
import { Navbar } from '@/components/layout/navbar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Agent Chain - AI-Powered Autonomous Agent Platform</title>
        <meta name="description" content="Discover and deploy AI-powered autonomous agents for trading, social media, DeFi, NFTs, gaming, and DAOs." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Providers>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
        </div>
      </Providers>
    </>
  );
}
