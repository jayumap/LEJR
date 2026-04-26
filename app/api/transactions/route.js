import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getUserByGoogleId } from "@/lib/db";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getUserByGoogleId(session.user.googleId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await query(
    `SELECT transaction_date, broker, fund_name, transaction_type,
            amount, units, nav, order_id, folio_number, confidence, message_id
     FROM transactions
     WHERE user_id = $1
     ORDER BY transaction_date DESC
     LIMIT 200`,
    [user.id]
  );

  return NextResponse.json({
    transactions: result.rows,
    sheetId: user.sheet_id || null,
    sheetUrl: user.sheet_id
      ? `https://docs.google.com/spreadsheets/d/${user.sheet_id}`
      : null,
  });
}
