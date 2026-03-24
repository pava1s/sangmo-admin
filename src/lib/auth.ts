import { createClient } from '@/utils/supabase/client';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Administrator' | 'Marketing' | 'Customer Support' | 'Internal Staff' | 'Tech' | 'agent' | 'super_admin' | 'tech_support' | 'admin';
  avatar: string;
  permissions?: Record<string, boolean>;
};

// ✅ REAL AUTH: Fetches the logged-in user from Supabase
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();

  // 1. Get the session (Is the browser logged in?)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // 2. Get their profile details (Name, Role) from the database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, permissions') // Fetch user-specific overrides
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.warn("Profile fetch error:", error.message);
  }

  // 3. Fetch Role Definitions (Base Permissions)
  let basePermissions: string[] = [];
  if (profile?.role) {
    const { data: roleDef } = await supabase
      .from('role_definitions')
      .select('permissions')
      .eq('role', profile.role)
      .single();

    if (roleDef?.permissions) {
      basePermissions = roleDef.permissions as string[]; // e.g. ["can_view_sales", "can_view_logs"]
    }
  }

  // 4. Merge Permissions (Base + Overrides)
  const finalPermissions: Record<string, boolean> = {};

  // Apply Base
  basePermissions.forEach(p => {
    if (p === '*') {
      // Wildcard: Enable all known? Or just handle in hasPermission?
      // For simplicity, we'll let hasPermission handle 'Super Admin' role check generally,
      // but here we can't easily expand '*' without list of all permissions.
      // User.role check is safer for Super Admin.
    } else {
      finalPermissions[p] = true;
    }
  });

  // Apply Overrides (User specific)
  if (profile?.permissions) {
    Object.entries(profile.permissions).forEach(([key, val]) => {
      finalPermissions[key] = val as boolean;
    });
  }

  // 5. Return the user object
  return {
    id: session.user.id,
    name: profile?.full_name || session.user.email || 'User',
    email: session.user.email || '',
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'U'}&background=random`,
    role: profile?.role || 'Internal Staff',
    permissions: finalPermissions,
  };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}