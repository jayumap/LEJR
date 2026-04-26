import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SessionWrapper from "./SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "LEJR — SIP Transaction Tracker",
  description:
    "Automatically track your mutual fund SIP transactions from Gmail. AI-powered extraction, organized in a Google Sheet on your Drive.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={inter.className}>
      <body>
        <SessionWrapper session={session}>{children}</SessionWrapper>
      </body>
    </html>
  );
}