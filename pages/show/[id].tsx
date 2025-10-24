import { useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Head from "next/head";
import Header from "../Header";

type Show = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalTickets: number;
  ticketsSold: number;
};

export const getServerSideProps = async ({ params }: any) => {
  const id = params?.id as string;
  const docRef = doc(db, "shows", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return { notFound: true };

  const data = snapshot.data();
  return {
    props: {
      show: {
        id,
        name: data.name ?? "Untitled Show",
        description: data.description ?? "No description available.",
        imageUrl: data.imageUrl ?? "/show1.png",
        totalTickets: data.totalTickets ?? 0,
        ticketsSold: data.ticketsSold ?? 0,
      } as Show,
    },
  };
};

export default function ShowPage({ show }: { show: Show }) {
  const router = useRouter();
  const ticketsLeft = show.totalTickets - show.ticketsSold;
  const isSoldOut = ticketsLeft <= 0;
  const [ticketCount, setTicketCount] = useState(1);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-space-grotesk">
      <Head>
        <title>{show.name} – Electroflix</title>
      </Head>

      {/* Header with Back button + Electroflix + My Account */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Show Image */}
        <img
          src={show.imageUrl}
          alt={show.name}
          className="rounded-2xl w-full md:w-1/2 object-cover shadow-lg"
        />

        {/* Details + Booking */}
        <div className="flex flex-col gap-4 md:w-1/2">
          <h1 className="text-4xl font-bold">{show.name}</h1>
          <p className="text-gray-400">{show.description}</p>
          <p className="text-gray-400 text-sm">{ticketsLeft} tickets left</p>

          {!isSoldOut && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setTicketCount((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                -
              </button>
              <span>{ticketCount}</span>
              <button
                onClick={() => setTicketCount((prev) => Math.min(prev + 1, 3))}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                +
              </button>
              <span className="text-sm text-gray-400">Max 3 per person</span>
            </div>
          )}

          <button
            disabled={isSoldOut}
            className={`mt-4 w-full md:w-auto px-6 py-2 rounded-lg font-semibold ${
              isSoldOut
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Book Now"}
          </button>
        </div>
      </main>
    </div>
  );
}
