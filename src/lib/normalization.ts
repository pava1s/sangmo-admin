
export function normalizePhone(phone: string): string {
    // 1. Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // 2. Ensure it isn't empty
    if (!cleaned) return phone;

    // 3. Heuristic: If it looks like an international number without +, add it.
    // (This is loose, but standardizes our internal storage to E.164 for consistency)
    // Actually, for LOOKUP, we want the raw digits.
    return cleaned;
}

export function getPhoneVariations(phone: string): string[] {
    const cleaned = normalizePhone(phone);
    if (!cleaned) return [phone];

    // Return the cleaned version AND the plus version
    return [cleaned, `+${cleaned}`];
}
