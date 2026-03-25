import { serverEnv } from '@/lib/server-env';
import { Message } from './aws/types';

export async function sendWhatsAppTemplateMessage(
    to: string,
    templateName: string,
    templateParams: string[]
) {
    const WHATSAPP_ACCESS_TOKEN = serverEnv.META_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = serverEnv.META_PHONE_ID;

    console.log("META TOKEN LENGTH (Template):", WHATSAPP_ACCESS_TOKEN?.length || 0);

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error('WhatsApp environment variables are not configured.');
    }

    const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: 'en_US',
            },
            components: [
                {
                    type: 'body',
                    parameters: templateParams.map(param => ({ type: 'text', text: param })),
                },
            ],
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || `HTTP status ${response.status}`;
        throw new Error(`WhatsApp API request failed: ${errorMessage}`);
    }

    return response.json();
}

export async function sendWhatsAppTextMessage(to: string, text: string) {
    const WHATSAPP_ACCESS_TOKEN = serverEnv.META_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = serverEnv.META_PHONE_ID;

    console.log("META TOKEN LENGTH (Text):", WHATSAPP_ACCESS_TOKEN?.length || 0);

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error('WhatsApp environment variables are not configured.');
    }

    const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
            body: text,
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || `HTTP status ${response.status}`;
        throw new Error(`WhatsApp API request failed: ${errorMessage}`);
    }

    const responseData = await response.json();
    const messageId = responseData.messages?.[0]?.id;
    if (!messageId) {
        throw new Error('Could not get message ID from WhatsApp API response.');
    }
    return messageId;
}
