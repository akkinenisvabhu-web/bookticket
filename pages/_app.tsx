import '../styles/globals.css'; // Adjust path if your CSS file is elsewhere
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
