/**
 * MOCK SETTINGS: Bypasses Supabase for the standalone admin dashboard.
 * Always returns API enabled to ensure the UI remains functional during transition.
 */

export async function isApiEnabled(): Promise<boolean> {
    return true;
}

export async function setApiEnabled(enabled: boolean): Promise<{ success: boolean; error?: any }> {
    console.log("Mock setApiEnabled triggered:", enabled);
    return { success: true };
}
