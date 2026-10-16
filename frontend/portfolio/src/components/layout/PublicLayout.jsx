import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
