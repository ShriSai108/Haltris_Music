import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { siteMetadata } from './metadata';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { legalDocuments } from '../content/legal';
import { AboutPage } from '../pages/AboutPage';
import { ArtistPage } from '../pages/ArtistPage';
import { ArtistsPage } from '../pages/ArtistsPage';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReleasesPage } from '../pages/ReleasesPage';
import '../styles/layout.css';

export function App() {
  useEffect(() => {
    document.title = siteMetadata.title;

    const getOrCreateMeta = (name: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (existing) return existing;

      const meta = document.createElement('meta');
      meta.name = name;
      document.head.append(meta);
      return meta;
    };

    getOrCreateMeta('description').content = siteMetadata.description;
    getOrCreateMeta('theme-color').content = siteMetadata.themeColor;

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = new URL(siteMetadata.canonicalPath, window.location.origin).href;
    if (!canonical.isConnected) {
      document.head.append(canonical);
    }
  }, []);

  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:artistSlug" element={<ArtistPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<LegalPage document={legalDocuments.privacy} />} />
        <Route path="/terms" element={<LegalPage document={legalDocuments.terms} />} />
        <Route path="/cookies" element={<LegalPage document={legalDocuments.cookies} />} />
        <Route path="/release-disclaimer" element={<LegalPage document={legalDocuments['release-disclaimer']} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
