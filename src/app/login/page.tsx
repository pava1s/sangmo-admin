'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TravonexLogo } from '@/components/icons';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating login - in real world this would hit an API
    setTimeout(() => {
      // The auth utility already mocks 'super_admin' if it matches the specific email
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border-white/20">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2FBF71]/10 text-[#2FBF71] mb-2">
            <TravonexLogo className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Wanderlynx Platform</CardTitle>
          <CardDescription>Login to manage your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                <Button variant="link" className="px-0 font-normal text-xs">Forgot password?</Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#2FBF71] hover:bg-[#28a361] h-11" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 dark:bg-slate-900/50 p-6">
          <p className="text-xs text-center text-muted-foreground mb-4">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
             <span>v2.1.0-beta</span>
             <span>•</span>
             <span>Secure Access</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
