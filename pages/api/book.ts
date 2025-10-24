import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Now returns an array of ticket IDs
type ResponseData = { message: string; ticketIds?: string[]; } 

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // PULL NEW DATA FROM REQUEST BODY
    const { showId, ticketCount, userId, userName, userRollNo } = req.body; 

    if (!showId || !ticketCount || !userId || ticketCount > 4 || ticketCount < 1 || !userName || !userRollNo) {
        return res.status(400).json({ message: 'Invalid or incomplete booking request.' });
    }

    const showRef = doc(db, 'shows', showId);

    try {
        const newTicketIds = await runTransaction(db, async (transaction) => {
            const showDoc = await transaction.get(showRef);

            if (!showDoc.exists()) {
                throw new Error("Show does not exist!");
            }

            const newTicketsSold = showDoc.data().ticketsSold + ticketCount;
            if (newTicketsSold > showDoc.data().totalTickets) {
                throw new Error("Not enough tickets available!");
            }

            // 1. Update the ticketsSold count
            transaction.update(showRef, { ticketsSold: newTicketsSold });
            
            const showName = showDoc.data().name;
            const ticketRefs = [];

            // 2. Loop to create multiple unique ticket documents
            for (let i = 0; i < ticketCount; i++) {
                const ticketData = {
                    userId: userId,
                    showId: showId,
                    showName: showName,
                    userName: userName,     // NEW DATA SAVED
                    userRollNo: userRollNo, // NEW DATA SAVED
                    guestIndex: i + 1, 
                    totalGuests: ticketCount,
                    purchaseDate: serverTimestamp()
                };
                
                // Add a new document and store its reference
                const newTicketRef = doc(collection(db, "tickets"));
                transaction.set(newTicketRef, ticketData);
                ticketRefs.push(newTicketRef.id);
            }

            return ticketRefs; // Return array of new IDs
        });

        // Redirect the user to the first ticket ID for viewing
        res.status(200).json({ message: 'Booking successful!', ticketIds: newTicketIds });

    } catch (error: any) {
        res.status(500).json({ message: error.message || 'An internal error occurred' });
    }
}
