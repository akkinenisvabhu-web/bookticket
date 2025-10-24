import Head from 'next/head';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useState } from 'react';

type Ticket = {
  id: string;
  showName: string;
  userName: string;
  rollNumber: string;
  showImage: string;
};

export async function getServerSideProps({ params }: any) {
  const ticketRef = doc(db, 'tickets', params.id);
  const ticketSnap = await getDoc(ticketRef);
  if (!ticketSnap.exists()) return { notFound: true };

  const ticketData = ticketSnap.data();
  const showRef = doc(db, 'shows', ticketData.showId);
  const showSnap = await getDoc(showRef);
  const showImage = showSnap.exists() ? showSnap.data().imageUrl : '/show1.png';

  return {
    props: {
      ticket: {
        id: ticketSnap.id,
        showName: ticketData.showName,
        userName: ticketData.userName,
        rollNumber: ticketData.rollNumber,
        showImage,
      },
    },
  };
}

export default function TicketPage({ ticket }: { ticket: Ticket }) {
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const qrData = encodeURIComponent(`https://electroflix.com/ticket/${ticket.id}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=1a202c&color=f0f0f0&qzone=1`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 font-space-grotesk">
      <Head>
        <title>{ticket.showName} – Your Ticket</title>
      </Head>

      {!confirmed ? (
        <>
          {/* Instruction banner */}
          <div className="mb-4 w-full max-w-md bg-black/80 text-white text-center py-3 text-xl md:text-2xl rounded-lg shadow-lg font-semibold">
            Take a screenshot of your ticket
          </div>

          {/* Ticket Poster */}
          <div className="relative w-full max-w-md h-[600px] rounded-2xl shadow-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ticket.showImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>

            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold text-center drop-shadow-lg">
                {ticket.showName}
              </h1>

              <div className="bg-black/70 p-4 rounded-lg text-center mx-auto drop-shadow-md mt-4">
                <p className="text-lg font-semibold">Booked By: {ticket.userName}</p>
                <p className="text-lg font-semibold">Roll No: {ticket.rollNumber}</p>
              </div>

              <div className="flex flex-col items-center mt-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="rounded-lg shadow-lg"
                />
                <div className="mt-2 px-2 py-1 bg-black/50 border border-black/30 rounded-sm">
                  <p className="font-mono text-sm">{ticket.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed button */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            Proceed
          </button>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center">
                <h2 className="text-white text-xl font-semibold mb-4">
                  Did you take a screenshot?
                </h2>
                <div className="flex justify-around mt-4">
                  <button
                    onClick={() => {
                      setConfirmed(true);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Thank you message
        <div className="text-center text-white mt-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank you for booking!</h1>
          <p className="text-lg md:text-xl">We hope you enjoy the show.</p>
        </div>
      )}
    </div>
  );
}
