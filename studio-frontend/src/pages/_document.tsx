import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-base-100 text-base-content">
        <html data-theme="night"></html>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
