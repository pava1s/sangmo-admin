'use client';

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAuthSession, isSuperAdmin } from '@/lib/auth';

export default function BookingsPage() {
  const [session, setSession] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAuth() {
      const s = await getAuthSession();
      setSession(s);
      setIsLoading(false);
    }
    loadAuth();
  }, []);

  const isAdmin = isSuperAdmin(session);

  const mockBookings = [
    { id: 'BK-001', traveler: 'John Doe', trek: 'Everest Base Camp', date: '2026-04-15', status: 'Confirmed', organizer: 'Unassigned' },
    { id: 'BK-002', traveler: 'Jane Smith', trek: 'Annapurna Circuit', date: '2026-05-10', status: 'Pending', organizer: 'Global Treks' },
    { id: 'BK-003', traveler: 'Mike Ross', trek: 'Island Peak', date: '2026-04-20', status: 'Confirmed', organizer: 'Unassigned' },
  ];

  if (isLoading) return <div className="p-8 text-center text-slate-400">Verifying session...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Redirecting to login...</div>;

  const organizers = ['Unassigned', 'Global Treks', 'Himalayan Guides', 'Mountain Kings'];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Booking Manager</h1>
          <p className="text-muted-foreground">Manage trekking logistics and traveler assignments.</p>
        </div>
        <Button className="bg-[#2FBF71] hover:bg-[#28a361]">Create New Booking</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search travelers, trekking IDs..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Traveler</TableHead>
                <TableHead>Trek / Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Organizer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {booking.traveler}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {booking.trek}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {booking.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select defaultValue={booking.organizer}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign Partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizers.map(org => (
                            <SelectItem key={org} value={org}>{org}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium">{booking.organizer}</span>
                    )}
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
