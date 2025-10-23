import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';

type ResponseData = { message: string; ticketId?: string; }

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { showId, ticketCount, userId } = req.body;

    if (!showId || !ticketCount || !userId || ticketCount > 4 || ticketCount < 1) {
        return res.status(400).json({ message: 'Invalid booking request.' });
    }

    const showRef = doc(db, 'shows', showId);

    try {
        const newTicketId = await runTransaction(db, async (transaction) => {
            const showDoc = await transaction.get(showRef);
            if (!showDoc.exists()) {
                throw new Error("Show does not exist!");
            }
            const newTicketsSold = showDoc.data().ticketsSold + ticketCount;
            if (newTicketsSold > showDoc.data().totalTickets) {
                throw new Error("Not enough tickets available!");
            }
            transaction.update(showRef, { ticketsSold: newTicketsSold });
            const ticketRef = await addDoc(collection(db, "tickets"), {
                userId: userId,
                showId: showId,
                showName: showDoc.data().name,
                ticketCount: ticketCount,
                purchaseDate: serverTimestamp()
            });
            return ticketRef.id;
        });
        res.status(200).json({ message: 'Booking successful!', ticketId: newTicketId });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'An internal error occurred' });
    }
}