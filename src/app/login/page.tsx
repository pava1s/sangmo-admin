'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TravonexLogo } from '@/components/icons';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { configureAmplify } from '@/lib/amplify-config';

// Initialize Amplify
configureAmplify();

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });

      if (isSignedIn) {
        toast({ title: 'Welcome back!', description: 'Redirecting to your service hub...' });
        router.push('/dashboard');
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border-white/20">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2FBF71]/10 text-[#2FBF71] mb-2">
            <TravonexLogo className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Wanderlynx Platform</CardTitle>
          <CardDescription>Enterprise Travel Administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-xs flex items-center gap-2 border border-destructive/20 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
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
                <Label htmlFor="password">Password</Label>
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
            <Button type="submit" className="w-full bg-[#2FBF71] hover:bg-[#28a361] h-11" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Secure Logon'}
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
