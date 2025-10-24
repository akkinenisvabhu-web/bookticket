import { useState } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Head from "next/head";
import Header from "./Header";

// ✅ Dynamically import (no SSR)
const QrReader = dynamic(() => import("react-qr-reader-es6"), { ssr: false });

export default function VerifyTicket() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTicket = async (ticketId: string) => {
    setLoading(true);
    setTicketInfo(null);

    try {
      const ticketRef = doc(db, "tickets", ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (ticketSnap.exists()) {
        const data = ticketSnap.data();
        setTicketInfo({
          valid: true,
          name: data.userName,
          rollNumber: data.rollNumber,
          showId: data.showId,
        });

        if (typeof window !== "undefined") {
          try {
            const audio = new Audio("/beep.mp3");
            audio.play().catch(() => {});
            if (navigator.vibrate) navigator.vibrate(200);
          } catch {}
        }
      } else {
        setTicketInfo({ valid: false });
      }
    } catch (error) {
      console.error("Error verifying ticket:", error);
      setTicketInfo({ valid: false });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-space-grotesk">
      <Head>
        <title>Verify Ticket – Electroflix</title>
      </Head>

      <Header />

      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Scan Ticket QR Code</h1>

        {/* ✅ QR Scanner */}
        <div className="flex justify-center mb-6">
          <QrReader
            delay={300}
            onScan={async (data: string | null) => {
              if (data) {
                setScanResult(data);
                await checkTicket(data);
              }
            }}
            onError={(err: unknown) => console.error(err)}
            style={{ width: "100%", borderRadius: "12px" }}
            // ✅ @ts-ignore prevents type error since constraints is valid runtime prop
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            constraints={{
              video: { facingMode: { ideal: "environment" } },
            }}
          />
        </div>

        {loading && <p className="text-gray-400">Verifying ticket...</p>}

        {ticketInfo && (
          <div
            className={`mt-6 p-4 rounded-xl ${
              ticketInfo.valid ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {ticketInfo.valid ? (
              <>
                <h2 className="text-2xl font-bold mb-2">✅ Ticket Verified</h2>
                <p>
                  <strong>Name:</strong> {ticketInfo.name}
                </p>
                <p>
                  <strong>Roll No:</strong> {ticketInfo.rollNumber}
                </p>
                <p>
                  <strong>Show ID:</strong> {ticketInfo.showId}
                </p>
              </>
            ) : (
              <h2 className="text-2xl font-bold">❌ Ticket Not Found</h2>
            )}
          </div>
        )}

        {scanResult && (
          <p className="mt-4 text-sm text-gray-500 break-words">
            Scanned ID: {scanResult}
          </p>
        )}
      </main>
    </div>
  );
}
