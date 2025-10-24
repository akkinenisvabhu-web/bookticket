// pages/index.tsx
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useContext, useState } from "react";
import Header from "./Header";
import { AuthContext } from "./_app";

// Dynamic import for QR Scanner (no SSR)
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

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
  const user = useContext(AuthContext);
  const [scanResult, setScanResult] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState("");

  // Only authorized user can scan
  const isAuthorized = user?.email === "akkinenisvabhu@gmail.com";

  const handleScan = async (data: any) => {
    if (data) {
      setScanResult(data.text);
      try {
        const ticketRef = doc(db, "tickets", data.text);
        const snap = await getDoc(ticketRef);

        if (snap.exists()) {
          setTicketData(snap.data());
          setError("");
        } else {
          setTicketData(null);
          setError("❌ Ticket not found in database!");
        }
      } catch (err) {
        console.error(err);
        setError("Error checking ticket.");
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError("Camera error or access denied.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-space-grotesk">
      <Head>
        <title>Electroflix – Movies & Events</title>
      </Head>

      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* QR Scanner Section */}
        {user && isAuthorized && (
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Scan Ticket QR</h2>
            <div className="w-80 h-80 border-4 border-purple-600 rounded-lg overflow-hidden">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            {scanResult && <p className="mt-4 text-gray-400">Ticket ID: {scanResult}</p>}
            {ticketData && (
              <div className="mt-4 p-4 bg-green-800 rounded-lg text-center">
                <h2 className="text-xl font-bold text-green-300">✅ Valid Ticket</h2>
                <p>Name: {ticketData.userName}</p>
                <p>Roll No: {ticketData.rollNumber}</p>
              </div>
            )}
            {error && <p className="mt-4 p-4 bg-red-700 rounded-lg">{error}</p>}
          </div>
        )}

        {/* Shows List */}
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent text-center mb-6">
          Discover Shows
        </h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 py-4">
          {shows.map((show) => (
            <ShowCard key={show.id} {...show} />
          ))}
        </div>
      </main>
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
