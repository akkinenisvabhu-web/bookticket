import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

// Update type definition to reflect the new structure (guest index and total guests)
type Ticket = { 
    id: string; 
    showName: string; 
    guestIndex: number; // e.g., 1
    totalGuests: number; // e.g., 3
    purchaseDate: string; 
    userId: string;
};
type TicketPageProps = { ticket: Ticket; };

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const ticketRef = doc(db, 'tickets', params?.id as string);
    const ticketSnap = await getDoc(ticketRef);
    if (!ticketSnap.exists()) return { notFound: true };
    
    const data = ticketSnap.data();
    const purchaseTimestamp = data.purchaseDate as Timestamp;
    
    const ticketData: Ticket = { 
        id: ticketSnap.id, 
        showName: data.showName, 
        guestIndex: data.guestIndex, // New field
        totalGuests: data.totalGuests, // New field
        purchaseDate: purchaseTimestamp.toDate().toLocaleString(),
        userId: data.userId
    };
    return { props: { ticket: ticketData }};
};

export default function TicketPage({ ticket }: TicketPageProps) {
    // QR Code data should include the unique ticket ID for verification
    const qrCodeData = JSON.stringify({
        id: ticket.id,
        show: ticket.showName,
        guest: ticket.guestIndex
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}&bgcolor=1a202c&color=f0f0f0&qzone=1`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - Ticket {ticket.guestIndex} of {ticket.totalGuests}</title></Head>
            <div className="w-full max-w-md animate-fade-in">
                <h1 className="mb-8 text-center text-3xl font-bold text-primary-blue">Your Electroflix Pass</h1>
                <div className="overflow-hidden rounded-2xl border-2 border-primary-blue/50 bg-gray-800 shadow-2xl">
                    <div className="bg-gradient-to-br from-primary-blue to-accent-teal p-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm uppercase tracking-widest text-white/80">Guest Ticket</p>
                                <h2 className="mt-1 text-4xl font-extrabold text-white">{ticket.showName}</h2>
                            </div>
                            {/* Display Guest Index */}
                            <div className="text-right">
                                <p className="text-sm font-bold text-white opacity-80">GUEST</p>
                                <p className="text-3xl font-extrabold text-white">{ticket.guestIndex}/{ticket.totalGuests}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 text-center">
                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-blue">Scan at Entry</p>
                        <div className="mb-6 flex justify-center">
                            <img src={qrCodeUrl} alt="QR Code" className="rounded-lg border-4 border-primary-blue shadow-xl" />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <div className="bg-gray-700 p-3 rounded-lg text-left">
                                <p className="text-xs uppercase text-off-white/70">Ticket ID</p>
                                <p className="font-mono text-sm break-words">{ticket.id}</p>
                            </div>
                            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div>
                                    <p className="text-xs uppercase text-off-white/70">User ID</p>
                                    <p className="font-medium text-sm">{ticket.userId.substring(0, 8)}...</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-off-white/70">Purchased</p>
                                    <p className="font-medium text-sm">{ticket.purchaseDate.split(',')[0]}</p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-off-white opacity-70">This pass is valid for one entry only. Do not share.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
