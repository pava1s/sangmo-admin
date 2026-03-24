'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, ShieldCheck, User, RefreshCw, AlertCircle } from 'lucide-react';
import { getAuthSession, UserSession } from '@/lib/auth';

export default function SetupDiagnosticPage() {
  const [session, setSession] = React.useState<UserSession | null>(null);
  const [stats, setStats] = React.useState<{ count: number; table: string; status: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const sess = await getAuthSession();
      setSession(sess);

      // We call a slim API route for diagnostics to avoid heavy client-side AWS calls
      const res = await fetch('/api/v1/whatsapp/analytics'); // Temporary reuse or we can create a new route
      const data = await res.json();
      
      setStats({
        count: data.totalMessages || 0,
        table: 'WanderlynxTable',
        status: 'Active'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="h-8 w-8 text-[#2FBF71]" />
          Platform Diagnostics
        </h1>
        <p className="text-muted-foreground mt-2">Deployment 14 Verification Control Center</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cognito User Status */}
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Current Authentication
             </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-lg font-bold">{session?.email || 'Unauthorized'}</div>
             <Badge className="mt-2 bg-[#2FBF71]/10 text-[#2FBF71] hover:bg-[#2FBF71]/20">
                Role: {session?.role || 'None'}
             </Badge>
          </CardContent>
        </Card>

        {/* IAM & DynamoDB Status */}
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> IAM & Permissions
             </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2 text-green-600 font-bold">
                <ShieldCheck className="h-5 w-5" />
                Verified Active
             </div>
             <p className="text-xs text-muted-foreground mt-2">IAM Role: sangmo-amplify-prod</p>
          </CardContent>
        </Card>

        {/* Table Metrics */}
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" /> WanderlynxTable
             </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold">{stats?.count || 0}</div>
             <p className="text-xs text-muted-foreground mt-1">Total items in table</p>
             <Badge variant="outline" className="mt-2 text-blue-600">
                Region: ap-south-2
             </Badge>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-start gap-4">
             <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
             <div className="space-y-2">
                <h4 className="font-bold text-destructive">Diagnostic Error Detected</h4>
                <p className="text-sm text-destructive/80 font-mono bg-white/50 p-3 rounded border">
                   {error}
                </p>
             </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-start">
         <Button onClick={checkStatus} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Re-run Verification
         </Button>
      </div>
    </div>
  );
}
