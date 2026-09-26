import { describe, expect, it } from 'vitest';
import { artists } from '../content/artists';
import { metadataForPath, prerenderRoutes, renderHeadTags, renderRobots, renderSitemap } from './metadata';

describe('page metadata', () => {
  it('lists every static route and every artist for prerendering', () => {
    expect(prerenderRoutes).toEqual(expect.arrayContaining([
      '/', '/artists', '/releases', '/about', '/contact', '/privacy', '/terms', '/cookies', '/release-disclaimer',
    ]));
    for (const artist of artists) expect(prerenderRoutes).toContain(`/artists/${artist.slug}`);
  });

  it('treats trailing slashes as the same page', () => {
    expect(metadataForPath('/artists/').canonicalUrl).toBe('https://haltris.com/artists');
  });

  it('writes escaped head tags, canonical, and a 1200x630 social image', () => {
    const head = renderHeadTags('/artists/lil-sukku');

    expect(head).toContain('<title>Lil&#39; Sukku | Haltris Music</title>');
    expect(head).toContain('<link rel="canonical" href="https://haltris.com/artists/lil-sukku" />');
    expect(head).toContain('<meta property="og:type" content="profile" />');
    expect(head).toContain('<meta property="og:image:width" content="1200" />');
    expect(head).toContain('<script type="application/ld+json">');
    expect(head).not.toContain('noindex');
  });

  it('keeps structured data from breaking out of its script tag', () => {
    for (const route of prerenderRoutes) {
      const scripts = renderHeadTags(route).match(/<script[^>]*>([\s\S]*?)<\/script>/g) ?? [];
      for (const script of scripts) {
        const body = script.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
        expect(body).not.toContain('<');
        expect(() => JSON.parse(body)).not.toThrow();
      }
    }
  });

  it('marks missing pages noindex without a canonical link', () => {
    const head = renderHeadTags('/404');

    expect(head).toContain('<meta name="robots" content="noindex" />');
    expect(head).not.toContain('rel="canonical"');
  });

  it('builds a sitemap of every route and a robots file that points to it', () => {
    const sitemap = renderSitemap('2026-09-26');

    for (const route of prerenderRoutes) {
      expect(sitemap).toContain(`<loc>${new URL(route, 'https://haltris.com').href.replace(/\/$/, route === '/' ? '/' : '')}</loc>`);
    }
    expect(sitemap).toContain('<lastmod>2026-09-26</lastmod>');
    expect(renderRobots()).toContain('Sitemap: https://haltris.com/sitemap.xml');
  });
});
