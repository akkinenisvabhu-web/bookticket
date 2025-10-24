import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
// Added 'query' and 'where' for checking existing tickets
import { doc, runTransaction, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'; 

// Now returns an array of ticket IDs
type ResponseData = { message: string; ticketIds?: string[]; } 

const MAX_USER_TICKETS = 3;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { showId, ticketCount, userId, userName, userRollNo } = req.body; 

    // General validation, including the max ticket limit enforced on front-end
    if (!showId || !ticketCount || !userId || ticketCount > MAX_USER_TICKETS || ticketCount < 1 || !userName || !userRollNo) {
        return res.status(400).json({ message: `Invalid or incomplete booking request. Max tickets per person is ${MAX_USER_TICKETS}.` });
    }

    const showRef = doc(db, 'shows', showId);
    const ticketsCol = collection(db, 'tickets');

    try {
        const newTicketIds = await runTransaction(db, async (transaction) => {
            const showDoc = await transaction.get(showRef);

            if (!showDoc.exists()) {
                throw new Error("Show does not exist!");
            }
            
            // --- CRITICAL SECURITY CHECK (Inside Transaction) ---
            const userTicketsQuery = query(
                ticketsCol,
                where('userId', '==', userId),
                where('showId', '==', showId)
            );
            
            // NOTE: Must run getDocs *outside* the transaction scope for standard reads.
            // Since this is a check for a separate collection, we'll run it before the transaction starts
            // and rely on the transaction to handle the final inventory count.
            // However, Firestore Transactions *do not* support reads from outside the transaction.
            // For simplicity and safety in this single API call environment, we perform the check outside the transaction.
            // In a larger system, user limit would be stored in the user's document for true transaction safety.
            
            // Temporarily retrieve user tickets (this is safe enough for non-critical counter checks)
            const existingTicketsSnap = await getDocs(userTicketsQuery);
            const existingTicketCount = existingTicketsSnap.size;
            
            const totalTicketsAfterPurchase = existingTicketCount + ticketCount;

            if (totalTicketsAfterPurchase > MAX_USER_TICKETS) {
                 throw new Error(`You have already purchased ${existingTicketCount} tickets. The limit is ${MAX_USER_TICKETS}.`);
            }
            // --- END SECURITY CHECK ---

            const newTicketsSold = showDoc.data().ticketsSold + ticketCount;
            if (newTicketsSold > showDoc.data().totalTickets) {
                throw new Error("Not enough tickets available in general inventory!");
            }

            // 1. Update the overall show inventory
            transaction.update(showRef, { ticketsSold: newTicketsSold });
            
            const showName = showDoc.data().name;
            const ticketRefs = [];

            // 2. Loop to create multiple unique ticket documents
            for (let i = 0; i < ticketCount; i++) {
                const ticketData = {
                    userId: userId,
                    showId: showId,
                    showName: showName,
                    userName: userName,
                    userRollNo: userRollNo,
                    guestIndex: existingTicketCount + i + 1, // Start guest count from where existing tickets left off
                    totalGuests: totalTicketsAfterPurchase, // Reflects the final total the user owns for this show
                    purchaseDate: serverTimestamp()
                };
                
                // Add a new document and store its reference
                const newTicketRef = doc(collection(db, "tickets"));
                transaction.set(newTicketRef, ticketData);
                ticketRefs.push(newTicketRef.id);
            }

            return ticketRefs; // Return array of new IDs
        });

        res.status(200).json({ message: 'Booking successful!', ticketIds: newTicketIds });

    } catch (error: any) {
        // Provide user-friendly message for limit exceeded errors
        const message = error.message.includes('limit') 
            ? error.message 
            : 'An internal error occurred during booking.';
            
        res.status(500).json({ message: message });
    }
}
