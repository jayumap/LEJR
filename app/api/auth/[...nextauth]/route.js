import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file"
          ].join(" "),
          access_type: "offline",
          prompt: "consent"
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        const client = await pool.connect();

        // Check if user already exists
        const existing = await client.query(
          "SELECT id FROM users WHERE google_id = $1",
          [account.providerAccountId]
        );

        if (existing.rows.length === 0) {
          // New user — insert them
          await client.query(
            `INSERT INTO users (email, google_id, access_token, refresh_token)
             VALUES ($1, $2, $3, $4)`,
            [
              user.email,
              account.providerAccountId,
              account.access_token,
              account.refresh_token
            ]
          );
        } else {
          // Existing user — update their tokens
          await client.query(
            `UPDATE users 
             SET access_token = $1, refresh_token = $2
             WHERE google_id = $3`,
            [
              account.access_token,
              account.refresh_token,
              account.providerAccountId
            ]
          );
        }

        client.release();
        return true;
      } catch (error) {
        console.error("DB error during sign in:", error);
        return false;
      }
    },

    async session({ session, token }) {
      session.user.googleId = token.sub;
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId;
      }
      return token;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };