import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const ThankYouPage: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white text-center">
      <Head>
        <title>Booking Complete | Electroflix</title>
      </Head>
      <div className="w-full max-w-md animate-fade-in p-8 bg-gray-800 rounded-2xl shadow-2xl border border-accent-teal/50">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 mx-auto text-accent-teal mb-6 animate-pulse" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Booking Confirmed!
        </h1>
        <p className="text-lg text-off-white/80 mb-6">
          Your tickets are secure. Enjoy the show!
        </p>
        <p className="text-sm text-primary-blue font-semibold mb-8 border border-primary-blue/30 p-3 rounded-lg bg-gray-900">
          **IMPORTANT:** Your tickets are available on the "My Account" section in this website. (Feature to be implemented.)
        </p>
        <Link href="/" passHref>
          <button className="w-full py-3 px-4 rounded-lg bg-neon-pink text-white font-bold transition-all duration-300 transform hover:scale-105 hover:bg-primary-blue">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;
