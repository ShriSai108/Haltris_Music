import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { site } from '../content/site';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="Haltris home" onClick={() => setMenuOpen(false)}>
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
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">Menu</span>
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
