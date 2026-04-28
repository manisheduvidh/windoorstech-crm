import './globals.css';

export const metadata = {
  title: 'Windoorstech CRM',
  description: 'Sales Lead Management System for Windoorstech',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
