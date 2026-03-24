'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Star, Activity } from 'lucide-react';

export default function PartnerPortalPage() {
  const partners = [
    { name: 'Global Treks', type: 'Organizer', tours: 12, rating: 4.8, status: 'Active' },
    { name: 'Himalayan Guides', type: 'Organizer', tours: 8, rating: 4.5, status: 'Active' },
    { name: 'Mountain Kings', type: 'Organizer', tours: 3, rating: 4.2, status: 'Pending' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">Partner Portal</h1>
          <p className="text-muted-foreground">Manage and monitor external trek organizers.</p>
        </div>
        <Button className="bg-[#2FBF71]"><UserPlus className="mr-2 h-4 w-4" /> Add Partner</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ 450,000</div>
            <p className="text-xs text-muted-foreground">Across all organizers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6/5</div>
            <p className="text-xs text-muted-foreground">Partner satisfaction rating</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Directory</CardTitle>
          <CardDescription>A list of all registered expedition partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Total Tours</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.name}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.tours}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {partner.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={partner.status === 'Active' ? 'default' : 'secondary'}>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
