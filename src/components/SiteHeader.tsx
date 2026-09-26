import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '../content/site';
import { BlockMark } from './BlockMark';
import { Wordmark } from './Wordmark';

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
    <header className={menuOpen ? 'masthead masthead--open' : 'masthead'}>
      <span className="scroll-progress" aria-hidden="true" />
      <div className="masthead__inner">
        <NavLink className="brand" to="/" end aria-label="Haltris Music, home" onClick={() => setMenuOpen(false)}>
          <BlockMark className="brand__logo" />
          <Wordmark className="brand__name" />
          <span className="brand__rule" aria-hidden="true" />
          <span className="brand__descriptor">{site.descriptor}</span>
        </NavLink>

        <nav
          id="primary-navigation"
          className={menuOpen ? 'nav nav--open' : 'nav'}
          aria-label="Primary navigation"
        >
          {site.navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}
            >
              <span className="nav__label" data-text={item.label}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="masthead__actions">
          <Link className="masthead__cta" to="/contact?type=artist" onClick={() => setMenuOpen(false)} data-magnetic>
            <span className="live-dot" aria-hidden="true" />
            Send a demo
          </Link>

          <button
            ref={menuButtonRef}
            className="masthead__toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="masthead__toggle-bars" aria-hidden="true">
              <span />
              <span />
            </span>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}
