export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Administrator' | 'Marketing' | 'Customer Support' | 'Internal Staff' | 'Tech' | 'agent' | 'super_admin' | 'tech_support' | 'admin';
  avatar: string;
  permissions?: Record<string, boolean>;
};

// ✅ MOCK AUTH: Bypasses Supabase for the standalone admin dashboard
export async function getCurrentUser(): Promise<User | null> {
  // Mocking a logged-in Super Admin
  return {
    id: 'admin-123',
    name: 'Wanderlynx Admin',
    email: 'admin@wanderlynx.com',
    avatar: `https://ui-avatars.com/api/?name=Admin&background=random`,
    role: 'Super Admin',
    permissions: { '*': true },
  };
}

export async function logout() {
  console.log("Mock logout triggered");
  window.location.href = '/';
}