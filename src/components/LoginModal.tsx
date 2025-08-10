import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function LoginModal() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignIn = async () => {
    await signInWithGoogle();
    setIsOpen(false);
  };

  // Show setup message if Firebase is not configured
  if (!auth) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Sign In</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Firebase Setup Required</DialogTitle>
            <DialogDescription>
              Please configure Firebase to enable authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                To enable Google OAuth authentication:
              </p>
              <ol className="text-sm text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                <li>Create a Firebase project</li>
                <li>Enable Google Authentication</li>
                <li>Copy your Firebase config</li>
                <li>Create a .env file with your config</li>
              </ol>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              See FIREBASE_SETUP.md for detailed instructions
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSignOut = async () => {
    await logout();
    setIsOpen(false);
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <img
              src={user.photoURL || ''}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <span className="hidden sm:inline">{user.displayName}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Manage your Vistagram account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="destructive" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Vistagram</DialogTitle>
          <DialogDescription>
            Sign in to capture and share your POI moments
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
