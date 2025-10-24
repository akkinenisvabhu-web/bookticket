import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'; // <-- NEW IMPORT

// Update type definition to reflect the new structure
type Ticket = { 
    id: string; 
    showName: string; 
    guestIndex: number; 
    totalGuests: number; 
    purchaseDate: string; 
    userId: string;
    userName: string; // NEW FIELD
    userRollNo: string; // NEW FIELD
};
type TicketPageProps = { ticket: Ticket; };

// FIX: Corrected typo from GetServerServerSideProps to GetServerSideProps
// FIX: Explicitly typed 'params' as GetServerSidePropsContext['params'] for strictness
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    // NOTE: Query parameters (like all_ids) are handled on the client side (below)
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
        userName: data.userName, // Retrieved new field
        userRollNo: data.userRollNo // Retrieved new field
    };
    return { props: { ticket: ticketData }};
};

export default function TicketPage({ ticket }: TicketPageProps) {
    const router = useRouter(); // <-- GET ROUTER INSTANCE
    
    // CRITICAL: Extract the full list of ticket IDs from the URL query param 'all_ids'
    const allTicketIds: string[] = Array.isArray(router.query.all_ids) 
        ? router.query.all_ids[0].split(',') 
        : typeof router.query.all_ids === 'string' 
            ? router.query.all_ids.split(',') 
            : [ticket.id]; // Fallback to current ID if list is missing

    const currentTicketIndex = allTicketIds.findIndex(id => id === ticket.id);
    const isLastTicket = currentTicketIndex === allTicketIds.length - 1;
    const nextTicketId = allTicketIds[currentTicketIndex + 1];

    const handleNextTicket = () => {
        if (nextTicketId) {
            // Navigate to the next ticket, preserving the list of all IDs in the query
            router.push(`/ticket/${nextTicketId}?all_ids=${allTicketIds.join(',')}`);
        } else if (isLastTicket) {
            router.push('/'); // Go home if it's the last ticket
        }
    };
    
    // QR Code data should include the unique ticket ID for verification
    const qrCodeData = JSON.stringify({
        id: ticket.id,
        show: ticket.showName,
        name: ticket.userName,
        rollno: ticket.userRollNo
    });
    // Ensure data is URL encoded
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}&bgcolor=1a202c&color=f0f0f0&qzone=1`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - Ticket {ticket.guestIndex} of {ticket.totalGuests}</title></Head>
            <div className="w-full max-w-md animate-fade-in">
                <h1 className="mb-8 text-center text-3xl font-bold text-primary-blue">Your Virtual Pass</h1>
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
                    
                    {/* NEW: USER AND ROLL NUMBER INFO */}
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

                {/* --- NEW NAVIGATION BUTTON --- */}
                {allTicketIds.length > 1 && (
                    <button
                        onClick={handleNextTicket}
                        className={`w-full mt-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.01] ${isLastTicket 
                            ? 'bg-primary-blue hover:bg-accent-teal' 
                            : 'bg-neon-pink hover:bg-primary-blue'
                        } text-white shadow-xl shadow-gray-900/50`}
                    >
                        {isLastTicket ? 'DONE / Back to Home' : `Next Ticket (${ticket.guestIndex + 1}/${ticket.totalGuests})`}
                    </button>
                )}
            </div>
        </div>
    );
}
