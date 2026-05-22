import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "StudyLa — Fahamkan dulu, baru latih tubi",
  description: "Aplikasi bantu parent coach anak ulang kaji subjek sekolah rendah ikut KSSR Semakan 2017.",
  themeColor: "#BE185D",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`${jakarta.className} min-h-full bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
