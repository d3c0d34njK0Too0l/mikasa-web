import "./globals.css";

export const metadata = {
  title: "MikasaBot Web",
  description: "Tools Web MikasaBot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
