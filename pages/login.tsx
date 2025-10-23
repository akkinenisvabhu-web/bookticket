import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import Head from 'next/head';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (authFunction: Function, e: FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await authFunction(auth, email, password);
            router.push('/');
        } catch (err: unknown) {
            const authError = err as AuthError;
            setError(authError.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-dark-blue p-4 text-off-white font-space-grotesk">
            <Head><title>Electroflix - Login / Sign Up</title></Head>
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl animate-fade-in border border-primary-blue/30">
                <h2 className="text-4xl font-bold text-center text-primary-blue">Welcome</h2>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-bold text-off-white/90">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-off-white focus:outline-none focus:ring-2 focus:ring-accent-teal" required />
                    </div>
                    <div>
                        <label htmlFor="password"className="block mb-2 text-sm font-bold text-off-white/90">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-off-white focus:outline-none focus:ring-2 focus:ring-accent-teal" required />
                    </div>
                    {error && <p className="text-center text-sm text-neon-pink">{error}</p>}
                    <div className="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <button onClick={(e) => handleAuth(signInWithEmailAndPassword, e)} className="w-full transform rounded-lg bg-primary-blue px-4 py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:bg-accent-teal hover:shadow-primary-blue/50">Login</button>
                        <button onClick={(e) => handleAuth(createUserWithEmailAndPassword, e)} className="w-full transform rounded-lg bg-gray-700 px-4 py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:bg-gray-600 hover:shadow-gray-600/50">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    );
}