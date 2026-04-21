import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getUserByGoogleId(googleId) {
  const result = await query(
    "SELECT * FROM users WHERE google_id = $1",
    [googleId]
  );
  return result.rows[0] || null;
}

export async function updateUserTokens(googleId, accessToken, refreshToken) {
  await query(
    `UPDATE users SET access_token = $1, refresh_token = $2 
     WHERE google_id = $3`,
    [accessToken, refreshToken, googleId]
  );
}

export async function saveTransaction(userId, tx) {
  await query(
    `INSERT INTO transactions (
      user_id, transaction_date, broker, fund_name,
      transaction_type, amount, units, nav,
      order_id, folio_number, confidence, message_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (message_id) DO NOTHING`,
    [
      userId,
      tx.transaction_date,
      tx.broker,
      tx.fund_name,
      tx.transaction_type,
      tx.amount,
      tx.units,
      tx.nav,
      tx.order_id,
      tx.folio_number,
      tx.confidence,
      tx.message_id
    ]
  );
}

export async function getExistingMessageIds(userId) {
  const result = await query(
    "SELECT message_id FROM transactions WHERE user_id = $1",
    [userId]
  );
  return new Set(result.rows.map(r => r.message_id));
}

export async function createSyncLog(userId) {
  const result = await query(
    `INSERT INTO sync_log (user_id, status, started_at)
     VALUES ($1, 'running', now()) RETURNING id`,
    [userId]
  );
  return result.rows[0].id;
}

export async function updateSyncLog(logId, status, emailsScanned, txFound, error = null) {
  await query(
    `UPDATE sync_log 
     SET status = $1, emails_scanned = $2, 
         transactions_found = $3, finished_at = now(), error = $4
     WHERE id = $5`,
    [status, emailsScanned, txFound, error, logId]
  );
}