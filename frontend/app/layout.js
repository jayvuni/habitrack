import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Progressio",
  description:
    "Build positive routines and achieve your goals with our easy-to-use habit tracker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " dark"}>{children}</body>
    </html>
  );
}
