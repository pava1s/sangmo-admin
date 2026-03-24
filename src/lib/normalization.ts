export function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return phone;
    return cleaned;
}

export function getPhoneVariations(phone: string): string[] {
    const cleaned = normalizePhone(phone);
    if (!cleaned) return [phone];
    return [cleaned, `+${cleaned}`];
}
