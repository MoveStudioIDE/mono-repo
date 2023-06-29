import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import {WalletProvider} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { Analytics } from '@vercel/analytics/react';
import { ReactFlowProvider } from 'reactflow';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <ReactFlowProvider>
        <Component {...pageProps} />
        <Analytics/>
      </ReactFlowProvider>
    </WalletProvider>
  )
}
