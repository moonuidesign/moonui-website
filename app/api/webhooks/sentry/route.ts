import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/libs/telegram';

// Sentry webhook payload type (simplified)
interface SentryWebhookPayload {
    data: {
        event: {
            title: string;
            web_url: string;
            environment: string;
            level: string;
            culprit: string;
            message: string;
        };
    };
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json(); // Sentry sends JSON payload
        const { data } = payload as SentryWebhookPayload;

        if (!data || !data.event) {
            return NextResponse.json(
                { message: 'Invalid payload structure' },
                { status: 400 },
            );
        }

        const { title, web_url, environment, level, message } = data.event;

        // Construct Telegram Message
        const telegramMessage = `
🚨 <b>New Sentry Issue</b> 🚨

<b>Title:</b> ${title}
<b>Environment:</b> ${environment}
<b>Level:</b> ${level.toUpperCase()}
<b>Message:</b> ${message}

<a href="${web_url}">View Issue on Sentry</a>
    `;

        // Send to Telegram
        await sendTelegramMessage(telegramMessage);

        return NextResponse.json({ message: 'Notification sent' }, { status: 200 });
    } catch (error) {
        console.error('[SentryWebhook] Error processing webhook:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
