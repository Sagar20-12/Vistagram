import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showLoginSuccess: boolean;
  showLogoutAnimation: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hideLoginSuccess: () => void;
  hideLogoutAnimation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available. Authentication disabled.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      toast.error('Firebase not configured. Please set up your environment variables.');
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        // Show success animation instead of toast
        setShowLoginSuccess(true);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      toast.error('Firebase not configured. Please set up your environment variables.');
      return;
    }

    try {
      setLoading(true);
      // Show logout animation before signing out
      setShowLogoutAnimation(true);
      
      // Wait a bit for the animation to start, then sign out
      setTimeout(async () => {
        await signOut(auth);
      }, 500);
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
      setShowLogoutAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  const hideLoginSuccess = () => {
    setShowLoginSuccess(false);
  };

  const hideLogoutAnimation = () => {
    setShowLogoutAnimation(false);
  };

  const value = {
    user,
    loading,
    showLoginSuccess,
    showLogoutAnimation,
    signInWithGoogle,
    logout,
    hideLoginSuccess,
    hideLogoutAnimation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
