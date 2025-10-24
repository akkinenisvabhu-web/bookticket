import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

type Show = {
  id: string;
  name: string;
  imageUrl: string;
  totalTickets: number;
  ticketsSold: number;
};

type HomePageProps = { shows: Show[] };

export const getStaticProps: GetStaticProps = async () => {
  const querySnapshot = await getDocs(collection(db, "shows"));
  const shows = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "Untitled Show",
      imageUrl: data.imageUrl ?? "/show1.png",
      totalTickets: data.totalTickets ?? 0,
      ticketsSold: data.ticketsSold ?? 0,
    } as Show;
  });

  return { props: { shows }, revalidate: 60 };
};

const HomePage: NextPage<HomePageProps> = ({ shows }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-space-grotesk">
      <Head>
        <title>electroflix – Movies & Events</title>
      </Head>

      {/* Top Buttons (inside page content) */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-400">Electroflix</h1>
        <div className="flex space-x-4">
          <Link href="/">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
              Home
            </button>
          </Link>
          <Link href="/account">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
              My Account
            </button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="py-8 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
          Discover Shows
        </h2>
        <p className="text-gray-400 mt-3 text-lg">
          Find your next blockbuster and grab your seat.
        </p>
      </header>

      {/* Shows List */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 py-4">
          {shows.map((show) => (
            <ShowCard key={show.id} {...show} />
          ))}
        </div>
      </main>

      <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
        © 2025 electroflix. All rights reserved.
      </footer>
    </div>
  );
};

function ShowCard({ id, name, imageUrl, totalTickets, ticketsSold }: Show) {
  const ticketsLeft = totalTickets - ticketsSold;
  const isSoldOut = ticketsLeft <= 0;

  return (
    <div className="flex-shrink-0 w-64 bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="relative h-80 overflow-hidden rounded-t-2xl">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {isSoldOut && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold shadow">
            SOLD OUT
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-white font-semibold text-lg line-clamp-2">{name}</h3>
        <p className="text-gray-400 text-sm">{ticketsLeft} tickets left</p>

        <Link href={`/show/${id}`} passHref>
          <button
            disabled={isSoldOut}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isSoldOut
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Book Now"}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
