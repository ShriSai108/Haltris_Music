import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page not-found-page">
      <p className="eyebrow">404 · Off the signal</p>
      <h1>Page not found.</h1>
      <p>The page you were looking for has moved, disappeared, or never existed.</p>
      <Link className="button-link" to="/">Return home <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
