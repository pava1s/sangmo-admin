
export type UserRole = 'super_admin' | 'organizer';

export interface UserSession {
    email: string;
    role: UserRole;
    orgId?: string;
}

// Current Mock Auth using the Super Admin email provided by the user
const SUPER_ADMIN_EMAIL = 'pavansrinivas64@gmail.com';

export function getSession(): UserSession {
    // In a real app, this would come from a cookie or Auth header
    // For this migration, we mock it based on the user's instructions
    return {
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin'
    };
}

export function isSuperAdmin(session: UserSession): boolean {
    return session.role === 'super_admin' && session.email === SUPER_ADMIN_EMAIL;
}

export function isOrganizer(session: UserSession): boolean {
    return session.role === 'organizer';
}

export const ROLE_PERMISSIONS = {
    super_admin: [
        'whatsapp',
        'email',
        'bookings',
        'partners',
        'analytics',
        'developers',
        'settings'
    ],
    organizer: [
        'bookings',
        'setup'
    ]
};