import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../types';

interface NavBarProps {
  items: NavItem[];
}

const NavBar = ({ items }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/+$/, '') || '/';
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`nav${isScrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <div className="nav-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div className="nav-logo-text">
            EA-HTS 2027
            <span>IEEE East Africa</span>
          </div>
        </Link>

        <ul className={`nav-links${isMenuOpen ? ' open' : ''}`} id="nav-links">
          {items.map((item) => {
            const isActive = (item.href.replace(/\/+$/, '') || '/') === currentPath;
            if (!item.href.startsWith('/')) {
              return <li key={item.href}><a href={item.href} className={isActive ? 'active' : ''} onClick={closeMenu}>{item.label}</a></li>;
            }
            return (
              <li key={item.href}>
                <Link to={item.href} className={isActive ? 'active' : ''} onClick={closeMenu}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-cta">
          <Link to="/register" className="btn btn-gold" onClick={closeMenu}>
            Register
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <button
          className={`nav-toggle${isMenuOpen ? ' active' : ''}`}
          id="nav-toggle"
          aria-label="Toggle menu"
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
