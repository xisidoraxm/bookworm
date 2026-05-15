import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "../components/BootstrapClient";
import GoogleMapsLoader from "../components/GoogleMapsLoader";
import NavWrapper from "../components/NavWrapper";
import BookwormAI from "../components/BookwormAI";
import { CartProvider } from "../context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CartProvider>
          <BootstrapClient />
          <GoogleMapsLoader />
          <NavWrapper />
          {children}
          <BookwormAI />
        </CartProvider>
      </body>
    </html>
  );
}
