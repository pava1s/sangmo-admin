'use client';

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Landmark, CheckCircle2 } from 'lucide-react';

export default function SetupPage() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Your company profile has been verified. You can now view your assigned bookings.
          </p>
          <Button className="w-full bg-[#2FBF71]" onClick={() => window.location.href = '/dashboard/bookings'}>
             Go to Bookings
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Partner Setup</h1>
        <p className="text-muted-foreground">Please complete your profile to start receiving bookings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
            <CardDescription>Enter your official business details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="e.g., Himalayan Quest" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxId">Tax Identification Number (GST/VAT)</Label>
              <Input id="taxId" placeholder="GSTIN-123456789" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Bank & Payout Details
            </CardTitle>
            <CardDescription>Where should we send your trek payouts?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="accHolder">Account Holder Name</Label>
              <Input id="accHolder" placeholder="Legal Name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="e.g., HDFC Bank" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accNumber">Account Number</Label>
              <Input id="accNumber" placeholder="0000 0000 0000" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ifsc">IFSC / SWIFT Code</Label>
              <Input id="ifsc" placeholder="HDFC0001234" required />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 flex justify-end p-4">
            <Button type="submit" className="bg-[#2FBF71] hover:bg-[#28a361]">Complete Onboarding</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
