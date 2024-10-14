// src/app/layout.js
import Navbar from "./components/page.js";
import "./globals.css";

export const metadata = {
  title: "Form Yönetimi",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
