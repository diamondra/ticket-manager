import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__title">Ticket Manager</Link>
        {isHome && (
          <Link to="/create" className="btn btn--primary btn--sm">+ New Event</Link>
        )}
        {!isHome && (
          <Link to="/" className="btn btn--outline btn--sm">&larr; Events</Link>
        )}
      </div>
    </header>
  );
}
