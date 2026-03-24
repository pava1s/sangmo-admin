import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut as amplifySignOut } from 'aws-amplify/auth';
import { configureAmplify } from './amplify-config';

// Initialize Amplify on first import
configureAmplify();

export type UserRole = 'super_admin' | 'organizer';

export interface UserSession {
  email: string;
  role: UserRole;
  organizations?: string[];
}

export async function getAuthSession(): Promise<UserSession | null> {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const session = await fetchAuthSession();
    
    // Groups are stored in the ID Token
    const tokens = session.tokens;
    const groups = (tokens?.idToken?.payload?.['cognito:groups'] as string[]) || [];
    
    let role: UserRole = 'organizer';
    if (groups.includes('Admins') || attributes.email === 'pavansrinivas64@gmail.com') {
      role = 'super_admin';
    }

    return {
      email: attributes.email || '',
      role,
      organizations: groups.filter(g => g !== 'Admins' && g !== 'Organizers')
    };
  } catch (error) {
    console.debug('No active session found');
    return null;
  }
}

// Temporary backward compatibility for components not yet converted to async
export function getSession(): UserSession {
  // We keep a mock fallback for the layout but prefer getAuthSession everywhere
  // In a real app, you'd use a React Context to provide this.
  return {
    email: 'pavansrinivas64@gmail.com',
    role: 'super_admin'
  };
}

export function isSuperAdmin(session: UserSession | null): boolean {
  return session?.role === 'super_admin';
}

export async function logout() {
  await amplifySignOut();
}