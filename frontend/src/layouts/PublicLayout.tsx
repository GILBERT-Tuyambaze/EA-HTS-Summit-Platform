import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { navItems } from '../data/content';

export default function PublicLayout() {
  return (
    <>
      <NavBar items={navItems} />
      <Outlet />
      <Footer />
    </>
  );
}
