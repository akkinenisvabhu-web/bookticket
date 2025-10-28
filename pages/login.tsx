import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    AuthError, 
    GoogleAuthProvider, 
    signInWithPopup 
} from 'firebase/auth';

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false); // Controls the mode (Login or Sign Up)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Dynamically set the heading based on the current mode
    const headingText = isSignup ? 'Create Account: Sign Up' : 'Welcome Back: Login';
    const submitText = isSignup ? 'Create Account' : 'Continue to Login';

    // --- 1. Handles Email/Password Submission ---
    const handleEmailAuth = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const authFunction = isSignup ? createUserWithEmailAndPassword : signInWithEmailAndPassword;

        try {
            await authFunction(auth, email, password);
            router.push('/'); // Redirect to home page on successful action
        } catch (err: unknown) {
            const authError = err as AuthError;
            setError(authError.message); 
        }
    };
    
    // --- 2. Handles Google Sign-In Pop-up ---
    const handleGoogleSignIn = async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        
        try {
            await signInWithPopup(auth, provider);
            router.push('/'); // Redirect on success
        } catch (err: unknown) {
            const firebaseError = err as AuthError;
            // Provide user-friendly error messages
            if (firebaseError.code === 'auth/popup-closed-by-user') {
                setError('Google sign-in cancelled.');
            } else {
                setError(firebaseError.message);
            }
        }
    };
    
    // --- IMPORTANT: Removed alert() as per project rules. Error is displayed in the UI. ---

    return (
        <div className="flex items-center justify-center min-h-screen bg-dark-blue p-4 font-space-grotesk text-off-white">
            <Head><title>Electroflix - {isSignup ? 'Sign Up' : 'Login'}</title></Head>
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl animate-fade-in border border-primary-blue/30">
                
                {/* DYNAMIC HEADING */}
                <h2 className="text-4xl font-bold text-center text-primary-blue">{headingText}</h2>
                
                <form className="space-y-6" onSubmit={handleEmailAuth}>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-bold text-off-white/90">Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-off-white focus:outline-none focus:ring-2 focus:ring-accent-teal" 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block mb-2 text-sm font-bold text-off-white/90">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-off-white focus:outline-none focus:ring-2 focus:ring-accent-teal" 
                            required 
                        />
                    </div>
                    
                    {error && <p className="text-center text-sm text-neon-pink">{error}</p>}
                    
                    <div className="flex flex-col space-y-4 pt-4">
                        
                        {/* MAIN SUBMISSION BUTTON */}
                        <button 
                            type="submit"
                            className="w-full transform rounded-lg bg-neon-pink px-4 py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:bg-primary-blue hover:shadow-primary-blue/50"
                        >
                            {submitText}
                        </button>
                        
                        {/* --- OR Divider --- */}
                        <div className="flex items-center">
                            <hr className="flex-grow border-gray-600" />
                            <span className="px-3 text-gray-500 text-sm">OR</span>
                            <hr className="flex-grow border-gray-600" />
                        </div>
                        
                        {/* --- GOOGLE LOGIN BUTTON --- */}
                        <button 
                            type="button"
                            onClick={handleGoogleSignIn} 
                            className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-600 rounded-lg text-off-white font-semibold transition-all hover:bg-gray-700"
                        >
                            {/* Google Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 3c2.08 0 3.96.88 5.303 2.303l-2.121 2.121C13.882 7.156 13 6.75 12 6.75c-2.899 0-5.25 2.351-5.25 5.25s2.351 5.25 5.25 5.25c2.25 0 4.18-1.42 4.88-3.375h-4.88v-3.75h9.375c.105 1.5.075 2.925-.09 4.35C20.463 17.5 16.5 21 12 21c-4.962 0-9-4.038-9-9s4.038-9 9-9z"/></svg>
                            <span>Sign Up or Login using Google</span>
                        </button>

                        {/* --- SWITCHER --- */}
                        <p className="text-center text-sm text-off-white/70 pt-4">
                            {isSignup ? "Already have an account?" : "New here?"}
                            <button 
                                type="button" 
                                onClick={() => setIsSignup(!isSignup)}
                                className="ml-1 text-accent-teal hover:text-neon-pink font-bold underline"
                            >
                                {isSignup ? 'Log In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
