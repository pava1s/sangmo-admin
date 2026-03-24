'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAuthSession, User } from '@/lib/auth';
import { Lock, Loader2, Trash2, Plus, Pencil } from 'lucide-react';
import { apiClient as api } from '@/lib/api-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    const [department, setDepartment] = React.useState<string>('');
    const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [welcomeMessage, setWelcomeMessage] = React.useState("Thanks for contacting Wanderlynx! An agent will be with you shortly.");
    const [isWelcomeEnabled, setWelcomeEnabled] = React.useState(true);
    const [isApiEnabled, setIsApiEnabled] = React.useState(true);

    // Team Management State
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [isInviting, setIsInviting] = React.useState(false);
    const [inviteForm, setInviteForm] = React.useState({
        email: '',
        fullName: '',
        role: 'agent',
        password: Math.random().toString(36).slice(-8)
    });

    const [editOpen, setEditOpen] = React.useState(false);
    const [editForm, setEditForm] = React.useState<any>({
        id: '',
        role: '',
        fullName: '',
        password: '',
        email: '',
        permissions: {}
    });

    const PERMISSIONS_LIST = [
        { id: 'can_view_sales', label: 'View Sales Pipeline' },
        { id: 'can_manage_billing', label: 'Manage Billing' },
        { id: 'can_view_logs', label: 'View System Logs' },
        { id: 'can_export_contacts', label: 'Export Contacts' },
        { id: 'can_access_api_keys', label: 'View API Keys' },
    ];

    const fetchTeam = async () => {
        try {
            // @ts-ignore
            const data = await api.getTeamMembers();
            setTeamMembers(data || []);
        } catch (e) {
            console.error("Failed to load team", e);
        }
    };

    React.useEffect(() => {
        async function loadData() {
            try {
                const currentUser = await getAuthSession();
                setUser(currentUser);
                if (currentUser?.role === 'super_admin') {
                    await fetchTeam();
                    // @ts-ignore
                    const settings = await api.getSystemSettings();
                    setIsApiEnabled(settings.api_v1_enabled);
                }
            } catch (err) {
                console.error("Settings load error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const handleInviteUser = async () => {
        setIsInviting(true);
        try {
            // @ts-ignore
            await api.inviteTeamMember(inviteForm);
            toast({ title: "User Created", description: `Created account for ${inviteForm.fullName}` });
            setInviteOpen(false);
            setInviteForm({ email: '', fullName: '', role: 'agent', password: Math.random().toString(36).slice(-8) });
            await fetchTeam();
        } catch (e: any) {
            toast({ variant: "destructive", title: "Invite Failed", description: e.message });
        } finally {
            setIsInviting(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to remove this user?")) return;
        try {
            // @ts-ignore
            await api.deleteTeamMember(id);
            toast({ title: "User Removed" });
            fetchTeam();
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleSaveAutomations = () => {
        localStorage.setItem('automations_welcome_enabled', JSON.stringify(isWelcomeEnabled));
        localStorage.setItem('automations_welcome_message', welcomeMessage);
        toast({ title: "Automations Saved" });
    };

    const handleApiToggle = async (enabled: boolean) => {
        setIsApiEnabled(enabled);
        try {
            // @ts-ignore
            await api.updateSystemSettings({ api_v1_enabled: enabled });
            toast({ title: enabled ? "API Enabled" : "API Disabled" });
        } catch (e) {
            setIsApiEnabled(!enabled);
            toast({ variant: "destructive", title: "Error" });
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!user) return <div>Error loading user profile.</div>;

    const allowedRoles = ['Super Admin', 'Admin', 'Administrator', 'Internal Staff'];
    if (!allowedRoles.includes(user.role)) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
                <Lock className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-3xl font-bold">Access Restricted</h1>
                <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
            </main>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-white dark:bg-slate-950 min-h-screen font-sans">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="automations">Automations</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="developers">Developers</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Manage your profile information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" disabled>Change Photo</Button>
                            </div>
                            <div className="grid gap-2">
                                <Label>Full Name</Label>
                                <Input value={user.name} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input value={user.email} readOnly />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="automations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automated Messages</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label>Welcome Message</Label>
                                <Switch checked={isWelcomeEnabled} onCheckedChange={setWelcomeEnabled} />
                            </div>
                            <Textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} disabled={!isWelcomeEnabled} />
                            <Button onClick={handleSaveAutomations}>Save Automations</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Team Management</CardTitle>
                            <Button onClick={() => setInviteOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teamMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>{member.full_name} ({member.email})</TableCell>
                                            <TableCell><Badge>{member.role}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(member.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="developers">
                  <Card>
                    <CardHeader><CardTitle>API Access</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <Label className="text-base">External API v1</Label>
                        <p className="text-xs text-muted-foreground">Allow third-party tools to send messages.</p>
                      </div>
                      <Switch checked={isApiEnabled} onCheckedChange={handleApiToggle} />
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Full Name" value={inviteForm.fullName} onChange={e => setInviteForm({...inviteForm, fullName: e.target.value})} />
                        <Input placeholder="Email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
                        <Input placeholder="Password" value={inviteForm.password} onChange={e => setInviteForm({...inviteForm, password: e.target.value})} />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleInviteUser} disabled={isInviting}>Create Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}