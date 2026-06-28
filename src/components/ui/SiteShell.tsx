'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import { CartProvider } from '@/context/CartContext';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register';

  if (isAdmin || isAuth) return <>{children}</>;

  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </CartProvider>
  );
}
