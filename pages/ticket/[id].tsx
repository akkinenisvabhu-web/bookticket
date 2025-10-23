import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';

type Ticket = { id: string; showName: string; ticketCount: number; purchaseDate: string; };
type TicketPageProps = { ticket: Ticket; };

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const ticketRef = doc(db, 'tickets', params?.id as string);
    const ticketSnap = await getDoc(ticketRef);
    if (!ticketSnap.exists()) return { notFound: true };
    const data = ticketSnap.data();
    const purchaseTimestamp = data.purchaseDate as Timestamp;
    const ticketData: Ticket = { id: ticketSnap.id, showName: data.showName, ticketCount: data.ticketCount, purchaseDate: purchaseTimestamp.toDate().toLocaleString() };
    return { props: { ticket: ticketData }};
};

export default function TicketPage({ ticket }: TicketPageProps) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=electroflix.com/ticket/${ticket.id}&bgcolor=1a202c&color=f0f0f0&qzone=1`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - Your Ticket for {ticket.showName}</title></Head>
            <div className="w-full max-w-md animate-fade-in">
                <h1 className="mb-8 text-center text-3xl font-bold text-primary-blue">Your Electroflix Pass</h1>
                <div className="overflow-hidden rounded-2xl border-2 border-primary-blue/50 bg-gray-800 shadow-2xl">
                    <div className="bg-gradient-to-br from-primary-blue to-accent-teal p-8">
                        <p className="text-sm uppercase tracking-widest text-white/80">Event Pass</p>
                        <h2 className="mt-1 text-4xl font-extrabold text-white">{ticket.showName}</h2>
                    </div>
                    <div className="p-8 text-center">
                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-blue">Scan at Entry</p>
                        <div className="mb-6 flex justify-center">
                            <img src={qrCodeUrl} alt="QR Code" className="rounded-lg border-4 border-primary-blue shadow-xl" />
                        </div>
                        <div className="flex items-center justify-between text-lg">
                            <div>
                                <p className="text-xs uppercase text-off-white/70">Guests</p>
                                <p className="font-medium">{ticket.ticketCount}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-off-white/70">Purchased</p>
                                <p className="font-medium">{ticket.purchaseDate.split(',')[0]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}