import 'server-only';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(message: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn(
            '[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.',
        );
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML', // Allows bolding/linking
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Telegram] Failed to send message:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Telegram] Error sending message:', error);
        return false;
    }
}
