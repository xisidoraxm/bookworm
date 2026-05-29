import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "../components/BootstrapClient";
import GoogleMapsLoader from "../components/GoogleMapsLoader";
import NavWrapper from "../components/Nav/NavWrapper";
import BookwormAI from "../components/AI/BookwormAI";
import { CartProvider } from "../context/CartContext";
import { ActivityTracker } from "../components/ActivityTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CartProvider>
          <ActivityTracker>
            <BootstrapClient />
            <GoogleMapsLoader />
            <NavWrapper />
            {children}
            <BookwormAI />
          </ActivityTracker>
        </CartProvider>
      </body>
    </html>
  );
}
