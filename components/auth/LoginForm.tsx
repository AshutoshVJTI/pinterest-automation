'use client'

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/'); // Redirect after successful sign-in
    } catch (error) {
      setError('Failed to sign in with Google.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Pinterest Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center gap-2" 
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Image 
                  src="/google.svg" 
                  alt="Google" 
                  width={20} 
                  height={20} 
                />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 