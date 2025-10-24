import { useState, useContext, useEffect } from "react";
import dynamic from "next/dynamic";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "./Header";
import { AuthContext } from "./_app";

// Dynamic import to avoid SSR issues
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

export default function VerifyPage() {
  const user = useContext(AuthContext);
  const [result, setResult] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async (data: any) => {
    if (data) {
      setResult(data.text);
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

  // Optional: check if authorized user
  const isAuthorized = user?.email === "akkinenisvabhu@gmail.com";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex flex-col items-center mt-8">
        <h1 className="text-3xl font-bold mb-4">Scan Ticket QR</h1>

        {!user && <p className="text-gray-400">Please log in to access this page.</p>}

        {user && !isAuthorized && (
          <p className="text-red-500 font-semibold">
            You are not authorized to access the QR scanner.
          </p>
        )}

        {user && isAuthorized && (
          <>
            <div className="w-80 h-80 border-4 border-purple-600 rounded-lg overflow-hidden">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            {result && <p className="mt-4 text-gray-400">Ticket ID: {result}</p>}

            {ticketData && (
              <div className="mt-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-green-300">✅ Valid Ticket</h2>
                <p>Name: {ticketData.userName}</p>
                <p>Roll No: {ticketData.rollNumber}</p>
              </div>
            )}

            {error && <p className="mt-4 p-4 bg-red-700 rounded-lg">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
