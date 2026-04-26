import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { scanEmails } from "@/lib/gmail";
import { extractTransaction } from "@/lib/gemini";
import {
    getUserByGoogleId,
    saveTransaction,
    getExistingMessageIds,
    createSyncLog,
    updateSyncLog,
    query
} from "@/lib/db";
import { createUserSheet, writeTransactionsToSheet } from "@/lib/sheets";

export async function POST(request) {
    // Check user is logged in
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.user.googleId);
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }

    const logId = await createSyncLog(user.id);

    console.log(`[sync] triggered by: ${session?.user?.email} at ${new Date().toISOString()}`);

    try {
        // Step 1 — Scan Gmail
        const emails = await scanEmails(
            user.access_token,
            user.refresh_token,
            90
        );

        // Step 2 — Get already processed message IDs (dedup)
        const existingIds = await getExistingMessageIds(user.id);

        let newCount = 0;
        let reviewCount = 0;

        // Step 3 — Extract each email with Gemini
        for (const email of emails) {
            // Skip if already processed
            if (existingIds.has(email.messageId)) {
                console.log(`⏭️  Skipping already processed - MsgID: ${email.messageId}`);
                continue;
            }

            const parsed = await extractTransaction(email.body, {
                subject: email.subject,
                date: email.date.toISOString(),
                messageId: email.messageId
            });

            if (!parsed || !parsed.is_transaction) continue;

            const tx = {
                transaction_date: parsed.transaction_date ||
                    email.date.toISOString().split("T")[0],
                broker: parsed.broker || "Unknown",
                fund_name: parsed.fund_name || "Unknown",
                transaction_type: parsed.transaction_type || "Unknown",
                amount: parsed.amount || null,
                units: parsed.units || null,
                nav: parsed.nav || null,
                order_id: parsed.order_id || null,
                folio_number: parsed.folio_number || null,
                confidence: parsed.confidence || 0,
                message_id: email.messageId
            };

            await saveTransaction(user.id, tx);

            if (parsed.confidence >= 0.8) {
                newCount++;
            } else {
                reviewCount++;
            }

            existingIds.add(email.messageId);
        }

        // Create sheet if user doesn't have one yet
        if (!user.sheet_id) {
            console.log("📊 Creating Google Sheet for user...");
            const sheetId = await createUserSheet(
                user.access_token,
                user.refresh_token,
                user.email
            );
            // Save sheet ID to user record
            await query(
                "UPDATE users SET sheet_id = $1 WHERE id = $2",
                [sheetId, user.id]
            );
            user.sheet_id = sheetId;
            console.log(`✅ Sheet created and saved: ${sheetId}`);
        }

        // Write all transactions to sheet
        console.log("📝 Writing transactions to sheet...");
        const sheetResult = await writeTransactionsToSheet(
            user.access_token,
            user.refresh_token,
            user.sheet_id,
            user.id
        );

        await updateSyncLog(logId, "done", emails.length, newCount + reviewCount);

        return Response.json({
            success: true,
            emailsScanned: emails.length,
            transactionsSaved: newCount,
            needsReview: reviewCount,
            sheetUrl: `https://docs.google.com/spreadsheets/d/${user.sheet_id}`
        });

    } catch (error) {
        console.error("Sync failed:", error);
        await updateSyncLog(logId, "failed", 0, 0, error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}