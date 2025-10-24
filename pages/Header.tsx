import Link from 'next/link';
import { useAuthStatus } from '../lib/useAuthStatus'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../lib/firebase'; 
import { useRouter } from 'next/router';

const Header = () => {
    // Check authentication status
    const { user, isLoading } = useAuthStatus();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login'); // Redirect to login page after signing out
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    
    // --- Header Button Logic ---
    const HeaderButton = () => {
        if (isLoading) {
            return <div className="animate-pulse bg-gray-700 w-28 h-10 rounded-lg"></div>;
        }
        
        if (user) {
            // User is logged in: Show My Account button and Sign Out button
            return (
                <div className="flex space-x-3 items-center">
                    <Link href="/account" passHref>
                        <button className="py-2 px-4 bg-accent-teal hover:bg-primary-blue rounded-lg text-white font-bold transition-colors shadow-lg shadow-accent-teal/30">
                            My Account
                        </button>
                    </Link>
                    {/* Sign Out Button */}
                    <button 
                        onClick={handleLogout}
                        className="py-2 px-4 bg-gray-600 hover:bg-neon-pink rounded-lg text-white font-bold transition-colors shadow-lg"
                    >
                        Sign Out
                    </button>
                </div>
            );
        }
        
        // User is logged out: Show Login button
        return (
            <Link href="/login" passHref>
                <button className="py-2 px-4 bg-neon-pink hover:bg-primary-blue rounded-lg text-white font-bold transition-colors shadow-lg shadow-neon-pink/30">
                    Login / Sign Up
                </button>
            </Link>
        );
    };
    // ----------------------------

    return (
        // Stick the header to the top and give it a slight blur
        <div className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-sm shadow-xl">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo: Electroflix text with gradient, returns to home */}
                <Link href="/" passHref>
                    {/* FIX: Moved title/logo structure here */}
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-neon-pink cursor-pointer">
                        Electroflix
                    </h1>
                </Link>
                
                <HeaderButton />
            </div>
        </div>
    );
};

export default Header;
