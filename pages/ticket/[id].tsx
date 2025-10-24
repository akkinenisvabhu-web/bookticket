import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react'; // <-- NEW IMPORT

// Update type definition
type Ticket = { 
    id: string; 
    showName: string; 
    guestIndex: number; 
    totalGuests: number; 
    purchaseDate: string; 
    userId: string;
    userName: string;
    userRollNo: string;
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
        guestIndex: data.guestIndex,
        totalGuests: data.totalGuests,
        purchaseDate: purchaseTimestamp.toDate().toLocaleString(),
        userId: data.userId,
        userName: data.userName,
        userRollNo: data.userRollNo
    };
    return { props: { ticket: ticketData }};
};

export default function TicketPage({ ticket }: TicketPageProps) {
    const router = useRouter(); 
    const [showModal, setShowModal] = useState(false); // NEW STATE FOR MODAL
    
    // CRITICAL: Extract the full list of ticket IDs from the URL query param 'all_ids'
    const allTicketIds: string[] = Array.isArray(router.query.all_ids) 
        ? router.query.all_ids[0].split(',') 
        : typeof router.query.all_ids === 'string' 
            ? router.query.all_ids.split(',') 
            : [ticket.id];

    const currentTicketIndex = allTicketIds.findIndex(id => id === ticket.id);
    const hasPreviousTicket = currentTicketIndex > 0;
    const hasNextTicket = currentTicketIndex < allTicketIds.length - 1;
    const previousTicketId = allTicketIds[currentTicketIndex - 1];
    const nextTicketId = allTicketIds[currentTicketIndex + 1];

    const navigateToTicket = (newTicketId: string) => {
        router.push(`/ticket/${newTicketId}?all_ids=${allTicketIds.join(',')}`);
    };

    // Handlers for navigation
    const handlePreviousTicket = () => { if (hasPreviousTicket) navigateToTicket(previousTicketId); };
    const handleNextTicket = () => { if (hasNextTicket) navigateToTicket(nextTicketId); };

    // Handler for Proceed Button
    const handleProceed = () => {
        setShowModal(true);
    };

    const handleConfirmScreenshot = (confirmed: boolean) => {
        if (confirmed) {
            router.push('/thank-you'); // Navigate to the thank you page
        } else {
            setShowModal(false); // Close modal and stay on ticket page
        }
    };
    
    // QR Code data
    const qrCodeData = JSON.stringify({
        id: ticket.id, show: ticket.showName, name: ticket.userName, rollno: ticket.userRollNo
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}&bgcolor=1a202c&color=f0f0f0&qzone=1`;

    // Modal Component
    const ScreenshotModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl border border-neon-pink/50">
                <h3 className="text-2xl font-bold text-neon-pink mb-4">Screenshot Confirmation</h3>
                <p className="text-off-white/90 mb-6">Did you successfully take a screenshot of your virtual pass?</p>
                <div className="flex justify-between space-x-4">
                    <button 
                        onClick={() => handleConfirmScreenshot(true)} 
                        className="flex-1 py-3 bg-accent-teal text-white rounded-lg font-semibold hover:bg-primary-blue transition-colors duration-200"
                    >
                        Yes, Proceed
                    </button>
                    <button 
                        onClick={() => handleConfirmScreenshot(false)} 
                        className="flex-1 py-3 bg-gray-600 text-off-white rounded-lg font-semibold hover:bg-gray-500 transition-colors duration-200"
                    >
                        No, Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - Ticket {ticket.guestIndex} of {ticket.totalGuests}</title></Head>
            
            {showModal && <ScreenshotModal />}

            {/* --- NEW: SCREENSHOT HEADING --- */}
            <h1 className="text-2xl font-bold text-neon-pink mb-4 animate-pulse">
                Please Take A Screenshot of Your Ticket
            </h1>
            
            {/* Main Ticket Area */}
            <div className="w-full max-w-md animate-fade-in">
                
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
                    
                    {/* USER AND ROLL NUMBER INFO */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="text-center">
                            <p className="text-lg font-bold text-off-white/90">Ticket Holder</p>
                            <p className="text-3xl font-extrabold text-neon-pink uppercase">{ticket.userName}</p>
                            <p className="text-sm text-off-white/70 mt-1">Roll No: {ticket.userRollNo}</p>
                        </div>
                    </div>

                    <div className="p-8 text-center">
                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-blue">Scan at Entry</p>
                        <div className="mb-6 flex justify-center">
                            <img src={qrCodeUrl} alt={`QR Code for Ticket ${ticket.id}`} className="rounded-lg border-4 border-primary-blue shadow-xl" />
                        </div>
                        <div className="flex flex-col space-y-3">
                            <div className="bg-gray-700 p-3 rounded-lg text-left">
                                <p className="text-xs uppercase text-off-white/70">Unique Ticket ID</p>
                                <p className="font-mono text-sm break-words">{ticket.id}</p>
                            </div>
                            {/* ... User ID and Purchase Date details ... */}
                            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div><p className="text-xs uppercase text-off-white/70">User ID</p><p className="font-medium text-sm">{ticket.userId.substring(0, 8)}...</p></div>
                                <div><p className="text-xs uppercase text-off-white/70">Purchased</p><p className="font-medium text-sm">{ticket.purchaseDate.split(',')[0]}</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Navigation Bar --- */}
                <div className="flex justify-between space-x-4 mt-4">
                    {/* Previous Button */}
                    <button
                        onClick={handlePreviousTicket}
                        disabled={!hasPreviousTicket}
                        className={`py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${
                            hasPreviousTicket ? 'bg-primary-blue hover:bg-accent-teal' : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }`}
                    >
                        &larr; Prev
                    </button>

                    {/* Proceed Button */}
                    <button
                        onClick={handleProceed}
                        className="flex-grow py-3 rounded-lg font-bold text-white bg-neon-pink hover:bg-primary-blue transition-all duration-300 shadow-md transform hover:scale-[1.01]"
                    >
                        Proceed
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={handleNextTicket}
                        disabled={!hasNextTicket}
                        className={`py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${
                            hasNextTicket ? 'bg-primary-blue hover:bg-accent-teal' : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }`}
                    >
                        Next &rarr;
                    </button>
                </div>
                
                <p className="mt-6 text-center text-sm text-off-white opacity-70">
                    You can navigate between your {allTicketIds.length} tickets using the arrow buttons.
                </p>
            </div>
        </div>
    );
}
