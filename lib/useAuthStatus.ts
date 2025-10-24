import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
// Assumes 'auth' is exported from the file in the parent directory
import { auth } from './firebase'; 

type AuthStatus = {
  user: User | null;
  isLoading: boolean;
};

export const useAuthStatus = (): AuthStatus => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
};
