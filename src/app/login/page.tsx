'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, confirmSignIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TravonexLogo } from '@/components/icons';
import { Loader2, Mail, Lock, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { configureAmplify } from '@/lib/amplify-config';

// Initialize Amplify
configureAmplify();

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPasswordFields, setShowNewPasswordFields] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSignOutRunning, setIsSignOutRunning] = React.useState(false);
  
  // SECURE RELOAD: Purge stale Cognito session if "Already Signed In" error detected
  React.useEffect(() => {
    async function checkActiveSession() {
      try {
        const user = await getCurrentUser();
        if (user) {
          console.warn('Stale session detected. Purging...');
          setIsSignOutRunning(true);
          await signOut();
          window.location.reload();
        }
      } catch (e: any) {
        // If "There is already a signed in user" error manifests during login attempt,
        // we can also catch it in the handleLogin catch block.
        // This effect proactively clears if a user is already resolved.
        if (e.message?.includes('already a signed in user')) {
          await signOut();
          window.location.reload();
        }
      }
    }
    checkActiveSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (showNewPasswordFields) {
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const { isSignedIn } = await confirmSignIn({
            challengeResponse: newPassword
        });

        if (isSignedIn) {
            toast({ title: 'Password Set!', description: 'Your account is now fully secured.' });
            router.push('/dashboard');
        }
        return;
      }

      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });

      if (isSignedIn) {
        toast({ title: 'Welcome back!', description: 'Redirecting to your service hub...' });
        router.push('/dashboard');
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setShowNewPasswordFields(true);
        toast({ title: 'Action Required', description: 'This is your first login. Please set a new password.' });
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        toast({ variant: 'destructive', title: 'Verify Email', description: 'Please check your email to verify your account.' });
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
      toast({ variant: 'destructive', title: 'Login Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2FBF71]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />

      <Card className="w-full max-w-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-none bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-slate-200/50 dark:ring-white/10 relative z-10">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2FBF71]/10 text-[#2FBF71] mb-2 shadow-inner ring-1 ring-[#2FBF71]/20">
            <TravonexLogo className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Wanderlynx Platform</CardTitle>
          <CardDescription className="text-slate-500 font-medium tracking-wide">Wanderlynx Admin Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-xs flex items-center gap-2 border border-destructive/20 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {!showNewPasswordFields ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Button variant="link" className="px-0 font-normal text-xs" type="button">Forgot password?</Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10" 
                      required 
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Identity Verified</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Please set a permanent password to continue.</p>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10" 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-[#2FBF71] hover:bg-[#28a361] h-11" disabled={isLoading || isSignOutRunning}>
              {isSignOutRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : showNewPasswordFields ? (
                'Finalize Account Setup'
              ) : (
                'Secure Login'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 dark:bg-slate-900/50 p-6">
          <p className="text-xs text-center text-muted-foreground mb-4 font-mono">
            AWS COGNITO SECURED
          </p>
          <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
             <span>v2.2.0-prod</span>
             <span>•</span>
             <span>Global Service Hub</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
