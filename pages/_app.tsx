import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Layout from '../components/layout';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </Layout>
  );
}

export default MyApp;
