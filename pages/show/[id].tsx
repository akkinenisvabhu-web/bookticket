import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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
    return { props: { show: { id: docSnap.id, ...docSnap.data() } as Show }, revalidate: 60 };
};

export default function ShowPage({ show }: ShowPageProps) {
    const [ticketCount, setTicketCount] = useState(1);
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    const handleBooking = async () => {
        if (!user) { setMessage('Please log in to book tickets.'); return; }
        setMessage('Processing your booking...');
        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: show.id, ticketCount, userId: user.uid }),
            });
            const data = await res.json();
            if (res.ok) { window.location.href = `/ticket/${data.ticketId}`; }
            else { setMessage(`Error: ${data.message}`); }
        } catch (error) { setMessage('An unexpected error occurred.'); }
    };

    const ticketsLeft = show.totalTickets - show.ticketsSold;
    const isFewTicketsLeft = ticketsLeft > 0 && ticketsLeft <= 10;

    // Enhanced style for the ticket counter badge
    const ticketBadgeClasses = ticketsLeft > 0
        ? isFewTicketsLeft
            ? 'bg-neon-pink text-white animate-pulse shadow-md shadow-neon-pink/50'
            : 'bg-accent-teal text-white'
        : 'bg-gray-600 text-off-white';

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - {show.name}</title></Head>
            
            {/* Main Card Container */}
            <div className="w-full max-w-5xl animate-fade-in overflow-hidden rounded-2xl border border-primary-blue/30 bg-gray-900 shadow-2xl shadow-primary-blue/20 md:flex">
                
                {/* --- UPDATED IMAGE SECTION (with Overlay) --- */}
                <div className="relative w-full md:w-1/2 h-96 md:h-auto bg-black flex items-center justify-center">
                    <img
                        className="w-full h-full object-cover"
                        src={show.imageUrl}
                        alt={show.name}
                    />
                    {/* Subtle Gradient Overlay for blend */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>
                    
                    {/* Back Button */}
                    <Link href="/" passHref>
                        <div className="absolute top-4 left-4 z-10 text-off-white bg-gray-700 bg-opacity-70 rounded-full p-2.5 backdrop-blur-sm hover:bg-neon-pink hover:bg-opacity-90 transition-all duration-300 cursor-pointer shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                    </Link>
                </div>
                {/* --- END OF UPDATED IMAGE SECTION --- */}

                {/* Details and Booking Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                        {/* Title with Gradient */}
                        <h1 className="mb-4 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-neon-pink animate-slide-up">
                            {show.name}
                        </h1>
                        <p className="mb-6 text-lg text-off-white/80 animate-slide-up [animation-delay:100ms] border-l-4 border-primary-blue pl-4">
                            {show.description}
                        </p>
                        
                        {/* Tickets Remaining Status */}
                        <div className="mb-8 text-xl font-semibold text-off-white animate-slide-up [animation-delay:200ms] flex items-center">
                            Tickets Remaining:
                            <span className={`ml-3 rounded-full px-4 py-1 font-bold transition-all duration-300 ${ticketBadgeClasses}`}>
                                {ticketsLeft > 0 ? ticketsLeft : 'SOLD OUT'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto animate-slide-up [animation-delay:300ms]">
                        {ticketsLeft > 0 ? (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="tickets" className="mb-3 block text-sm font-bold text-off-white/90">Number of Tickets (Max 4)</label>
                                    <select 
                                        id="tickets" 
                                        value={ticketCount} 
                                        onChange={(e) => setTicketCount(Number(e.target.value))} 
                                        className="w-full rounded-lg border-2 border-gray-700 bg-gray-800 p-3 text-lg focus:border-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-teal/50 transition-all duration-200"
                                    >
                                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                {user ? (
                                    <button 
                                        onClick={handleBooking} 
                                        className="w-full transform rounded-lg bg-neon-pink py-4 text-lg font-bold shadow-xl shadow-neon-pink/40 transition-all duration-300 hover:scale-[1.02] hover:bg-primary-blue hover:shadow-primary-blue/50"
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
                            <p className="animate-pulse text-center text-3xl font-extrabold text-neon-pink shadow-text-neon-pink/50">
                                SOLD OUT
                            </p>
                        )}
                        {message && <p className="mt-4 text-center text-sm text-neon-pink">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}