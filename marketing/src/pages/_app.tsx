import '~/styles/main.css'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'
import useFathom from '~/components/hooks/useFathom'
import SEO from '~/../next-seo.config'

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const fathom = useFathom()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#1A1B1C" />
        <meta name="msapplication-TileColor" content="#1A1B1C" />
        <meta name="theme-color" content="#1A1B1C" />
      </Head>
      <DefaultSeo {...SEO} />
      <div className="flex flex-col gap-5 px-10 lg:px-3 mx-auto max-w-6xl pt-3 pb-2">
        <Component {...pageProps} fathom={fathom} />
      </div>
    </>
  )
}

export default App
