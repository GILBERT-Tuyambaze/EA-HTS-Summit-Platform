import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { navItems } from '../data/content';
import '../styles/public/not-found.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAdminFallback = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  const content = (
    <main className="public-not-found-shell">
      <section className="public-not-found-card">
        <div className="public-not-found-visual" aria-hidden="true">404</div>
        <p className="public-not-found-kicker">Error</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <div className="public-not-found-actions">
          <Link to="/" className="btn btn-primary">Return Home</Link>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </section>
    </main>
  );

  if (!isAdminFallback) {
    return content;
  }

  return (
    <>
      <NavBar items={navItems} />
      {content}
      <Footer />
    </>
  );
}
