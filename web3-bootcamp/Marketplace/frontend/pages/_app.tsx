import "../styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
// import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import Layout from "../components/Layout";
// import NetworkBanner from "../components/NetworkBanner";
import { NotificationProvider } from "web3uikit";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// const client = new ApolloClient({
//   cache: new InMemoryCache(),
//   uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider appId="">
        <Layout>
          <Component {...pageProps} />
        </Layout>
        {/* <ApolloProvider client={client}> */}
        {/* <NotificationProvider> */}
        {/* <NetworkBanner />
        {/* </NotificationProvider> */}
        {/* </ApolloProvider> */}
      </MoralisProvider>
    </>
  );
}
export default MyApp;
