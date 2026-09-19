import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { site } from '../content/site';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const dismissMenu = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', dismissMenu);
    return () => document.removeEventListener('keydown', dismissMenu);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" end aria-label="Haltris home" onClick={() => setMenuOpen(false)}>
        <img
          className="brand__logo"
          src="/haltris-logo.png"
          alt="Haltris"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        <span className="wordmark">{site.wordmark}</span>
      </NavLink>
      <button
        ref={menuButtonRef}
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? 'Close' : 'Menu'}</span>
      </button>
      <nav id="primary-navigation" className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'} aria-label="Primary navigation">
        {site.navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
