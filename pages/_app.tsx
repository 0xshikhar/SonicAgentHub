import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from '../components/layout'; 

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Agent Market - AI-Powered Autonomous Agent Platform</title>
        <meta name="description" content="Discover and deploy AI-powered autonomous agents for trading, social media, DeFi, NFTs, gaming, and DAOs." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
