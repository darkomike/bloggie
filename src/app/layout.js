import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { UIProvider } from "@/components/UIProvider";
import AuthMiddleware from "@/components/AuthMiddleware";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bloggie - Professional Blog Platform",
  description: "A professional blog platform for sharing insights, stories, and knowledge with the world.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/assets/images/logo.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
    apple: "/assets/images/logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/images/logo.jpg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  let actualTheme = theme;
                  
                  if (theme === 'system') {
                    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  if (actualTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        <UIProvider>
          <ThemeProvider>
            <AuthProvider>
              <AuthMiddleware>
                <Header />
                <main className="min-h-screen pt-16">
                  {children}
                </main>
                <Footer />
                <ScrollToTop />
                <SpeedInsights />
                <Analytics />
              </AuthMiddleware>
            </AuthProvider>
          </ThemeProvider>
        </UIProvider>
      </body>
    </html>
  );
}
