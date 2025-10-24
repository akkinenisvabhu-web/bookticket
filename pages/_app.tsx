import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState, createContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth"; // this works if firebase installed
import { auth } from "../lib/firebase";

export const AuthContext = createContext<User | null>(null);

export default function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return <AuthContext.Provider value={user}><Component {...pageProps} /></AuthContext.Provider>;
}
