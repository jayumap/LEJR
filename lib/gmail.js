import { google } from "googleapis";

const EMAIL_SUBJECTS = [
    "Units allocated",
    "SIP confirmed",
    "Purchase confirmed",
    "Order executed",
    "Investment successful",
    "Folio",
    "units allotted",
    "SIP: Units"
];

const FILTER_KEYWORDS = [
    "₹", "amount", "units", "nav",
    "allotted", "folio", "sip",
    "transaction", "purchase", "redeemed"
];

export function getOAuthClient(accessToken, refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    oauth2Client.on("tokens", (tokens) => {
        if (tokens.refresh_token) {
            console.log("Token refreshed for user");
        }
    });

    return oauth2Client;
}

function isLikelyTransactionEmail(body) {
    const lower = body.toLowerCase();
    return FILTER_KEYWORDS.some(k => lower.includes(k));
}

function getDaysAgoDate(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0].replaceAll("-", "/");
}

function extractBody(payload) {
    let body = "";
    let htmlBody = "";

    if (payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                body = Buffer.from(part.body.data, "base64").toString("utf-8");
                break;
            }
            if (part.mimeType === "text/html" && part.body?.data) {
                htmlBody = Buffer.from(part.body.data, "base64").toString("utf-8");
            }
            // Handle nested multipart
            if (part.mimeType?.startsWith("multipart") && part.parts) {
                for (const subpart of part.parts) {
                    if (subpart.mimeType === "text/plain" && subpart.body?.data) {
                        body = Buffer.from(subpart.body.data, "base64").toString("utf-8");
                        break;
                    }
                    if (subpart.mimeType === "text/html" && subpart.body?.data) {
                        htmlBody = Buffer.from(subpart.body.data, "base64").toString("utf-8");
                    }
                }
            }
            if (body) break;
        }
    }

    // Fall back to HTML stripped of tags
    if (!body && htmlBody) {
        body = htmlBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    return body;
}

export async function scanEmails(accessToken, refreshToken, daysToScan = 60) {
    const auth = getOAuthClient(accessToken, refreshToken);
    const gmail = google.gmail({ version: "v1", auth });

    const subjectQuery = EMAIL_SUBJECTS
        .map(s => `subject:"${s}"`)
        .join(" OR ");

    const afterDate = getDaysAgoDate(daysToScan);
    const query = `(${subjectQuery}) after:${afterDate}`;

    console.log("Gmail query:", query);

    const threadsRes = await gmail.users.threads.list({
        userId: "me",
        q: query,
        maxResults: 100
    });

    const threads = threadsRes.data.threads || [];
    console.log(`Found ${threads.length} threads`);

    const emails = [];

    for (const thread of threads) {
        const threadData = await gmail.users.threads.get({
            userId: "me",
            id: thread.id,
            format: "full"
        });

        for (const message of threadData.data.messages) {
            const msgId = message.id;
            const date = new Date(parseInt(message.internalDate));
            const headers = message.payload.headers || [];
            const subject = headers.find(h => h.name === "Subject")?.value || "[No Subject]";

            const body = extractBody(message.payload);

            if (!body || body.length < 50) {
                console.log(`✗ Too short or empty: ${msgId}`);
                continue;
            }

            if (!isLikelyTransactionEmail(body)) {
                console.log(`✗ Filtered out: ${msgId} | ${subject}`);
                continue;
            }

            console.log(`✓ Queued for Gemini: ${msgId} | ${subject}`);

            emails.push({
                messageId: msgId,
                date,
                subject,
                body: body.substring(0, 3000)
            });
        }

        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`Pre-filtered to ${emails.length} likely transaction emails`);
    return emails;
}