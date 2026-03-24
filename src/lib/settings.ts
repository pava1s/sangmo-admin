
import { createClient } from '@/utils/supabase/server';

/**
 * Checks if the external API V1 is enabled in system_settings.
 * Defaults to TRUE if setting is missing (fail-open or fail-safe depending on policy, implementation here is fail-safe/true).
 */
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if the external API V1 is enabled in system_settings.
 * Defaults to TRUE if setting is missing (fail-open or fail-safe depending on policy, implementation here is fail-safe/true).
 * @param clientOptional - Optional Supabase client (e.g. Service Role) to use instead of default auth client.
 */
export async function isApiEnabled(clientOptional?: SupabaseClient): Promise<boolean> {
    try {
        const supabase = clientOptional || await createClient();

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'api_v1_enabled')
            .single();

        if (error || !data) {
            // If table doesn't exist or row missing, default to TRUE to avoid breaking existing integrations before migration
            // Only return FALSE if explicitly set to false
            if (error.code === 'PGRST116') return true; // Row not found
            return true;
        }

        return data.value === true;
    } catch (e) {
        console.error("Error checking API settings:", e);
        return true; // Default to enabled on error
    }
}

export async function setApiEnabled(enabled: boolean): Promise<{ success: boolean; error?: any }> {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('system_settings')
            .upsert({
                key: 'api_v1_enabled',
                value: enabled,
                description: 'Global toggle for external API v1 access',
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, error: e };
    }
}
