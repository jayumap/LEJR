const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function safeJsonParse(text) {
    // Remove markdown code blocks first
    const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        // Try extracting JSON object from cleaned text
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch {
            // Last resort — try to fix truncated JSON by closing it
            try {
                const truncated = match[0];
                // Count open braces to close them
                const openBraces = (truncated.match(/\{/g) || []).length;
                const closeBraces = (truncated.match(/\}/g) || []).length;
                const toClose = openBraces - closeBraces;
                // Remove trailing comma if exists then close
                const fixed = truncated.replace(/,\s*$/, "") + "}".repeat(toClose);
                return JSON.parse(fixed);
            } catch {
                return null;
            }
        }
    }
}

async function fetchWithRetry(url, options, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            throw new Error(`HTTP ${res.status}`);
        } catch (e) {
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

function regexFallback(emailBody) {
    try {
        const text = emailBody;

        const fundMatch = text.match(/SCHEME NAME\s*\n([^\n]+)/i) ||
            text.match(/scheme\s*name[:\s]+([^\n\r]+)/i) ||
            text.match(/fund name[:\s]+([^\n\r]+)/i);

        const amountMatch = text.match(/SIP AMOUNT\s*\n₹?([\d,]+\.?\d*)/i) ||
            text.match(/INVESTMENT AMOUNT\s*\n₹?([\d,]+\.?\d*)/i) ||
            text.match(/amount[:\s]+₹?([\d,]+\.?\d*)/i);

        const unitsMatch = text.match(/UNITS ALLOCATED\s*\n([\d.]+)/i) ||
            text.match(/units\s*allocated[:\s]+([\d.]+)/i);

        const navMatch = text.match(/NAV\s*\n([\d.]+)/i) ||
            text.match(/nav[:\s]+([\d.]+)/i);

        const orderMatch = text.match(/ORDER ID\s*\n([A-Z0-9]+)/i) ||
            text.match(/order\s*id[:\s]+([A-Z0-9]+)/i);

        const dateMatch = text.match(/(\d{1,2}\s+\w+,?\s+\d{4})/);

        if (!fundMatch && !amountMatch) return null;

        return {
            is_transaction: true,
            confidence: 0.75,
            broker: "Groww",
            transaction_type: text.toLowerCase().includes("sip") ? "SIP" : "Lumpsum",
            fund_name: fundMatch?.[1]?.trim().split(/\s{2,}|\t/)[0] || null,
            amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null,
            units: unitsMatch ? parseFloat(unitsMatch[1]) : null,
            nav: navMatch ? parseFloat(navMatch[1]) : null,
            order_id: orderMatch?.[1]?.trim() || null,
            transaction_date: null,
            folio_number: null
        };
    } catch {
        return null;
    }
}

export async function extractTransaction(emailBody, emailInfo = {}) {
    const { subject = "Unknown", date = "", messageId = "" } = emailInfo;

    try {
        console.log(`📤 Sending to Gemini — "${subject}" | ${messageId}`);

        const prompt = `You are a financial data extractor. Extract mutual fund transaction details and return ONLY valid JSON, nothing else. No markdown, no code blocks, just raw JSON.

{
  "is_transaction": true or false,
  "confidence": 0 to 1,
  "broker": "",
  "transaction_type": "SIP" or "Lumpsum" or "Redemption" or "Unknown",
  "fund_name": "",
  "amount": number or null,
  "units": number or null,
  "nav": number or null,
  "order_id": "" or null,
  "transaction_date": "YYYY-MM-DD" or null,
  "folio_number": "" or null
}

Email:
${emailBody}`;

        await sleep(6000);

        const res = await fetchWithRetry(
            `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1024
                    }
                })
            }
        );

        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("RAW GEMINI RESPONSE:", raw.substring(0, 500));
        const result = safeJsonParse(raw);

        console.log(`✅ Gemini result — is_transaction: ${result?.is_transaction} | confidence: ${result?.confidence} | fund: ${result?.fund_name}`);

        if (result?.is_transaction !== undefined) {
            console.log(`✅ Gemini result — is_transaction: ${result?.is_transaction} | confidence: ${result?.confidence} | fund: ${result?.fund_name}`);
            return result;
        }

        // Gemini returned something but parsing failed — try regex
        console.log(`⚠️ Gemini parse failed for ${messageId} — trying regex fallback`);
        const fallback = regexFallback(emailBody);
        if (fallback) console.log(`✅ Regex fallback succeeded — fund: ${fallback.fund_name}`);
        return fallback;

    } catch (e) {
        // Gemini completely failed — try regex
        console.error(`❌ Gemini failed for ${messageId}: ${e.message} — trying regex fallback`);
        const fallback = regexFallback(emailBody);
        if (fallback) console.log(`✅ Regex fallback succeeded — fund: ${fallback.fund_name}`);
        return fallback;
    }
}