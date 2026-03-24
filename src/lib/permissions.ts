import { Profile } from './types';

export const PERMISSIONS = {
    VIEW_SALES: 'can_view_sales',
    MANAGE_BILLING: 'can_manage_billing', // Super Admin only by default
    VIEW_LOGS: 'can_view_logs',
    EXPORT_CONTACTS: 'can_export_contacts',
    ACCESS_API_KEYS: 'can_access_api_keys',
    MANAGE_TEAM: 'can_manage_team',
    VIEW_CONTACTS: 'can_view_contacts',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ROLE_DEFAULTS are now managed in the Database (role_definitions table)
// and fetched during auth (lib/auth.ts)

export function hasPermission(user: Profile | null, permission: PermissionKey): boolean {
    if (!user) return false;

    // 1. Super Admin bypass
    const role = user.role as string;
    if (role === 'super_admin' || role === 'Super Admin') return true;

    // 2. Check Permissions (Populated by auth.ts from DB + Overrides)
    if (user.permissions && user.permissions[permission] === true) {
        return true;
    }

    return false;
}
