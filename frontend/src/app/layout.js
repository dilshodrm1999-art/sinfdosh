import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Sinfdosh — sinfdoshlarni toping",
  description: "Maktabdosh va sinfdoshlarni topish ijtimoiy platformasi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
