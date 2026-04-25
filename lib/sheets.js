import { google } from "googleapis";
import { getOAuthClient } from "./gmail.js";
import { query } from "./db.js";

// ========================================
// CREATE SHEET FOR NEW USER
// ========================================

export async function createUserSheet(accessToken, refreshToken, userEmail) {
    const auth = getOAuthClient(accessToken, refreshToken);
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: `LEJR — Mutual Fund Tracker`
            },
            sheets: [
                { properties: { title: "Transactions" } },
                { properties: { title: "Summary" } },
                { properties: { title: "Review" } }
            ]
        }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Get ACTUAL sheet IDs returned by Google (not 0,1,2)
    const sheetsList = spreadsheet.data.sheets;
    const txSheetId = sheetsList[0].properties.sheetId;
    const summarySheetId = sheetsList[1].properties.sheetId;
    const reviewSheetId = sheetsList[2].properties.sheetId;

    console.log(`✅ Sheet created: ${spreadsheetId}`);
    console.log(`Sheet IDs — Tx: ${txSheetId}, Summary: ${summarySheetId}, Review: ${reviewSheetId}`);

    await setupSheetHeaders(sheets, spreadsheetId, txSheetId, summarySheetId, reviewSheetId);

    return spreadsheetId;
}

async function setupSheetHeaders(sheets, spreadsheetId, txSheetId, summarySheetId, reviewSheetId) {
    const transactionHeaders = [[
        "Date", "Broker", "Fund Name", "Type", "Amount (₹)",
        "Units", "NAV", "Order ID", "Folio", "Confidence", "Source"
    ]];

    const summaryHeaders = [[
        "Fund Name", "Total Invested (₹)", "Total Units", "Transactions", "Last SIP Date"
    ]];

    const reviewHeaders = [[
        "Date", "Broker", "Fund Name", "Type", "Amount (₹)",
        "Units", "NAV", "Order ID", "Confidence", "Message ID"
    ]];

    // Write headers
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: "RAW",
            data: [
                { range: "Transactions!A1:K1", values: transactionHeaders },
                { range: "Summary!A1:E1", values: summaryHeaders },
                { range: "Review!A1:J1", values: reviewHeaders }
            ]
        }
    });

    // Format with actual sheet IDs
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    repeatCell: {
                        range: { sheetId: txSheetId, startRowIndex: 0, endRowIndex: 1 },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.07, green: 0.07, blue: 0.07 },
                                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                            }
                        },
                        fields: "userEnteredFormat(backgroundColor,textFormat)"
                    }
                },
                {
                    repeatCell: {
                        range: { sheetId: summarySheetId, startRowIndex: 0, endRowIndex: 1 },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.07, green: 0.07, blue: 0.07 },
                                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                            }
                        },
                        fields: "userEnteredFormat(backgroundColor,textFormat)"
                    }
                },
                {
                    repeatCell: {
                        range: { sheetId: reviewSheetId, startRowIndex: 0, endRowIndex: 1 },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.9, green: 0.7, blue: 0.0 },
                                textFormat: { bold: true }
                            }
                        },
                        fields: "userEnteredFormat(backgroundColor,textFormat)"
                    }
                },
                {
                    updateSheetProperties: {
                        properties: { sheetId: txSheetId, gridProperties: { frozenRowCount: 1 } },
                        fields: "gridProperties.frozenRowCount"
                    }
                },
                {
                    updateSheetProperties: {
                        properties: { sheetId: summarySheetId, gridProperties: { frozenRowCount: 1 } },
                        fields: "gridProperties.frozenRowCount"
                    }
                },
                {
                    updateSheetProperties: {
                        properties: { sheetId: reviewSheetId, gridProperties: { frozenRowCount: 1 } },
                        fields: "gridProperties.frozenRowCount"
                    }
                }
            ]
        }
    });

    console.log("✅ Headers and formatting done");
}

// ========================================
// WRITE TRANSACTIONS TO SHEET
// ========================================

export async function writeTransactionsToSheet(
    accessToken, refreshToken, spreadsheetId, userId
) {
    const auth = getOAuthClient(accessToken, refreshToken);
    const sheets = google.sheets({ version: "v4", auth });

    // Get all transactions for this user from DB
    const result = await query(
        `SELECT * FROM transactions 
     WHERE user_id = $1 
     ORDER BY transaction_date DESC`,
        [userId]
    );

    const transactions = result.rows;

    if (transactions.length === 0) {
        console.log("No transactions to write");
        return;
    }

    // Split into confident and review
    const confident = transactions.filter(t => t.confidence >= 0.8);
    const needsReview = transactions.filter(t => t.confidence < 0.8);

    // Format rows for Transactions sheet
    const txRows = confident.map(t => [
        t.transaction_date || "",
        t.broker || "",
        t.fund_name || "",
        t.transaction_type || "",
        t.amount || "",
        t.units || "",
        t.nav || "",
        t.order_id || "",
        t.folio_number || "",
        t.confidence || "",
        t.confidence >= 0.8 ? "Auto" : "Review"
    ]);

    // Format rows for Review sheet
    const reviewRows = needsReview.map(t => [
        t.transaction_date || "",
        t.broker || "",
        t.fund_name || "",
        t.transaction_type || "",
        t.amount || "",
        t.units || "",
        t.nav || "",
        t.order_id || "",
        t.confidence || "",
        t.message_id || ""
    ]);

    // Build summary data
    const summaryMap = {};
    confident.forEach(t => {
        const key = t.fund_name;
        if (!summaryMap[key]) {
            summaryMap[key] = {
                fund_name: t.fund_name,
                total_invested: 0,
                total_units: 0,
                count: 0,
                last_date: t.transaction_date
            };
        }
        summaryMap[key].total_invested += parseFloat(t.amount || 0);
        summaryMap[key].total_units += parseFloat(t.units || 0);
        summaryMap[key].count += 1;
        if (t.transaction_date > summaryMap[key].last_date) {
            summaryMap[key].last_date = t.transaction_date;
        }
    });

    const summaryRows = Object.values(summaryMap).map(s => [
        s.fund_name,
        Math.round(s.total_invested * 100) / 100,
        Math.round(s.total_units * 1000) / 1000,
        s.count,
        s.last_date || ""
    ]);

    // Clear existing data (keep headers) and rewrite
    const requests = [];

    if (txRows.length > 0) {
        requests.push({
            range: "Transactions!A2:K1000",
            values: txRows
        });
    }

    if (summaryRows.length > 0) {
        requests.push({
            range: "Summary!A2:E100",
            values: summaryRows
        });
    }

    if (reviewRows.length > 0) {
        requests.push({
            range: "Review!A2:J1000",
            values: reviewRows
        });
    }

    // Clear old data first
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Transactions!A2:K1000"
    });
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Summary!A2:E100"
    });
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Review!A2:J1000"
    });

    // Write new data
    if (requests.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: requests
            }
        });
    }

    console.log(`✅ Sheet updated — ${txRows.length} transactions, ${summaryRows.length} funds, ${reviewRows.length} in review`);

    return {
        transactionsWritten: txRows.length,
        fundsInSummary: summaryRows.length,
        needsReview: reviewRows.length
    };
}