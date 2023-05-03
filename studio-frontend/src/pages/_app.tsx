import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import {WalletProvider} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
      <Analytics/>
    </WalletProvider>
  )
}
