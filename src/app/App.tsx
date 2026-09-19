import { Route, Routes } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import '../styles/layout.css';

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
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<ArtistsPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
