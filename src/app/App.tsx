import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { metadataForPath, siteMetadata } from './metadata';
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
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMagnetic, useScrolledFlag } from '../hooks/useMotion';
import '../styles/layout.css';

export function App() {
  const location = useLocation();

  useEffect(() => {
    const pageMetadata = metadataForPath(location.pathname);
    document.title = pageMetadata.title;

    const getOrCreateMeta = (attribute: 'name' | 'property', key: string) => {
      const selector = `meta[${attribute}="${key}"]`;
      const existing = document.head.querySelector<HTMLMetaElement>(selector);
      if (existing) return existing;

      const meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      document.head.append(meta);
      return meta;
    };

    getOrCreateMeta('name', 'description').content = pageMetadata.description;
    getOrCreateMeta('name', 'theme-color').content = siteMetadata.themeColor;
    getOrCreateMeta('property', 'og:site_name').content = siteMetadata.title;
    getOrCreateMeta('property', 'og:type').content = pageMetadata.socialType;
    getOrCreateMeta('property', 'og:title').content = pageMetadata.title;
    getOrCreateMeta('property', 'og:description').content = pageMetadata.description;
    getOrCreateMeta('property', 'og:url').content = pageMetadata.canonicalUrl;
    getOrCreateMeta('property', 'og:image').content = pageMetadata.socialImageUrl;
    getOrCreateMeta('name', 'twitter:card').content = 'summary_large_image';
    getOrCreateMeta('name', 'twitter:title').content = pageMetadata.title;
    getOrCreateMeta('name', 'twitter:description').content = pageMetadata.description;
    getOrCreateMeta('name', 'twitter:image').content = pageMetadata.socialImageUrl;

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (pageMetadata.indexable) {
      robots?.remove();
    } else {
      getOrCreateMeta('name', 'robots').content = 'noindex';
    }

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = pageMetadata.canonicalUrl;
    if (!canonical.isConnected) {
      document.head.append(canonical);
    }

    for (const script of document.head.querySelectorAll('script[type="application/ld+json"]')) script.remove();
    for (const data of pageMetadata.structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.append(script);
    }
  }, [location.pathname]);

  useScrollReveal(location.pathname);
  useMagnetic();
  useScrolledFlag();

  // On the first load the browser owns focus and scroll. Only after a
  // client-side navigation do we reset scroll and move focus to the new page.
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    // 'instant' so the page does not glide to the top under CSS smooth scrolling.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('page-content')?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="app-shell" id="top">
      <span className="grain" aria-hidden="true" />
      <a className="skip-link" href="#page-content">Skip to content</a>
      <SiteHeader />
      <div id="page-content" key={location.pathname} tabIndex={-1}>
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
      </div>
      <SiteFooter />
    </div>
  );
}
