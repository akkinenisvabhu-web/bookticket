import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./_app";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";

export default function AccountPage() {
  const user = useContext(AuthContext);
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchTickets = async () => {
      const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchTickets();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-space-grotesk">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
      {tickets.length === 0 && <p>No tickets booked yet.</p>}
      <div className="flex flex-col gap-4">
        {tickets.map((t) => (
          <div key={t.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.showName}</p>
              <p className="text-sm">Booked by: {t.userName}</p>
            </div>
            <button
              onClick={() => router.push(`/ticket/${t.id}`)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              View Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
