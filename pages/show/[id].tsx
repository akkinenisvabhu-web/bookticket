import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { query, where } from 'firebase/firestore'; // Added query, where
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

type Show = { id: string; name: string; description: string; imageUrl: string; totalTickets: number; ticketsSold: number; };
type ShowPageProps = { show: Show; };

export const getStaticPaths: GetStaticPaths = async () => {
    const querySnapshot = await getDocs(collection(db, "shows"));
    const paths = querySnapshot.docs.map(doc => ({ params: { id: doc.id } }));
    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const docRef = doc(db, 'shows', params?.id as string);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { notFound: true };
    return { props: { show: { id: docSnap.id, ...docSnap.data() } as Show }, revalidate: 62 };
};

const MAX_BOOKING_LIMIT = 3; // Defined max limit for clarity

export default function ShowPage({ show }: ShowPageProps) {
    const [ticketCount, setTicketCount] = useState(1);
    const [userName, setUserName] = useState('');
    const [userRollNo, setUserRollNo] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [userTicketsOwned, setUserTicketsOwned] = useState(0); 
    const [loadingTickets, setLoadingTickets] = useState(true); 
    const [message, setMessage] = useState('');

    // --- NEW: Derive state for button control ---
    const isFormInvalid = !userName.trim() || !userRollNo.trim();
    // ---------------------------------------------
    
    // NEW EFFECT: Fetch user's existing tickets for this show
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchUserTickets(currentUser.uid, show.id);
            } else {
                setLoadingTickets(false);
            }
        });
        return () => unsubscribeAuth();
    }, [show.id]);

    const fetchUserTickets = async (userId: string, showId: string) => {
        try {
            const ticketsCol = collection(db, 'tickets');
            const userQuery = query(
                ticketsCol,
                where('userId', '==', userId),
                where('showId', '==', showId)
            );
            const snapshot = await getDocs(userQuery);
            setUserTicketsOwned(snapshot.size);
            setTicketCount(1);
        } catch (error) {
            console.error("Error fetching user tickets:", error);
            setMessage("Error checking your existing bookings.");
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleBooking = async () => {
        // --- REMOVED redundant validation check here, as button will be disabled ---

        if (!user) { setMessage('Please log in to book tickets.'); return; }
        
        setMessage('Processing your booking...');
        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    showId: show.id, 
                    ticketCount, 
                    userId: user.uid,
                    userName, 
                    userRollNo 
                }),
            });
            const data = await res.json();
            if (res.ok) { 
                const firstTicketId = data.ticketIds[0];
                const allTicketIds = data.ticketIds.join(',');
                // Redirect with all IDs
                window.location.href = `/ticket/${firstTicketId}?all_ids=${allTicketIds}`; 
            }
            else { setMessage(`Error: ${data.message}`); }
        } catch (error) { setMessage('An unexpected error occurred.'); }
    };

    const ticketsLeft = show.totalTickets - show.ticketsSold;
    const isFewTicketsLeft = ticketsLeft > 0 && ticketsLeft <= 10;
    
    const remainingPurchasable = MAX_BOOKING_LIMIT - userTicketsOwned;
    const isSoldOutForUser = remainingPurchasable <= 0;

    const ticketOptions = Array.from({ length: remainingPurchasable }, (_, i) => i + 1);

    const ticketBadgeClasses = ticketsLeft > 0
        ? isFewTicketsLeft
            ? 'bg-neon-pink text-white animate-pulse shadow-md shadow-neon-pink/50'
            : 'bg-accent-teal text-white'
        : 'bg-gray-600 text-off-white';

    // --- NEW: Dynamic button class based on validation ---
    const bookButtonClasses = `w-full transform rounded-lg py-4 text-lg font-bold shadow-xl transition-all duration-300 
        ${isFormInvalid ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' : 'bg-neon-pink shadow-neon-pink/40 hover:scale-[1.02] hover:bg-primary-blue hover:shadow-primary-blue/50'}
        text-white`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - {show.name}</title></Head>
            
            <div className="w-full max-w-5xl animate-fade-in overflow-hidden rounded-2xl border border-primary-blue/30 bg-gray-900 shadow-2xl shadow-primary-blue/20 md:flex">
                
                {/* Poster Section (Unchanged) */}
                <div className="relative w-full md:w-2/5 h-[30rem] md:h-auto bg-black flex items-center justify-center p-8 transition-all duration-300">
                    <img
                        className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                        src={show.imageUrl}
                        alt={show.name}
                    />
                    
                    <Link href="/" passHref>
                        <div className="absolute top-4 left-4 z-10 text-off-white bg-gray-700 bg-opacity-70 rounded-full p-2.5 backdrop-blur-sm hover:bg-neon-pink hover:bg-opacity-90 transition-all duration-300 cursor-pointer shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Details and Booking Section */}
                <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                    <div>
                        <h1 className="mb-4 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-neon-pink animate-slide-up">
                            {show.name}
                        </h1>
                        <p className="mb-6 text-lg text-off-white/80 animate-slide-up [animation-delay:100ms] border-l-4 border-primary-blue pl-4">
                            {show.description}
                        </p>
                        
                        <div className="mb-8 text-xl font-semibold text-off-white animate-slide-up [animation-delay:200ms] flex items-center">
                            Tickets Remaining:
                            <span className={`ml-3 rounded-full px-4 py-1 font-bold transition-all duration-300 ${ticketBadgeClasses}`}>
                                {ticketsLeft > 0 ? ticketsLeft : 'SOLD OUT'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto animate-slide-up [animation-delay:300ms] p-6 bg-gray-800 rounded-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-primary-blue">Book Your Tickets</h2>
                        
                        {loadingTickets ? (
                            <p className="text-center py-8 text-off-white/70">Checking ticket limits...</p>
                        ) : (
                            <>
                                {/* User Limit Status (Unchanged) */}
                                <p className={`mb-4 text-sm font-bold text-center p-2 rounded-lg ${isSoldOutForUser ? 'bg-red-900 text-neon-pink' : 'bg-green-900 text-accent-teal'}`}>
                                    You currently own {userTicketsOwned} of {MAX_BOOKING_LIMIT} tickets for this show.
                                </p>
                                
                                {ticketsLeft > 0 && !isSoldOutForUser ? (
                                    <>
                                        {/* Name Input */}
                                        <div className="mb-4">
                                            <label htmlFor="name" className="mb-2 block text-sm font-bold text-off-white/90">Full Name (For Ticket)</label>
                                            <input 
                                                id="name" 
                                                type="text" 
                                                value={userName} 
                                                onChange={(e) => setUserName(e.target.value)} 
                                                className="w-full rounded-lg border-2 border-gray-700 bg-gray-900 p-3 text-lg focus:border-neon-pink focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all duration-200"
                                                placeholder="Enter your name (All tickets will have this name)"
                                                required
                                            />
                                            {/* NEW: Warning message if empty */}
                                            {!userName.trim() && <p className="mt-1 text-xs text-neon-pink">Name is required to proceed.</p>}
                                        </div>

                                        {/* Roll Number Input */}
                                        <div className="mb-6">
                                            <label htmlFor="rollno" className="mb-2 block text-sm font-bold text-off-white/90">Roll Number</label>
                                            <input 
                                                id="rollno" 
                                                type="text" 
                                                value={userRollNo} 
                                                onChange={(e) => setUserRollNo(e.target.value)} 
                                                className="w-full rounded-lg border-2 border-gray-700 bg-gray-900 p-3 text-lg focus:border-neon-pink focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all duration-200"
                                                placeholder="Enter roll number"
                                                required
                                            />
                                            {/* NEW: Warning message if empty */}
                                            {!userRollNo.trim() && <p className="mt-1 text-xs text-neon-pink">Roll Number is required to proceed.</p>}
                                        </div>

                                        {/* Ticket Count Selector (Unchanged) */}
                                        <div className="mb-6">
                                            <label htmlFor="tickets" className="mb-3 block text-sm font-bold text-off-white/90">Number of Tickets (Max {remainingPurchasable})</label>
                                            <select 
                                                id="tickets" 
                                                value={ticketCount} 
                                                onChange={(e) => setTicketCount(Number(e.target.value))} 
                                                className="w-full rounded-lg border-2 border-gray-700 bg-gray-900 p-3 text-lg focus:border-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-teal/50 transition-all duration-200"
                                            >
                                                {ticketOptions.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>

                                        {user ? (
                                            <button 
                                                onClick={handleBooking} 
                                                // --- FIX: Button is disabled if form is invalid ---
                                                disabled={isFormInvalid}
                                                className={bookButtonClasses}
                                            >
                                                Book {ticketCount} Ticket{ticketCount > 1 ? 's' : ''} Now
                                            </button>
                                        ) : (
                                            <Link href="/login" passHref>
                                                <div className="w-full cursor-pointer rounded-lg bg-gray-700 py-4 text-center text-lg font-bold hover:bg-gray-600 transition-colors duration-300">
                                                    Login to Book Tickets
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="animate-pulse text-center text-3xl font-extrabold text-neon-pink">
                                        {isSoldOutForUser ? 'INDIVIDUAL LIMIT REACHED' : 'SHOW SOLD OUT'}
                                    </p>
                                )}
                            </>
                        )}
                        {message && <p className="mt-4 text-center text-sm text-neon-pink">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
