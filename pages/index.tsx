import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

type Show = { id: string; name: string; description: string; imageUrl: string; totalTickets: number; ticketsSold: number; };
type HomePageProps = { shows: Show[]; };

export const getStaticProps: GetStaticProps = async () => {
  const querySnapshot = await getDocs(collection(db, "shows"));
  const shows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Show, 'id'> }));
  return { props: { shows }, revalidate: 60 };
}

const HomePage: NextPage<HomePageProps> = ({ shows }) => {
  return (
    <div className="bg-dark-blue min-h-screen text-off-white font-space-grotesk">
      <Head>
        <title>Electroflix - Your Ultimate Event Hub</title>
        <meta name="description" content="Discover and book tickets for the hottest shows on Electroflix." />
      </Head>

      <header className="relative text-center py-24 overflow-hidden">
        <h1 className="text-6xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-teal to-neon-pink animate-fade-in">
          Electroflix
        </h1>
        <p className="mt-4 text-lg text-off-white opacity-80 animate-fade-in [animation-delay:200ms]">
          Your portal to electrifying experiences.
        </p>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-10 text-center text-primary-blue animate-fade-in [animation-delay:400ms]">
          Upcoming Events
        </h2>
        {/* --- THIS IS THE CORRECTED GRID CONTAINER --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          {shows.map((show, index) => (
            <ShowCard key={show.id} show={show} delay={index * 100} />
          ))}
        </div>
      </main>

       <footer className="text-center py-12 mt-10 text-off-white opacity-60 text-sm border-t border-gray-700">
        <p>&copy; 2025 Electroflix. All rights reserved.</p>
        <p className="mt-2">Designed for the future.</p>
      </footer>
    </div>
  );
}

function ShowCard({ show, delay }: { show: Show; delay: number }) {
    const ticketsLeft = show.totalTickets - show.ticketsSold;
    const isFewTicketsLeft = ticketsLeft > 0 && ticketsLeft <= 10;
    return (
        <div
            className="flex flex-col bg-gray-800 rounded-xl overflow-hidden shadow-lg transform hover:scale-[1.02] transition-all duration-300 ease-in-out group animate-fade-in border border-gray-700 hover:border-primary-blue/50"
            style={{ animationDelay: `${delay}ms` }}
        >
            <img
                src={show.imageUrl}
                alt={show.name}
                className="w-full h-auto object-cover"
            />
            <div className="p-6 text-off-white flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-blue transition-colors duration-300">{show.name}</h3>
                <p className="text-off-white text-sm opacity-80 mb-4 h-14 overflow-hidden">{show.description}</p>
                {ticketsLeft > 0 ? (
                    <div className={`text-lg font-semibold mb-4 ${isFewTicketsLeft ? 'text-neon-pink animate-pulse' : 'text-accent-teal'}`}>
                        {isFewTicketsLeft ? `Only ${ticketsLeft} tickets left!` : `${ticketsLeft} tickets available`}
                    </div>
                ) : (
                    <div className="text-lg font-semibold text-gray-500 mb-4">
                       Sold Out
                    </div>
                )}
                <Link href={`/show/${show.id}`} passHref>
                    <button
                        className="w-full mt-auto py-3 px-4 bg-primary-blue hover:bg-accent-teal rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-primary-blue/50"
                        disabled={ticketsLeft <= 0}
                    >
                        {ticketsLeft > 0 ? "Book Ticket" : "View Details"}
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default HomePage;