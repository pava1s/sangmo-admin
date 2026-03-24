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
} from "@/components/ui/tabs" // FIXED: Corrected path for Tabs
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, User } from '@/lib/auth';
import { Lock, Loader2 } from 'lucide-react';
import { authFetch } from '@/utils/api-client'; // GEMINI FIX: Fixed 401 error
import { createClient } from '@/utils/supabase/client';
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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, Pencil } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    const [department, setDepartment] = React.useState<string>('');
    const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);


    const [welcomeMessage, setWelcomeMessage] = React.useState("Thanks for contacting Wanderlynx! An agent will be with you shortly.");
    const [isWelcomeEnabled, setWelcomeEnabled] = React.useState(true);
    const [isApiEnabled, setIsApiEnabled] = React.useState(true); // Default true

    // Team Management State
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [isInviting, setIsInviting] = React.useState(false);
    const [inviteForm, setInviteForm] = React.useState({
        email: '',
        fullName: '',
        role: 'agent', // Matches backend 'agent'
        password: Math.random().toString(36).slice(-8) // Random default
    });

    // --- USER EDITING STATE (Moved Up to fix Hooks Rule) ---
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<any>(null);
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

    const handleInviteUser = async () => {
        setIsInviting(true);
        try {
            const res = await authFetch('/api/team/invite', {
                method: 'POST',
                body: JSON.stringify(inviteForm),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to invite');
            }

            toast({
                title: "User Created",
                description: `Created account for ${inviteForm.fullName}`,
            });
            setInviteOpen(false);
            setInviteForm({ email: '', fullName: '', role: 'agent', password: Math.random().toString(36).slice(-8) });

            // Refresh List
            const listRes = await authFetch('/api/team');
            if (listRes.ok) setTeamMembers(await listRes.json());

        } catch (e: any) {
            toast({ variant: "destructive", title: "Invite Failed", description: e.message });
        } finally {
            setIsInviting(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to remove this user? This cannot be undone.")) return;
        try {
            const res = await authFetch(`/api/team?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Delete failed');
            }
            toast({ title: "User Removed" });
            setTeamMembers(prev => prev.filter(m => m.id !== id));
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    React.useEffect(() => {
        async function loadData() {
            let currentUser: User | null = null;
            try {
                // 1. Load User
                currentUser = await getCurrentUser();
                setUser(currentUser);

                // Fetch extra profile fields
                if (currentUser) {
                    const { data: profile } = await createClient().from('profiles').select('department').eq('id', currentUser.id).single();
                    if (profile?.department) setDepartment(profile.department);
                }

                // 2. Load Team via authFetch to bypass middleware
                if (currentUser?.role === 'Super Admin') {
                    const response = await authFetch('/api/team');
                    if (response.ok) {
                        const data = await response.json();
                        setTeamMembers(data);
                    }
                }

                // 3. Load Automations
                const savedEnabled = localStorage.getItem('automations_welcome_enabled');
                const savedMessage = localStorage.getItem('automations_welcome_message');
                if (savedEnabled !== null) setWelcomeEnabled(JSON.parse(savedEnabled));
                if (savedMessage !== null) setWelcomeMessage(savedMessage);

            } catch (err) {
                console.error("Settings load error:", err);
            }

            // 4. Load API Settings (If Admin)
            if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Tech' || currentUser?.role === 'Admin') {
                try {
                    const res = await authFetch('/api/settings');
                    if (res.ok) {
                        const data = await res.json();
                        setIsApiEnabled(data.api_v1_enabled);
                    }
                } catch (e) {
                    console.error("Failed to load API settings", e);
                }
            }

            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleSaveChanges = async () => {
        if (!user) return;

        try {
            const { error } = await createClient()
                .from('profiles')
                .update({ department })
                .eq('id', user.id);

            if (error) throw error;
            toast({ title: "Settings Saved", description: "Profile and Department updated." });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Save Failed", description: e.message });
        }
    };

    const handleSaveAutomations = () => {
        localStorage.setItem('automations_welcome_enabled', JSON.stringify(isWelcomeEnabled));
        localStorage.setItem('automations_welcome_message', welcomeMessage);
        toast({ title: "Automations Saved" });
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!user) return <div>Error loading user profile.</div>;

    const allowedRoles = ['Super Admin', 'Admin', 'Administrator', 'Internal Staff'];
    if (!allowedRoles.includes(user.role)) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:gap-8 md:p-10 text-center">
                <Lock className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-3xl font-bold">Access Restricted</h1>
                <p>Only Admins can access the settings page.</p>
                <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
            </main>
        )
    }

    // --- USER EDITING STATE MOVED TO TOP ---

    const handleEditClick = (member: any) => {
        setEditingUser(member);
        setEditForm({
            id: member.id,
            role: member.role || 'Internal Staff',
            fullName: member.full_name,
            password: '',
            email: member.email,
            permissions: member.permissions || {}
        });
        setEditOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            const updates: any = {};
            // Only include changed fields or explicit fields
            updates.role = editForm.role;
            updates.fullName = editForm.fullName;
            updates.email = editForm.email;
            updates.permissions = editForm.permissions;
            if (editForm.password) updates.password = editForm.password;

            const res = await authFetch(`/api/team`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editForm.id, updates })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Update failed');
            }

            toast({ title: "User Updated", description: "Successfully updated user details." });
            setEditOpen(false);

            // Refresh List
            const listRes = await authFetch('/api/team');
            if (listRes.ok) setTeamMembers(await listRes.json());
        } catch (e: any) {
            toast({ variant: "destructive", title: "Update Failed", description: e.message });
        }
    };
    const handleApiToggle = async (enabled: boolean) => {
        // Optimistic UI
        setIsApiEnabled(enabled);
        try {
            const res = await authFetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_v1_enabled: enabled })
            });
            if (!res.ok) throw new Error('Failed to update setting');

            toast({
                title: enabled ? "API Enabled" : "API Disabled",
                description: `External API v1 access is now ${enabled ? 'active' : 'blocked'}.`
            });
        } catch (e) {
            setIsApiEnabled(!enabled); // Revert
            toast({ variant: "destructive", title: "Error", description: "Failed to update API setting" });
        }
    };


    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-white dark:bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <div className="flex items-center space-x-2">
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="flex flex-wrap h-auto w-full gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-1">
                            <TabsTrigger value="account" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">Account</TabsTrigger>
                            <TabsTrigger value="automations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">Automations</TabsTrigger>
                            <TabsTrigger value="team" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">Team</TabsTrigger>
                            {(['Super Admin', 'super_admin', 'Tech', 'tech', 'Admin', 'admin'].includes(user.role)) && (
                                <>
                                    <TabsTrigger value="roles" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">Roles</TabsTrigger>
                                    <TabsTrigger value="developers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100">Developers</TabsTrigger>
                                </>
                            )}
                        </TabsList>

                        <TabsContent value="account" className="space-y-4">
                            <Card className="max-w-4xl dark:bg-slate-950 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="dark:text-slate-100">My Profile</CardTitle>
                                    <CardDescription className="dark:text-slate-400">Manage your profile information.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline" className="rounded-full" disabled>Change Photo</Button>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Department / Team</Label>
                                            <Select value={department} onValueChange={setDepartment}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sales">Sales ($)</SelectItem>
                                                    <SelectItem value="Support">Support (🎧)</SelectItem>
                                                    <SelectItem value="Tech">Tech (⚡)</SelectItem>
                                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">This determines which auto-assigned chats you receive.</p>
                                        </div>
                                    </div>
                                    <Button className="rounded-full" size="lg" onClick={handleSaveChanges}>Save Changes</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="automations" className="space-y-4">
                            <Card className="max-w-4xl dark:bg-slate-950 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="dark:text-slate-100">Automated Messages</CardTitle>
                                    <CardDescription className="dark:text-slate-400">Configure automated responses for your customers.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="welcome-message-toggle" className="flex flex-col space-y-1">
                                            <span>Welcome Message</span>
                                            <span className="font-normal leading-snug text-muted-foreground dark:text-slate-400">
                                                Automatically send a welcome message to new chats.
                                            </span>
                                        </Label>
                                        <Switch
                                            id="welcome-message-toggle"
                                            checked={isWelcomeEnabled}
                                            onCheckedChange={setWelcomeEnabled}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="welcome-message">Message Content</Label>
                                        <Textarea
                                            id="welcome-message"
                                            placeholder="Type your welcome message here."
                                            value={welcomeMessage}
                                            onChange={(e) => setWelcomeMessage(e.target.value)}
                                            disabled={!isWelcomeEnabled}
                                        />
                                    </div>
                                    <Button className="rounded-full dark:bg-slate-100 dark:text-slate-900" size="lg" onClick={handleSaveAutomations}>Save Automations</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="team" className="space-y-4">
                            <Card className="max-w-4xl dark:bg-slate-950 dark:border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="dark:text-slate-100">Team Management</CardTitle>
                                        <CardDescription className="dark:text-slate-400">Manage your team members and permissions.</CardDescription>
                                    </div>
                                    <Button onClick={() => setInviteOpen(true)} className="rounded-full bg-[#2FBF71] hover:bg-[#259b5c] text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Member
                                    </Button>
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
                                                    <TableCell className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={member.avatar_url} />
                                                            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium dark:text-slate-200">{member.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            member.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                                member.role === 'Tech' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                        }>
                                                            {member.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                                        {/* Edit Button */}
                                                        {(user.role === 'Super Admin' || (user.role === 'Admin' && member.role !== 'Super Admin')) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleEditClick(member)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        {member.id !== user.id && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                                                    title="Reset Password"
                                                                    onClick={async () => {
                                                                        if (!confirm(`Reset password for ${member.full_name}?`)) return;
                                                                        const newPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Stronger random

                                                                        try {
                                                                            const res = await authFetch(`/api/team`, {
                                                                                method: 'PATCH',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ id: member.id, updates: { password: newPass } })
                                                                            });
                                                                            if (!res.ok) throw new Error("Failed");

                                                                            prompt(`Password Reset Successful.\n\nCopy this new password for ${member.full_name}:`, newPass);
                                                                        } catch (e) {
                                                                            alert("Failed to reset password.");
                                                                        }
                                                                    }}
                                                                >
                                                                    <Lock className="h-4 w-4" />
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDeleteUser(member.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {teamMembers.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                        No team members found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="roles" className="space-y-4">
                            <RoleMatrixEditor />
                        </TabsContent>

                        <TabsContent value="developers" className="space-y-4">
                            <Card className="max-w-4xl dark:bg-slate-950 dark:border-slate-800 border-red-200 bg-red-50/10">
                                <CardHeader>
                                    <CardTitle className="dark:text-slate-100 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-red-500" />
                                        API Access Control
                                    </CardTitle>
                                    <CardDescription className="dark:text-slate-400">
                                        Manage external access to the Wanderlynx Platform API (v1).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-800">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-semibold">External API Access</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow external tools to send messages via <code>/api/v1/messages/send</code>.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold uppercase tracking-wide ${isApiEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                                {isApiEnabled ? 'Active' : 'Blocked'}
                                            </span>
                                            <Switch
                                                checked={isApiEnabled}
                                                onCheckedChange={handleApiToggle}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-500">
                                        <strong>Documentation:</strong> Authorization header required: <code>x-api-key: [YOUR_KEY]</code>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Member Permissions</DialogTitle>
                        <DialogDescription>
                            Configure role and granular access for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={editForm.role} onValueChange={v => setEditForm({ ...editForm, role: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agent">Agent (Default)</SelectItem>
                                    <SelectItem value="tech_support">Tech Support</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Role determines default baseline access. Use overrides below for specific needs.
                            </p>
                        </div>

                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                            <Label className="text-sm font-semibold mb-2 block">Granular Permissions (Overrides)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {PERMISSIONS_LIST.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={perm.id}
                                            checked={editForm.permissions?.[perm.id] ?? false}
                                            onChange={(e) => {
                                                setEditForm((prev: any) => ({
                                                    ...prev,
                                                    permissions: { ...prev.permissions, [perm.id]: e.target.checked }
                                                }));
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                        />
                                        <label
                                            htmlFor={perm.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {perm.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-password">New Password (Optional)</Label>
                            <Input id="edit-password" type="text" placeholder="(Leave blank to keep unchanged)" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="font-mono bg-slate-50" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite User Dialog */}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                            Create a new user account. They will receive this temporary password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={inviteForm.fullName} onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select value={inviteForm.role} onValueChange={v => setInviteForm({ ...inviteForm, role: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agent">Agent / Staff</SelectItem>
                                    <SelectItem value="tech_support">Tech Support</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Temp Pass</Label>
                            <Input id="password" value={inviteForm.password} onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })} className="col-span-3 font-mono" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInviteUser} disabled={isInviting} className="bg-[#2FBF71] hover:bg-[#259b5c] text-white">
                            {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

function RoleMatrixEditor() {
    const { toast } = useToast();
    const [roles, setRoles] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const PERMISSIONS_LIST = [
        { id: 'can_view_sales', label: 'View Sales Pipeline' },
        { id: 'can_manage_billing', label: 'Manage Billing' },
        { id: 'can_view_logs', label: 'View System Logs' },
        { id: 'can_export_contacts', label: 'Export Contacts' },
        { id: 'can_access_api_keys', label: 'View API Keys' },
        { id: 'can_manage_team', label: 'Manage Team' },
        { id: 'can_view_contacts', label: 'View Contacts' },
    ];

    const ROLES_ORDER = ['super_admin', 'admin', 'tech_support', 'agent'];

    React.useEffect(() => {
        loadRoles();
    }, []);

    async function loadRoles() {
        try {
            const res = await authFetch('/api/settings/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (e) {
            console.error("Failed to load roles", e);
        } finally {
            setLoading(false);
        }
    }

    const togglePermission = async (roleName: string, permId: string, currentPerms: string[]) => {
        if (roleName === 'Super Admin') return; // Immutable

        const hasPerm = currentPerms.includes(permId);
        const newPerms = hasPerm
            ? currentPerms.filter(p => p !== permId)
            : [...currentPerms, permId];

        // Optimistic Update
        setRoles(prev => prev.map(r => r.role === roleName ? { ...r, permissions: newPerms } : r));

        try {
            const res = await authFetch('/api/settings/roles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: roleName, permissions: newPerms })
            });
            if (!res.ok) throw new Error("Failed to save");
            toast({ title: "Role Updated", description: `${roleName} permissions saved.` });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save permission." });
            loadRoles(); // Revert
        }
    };

    if (loading) return <div className="p-4 text-center text-muted-foreground">Loading role definitions...</div>;

    // Helper to find permissions for a role name. 
    const getRolePerms = (name: string) => {
        const r = roles.find(item => item.role === name);
        return Array.isArray(r?.permissions) ? r.permissions : [];
    };

    return (
        <Card className="max-w-6xl dark:bg-slate-950 dark:border-slate-800">
            <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
                <CardDescription>
                    Define what each role can do by default. These apply to all users with the role, unless overridden individually.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Permission</TableHead>
                                {ROLES_ORDER.map(role => (
                                    <TableHead key={role} className="text-center text-xs whitespace-nowrap px-2 capitalize">
                                        {role.replace('_', ' ')}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PERMISSIONS_LIST.map((perm) => (
                                <TableRow key={perm.id}>
                                    <TableCell className="font-medium py-2">
                                        <div className="text-sm">{perm.label}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{perm.id}</div>
                                    </TableCell>
                                    {ROLES_ORDER.map(role => {
                                        const rolePerms = getRolePerms(role);
                                        const isChecked = rolePerms.includes(perm.id) || rolePerms.includes('*');
                                        const isSuper = role === 'Super Admin';

                                        return (
                                            <TableCell key={role} className="text-center py-2">
                                                <input
                                                    type="checkbox"
                                                    disabled={isSuper}
                                                    checked={isChecked || isSuper}
                                                    onChange={() => togglePermission(role, perm.id, rolePerms)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 cursor-pointer"
                                                />
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}