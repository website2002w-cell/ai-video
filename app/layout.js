import "./globals.css";

export const metadata = {
  title: "தமிழ் AI Video Studio",
  description: "Script upload செய்து AI video உருவாக்கும் website"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ta">
      <body>{children}</body>
    </html>
  );
}
