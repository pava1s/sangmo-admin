import { fetchAuthSession, getCurrentUser, fetchUserAttributes, signOut as amplifySignOut } from 'aws-amplify/auth';
import { configureAmplify } from './amplify-config';

// Initialize Amplify on first import
configureAmplify();

export type UserRole = 'super_admin' | 'organizer';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organizations?: string[];
}

export type User = UserSession;

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
      id: user.userId,
      name: attributes.name || attributes.email?.split('@')[0] || 'User',
      email: attributes.email || '',
      role,
      avatar: attributes.picture,
      organizations: groups.filter(g => g !== 'Admins' && g !== 'Organizers')
    };
  } catch (error) {
    console.debug('No active session found');
    return null;
  }
}

export function isSuperAdmin(session: UserSession | null): boolean {
  return session?.role === 'super_admin';
}

export async function logout() {
  await amplifySignOut();
}