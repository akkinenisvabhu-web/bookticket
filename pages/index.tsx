import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

type Show = { 
  id: string; 
  name: string; 
  description: string; 
  imageUrl: string; 
  totalTickets: number; 
  ticketsSold: number; 
};

type HomePageProps = { shows: Show[]; };

export const getStaticProps: GetStaticProps = async () => {
  const querySnapshot = await getDocs(collection(db, "shows"));
  
  const shows = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'Untitled Show',
      description: data.description || 'No description available.',
      imageUrl: data.imageUrl || '', 
      totalTickets: data.totalTickets || 0,
      ticketsSold: data.ticketsSold || 0,
    } as Show;
  });
  
  return { props: { shows }, revalidate: 60 };
}

const HomePage: NextPage<HomePageProps> = ({ shows }) => {
  const localImages = [
    '/show3.jpg',
    '/show2.jpg',
    '/show1.png',
    '/show4.jpg',
  ];

  const showsWithLocalImages = shows.map((show, index) => ({
    ...show,
    imageUrl: localImages[index] ?? '/show1.png' 
  }));

  return (
    <div className="bg-dark-blue min-h-screen text-off-white font-space-grotesk">
      <Head>
        <title>Electroflix - Your Ultimate Event Hub</title>
        <meta name="description" content="Discover and book tickets for the hottest shows on Electroflix." />
      </Head>

      <header className="relative text-center py-24 overflow-hidden">
        <h1 className="text-6xl sm:text-8xl font-extrabold text-off-white bg-clip-text bg-gradient-to-r from-primary-blue via-accent-teal to-neon-pink animate-fade-in">
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

        {/* The horizontal gap is provided by gap-6 */}
        <div className="flex flex-wrap justify-center gap-6">
          {showsWithLocalImages.map((show, index) => (
            <ShowCard key={show.id} show={show} delay={index * 100} />
          ))}
        </div>
      </main>

      <footer className="text-center py-12 mt-10 text-off-white opacity-60 text-sm border-t border-gray-700">
        <p>&copy; 2025 Electroflix. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------

function ShowCard({ show, delay }: { show: Show; delay: number }) {
  const ticketsLeft = show.totalTickets - show.ticketsSold;
  const isFewTicketsLeft = ticketsLeft > 0 && ticketsLeft <= 20; 

  return (
    // Card Container with hover animations
    <div
      className="w-[calc(50%-12px)] sm:w-[calc(33%-16px)] lg:w-[calc(25%-18px)] max-w-[250px] bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-neon-pink/30 transform hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-in-out group animate-fade-in border border-gray-700 hover:border-accent-teal"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Link wrapper for the whole card */}
      <Link href={`/show/${show.id}`} passHref className="flex flex-col h-full">
        
        {/* Image Area - Tall poster image (fixed height h-80) */}
        <div className="relative overflow-hidden w-full h-80"> 
          <img
            src={show.imageUrl}
            alt={show.name}
            className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-[1.05] transition-all duration-500" 
          />
          {/* Absolute-positioned badge for status */}
          {ticketsLeft <= 0 && (
            <div className="absolute top-2 right-2 bg-neon-pink text-white font-bold py-0.5 px-2 rounded text-xs shadow-md">
              SOLD OUT
            </div>
          )}
          {isFewTicketsLeft && ticketsLeft > 0 && (
            <div className="absolute top-2 right-2 bg-primary-blue text-white font-bold py-0.5 px-2 rounded text-xs shadow-md animate-pulse">
              LAST CHANCE
            </div>
          )}
        </div>

        {/* Content Area (Below the image) 
            We use flex-col and justify-between for content alignment
        */}
        <div className="p-4 text-off-white flex flex-col justify-between flex-grow"> 
          
          {/* PRIMARY CONTENT BLOCK - ENFORCES MINIMUM HEIGHT */}
          <div className="flex flex-col flex-grow min-h-[5rem]"> 
            
            {/* Title and Price */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-extrabold group-hover:text-accent-teal transition-colors duration-300 leading-tight line-clamp-2">
                    {show.name}
                </h3>
                <span className="text-xl font-bold text-neon-pink ml-2 flex-shrink-0">
                    ₹49
                </span>
            </div>

            {/* Tickets Left Status */}
            <div className="text-xs opacity-70 mb-3 flex justify-between">
                <span>{ticketsLeft > 0 ? `${ticketsLeft} tickets available` : '0 tickets left'}</span>
            </div>
          </div>
          {/* END PRIMARY CONTENT BLOCK */}

          {/* Button - guaranteed to align horizontally */}
          <button
            className={`w-full py-2 rounded-md font-bold text-sm transition-all duration-300 transform ${
              ticketsLeft > 0 
                ? 'bg-primary-blue text-white hover:bg-neon-pink hover:shadow-md hover:shadow-neon-pink/50' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            disabled={ticketsLeft <= 0}
          >
            {ticketsLeft > 0 ? 'Book Tickets' : 'Sold Out'}
          </button>
        </div>
      </Link>
    </div>
  );
}

export default HomePage;