import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css"
import BootstrapClient from "../components/BootstrapClient";
import GoogleMapsLoader from "../components/GoogleMapsLoader";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
          <body>
            <BootstrapClient />
            <GoogleMapsLoader />
            {children}
          </body>
      </html>
  );
}
