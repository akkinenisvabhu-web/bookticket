import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { onAuthStateChanged, User } from 'firebase/auth'; // Removed signOut import (handled by Header)
import { auth, db } from '../lib/firebase'; // Added db import
import { collection, query, where, getDocs } from 'firebase/firestore'; // Added Firestore imports
import Link from 'next/link';

// Define the structure of a fetched ticket (matching the database fields)
type Ticket = {
    id: string;
    showName: string;
    userName: string;
    userRollNo: string;
    guestIndex: number;
    totalGuests: number;
    purchaseDate: string; // Stored as string after formatting
};

const AccountPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]); // State to store fetched tickets
    const [isTicketsLoading, setIsTicketsLoading] = useState(true);
    const router = useRouter();

    // 1. Authentication Check Effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // If user is not logged in, redirect to login page
                router.replace('/login');
            } else {
                setUser(currentUser);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    // 2. Ticket Fetching Effect
    useEffect(() => {
        if (user) {
            fetchMyTickets(user.uid);
        }
    }, [user]); // Run when user object is available

    // Fetches all tickets belonging to the current user
    const fetchMyTickets = async (userId: string) => {
        setIsTicketsLoading(true);
        try {
            // Build the query: collection('tickets') where userId == current user's ID
            const ticketsCol = collection(db, 'tickets');
            const userQuery = query(
                ticketsCol,
                where('userId', '==', userId)
            );
            
            const snapshot = await getDocs(userQuery);
            
            const fetchedTickets: Ticket[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                const purchaseDate = data.purchaseDate?.toDate()?.toLocaleDateString() || 'Unknown Date';

                return {
                    id: doc.id,
                    showName: data.showName,
                    userName: data.userName,
                    userRollNo: data.userRollNo,
                    guestIndex: data.guestIndex,
                    totalGuests: data.totalGuests,
                    purchaseDate: purchaseDate,
                } as Ticket;
            });
            
            setTickets(fetchedTickets);

        } catch (error) {
            console.error("Error fetching user tickets:", error);
            setTickets([]); 
        } finally {
            setIsTicketsLoading(false);
        }
    };
    
    // Displays the list of booked tickets
    const MyTicketsList = () => {
        if (isTicketsLoading) {
            return <p className="text-off-white/70 animate-pulse">Fetching your tickets...</p>;
        }
        if (tickets.length === 0) {
             return <p className="text-off-white/70">You haven't booked any tickets yet. Go browse some shows!</p>;
        }

        const ticketsByShow = tickets.reduce((acc, ticket) => {
            if (!acc[ticket.showName]) {
                acc[ticket.showName] = [];
            }
            acc[ticket.showName].push(ticket);
            return acc;
        }, {} as Record<string, Ticket[]>);

        return (
            <div className="space-y-6">
                {Object.entries(ticketsByShow).map(([showName, ticketGroup]) => (
                    <div key={showName} className="p-4 bg-gray-700 rounded-lg border border-primary-blue/30 shadow-lg">
                        <h4 className="text-xl font-bold text-accent-teal mb-3">{showName}</h4>
                        <p className="text-sm text-off-white/70 mb-3">Purchased on: {ticketGroup[0].purchaseDate}</p>

                        <div className="space-y-2 border-t border-gray-600 pt-3">
                            {ticketGroup.map((ticket) => (
                                <div key={ticket.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-md shadow-sm">
                                    <div>
                                        <p className="text-sm font-semibold text-neon-pink">Ticket {ticket.guestIndex} of {ticket.totalGuests}</p>
                                        <p className="text-xs text-off-white/80">Roll No: {ticket.userRollNo}</p>
                                    </div>
                                    <Link href={`/ticket/${ticket.id}`} passHref>
                                        <button className="text-xs bg-primary-blue hover:bg-neon-pink py-1 px-3 rounded font-semibold transition-colors">
                                            View Pass
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
                <p className="text-xl animate-pulse text-accent-teal">Loading account details...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-start justify-center bg-dark-blue p-8 font-space-grotesk text-off-white">
            <Head><title>My Account | Electroflix</title></Head>
            
            <div className="w-full max-w-4xl animate-fade-in">
                {/* Removed Logout Button from here, it's now in Header.tsx */}
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-neon-pink">
                        Welcome, {user.email}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Account Details */}
                    <div className="md:col-span-1 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 h-fit sticky top-4">
                        <h3 className="text-xl font-bold text-primary-blue mb-4">Account Details</h3>
                        <p className="text-off-white/90 mb-1">Email: <span className="font-semibold text-accent-teal break-all">{user.email}</span></p>
                        <p className="text-off-white/90">UID: <span className="font-mono text-xs break-all">{user.uid}</span></p>
                        
                        <div className='border-t border-gray-700 pt-4 mt-6'>
                            <Link href="/" passHref>
                                <button className="w-full py-2 bg-primary-blue hover:bg-accent-teal rounded-lg text-white font-bold transition-colors">
                                    Browse Shows
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: My Tickets List */}
                    <div className="md:col-span-2">
                        <h3 className="text-3xl font-bold text-primary-blue mb-6 border-b border-gray-700 pb-2">My Tickets History</h3>
                        <MyTicketsList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
