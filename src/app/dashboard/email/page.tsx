'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Send, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailCenterPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold font-heading">Email Center</h1>
        <p className="text-muted-foreground">Manage traveler confirmations and itinerary emails.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Sent Today', value: '142', icon: Send, color: 'text-blue-600' },
          { label: 'Scheduled', value: '28', icon: Clock, color: 'text-purple-600' },
          { label: 'Failed/Bounced', value: '3', icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Open Rate', value: '68%', icon: Mail, color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6">
            <Mail className="h-12 w-12 text-blue-600" />
         </div>
         <CardTitle className="text-2xl mb-2">Automated Email Engine Ready</CardTitle>
         <CardDescription className="max-w-md mx-auto mb-6">
            AWS SES integration is pending. Once configured, you will be able to send dynamic itineraries and booking confirmations from here.
         </CardDescription>
         <Button className="bg-blue-600 hover:bg-blue-700">Configure AWS SES</Button>
      </Card>
    </div>
  );
}
