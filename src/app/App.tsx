import { Link, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <main>
      <p>Independent music, carefully amplified.</p>
    </main>
  );
}

function ArtistsPage() {
  return (
    <main>
      <h1>Artists</h1>
    </main>
  );
}

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Haltris home">
          HALTRIS
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/artists">Artists</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<ArtistsPage />} />
      </Routes>
    </div>
  );
}
