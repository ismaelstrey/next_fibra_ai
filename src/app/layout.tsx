import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@xyflow/react/dist/base.css'; 
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { MapProvider } from "@/context/MapContext";
import { Toaster } from "@/components/ui/sonner"

// Configuração das fontes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadados da aplicação
export const metadata: Metadata = {
  title: "FibraDoc - Documentação de Fibra Óptica",
  description: "Sistema para documentação de infraestrutura de fibra óptica",
};

/**
 * Layout principal da aplicação
 * Inclui provedores de autenticação e tema
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        suppressHydrationWarning
      >
        <Toaster position="bottom-center" />
        <ThemeProvider>
          <AuthProvider>
            <MapProvider>
              {children}
            </MapProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
